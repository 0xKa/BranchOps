import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "@/features/auth/auth-store";
import { isRoleAllowed } from "@/lib/route-permissions";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useEffect, useRef } from "react";
import type { UserRole } from "@/features/auth/types";

interface RoleRouteProps {
    allowedRoles: readonly UserRole[];
}

/**
 * Layout route that checks if the current user's role is in the allowed list.
 * If not, redirects to /dashboard with a toast notification.
 *
 * Must be nested inside <ProtectedRoute> (which handles authentication).
 */
export default function RoleRoute({ allowedRoles }: RoleRouteProps) {
    const user = useUser();
    const location = useLocation();
    const { t } = useTranslation();
    const hasToasted = useRef(false);

    const allowed = isRoleAllowed(user?.role ?? null, allowedRoles);

    useEffect(() => {
        if (!allowed && !hasToasted.current) {
            hasToasted.current = true;
            toast.error(t("errors.accessDenied"));
        }
    }, [allowed, t]);

    if (!allowed) {
        return <Navigate to="/dashboard" replace state={{ from: location }} />;
    }

    return <Outlet />;
}
