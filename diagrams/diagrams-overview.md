# BranchOps — Diagrams Overview

All diagrams are located in the [`diagrams/`](./diagrams) directory as `.mmd` (Mermaid) files.

---

## Use Case Diagram
**File:** [`diagrams/use-case-diagram.mmd`](./diagrams/use-case-diagram.mmd)

Describes what each actor can do within the system. Five roles are identified — Admin, Branch Manager, Stock Manager, Cashier, and Guest — each mapped to the features they can access. Admin has full access across all ten use case groups, while other roles have progressively narrower permissions derived from the route-permission rules defined in `route-permissions.ts`.

---

## Class Diagram
**File:** [`diagrams/class-diagram.mmd`](./diagrams/class-diagram.mmd)

Models the object-oriented structure of the domain layer in `BranchOps.Domain`. Eleven entities inherit from `BaseDomainObject` (which provides `Id`, `CreatedAt`, and `UpdatedAt`), while `AuditLog` stands alone. The diagram captures all properties, four enumerations (`UserRole`, `OrderStatus`, `PaymentMethod`, `StockAdjustmentType`), and the associations between entities such as composition, aggregation, and directed references.

---

## Entity Relationship Diagram
**File:** [`diagrams/er-diagram.mmd`](./diagrams/er-diagram.mmd)

Represents the relational database schema backing the PostgreSQL instance. All thirteen tables are shown with their full column definitions, data types, and PK/FK markers. Enum columns include inline value comments for readability. Cardinalities reflect the actual EF Core navigation properties — notably the two labeled edges from `User` to `Order` (creates vs. cancels) and the one-to-zero-or-one link between `User` and `Employee`.

---

## Block Diagram
**File:** [`diagrams/block-diagram.mmd`](./diagrams/block-diagram.mmd)

Provides a high-level architectural overview of the entire system across five horizontal layers: the React 19 client with its eleven feature modules, the frontend infrastructure stack (React Router, TanStack Query, Zustand, Axios, shadcn/ui, i18next), the twelve ASP.NET Core API controllers, the backend infrastructure (JWT, EF Core, Audit Service, DI, Scalar, Identity), and the PostgreSQL data layer split into eight logical table groups.

---

## Sequence Diagram
**File:** [`diagrams/sequence-diagram.mmd`](./diagrams/sequence-diagram.mmd)

Illustrates the runtime message flow between actors and system components across five key scenarios: user login and JWT issuance, a normal authenticated API request, silent token refresh on 401, creating a POS order (including the database transaction that writes the order, deducts stock, and records a `StockAdjustment`), and a manual stock adjustment submitted by a Stock Manager — all with audit log entries written at the end of each mutating flow.

---

## Level 0 DFD
**File:** [`diagrams/level0-dfd-diagram.mmd`](./diagrams/level0-dfd-diagram.mmd)

A Level-0 DFD (context diagram) that treats BranchOps as a single black-box process surrounded by its five external actors. The diagram is laid out left-to-right, with actors on either side of the central system node. Each actor's inbound data flows — credentials, form submissions, cart items, adjustment details — and outbound data flows — JWT tokens, confirmations, reports, page content — are labeled on the arrows. It defines the system boundary and establishes the complete set of external interactions before decomposing into more detailed diagrams.

---

## Context Diagram
**File:** [`diagrams/context-diagram.mmd`](./diagrams/context-diagram.mmd)

A Level-0 DFD treating BranchOps as a single black-box process surrounded by its five external actors. Each actor's inbound data (credentials, requests, form submissions) and outbound data (JWT tokens, reports, confirmations, page content) are labeled on the arrows. It serves as the entry point for understanding system boundaries before diving into the more detailed Level-1 DFD or sequence diagrams.

---

## Level 1 DFD
**File:** [`diagrams/level1-dfd-diagram.mmd`](./diagrams/level1-dfd-diagram.mmd)

Decomposes the system into fifteen numbered sub-processes grouped under seven functional areas (Authentication, Branch & Employee Management, Product Catalogue, POS Orders, Inventory, Reports, Audit Trail). External entities sit on the left, processes in the centre, and seven data stores on the right. Each arrow carries a precise data-flow label, making it straightforward to trace exactly which process reads from or writes to each store.

---

## Activity Diagram
**File:** [`diagrams/activity-diagram.mmd`](./diagrams/activity-diagram.mmd)

Traces the full lifecycle of a user session from app launch to logout, branching into three role-specific flows: Admin/Branch Manager navigating the dashboard and exporting reports, the Cashier building a cart and completing a POS order with automatic stock deduction, and the Stock Manager viewing stock levels and submitting adjustments. Decision nodes cover token expiry, silent refresh, out-of-stock errors, and low-stock alert triggers.
