import { Navigate, Outlet } from "react-router-dom";
import { useIsAuthenticated, useIsHydrated, useUser } from "@/features/auth/auth-store";
import { CustomSpinner } from "@/components/ui/spinner";
import { getDefaultRouteForRole } from "@/lib/route-permissions";
import { USER_ROLES } from "@/features/auth/types";

export default function PublicOnlyRoute() {
  const isAuthenticated = useIsAuthenticated();
  const isHydrated = useIsHydrated();
  const user = useUser();

  if (!isHydrated) {
    return <CustomSpinner />;
  }

  if (isAuthenticated) {
    const defaultRoute = getDefaultRouteForRole(user?.role ?? USER_ROLES.Guest);
    return <Navigate to={defaultRoute} replace />;
  }

  return <Outlet />;
}
