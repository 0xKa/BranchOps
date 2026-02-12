import { Navigate, Outlet } from "react-router-dom";
import { useIsAuthenticated, useIsHydrated } from "@/features/auth/auth-store";
import { CustomSpinner } from "@/components/ui/spinner";

export default function ProtectedRoute() {
  const isAuthenticated = useIsAuthenticated();
  const isHydrated = useIsHydrated();

  if (!isHydrated) {
    return <CustomSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
