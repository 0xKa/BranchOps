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

**Routing** (`client/src/router.tsx`): Three route guards in `client/src/layouts/`:

1. `ProtectedRoute` — requires authentication
2. `PublicOnlyRoute` — redirects authenticated users away from login/home
3. `RoleRoute` — restricts to specific roles (composed inside `ProtectedRoute`)

The route-to-allowed-roles map in `client/src/lib/route-permissions.ts` is **not** a router guard — it's the source of truth used by the sidebar to filter nav items and by helpers like `hasRouteAccess` / `getDefaultRouteForRole`. Keep it in sync with the `<RoleRoute allowedRoles={...}>` blocks in `router.tsx`.

**Auth flow** (`client/src/features/auth/auth-store.ts`): Zustand store persists `user` and a `tokens` object (`accessToken`, `refreshToken`, `accessTokenExpiresAt`) plus `isAuthenticated` to localStorage under key `auth-storage`. Exposes `isTokenExpired()` (30 s skew) and an `isHydrated` flag for gating routing on first load. Roles: `Admin (0)`, `StockManager (1)`, `BranchManager (2)`, `Cashier (3)`, `Guest (4)`.

**API layer** (`client/src/services/api.ts`): Axios instance with two interceptors:

- Attaches JWT `Authorization` header on every request
- On 401, auto-refreshes the access token via `POST /Auth/refresh-token` (queueing concurrent failed requests) and retries the original; refresh failure triggers `logout()`
- For non-Admin users, automatically injects `branchId` query param on **GET** requests to branch-scoped endpoints. Current `BRANCH_SCOPED_PREFIXES`: `Orders`, `Stock`, `Dashboard`, `Reports`, `Employees`, `BranchPhones`, `Branches`. Caller-provided `branchId` is preserved.

**State management**: Zustand for auth state; TanStack React Query for all server state (caching, background refetch).

**UI**: shadcn/ui components (Radix UI primitives) + Tailwind CSS 4. Path alias `@/` maps to `client/src/`.

**i18n**: i18next with English and Arabic (`client/src/locales/`), including RTL support.

### Backend

**Layered architecture** inside `server/BranchOps.Api/`:

- `Controllers/` — 13 REST controllers (`AccountSettings`, `AuditLog`, `Auth`, `Branches`, `BranchPhones`, `Dashboard`, `EmployeeSalaries`, `Employees`, `Orders`, `ProductCategories`, `Products`, `Reports`, `Stock`); role-based `[Authorize]` attributes enforce access
- `Services/` — business logic registered via `DependencyInjection.cs`; service methods return `ServiceResult<T>` for uniform error handling
- `Data/BranchOpsDbContext.cs` — EF Core DbContext; automatically sets `CreatedAt`/`UpdatedAt` on `SaveChanges`
- `Data/Configuration/` — Fluent API entity configurations
- `Security/Auth.cs` — JWT generation and refresh token logic; JWT includes a `BranchId` claim for non-Admin users. `UserContextExtensions.cs` provides `ClaimsPrincipal` helpers used by controllers
- `Dtos/` — request/response DTOs
- `Migrations/` — EF Core migration history
- `Seed/` — `SeedImporter.RunAsync` is invoked from `Program.cs` on startup to import fixture data

CORS in `Program.cs` allows `http(s)://localhost:5173` only (development origin).

**Domain** (`server/BranchOps.Domain/`): Plain C# entities. All inherit from `BaseDomainObject` (adds `CreatedAt`, `UpdatedAt`). `User` and `UserRole` live under `Auth/`; the rest are at the project root. Key entities: `User`, `Branch`, `BranchPhone`, `Employee`, `EmployeeSalary`, `Product`, `ProductCategory`, `Order`, `OrderItem`, `BranchStock`, `StockAdjustment`, `AuditLog`.

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

| Layer              | Technology                         |
| ------------------ | ---------------------------------- |
| Frontend framework | React 19, TypeScript, Bun + Vite 7 |
| Routing            | React Router v7                    |
| Server state       | TanStack React Query 5             |
| Client state       | Zustand 5                          |
| UI components      | shadcn/ui (Radix UI)               |
| Styling            | Tailwind CSS 4                     |
| Forms              | React Hook Form + Zod              |
| Backend framework  | ASP.NET Core Web API (.NET 10)     |
| ORM                | Entity Framework Core 10 + Npgsql  |
| Database           | PostgreSQL                         |
| Auth               | JWT Bearer + ASP.NET Identity      |
| API docs           | Scalar (OpenAPI) at `/scalar`      |
