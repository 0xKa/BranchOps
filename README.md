# BranchOps

A web-based multi-branch management system for businesses and restaurants to centralizes operations across different locations. The MVP targets fast order processing, accurate inventory, and branch-level visibility with role-based access.

**MVP Features**

- Secure login (JWT) + roles (Admin/BranchManager/Staff)
- Branch management
- Product catalog (products + categories)
- POS orders (create, totals, paid/cancelled)
- Inventory tracking (auto deduction from orders + stock-in/adjustments)
- Low-stock alerts (reorder level per branch)
- Basic reports (daily sales, sales by branch, top products)
- Audit trail (who/when)
- Sales forecasting per branch/product (e.g., next 7–30 days) using historical orders to predict demand and suggest reorder quantities.

**Tech Stack**

- Frontend: React + TypeScript + Vite
- Backend: ASP.NET Core Web API + EF Core
- DB: PostgreSQL
- Auth: JWT + RBAC
- AI: Microsoft Agent Framework + OpenAI API for the Replenishment Advisor

## Project Configuration

BranchOps uses ASP.NET Core configuration on the backend and Vite environment variables on the frontend. Keep real secrets out of committed files.

### Backend Config Files

Backend configuration is read from:

- `server/BranchOps.Api/appsettings.json`
- `server/BranchOps.Api/appsettings.Development.json`
- .NET user-secrets in local development
- Environment variables in deployed environments

Run backend commands from:

```powershell
cd C:\Projects\BranchOps\server\BranchOps.Api
```

### Database

The PostgreSQL connection string key is:

```text
ConnectionStrings:DefaultConnection
```

Current local default:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=BranchOpsDb;Username=postgres;Password=postgres;"
  }
}
```

Expected local database:

- Host: `localhost`
- Port: `5432`
- Database: `BranchOpsDb`
- Username: `postgres`
- Password: `postgres`

Override locally with user-secrets if your database credentials differ:

```powershell
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=BranchOpsDb;Username=postgres;Password=YOUR_PASSWORD;"
```

Apply migrations:

```powershell
dotnet ef database update
```

### JWT

JWT settings are under:

```text
Jwt
```

Current keys:

```json
{
  "Jwt": {
    "Key": "local-development-signing-key",
    "Issuer": "BranchOps",
    "Audience": "BranchOpsClient",
    "ExpirationMinutes": 60,
    "RefreshTokenExpirationDays": 7
  }
}
```

Config meanings:

- `Jwt:Key`: signing key used to issue and validate access tokens.
- `Jwt:Issuer`: expected token issuer.
- `Jwt:Audience`: expected token audience.
- `Jwt:ExpirationMinutes`: access token lifetime.
- `Jwt:RefreshTokenExpirationDays`: refresh token lifetime.

For local development, use a long random signing key. For production, set it through environment variables or a secret manager, not a committed file:

```powershell
dotnet user-secrets set "Jwt:Key" "YOUR_LONG_LOCAL_JWT_SIGNING_KEY"
```

### AI and OpenAI

AI settings are under:

```text
Ai
```

Current keys:

```json
{
  "Ai": {
    "OpenAI": {
      "ApiKey": "set with user-secrets or environment variables",
      "Model": "gpt-5-mini"
    },
    "Replenishment": {
      "MaxToolIterations": 6,
      "DefaultLookbackDays": 30,
      "MaxProductsPerRun": 3
    },
    "AskBranchOps": {
      "MaxToolIterations": 8,
      "DefaultLookbackDays": 30,
      "MaxTableRows": 10,
      "MaxMessageLength": 1000,
      "MaxHistoryMessages": 6
    }
  }
}
```

Config meanings:

- `Ai:OpenAI:ApiKey`: OpenAI API key. Required for the Replenishment Advisor.
- `Ai:OpenAI:Model`: OpenAI model id used by the advisor.
- `Ai:Replenishment:MaxToolIterations`: maximum tool-call loop iterations per run.
- `Ai:Replenishment:DefaultLookbackDays`: default sales-history window for replenishment analysis.
- `Ai:Replenishment:MaxProductsPerRun`: maximum persisted recommendations per advisor run.
- `Ai:AskBranchOps:MaxToolIterations`: maximum tool-call loop iterations for one Ask BranchOps answer.
- `Ai:AskBranchOps:DefaultLookbackDays`: default lookback window for operational questions.
- `Ai:AskBranchOps:MaxTableRows`: maximum rows returned by Ask BranchOps table-oriented tools.
- `Ai:AskBranchOps:MaxMessageLength`: maximum user message length accepted by the Ask BranchOps stream endpoint.
- `Ai:AskBranchOps:MaxHistoryMessages`: maximum recent chat messages sent to the Ask BranchOps agent.

Set the OpenAI API key with user-secrets:

```powershell
dotnet user-secrets set "Ai:OpenAI:ApiKey" "YOUR_OPENAI_API_KEY"
```

Optional: change the model locally:

```powershell
dotnet user-secrets set "Ai:OpenAI:Model" "gpt-5-mini"
```

For low-cost local testing, keep:

```powershell
dotnet user-secrets set "Ai:Replenishment:MaxToolIterations" "6"
dotnet user-secrets set "Ai:Replenishment:MaxProductsPerRun" "3"
```

### Frontend

Frontend configuration is read from `client/.env`.

Create it from the example file:

```powershell
cd C:\Projects\BranchOps\client
Copy-Item .env.example .env
```

Current frontend key:

```env
VITE_API_BASE_URL=https://localhost:7141/api
```

Config meaning:

- `VITE_API_BASE_URL`: base URL used by the React client for API requests.

### User-Secrets

The API project uses .NET user-secrets for local secrets. The project must have a `UserSecretsId` in `server/BranchOps.Api/BranchOps.Api.csproj`.

If it is missing, initialize it once:

```powershell
cd C:\Projects\BranchOps\server\BranchOps.Api
dotnet user-secrets init
```

List saved local secrets:

```powershell
dotnet user-secrets list
```

Common local secrets:

```powershell
dotnet user-secrets set "Ai:OpenAI:ApiKey" "YOUR_OPENAI_API_KEY"
dotnet user-secrets set "Jwt:Key" "YOUR_LONG_LOCAL_JWT_SIGNING_KEY"
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=BranchOpsDb;Username=postgres;Password=YOUR_PASSWORD;"
```

On Windows, user-secrets are stored outside the repository under:

```text
C:\Users\<YourUser>\AppData\Roaming\Microsoft\UserSecrets\<UserSecretsId>\secrets.json
```

### Environment Variable Names

ASP.NET Core supports environment variable overrides by replacing `:` with `__`.

Examples:

```powershell
$env:ConnectionStrings__DefaultConnection="Host=localhost;Port=5432;Database=BranchOpsDb;Username=postgres;Password=YOUR_PASSWORD;"
$env:Jwt__Key="YOUR_LONG_JWT_SIGNING_KEY"
$env:Ai__OpenAI__ApiKey="YOUR_OPENAI_API_KEY"
$env:Ai__OpenAI__Model="gpt-5-mini"
$env:Ai__Replenishment__MaxToolIterations="6"
$env:Ai__AskBranchOps__MaxToolIterations="8"
```

### Run Locally

Start the backend:

```powershell
cd C:\Projects\BranchOps\server\BranchOps.Api
dotnet run --launch-profile https
```

Start the frontend:

```powershell
cd C:\Projects\BranchOps\client
bun dev
```
