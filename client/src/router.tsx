import {
  DashboardLayout,
  ProtectedRoute,
  PublicOnlyRoute,
  RoleRoute,
  RootLayout,
} from "@/layouts";
import { createBrowserRouter } from "react-router";
import { USER_ROLES } from "@/features/auth/types";
import DashboardPage from "./features/dashboard/dashboard-page";
import LandingPage from "./features/landing/landing-page";
import ErrorState from "./components/error-state";
import LoginPage from "./features/auth/login-page";
import EmployeesPage from "./features/users/employee/employees-page";
import EmployeeSalariesPage from "./features/users/employee-salaries/employee-salaries-page";
import AdminsPage from "./features/users/admin/admins-page";
import BranchesPage from "./features/branches/branches-page";
import ProductsPage from "./features/products/products-page";
import CategoriesPage from "./features/products/categories/categories-page";
import NewOrderPage from "./features/pos/new-order-page";
import OrderHistoryPage from "./features/pos/order-history-page";
import StockLevelsPage from "./features/inventory/stock-levels-page";
import StockAdjustmentsPage from "./features/inventory/stock-adjustments-page";
import LowStockAlertsPage from "./features/inventory/low-stock-alerts-page";
import DailySalesPage from "./features/reports/daily-sales-page";
import SalesByBranchPage from "./features/reports/sales-by-branch-page";
import TopProductsPage from "./features/reports/top-products-page";
import ExportSalesPage from "./features/reports/export-sales-page";
import AuditLogPage from "./features/audit-log/audit-log-page";
import SettingsPage from "./features/settings/settings-page";
import ReplenishmentAgentPage from "./features/replenishment-agent/replenishment-agent-page";
import BranchOpsAgentPage from "./features/branchops-agent/branchops-agent-page";

const { Admin, StockManager, BranchManager, Cashier } = USER_ROLES;

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorState />,
    children: [
      // Public Routes
      { index: true, element: <LandingPage /> },

      // Public-Only Routes
      {
        element: <PublicOnlyRoute />,
        children: [
          { path: "home", element: <div>Home Page</div> },
          { path: "login", element: <LoginPage /> },
        ],
      },

      // Protected Routes (all authenticated users)
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              // Accessible to all authenticated users
              { path: "dashboard/*", element: <DashboardPage /> },
              { path: "settings", element: <SettingsPage /> },

              // Admin only
              {
                element: <RoleRoute allowedRoles={[Admin]} />,
                children: [
                  { path: "admins", element: <AdminsPage /> },
                  { path: "audit-log", element: <AuditLogPage /> },
                ],
              },

              // Admin + BranchManager
              {
                element: <RoleRoute allowedRoles={[Admin, BranchManager]} />,
                children: [
                  { path: "employees", element: <EmployeesPage /> },
                  { path: "employee-salaries", element: <EmployeeSalariesPage /> },
                  { path: "branches", element: <BranchesPage /> },
                  { path: "reports/daily-sales", element: <DailySalesPage /> },
                  { path: "reports/branch-sales", element: <SalesByBranchPage /> },
                  { path: "reports/top-products", element: <TopProductsPage /> },
                  { path: "reports/export", element: <ExportSalesPage /> },
                ],
              },

              // Admin + BranchManager + Cashier
              {
                element: <RoleRoute allowedRoles={[Admin, BranchManager, Cashier]} />,
                children: [
                  { path: "pos", element: <NewOrderPage /> },
                  { path: "pos/orders", element: <OrderHistoryPage /> },
                ],
              },

              // Admin + StockManager + BranchManager + Cashier
              {
                element: <RoleRoute allowedRoles={[Admin, StockManager, BranchManager, Cashier]} />,
                children: [
                  { path: "products", element: <ProductsPage /> },
                  { path: "products/categories", element: <CategoriesPage /> },
                  { path: "inventory", element: <StockLevelsPage /> },
                  { path: "inventory/adjustments", element: <StockAdjustmentsPage /> },
                  { path: "inventory/alerts", element: <LowStockAlertsPage /> },
                ],
              },

              // Admin + StockManager + BranchManager
              {
                element: <RoleRoute allowedRoles={[Admin, StockManager, BranchManager]} />,
                children: [
                  { path: "inventory/replenishment-agent", element: <ReplenishmentAgentPage /> },
                  { path: "reports/branchops-agent", element: <BranchOpsAgentPage /> },
                ],
              },
            ],
          },
        ],
      },

      // Error testing routes (dev only)
      {
        path: "test",
        children: [
          {
            path: "error500",
            loader: () => {
              throw new Response("Internal Server Error", { status: 500 });
            },
            element: null,
          },
          {
            path: "error403",
            loader: () => {
              throw new Response("Forbidden", { status: 403 });
            },
            element: null,
          },
          {
            path: "error",
            loader: () => {
              throw new Error("Something went wrong!");
            },
            element: null,
          },
        ],
      },
    ],
  },
]);
