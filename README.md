# BranchOps

A web-based multi-branch management system for businesses and restaurents to centralizes operations across different locations. The MVP targets fast order processing, accurate inventory, and branch-level visibility with role-based access.

**MVP Features**

- Secure login (JWT) + roles (Admin/BranchManager/Staff)
- Branch management
- Product catalog (products + categories)
- POS orders (create, totals, paid/cancelled)
- Inventory tracking (auto deduction from orders + stock-in/adjustments)
- Low-stock alerts (reorder level per branch)
- Basic reports (daily sales, sales by branch, top products)
- Audit trail (who/when)
- Sales forecasting per branch/product (ML python) (e.g., next 7–30 days) using historical orders to predict demand and suggest reorder quantities.

**Tech Stack**

- Frontend: React + TypeScript
- Backend: ASP.NET Core Web API + EF Core
- DB: PostgreSQL
- Auth: JWT + RBAC
- ML Service: Python (FastAPI) + scikit-learn or Prophet, model saved + called by the .NET API
