# Replenishment Advisor Feature Documentation

## Overview

The Replenishment Advisor is an AI-assisted inventory workflow for branch-level stock review. It analyzes a single branch at a time, uses existing inventory, product, and sales read models, and drafts reorder recommendations for human review.

The feature is designed to support stock managers and branch managers without automating inventory changes. Recommendations are advisory only. Approving or rejecting a recommendation records the decision metadata; it does not mutate stock quantities or create stock adjustments.

## Use Case

BranchOps stores stock by branch and product. Managers need to identify products that are low, moving quickly, or likely to run out soon. The Replenishment Advisor helps by:

- Reviewing low-stock items for a selected branch.
- Looking at current stock, sales velocity, days of stock, and product context.
- Producing a short natural-language summary of the review.
- Drafting reorder recommendations with quantity, urgency, rationale, and confidence.
- Letting a manager approve or reject each draft recommendation.
- Keeping run history for auditability and later review.

## Primary Users

The route is available to:

- Admin
- StockManager
- BranchManager

Cashiers cannot access the advisor.

## Main Scenarios

### Admin Runs Advisor for a Branch

1. Admin opens `/inventory/replenishment-agent`.
2. Admin selects a specific branch.
3. Admin optionally enters a focus prompt, such as "focus on critical low-stock items".
4. Admin starts the review.
5. The page streams AI narrative, tool calls, and draft recommendations.
6. When the run completes, the generated recommendations are available in the run detail panel.
7. Admin approves or rejects pending recommendations.

Admin users must choose one branch. "All Branches" is intentionally invalid because the AI tools and run context are branch-scoped.

### Branch-Scoped Manager Runs Advisor

1. StockManager or BranchManager opens `/inventory/replenishment-agent`.
2. The UI uses the branch from the authenticated user's employee profile.
3. The manager starts the review.
4. The backend enforces the JWT branch claim, so the user cannot run or view advisor data for another branch.
5. The manager can approve or reject recommendations for their own branch only.

### Run History Review

1. A user opens the advisor page.
2. The run history table loads previous runs in the user's branch scope.
3. The user selects a run.
4. The detail panel shows all persisted recommendations for that run.
5. Pending recommendations can be approved or rejected.

### Cancelled or Failed Run

If a user cancels the stream, the backend marks the run as `Cancelled`.

If the AI call or orchestration fails, the backend marks the run as `Failed`, stores a truncated error message on the run, and sends a user-safe failure event to the client.

## How It Works

## End-to-End Advisor Flow

This is the complete flow from the moment a user opens the advisor page until recommendations are approved or rejected.

### 1. User Opens the Advisor Page

The user navigates to:

```text
/inventory/replenishment-agent
```

The route guard allows only:

- Admin
- StockManager
- BranchManager

The page loads the branch selector, optional prompt field, active stream panel, run history table, and recommendation detail panel.

### 2. Branch Scope Is Resolved

Branch selection depends on the user's role:

- Admin users must manually select one branch.
- StockManager and BranchManager users use the branch from their authenticated employee profile.

The backend also enforces branch scope:

- Admin users can start a run only for the branch id they provide.
- Non-Admin users are forced to their JWT branch claim, regardless of any branch id sent by the client.

This prevents cross-branch advisor runs and cross-branch history access.

### 3. User Starts a Review

When the user clicks "Start Review", the frontend sends:

```text
POST /api/Replenishment/runs?branchId=<branch-id>
```

The request body is:

```json
{
  "userPrompt": "optional user focus prompt"
}
```

The frontend uses `fetch` instead of Axios because the endpoint returns a streaming Server-Sent Events response.

### 4. Backend Creates a Run

The controller calls the orchestrator. The orchestrator:

1. Validates that the branch exists.
2. Creates a `ReplenishmentRun` row.
3. Sets the run status to `Running`.
4. Stores the selected OpenAI model id on the run.
5. Saves the run before the AI agent starts.

At this point, the run is persisted even if the AI call later fails or is cancelled.

### 5. AI Run Context Is Set

The orchestrator sets the scoped run context:

- Run id
- User id
- Branch id

The AI tool middleware uses this context for audit logs and event correlation.

### 6. Agent and Tools Are Bound to the Branch

The orchestrator builds the `ReplenishmentAdvisorAgent` for the selected branch.

Branch-aware tools are bound to the same branch before execution. This ensures the agent analyzes only the active branch.

The agent can call tools for stock snapshots, low-stock items, sales velocity, days of stock, product lookup, and draft reorder creation.

### 7. SSE Stream Starts

The API response is opened as:

```text
Content-Type: text/event-stream
```

Response buffering is disabled so events can reach the browser as they happen.

The frontend starts reading SSE frames from the response body.

### 8. Agent Streams Text and Tool Events

While the AI agent runs:

- Text output is sent as `text-delta`.
- Tool invocation start is sent as `tool-start`.
- Tool invocation completion is sent as `tool-end`.
- Tool success/failure is written to the audit log.

The frontend displays:

- The growing advisor narrative.
- Collapsible tool-call cards.
- Tool arguments and result previews.

### 9. Agent Drafts Recommendations

When the agent identifies a reorder candidate, it calls the draft recommendation tool.

The draft tool records an in-memory draft with:

- Branch id
- Product id
- Suggested quantity
- Urgency
- Rationale
- Confidence

The draft tool does not save to the database and does not change stock.

### 10. Orchestrator Validates and Persists Drafts

After the agent finishes, the orchestrator validates each draft before persistence:

- The draft must belong to the active branch.
- The product must exist.
- A branch stock row must exist for the branch/product pair.
- Suggested quantity must be positive.
- Confidence is clamped between `0.0` and `1.0`.
- The number of persisted recommendations is capped by `Ai:Replenishment:MaxProductsPerRun`.

Valid drafts become `ReplenishmentRecommendation` rows with status `Pending`.

Each persisted draft is also emitted to the stream as `recommendation-added`.

### 11. Run Completes or Fails

If the run succeeds:

1. The final narrative is saved to `ReplenishmentRun.Summary`.
2. The run status is set to `Completed`.
3. `CompletedAt` is set.
4. A `run-completed` SSE event is sent.
5. The SSE stream closes.

If the run fails:

1. The run status is set to `Failed`.
2. A truncated error message is saved.
3. A user-safe `run-failed` SSE event is sent.
4. The SSE stream closes.

If the user cancels:

1. The run status is set to `Cancelled`.
2. The stream sends a failure-style cancellation event.
3. The SSE stream closes.

### 12. Frontend Refreshes History and Details

When the frontend receives `run-completed`, it:

1. Stores the completed run id.
2. Refreshes the run history query.
3. Opens the completed run in the detail panel.
4. Displays persisted recommendations.

The history endpoint is:

```text
GET /api/Replenishment/runs
```

The detail endpoint is:

```text
GET /api/Replenishment/runs/{id}
```

### 13. User Approves or Rejects Recommendations

For each pending recommendation, the user can approve or reject.

Approve endpoint:

```text
POST /api/Replenishment/runs/{runId}/recommendations/{recommendationId}/approve
```

Reject endpoint:

```text
POST /api/Replenishment/runs/{runId}/recommendations/{recommendationId}/reject
```

The decision request can include optional notes:

```json
{
  "notes": "optional decision notes"
}
```

The backend records:

- Recommendation status
- Deciding user id
- Decision timestamp
- Optional decision notes

Approving or rejecting a recommendation does not update inventory, create stock adjustments, or create purchase orders.

### 14. Recommendation Becomes Historical Record

After decision, the recommendation remains attached to the run as an audit-friendly record of:

- What the AI recommended.
- What stock level existed at the time.
- Why the agent recommended reorder.
- Who approved or rejected it.
- When the decision happened.

This makes the advisor useful both for operational review and later audit/history screens.

### Backend Flow

The backend orchestration lives in `server/BranchOps.Api/Ai/Orchestration/ReplenishmentRunOrchestrator.cs`.

When a run starts:

1. The controller resolves the effective branch.
2. The orchestrator creates a `ReplenishmentRun` row with status `Running`.
3. The scoped AI run context is set with run id, user id, and branch id.
4. The AI agent is built for the selected branch.
5. The agent streams text responses and invokes tools.
6. Tool middleware emits tool start/end events and writes audit logs.
7. Draft reorder recommendations are collected in memory by the AI tool layer.
8. After the agent finishes, drafts are validated and persisted as `ReplenishmentRecommendation` rows.
9. The run is marked `Completed`, `Failed`, or `Cancelled`.
10. The event channel is completed and the SSE response closes.

### AI Tooling

The AI agent can call tools for:

- Low-stock items.
- Current stock by product.
- Stock list for a branch.
- Top products.
- Sales velocity.
- Days of stock.
- Product lookup.
- Product listing by category.
- Drafting reorder recommendations.

The draft recommendation tool does not persist data or change stock. It only records in-memory drafts for the orchestrator to validate and persist after the run.

### Validation Before Persistence

Before a draft becomes a stored recommendation, the orchestrator validates that:

- The draft belongs to the active branch.
- The product exists.
- A branch stock row exists for that branch/product pair.
- Suggested quantity is positive.
- Confidence is clamped to `0.0` through `1.0`.
- The number of persisted recommendations is capped by configuration.

### Server-Sent Events

The start endpoint streams events using Server-Sent Events:

`POST /api/Replenishment/runs?branchId=<branch-id>`

Each frame uses:

```text
event: <event-type>
data: <json-payload>
```

Supported event types:

- `tool-start`
- `tool-end`
- `text-delta`
- `recommendation-added`
- `run-completed`
- `run-failed`

The frontend uses `fetch` with the authenticated bearer token and manually parses SSE frames from the response stream.

### History and Decisions

History and detail endpoints:

- `GET /api/Replenishment/runs`
- `GET /api/Replenishment/runs/{id}`

Decision endpoints:

- `POST /api/Replenishment/runs/{runId}/recommendations/{recommendationId}/approve`
- `POST /api/Replenishment/runs/{runId}/recommendations/{recommendationId}/reject`

Decision behavior:

- Only pending recommendations can be decided.
- Re-deciding a recommendation returns `409 Conflict`.
- Cross-branch access returns `403 Forbid`.
- Approval/rejection stores status, deciding user, decision time, and optional notes.
- Stock quantities are never changed by approval or rejection.

## Frontend Flow

The frontend feature lives in `client/src/features/replenishment-agent`.

The page includes:

- Branch selector for Admin users.
- Static assigned-branch badge for non-Admin users.
- Optional focus prompt.
- Start and cancel controls.
- Active stream narrative.
- Collapsible tool-call cards with argument and result previews.
- Draft recommendation cards during the active stream.
- Run history table with pagination.
- Run detail panel with persisted recommendations.
- Approve/reject confirmation dialogs.

The route is:

```text
/inventory/replenishment-agent
```

The sidebar item appears under Inventory as "Replenishment Advisor".

## Configuration

The backend requires an OpenAI API key:

```text
Ai:OpenAI:ApiKey
```

For local development, set it with .NET user-secrets from `server/BranchOps.Api`:

```powershell
dotnet user-secrets set "Ai:OpenAI:ApiKey" "YOUR_OPENAI_API_KEY"
```

The model and replenishment limits are configured under the `Ai` section:

```json
{
  "Ai": {
    "OpenAI": {
      "Model": "gpt-5-mini"
    },
    "Replenishment": {
      "MaxToolIterations": 20,
      "DefaultLookbackDays": 30,
      "MaxProductsPerRun": 25
    }
  }
}
```

Do not commit real API keys.

## Auditability

Tool execution is audited through the existing audit log service. Successful tool calls write `AI.Tool.Completed`; failed tool calls write `AI.Tool.Failed`.

Runs and recommendations are persisted in:

- `ReplenishmentRuns`
- `ReplenishmentRecommendations`

This gives managers a history of what the advisor reviewed, what it recommended, and how humans decided on those recommendations.

## Current Limitations

- The advisor reviews one branch per run.
- Recommendations are not converted into purchase orders.
- Approval does not update inventory.
- Live runs require a configured OpenAI API key.
- No dedicated automated test project currently covers this workflow.
