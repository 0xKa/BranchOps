# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BranchOps is a multi-branch retail/POS management system with a React + TypeScript frontend (Bun + Vite) and an ASP.NET Core Web API backend (.NET 10), backed by PostgreSQL.

## Development Commands

### Frontend (`client/`)

```bash
cd client
bun dev          # Start Vite dev server (hot reload on localhost:5173)
bun build        # Type-check + production build
bun lint         # Run ESLint
bun preview      # Preview production build
```

### Backend (`server/`)

```bash
cd server/BranchOps.Api
dotnet run       # Start API on https://localhost:7141
dotnet build     # Build solution
dotnet ef migrations add <Name>   # Add EF Core migration
dotnet ef database update         # Apply pending migrations
```

### Environment Setup

Copy `client/.env.example` to `client/.env`. The default API base URL is `https://localhost:7141/api`.

PostgreSQL must be running locally: `Host=localhost;Port=5432;Database=BranchOpsDb;Username=postgres;Password=postgres`

## Architecture

### Frontend

**Feature-based organization** under `client/src/features/` — each feature owns its components, hooks, and API calls. Features: `auth`, `dashboard`, `users`, `branches`, `products`, `pos`, `inventory`, `reports`, `audit-log`, `settings`, `landing`.

**Routing** (`client/src/router.tsx`): Three-tier route guards:

1. `ProtectedRoute` — requires authentication
2. `RoleRoute` — restricts to specific roles
3. Role-to-route mapping lives in `client/src/lib/route-permissions.ts`

**Auth flow** (`client/src/features/auth/auth-store.ts`): Zustand store persists `user`, `accessToken`, `refreshToken` to localStorage. Roles: `Admin (0)`, `StockManager (1)`, `BranchManager (2)`, `Cashier (3)`, `Guest (4)`.

**API layer** (`client/src/services/api.ts`): Axios instance with two interceptors:

- Attaches JWT `Authorization` header on every request
- On 401, auto-refreshes the access token and retries the original request
- For non-Admin users, automatically injects `branchId` query param on branch-scoped endpoints (Orders, Stock, Dashboard, Reports, etc.)

**State management**: Zustand for auth state; TanStack React Query for all server state (caching, background refetch).

**UI**: shadcn/ui components (Radix UI primitives) + Tailwind CSS 4. Path alias `@/` maps to `client/src/`.

**i18n**: i18next with English and Arabic (`client/src/locales/`), including RTL support.

### Backend

**Layered architecture** inside `server/BranchOps.Api/`:

- `Controllers/` — 13 REST controllers; role-based `[Authorize]` attributes enforce access
- `Services/` — business logic registered via `DependencyInjection.cs`
- `Data/BranchOpsDbContext.cs` — EF Core DbContext; automatically sets `CreatedAt`/`UpdatedAt` on `SaveChanges`
- `Data/Configuration/` — Fluent API entity configurations
- `Security/Auth.cs` — JWT generation and refresh token logic; JWT includes a `BranchId` claim for non-Admin users
- `Dtos/` — request/response DTOs
- `Migrations/` — EF Core migration history

**Domain** (`server/BranchOps.Domain/`): Plain C# entities. All inherit from `BaseDomainObject` (adds `CreatedAt`, `UpdatedAt`). Key entities: `User`, `Branch`, `Employee`, `EmployeeSalary`, `Product`, `ProductCategory`, `Order`, `OrderItem`, `BranchStock`, `StockAdjustment`, `AuditLog`.

**Branch-scoping pattern**: Non-Admin users have a `BranchId` JWT claim. Controllers accept an optional `branchId` query param; for non-Admin users the claim value is enforced, overriding any param the client sends.

**Audit trail**: Every mutating operation writes to the `AuditLog` table via the audit log service.

### Key Roles & Access

| Role          | Access                                    |
| ------------- | ----------------------------------------- |
| Admin         | All features, all branches                |
| BranchManager | Employees, Branches, Reports (own branch) |
| StockManager  | Products, Inventory                       |
| Cashier       | POS Orders, Products, Inventory           |
| Guest         | Read-only landing page                    |

## Tech Stack Quick Reference

| Layer              | Technology                        |
| ------------------ | --------------------------------- |
| Frontend framework | React 19, TypeScript, Vite 7      |
| Routing            | React Router v7                   |
| Server state       | TanStack React Query 5            |
| Client state       | Zustand 5                         |
| UI components      | shadcn/ui (Radix UI)              |
| Styling            | Tailwind CSS 4                    |
| Forms              | React Hook Form + Zod             |
| Backend framework  | ASP.NET Core Web API (.NET 10)    |
| ORM                | Entity Framework Core 10 + Npgsql |
| Database           | PostgreSQL                        |
| Auth               | JWT Bearer + ASP.NET Identity     |
| API docs           | Scalar (OpenAPI) at `/scalar`     |
