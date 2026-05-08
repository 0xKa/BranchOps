# Ask BranchOps

Ask BranchOps is an ephemeral, read-only AI analyst for operational questions. It is available at `/reports/ask-branchops` for `Admin`, `BranchManager`, and `StockManager` users.

## Scope

- No conversations or messages are persisted.
- No tools mutate data. The agent can only read dashboard metrics, sales reports, branch performance, recent orders, top products, low-stock alerts, and branch metadata.
- Tool calls are audited with entity type `AskBranchOps`.
- Admin users can ask across all branches or select one branch.
- Non-Admin users are forced to the branch in their JWT claim, regardless of any client-supplied branch id.

## Flow

1. The React page sends `POST /api/AskBranchOps/stream` with a message, optional branch id, and the last few in-memory messages.
2. The API creates a transient correlation id and sets AI run context to `AskBranchOps`.
3. The agent streams text and tool activity over SSE.
4. The UI appends text deltas, renders markdown-style tables, and shows collapsible tool activity.
5. Cancellation aborts the request and leaves the current assistant message marked as cancelled.

## SSE Events

- `tool-start`
- `tool-end`
- `text-delta`
- `answer-completed`
- `answer-failed`

## Configuration

Settings live under `Ai:AskBranchOps`:

- `MaxToolIterations`, default `8`
- `DefaultLookbackDays`, default `30`
- `MaxTableRows`, default `10`
- `MaxMessageLength`, default `1000`
- `MaxHistoryMessages`, default `6`
