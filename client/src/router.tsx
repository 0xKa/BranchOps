import { createBrowserRouter } from "react-router";
import { ProtectedRoute, PublicOnlyRoute, RootLayout } from "@/layouts";
import LandingPage from "./features/landing/landing-page";
import DashboardPage from "./features/dashboard/dashboard-page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <div>Oops! An error occurred.</div>,
    children: [
      // Public Routes
      { index: true, element: <LandingPage /> },

      // Public-Only Routes
      {
        element: <PublicOnlyRoute />,
        children: [{ path: "home", element: <div>Home Page</div> }],
      },

      // Protected Routes
      {
        element: <ProtectedRoute />,
        children: [{ path: "dashboard", element: <DashboardPage /> }],
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
