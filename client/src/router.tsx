import {
  DashboardLayout,
  ProtectedRoute,
  PublicOnlyRoute,
  RootLayout,
} from "@/layouts";
import { createBrowserRouter } from "react-router";
import DashboardPage from "./features/dashboard/dashboard-page";
import LandingPage from "./features/landing/landing-page";
import ErrorState from "./components/error-state";
import LoginPage from "./features/auth/login-page";
import EmployeesPage from "./features/users/employee/employees-page";
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
import SettingsPage from "./features/settings/settings-page";

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

      // Protected Routes
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              { path: "dashboard/*", element: <DashboardPage /> },
              { path: "admins", element: <AdminsPage /> },
              { path: "employees", element: <EmployeesPage /> },
              { path: "branches", element: <BranchesPage /> },
              { path: "products", element: <ProductsPage /> },
              { path: "products/categories", element: <CategoriesPage /> },
              { path: "pos", element: <NewOrderPage /> },
              { path: "pos/orders", element: <OrderHistoryPage /> },
              { path: "inventory", element: <StockLevelsPage /> },
              { path: "inventory/adjustments", element: <StockAdjustmentsPage /> },
              { path: "inventory/alerts", element: <LowStockAlertsPage /> },
              { path: "reports/daily-sales", element: <DailySalesPage /> },
              { path: "reports/branch-sales", element: <SalesByBranchPage /> },
              { path: "reports/top-products", element: <TopProductsPage /> },
              { path: "settings", element: <SettingsPage /> },
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
