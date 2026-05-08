# Repository Guidelines

## Project Structure & Module Organization

BranchOps is split into a React + TypeScript frontend and ASP.NET Core backend. Frontend code lives in `client/src/`: feature modules are in `features/`, shared UI in `components/`, routing in `router.tsx`, API setup in `services/api.ts`, translations in `locales/`, and static assets in `assets/`.

Backend code lives in `server/`. `BranchOps.Api/` contains controllers, services, DTOs, EF Core configuration, migrations, security helpers, and startup code. `BranchOps.Domain/` contains entities. `BranchOps.Ai/` contains the AI/replenishment skeleton. Diagrams and planning docs are in `diagrams/`, `docs/`, and `plan/`.

## Build, Test, and Development Commands

Run frontend commands from `client/`:

- `bun dev` starts the Vite dev server on `localhost:5173`.
- `bun build` runs TypeScript checks and creates a production build.
- `bun lint` runs ESLint across the frontend.
- `bun preview` serves the production build.

Run backend commands from `server/BranchOps.Api/`:

- `dotnet run --launch-profile https` starts the API.
- `dotnet build` builds backend projects.
- `dotnet ef migrations add <Name>` creates a migration.
- `dotnet ef database update` applies pending migrations.

VS Code defines `Run Backend`, `Run Frontend`, and `Run All` tasks.

## Coding Style & Naming Conventions

Use TypeScript, React function components, and feature-based organization on the client. Prefer kebab-case filenames, such as `use-products.ts` or `create-product-dialog.tsx`. Use the `@/` alias for `client/src/`. Keep server state in TanStack React Query hooks and auth state in Zustand.

Use standard C# conventions: PascalCase public types and members, camelCase locals, controllers ending in `Controller`, services ending in `Service`, and DTOs ending in `Dto`. Keep business logic in services and controller actions thin.

## Testing Guidelines

No dedicated test projects or frontend test runner are currently configured. Before submitting, run `bun lint`, `bun build`, and `dotnet build`. For high-risk backend changes, add or propose a `*.Tests` project near `server/`. For UI changes, manually verify affected routes.

## Commit & Pull Request Guidelines

Recent history uses short imperative commits, sometimes with Conventional Commit scopes, for example `feat(export): add sales export page on client side`. Keep messages focused on one change.

Pull requests should include a concise summary, test/build results, linked issue or task when available, and screenshots for UI changes. Note migrations, new environment variables, or permission changes explicitly.

## Security & Configuration Tips

Copy `client/.env.example` to `client/.env` for frontend configuration. The default API URL is `https://localhost:7141/api`. Local PostgreSQL is expected at `localhost:5432` with database `BranchOpsDb`. Do not commit secrets, real credentials, or machine-specific configuration.
