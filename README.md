# BranchOps

BranchOps is a full-stack multi-branch operations system for businesses and restaurants. It centralizes branch administration, employees, product catalog management, POS orders, inventory, sales reporting, audit history, and AI-assisted stock analysis in one role-aware web application.

The application is split into a React + TypeScript frontend and an ASP.NET Core backend backed by PostgreSQL. AI features live in a separate .NET project and stream results to the browser with Server-Sent Events.

## Tech Stack

| Area | Stack |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Bun, React Router, TanStack React Query, Zustand, Axios |
| UI | Tailwind CSS v4, shadcn/radix-style components, lucide-react, Recharts, i18next |
| Backend | ASP.NET Core Web API, .NET 10, Entity Framework Core 10, Npgsql/PostgreSQL |
| Auth | ASP.NET Core JWT Bearer auth, Identity password hashing, refresh tokens, role-based authorization |
| AI | `BranchOps.Ai`, Microsoft Agents AI, OpenAI chat model config, SSE event streams |
| API Docs | ASP.NET Core OpenAPI + Scalar in Development |

## Core Features

- Secure login, refresh tokens, protected routes, and role-based UI navigation.
- Branch, branch phone, employee, salary, admin user, and account settings management.
- Product and category management with branch-aware stock views.
- POS order creation, order history, cancellation, and stock deduction workflows.
- Inventory tools for stock levels, stock adjustments, threshold updates, and low-stock alerts.
- Dashboard cards, sales charts, branch performance, top products, recent orders, and low-stock summaries.
- Sales reports for daily sales, branch sales, top products, and CSV export.
- Audit log browsing for administrative review.
- Replenishment Advisor for AI-assisted reorder recommendations.
- BranchOps Agent for read-only operational questions over sales, stock, dashboard, branch, and order data.
- English/Arabic localization support and RTL-aware UI wiring.

## Repository Layout

```text
BranchOps/
  client/                         React + TypeScript frontend
    src/
      components/                 Shared and UI components
      features/                   Feature modules and route pages
      hooks/                      Shared React hooks
      layouts/                    Route guards and shell layouts
      lib/                        Utility and route permission helpers
      locales/                    i18n resources and language utilities
      services/api.ts             Axios API client and token refresh wiring
      router.tsx                  Frontend route tree
  server/
    BranchOps.Api/                ASP.NET Core API, controllers, services, EF config
    BranchOps.Domain/             Domain entities and enums
    BranchOps.Ai/                 AI agents, tools, middleware, streaming models
    Seed/                         Initial seed data and seed metadata
    SqlScripts/                   Manual helper SQL scripts
  diagrams/                       Mermaid diagrams and rendered images
  docs/                           Feature notes and screenshots
  plan/                           Planning artifacts
  BranchOps.slnx                  .NET solution file
```

## Prerequisites

- Bun for frontend package management and scripts.
- .NET SDK 10.0 or newer compatible with the project target framework.
- PostgreSQL running locally or remotely.
- EF Core CLI if you want to run migrations manually:

```powershell
dotnet tool install --global dotnet-ef
```

- An OpenAI API key. API startup validates `Ai:OpenAI:ApiKey`, so the backend will not start without it.
- A trusted ASP.NET Core HTTPS development certificate if using the default HTTPS API URL:

```powershell
dotnet dev-certs https --trust
```

## Quick Start

1. Install frontend dependencies:

```powershell
cd C:\Projects\BranchOps\client
bun install
Copy-Item .env.example .env
```

2. Configure backend secrets:

```powershell
cd C:\Projects\BranchOps\server\BranchOps.Api
dotnet user-secrets set "Ai:OpenAI:ApiKey" "YOUR_OPENAI_API_KEY"
dotnet user-secrets set "Jwt:Key" "YOUR_LONG_LOCAL_JWT_SIGNING_KEY"
```

3. If your PostgreSQL credentials differ from the committed local default, override the connection string:

```powershell
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=BranchOpsDb;Username=postgres;Password=YOUR_PASSWORD;"
```

4. Start the backend:

```powershell
cd C:\Projects\BranchOps\server\BranchOps.Api
dotnet run --launch-profile https
```

5. Start the frontend in a second terminal:

```powershell
cd C:\Projects\BranchOps\client
bun dev
```

6. Open the app:

```text
http://localhost:5173
```

The default frontend API base URL points to:

```text
https://localhost:7141/api
```

## Project Configuration

BranchOps uses ASP.NET Core configuration for the API and Vite environment variables for the client. Keep secrets out of committed files; use .NET user-secrets locally and environment variables in deployed environments.

### `server/BranchOps.Api/appsettings.json`

This file contains committed backend defaults for database, JWT, AI, logging, and host settings.

| Key | Default | Purpose |
| --- | --- | --- |
| `ConnectionStrings:DefaultConnection` | `Host=localhost;Port=5432;Database=BranchOpsDb;Username=postgres;Password=postgres;` | PostgreSQL connection used by EF Core. |
| `Jwt:Key` | Development signing key | HMAC signing key for access tokens. Override for local and production use. |
| `Jwt:Issuer` | `BranchOps` | Expected token issuer. |
| `Jwt:Audience` | `BranchOpsClient` | Expected token audience. |
| `Jwt:ExpirationMinutes` | `60` | Access token lifetime. |
| `Jwt:RefreshTokenExpirationDays` | `7` | Refresh token lifetime. |
| `Ai:OpenAI:Model` | `gpt-5-mini` | Model id used by AI agents. |
| `Ai:Replenishment:MaxToolIterations` | `6` | Tool-call loop limit for one replenishment run. |
| `Ai:Replenishment:DefaultLookbackDays` | `30` | Default sales-history window for replenishment analysis. |
| `Ai:Replenishment:MaxProductsPerRun` | `3` | Maximum persisted recommendations per run. |
| `Ai:BranchOpsAgent:MaxToolIterations` | `8` | Tool-call loop limit for one BranchOps Agent answer. |
| `Ai:BranchOpsAgent:DefaultLookbackDays` | `30` | Default lookback window for operational questions. |
| `Ai:BranchOpsAgent:MaxTableRows` | `10` | Maximum table rows returned by agent tools. |
| `Ai:BranchOpsAgent:MaxMessageLength` | `1000` | Maximum accepted user message length. |
| `Ai:BranchOpsAgent:MaxHistoryMessages` | `6` | Recent chat messages sent with an agent request. |

`Ai:OpenAI:ApiKey` is intentionally not committed, but the API requires it at startup.

### `server/BranchOps.Api/appsettings.Development.json`

This file holds development-only backend overrides for logging levels:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

### `server/BranchOps.Api/BranchOps.Api.csproj`

The API targets `.NET 10` and includes a `UserSecretsId`, so local secrets can be set without initializing user-secrets again.

Common local secrets:

```powershell
cd C:\Projects\BranchOps\server\BranchOps.Api
dotnet user-secrets set "Ai:OpenAI:ApiKey" "YOUR_OPENAI_API_KEY"
dotnet user-secrets set "Jwt:Key" "YOUR_LONG_LOCAL_JWT_SIGNING_KEY"
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=BranchOpsDb;Username=postgres;Password=YOUR_PASSWORD;"
dotnet user-secrets list
```

On Windows, user-secrets are stored outside the repository:

```text
C:\Users\<YourUser>\AppData\Roaming\Microsoft\UserSecrets\<UserSecretsId>\secrets.json
```

### `server/BranchOps.Api/Program.cs`

Startup requires these backend keys:

| Key | Purpose |
| --- | --- |
| `ConnectionStrings:DefaultConnection` | Database connection string. |
| `Jwt:Key` | JWT access-token signing key. |
| `Ai:OpenAI:ApiKey` | OpenAI API key for AI services. |

`Program.cs` also configures:

- OpenAPI and Scalar API reference in development.
- CORS policy `AllowFrontend` for `http://localhost:5173` and `https://localhost:5173`.
- JWT bearer authentication and authorization.
- Automatic migration and seed import through `SeedImporter`.

ASP.NET Core environment variables use `__` for nested keys:

```powershell
$env:ConnectionStrings__DefaultConnection="Host=localhost;Port=5432;Database=BranchOpsDb;Username=postgres;Password=YOUR_PASSWORD;"
$env:Jwt__Key="YOUR_LONG_JWT_SIGNING_KEY"
$env:Ai__OpenAI__ApiKey="YOUR_OPENAI_API_KEY"
$env:Ai__OpenAI__Model="gpt-5-mini"
```

### `server/BranchOps.Api/Properties/launchSettings.json`

Backend launch profiles:

| Profile | URL |
| --- | --- |
| `http` | `http://localhost:5065` |
| `https` | `https://localhost:7141;http://localhost:5065` |

Both profiles set:

```text
ASPNETCORE_ENVIRONMENT=Development
```

### `server/BranchOps.Ai/Configuration/AiOptions.cs`

This file defines the strongly typed AI options bound from the `Ai` section:

- `Ai:OpenAI` for `ApiKey`, `Model`, and optional `Organization`.
- `Ai:Replenishment` for advisor iteration, lookback, and persisted recommendation limits.
- `Ai:BranchOpsAgent` for analyst iteration, lookback, table size, message length, and history limits.

### `server/Seed/init.json`

The seed file is copied into the API output and imported on startup after migrations run. Import happens only when the `Users` table is empty. Passwords are stored as hashes, not plaintext credentials.

Seed summary:

| Section | Records |
| --- | ---: |
| Users | 30 |
| Branches | 14 |
| BranchPhones | 16 |
| Employees | 29 |
| EmployeeSalaries | 32 |
| ProductCategories | 6 |
| Products | 24 |
| BranchStocks | 30 |
| Orders | 16 |
| OrderItems | 36 |
| StockAdjustments | 71 |
| AuditLogs | 20 |

### `client/.env.example` and `client/.env`

Create the local frontend environment file from the example:

```powershell
cd C:\Projects\BranchOps\client
Copy-Item .env.example .env
```

Frontend API base URL:

```env
VITE_API_BASE_URL=https://localhost:7141/api
```

### `client/src/services/api.ts`

The Axios client uses `VITE_API_BASE_URL` for API requests and token refresh. It also:

- Sends JSON requests.
- Includes credentials.
- Attaches the JWT bearer token.
- Retries 401 responses through `/Auth/refresh-token`.
- Appends `branchId` to selected branch-scoped GET requests for non-admin users.

## Running the Application

### Backend

```powershell
cd C:\Projects\BranchOps\server\BranchOps.Api
dotnet run --launch-profile https
```

Development OpenAPI and Scalar are enabled only when `ASPNETCORE_ENVIRONMENT=Development`. With the default HTTPS profile, the API docs are available through the Scalar route exposed by `MapScalarApiReference`.

### Frontend

```powershell
cd C:\Projects\BranchOps\client
bun dev
```

The frontend is a Vite SPA. Route protection and sidebar filtering are handled client-side, while data access is still enforced by backend authorization policies.

## Command Reference

Run frontend commands from `client/`:

| Command | Purpose |
| --- | --- |
| `bun install` | Install frontend dependencies from `bun.lock`. |
| `bun dev` | Start the Vite dev server on `localhost:5173`. |
| `bun build` | Run TypeScript build checks and create a production bundle. |
| `bun lint` | Run ESLint over the frontend. |
| `bun preview` | Serve the production build locally. |

Run backend commands from `server/BranchOps.Api/` unless noted:

| Command | Purpose |
| --- | --- |
| `dotnet run --launch-profile https` | Start the API with the HTTPS launch profile. |
| `dotnet build` | Build the API project and referenced projects. |
| `dotnet build C:\Projects\BranchOps\BranchOps.slnx` | Build the full .NET solution from anywhere. |
| `dotnet ef migrations add <Name>` | Create an EF Core migration. |
| `dotnet ef database update` | Apply pending migrations. |
| `dotnet user-secrets list` | Show local API user-secrets. |

VS Code tasks are also configured for `Run Backend`, `Run Frontend`, and `Run All`.

## Authentication and Roles

Backend roles are defined by `BranchOps.Domain/Auth/UserRole.cs`:

```text
Admin, StockManager, BranchManager, Cashier, Guest
```

The frontend mirrors these numeric roles in `client/src/features/auth/types.ts` and centralizes route permissions in `client/src/lib/route-permissions.ts`.

High-level route access:

| Area | Roles |
| --- | --- |
| Dashboard, settings | Any authenticated user |
| Admin users, audit log | Admin |
| Branches, employees, salaries, reports | Admin, BranchManager |
| POS and order history | Admin, BranchManager, Cashier |
| Products and inventory views | Admin, StockManager, BranchManager, Cashier |
| Replenishment Advisor | Admin, StockManager, BranchManager |
| BranchOps Agent | Admin, StockManager, BranchManager |

For non-admin users, the JWT includes a `BranchId` claim when an employee record exists. The frontend appends that branch id to branch-scoped GET requests, and backend services/controllers enforce role and branch rules for sensitive workflows.

## Backend API

Most controllers use the route convention:

```text
/api/[Controller]
```

Important API areas:

| Controller | Purpose |
| --- | --- |
| `AuthController` | Login, logout, refresh token, current user, admin user management. |
| `BranchesController` and `BranchPhonesController` | Branch metadata and contact numbers. |
| `EmployeesController` and `EmployeeSalariesController` | Staff and salary management. |
| `ProductsController` and `ProductCategoriesController` | Product catalog and categories. |
| `OrdersController` | POS order creation, update, cancellation, deletion, and history. |
| `StockController` | Stock levels, low-stock alerts, adjustments, thresholds, and stock mutations. |
| `DashboardController` | Dashboard overview, charts, top products, recent orders, alerts. |
| `ReportsController` | Daily sales, branch sales, top products, and sales CSV export. |
| `AuditLogController` | Admin audit log browsing and filter metadata. |
| `ReplenishmentController` | AI replenishment runs, history, details, approvals, rejections. |
| `BranchOpsAgentController` | Read-only operational AI analyst streaming endpoint. |
| `AccountSettingsController` | Profile and password updates for the authenticated user. |

## AI Workflows

### Replenishment Advisor

The Replenishment Advisor is available at:

```text
/inventory/replenishment-agent
```

It reviews one branch at a time, streams tool activity and narrative output, drafts reorder recommendations, and persists accepted draft recommendations as pending records. Human approval or rejection records decision metadata, but it does not update stock, create purchase orders, or create stock adjustments.

Primary backend flow:

1. `POST /api/Replenishment/runs?branchId=<branch-id>` starts an SSE stream.
2. The API creates a `ReplenishmentRun`.
3. The AI agent reads stock, product, and sales data through branch-scoped tools.
4. Draft recommendations are validated by the orchestrator.
5. Valid recommendations are persisted up to `Ai:Replenishment:MaxProductsPerRun`.
6. Run history and details are available from `GET /api/Replenishment/runs` and `GET /api/Replenishment/runs/{id}`.
7. Users approve or reject recommendations through run recommendation endpoints.

More detail is in `docs/replenishment-advisor-feat-doc.md`.

### BranchOps Agent

The BranchOps Agent is available at:

```text
/reports/branchops-agent
```

It is an ephemeral, read-only operational analyst. Conversations are not persisted, tools do not mutate data, and tool calls are audited with entity type `BranchOpsAgent`.

Primary backend flow:

1. `POST /api/BranchOpsAgent/stream` sends a message, optional branch id, and recent in-memory history.
2. The API sets a transient run context.
3. The agent streams text and tool activity over SSE.
4. Admin users can query all branches or one selected branch.
5. Non-admin users are forced to the branch from their JWT claim.

More detail is in `docs/branchops-agent.md`.

## Database and Migrations

EF Core configuration lives under:

```text
server/BranchOps.Api/Data/
```

Migrations live under:

```text
server/BranchOps.Api/Migrations/
```

The migration sequence includes:

- Initial users
- Branches, employees, and salaries
- Products and orders
- Stock management
- Audit log
- Replenishment agent tables

The domain model lives in `server/BranchOps.Domain`, while API-specific EF configuration is kept in `server/BranchOps.Api/Data/Configuration`.

## Development Guidelines

- Keep frontend feature code under `client/src/features/`.
- Use `@/` imports for files under `client/src/`.
- Keep server state in TanStack Query hooks and auth state in Zustand.
- Keep backend controller actions thin and move business logic into services.
- Use DTOs for API contracts and domain entities for persistence models.
- Prefer EF Core migrations for schema changes.
- Do not commit secrets, real credentials, local machine configuration, or generated build output.

## Build and Verification

No dedicated frontend test runner or backend test project is configured. Before submitting changes, run:

```powershell
cd C:\Projects\BranchOps\client
bun lint
bun build
```

```powershell
cd C:\Projects\BranchOps\server\BranchOps.Api
dotnet build
```

For high-risk backend changes, add or propose a nearby `*.Tests` project under `server/`. For UI changes, manually verify the affected routes in the browser and include screenshots in pull requests when the visual behavior changes.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| API exits with missing OpenAI config | Set `Ai:OpenAI:ApiKey` through user-secrets or an environment variable. |
| API exits with missing JWT key | Set `Jwt:Key`; use a long random string for local development. |
| API cannot connect to PostgreSQL | Verify PostgreSQL is running and `ConnectionStrings:DefaultConnection` matches your local credentials. |
| Browser blocks API calls | Confirm `VITE_API_BASE_URL` points to the backend and the frontend runs on a CORS-allowed origin. |
| HTTPS certificate warning | Run `dotnet dev-certs https --trust`. |
| Database is empty | Start the API or run `dotnet ef database update`; seed import runs only when the `Users` table is empty. |
| Login fails with seeded users | The seed file contains password hashes, not plaintext passwords; create/reset a user through the app/database or use project-provided local credentials. |
| AI stream starts then fails | Check OpenAI key, model id, network access, and AI iteration limits. |

## Supporting Documentation

- `docs/replenishment-advisor-feat-doc.md` - Replenishment Advisor behavior, SSE events, persistence, and limitations.
- `docs/branchops-agent.md` - BranchOps Agent scope, flow, SSE events, and configuration.
- `diagrams/diagrams-overview.md` - Architecture and analysis diagrams.
- `server/Seed/README.md` - Seed metadata and record counts.
- `docs/imgs/` - UI screenshots used by the project documentation.
