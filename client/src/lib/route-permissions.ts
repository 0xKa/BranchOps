import { USER_ROLES, type UserRole } from "@/features/auth/types";

const { Admin, StockManager, BranchManager, Cashier } = USER_ROLES;

/**
 * Centralized route → allowed-roles mapping.
 * Used by the router (RoleRoute guard) and the sidebar (nav filtering).
 *
 * If a route is not listed here, it is accessible to ALL authenticated users.
 */
export const ROUTE_PERMISSIONS: Record<string, readonly UserRole[]> = {
    // Admin-only
    "/admins": [Admin],
    "/audit-log": [Admin],

    // Admin + BranchManager
    "/branches": [Admin, BranchManager],
    "/employees": [Admin, BranchManager],
    "/employee-salaries": [Admin, BranchManager],
    "/reports/daily-sales": [Admin, BranchManager],
    "/reports/branch-sales": [Admin, BranchManager],
    "/reports/top-products": [Admin, BranchManager],

    // Admin + BranchManager + Cashier
    "/pos": [Admin, BranchManager, Cashier],
    "/pos/orders": [Admin, BranchManager, Cashier],

    // Admin + StockManager + BranchManager + Cashier
    "/products": [Admin, StockManager, BranchManager, Cashier],
    "/products/categories": [Admin, StockManager, BranchManager, Cashier],
    "/inventory": [Admin, StockManager, BranchManager, Cashier],
    "/inventory/adjustments": [Admin, StockManager, BranchManager, Cashier],
    "/inventory/alerts": [Admin, StockManager, BranchManager, Cashier],
};

/**
 * Check whether a given role has access to a specific route path.
 * Routes not in the map are accessible to everyone.
 */
export function hasRouteAccess(path: string, role: UserRole | undefined | null): boolean {
    if (role == null) return false;
    const allowedRoles = ROUTE_PERMISSIONS[path];
    if (!allowedRoles) return true; // not restricted
    return allowedRoles.includes(role);
}

/**
 * Check whether a role is included in an explicit allowed-roles list.
 */
export function isRoleAllowed(role: UserRole | undefined | null, allowedRoles: readonly UserRole[]): boolean {
    if (role == null) return false;
    return allowedRoles.includes(role);
}

/**
 * Default landing route after login, per role.
 */
export function getDefaultRouteForRole(role: UserRole): string {
    switch (role) {
        case USER_ROLES.StockManager:
            return "/inventory";
        case USER_ROLES.Cashier:
            return "/pos";
        default:
            return "/dashboard";
    }
}

/**
 * Filter an array of navigation items (and their sub-items) so that only
 * items the given role has access to are included.
 *
 * An item is kept if its `url` passes `hasRouteAccess`.
 * If an item has sub-items, only accessible sub-items are kept;
 * the parent is hidden when no sub-items survive.
 */
export function filterNavByRole<
    T extends { url: string; items?: { url: string }[] },
>(items: T[], role: UserRole | undefined | null): T[] {
    if (role == null) return [];

    return items
        .map((item) => {
            // Filter sub-items first
            if (item.items && item.items.length > 0) {
                const filteredSubs = item.items.filter((sub) =>
                    hasRouteAccess(sub.url, role),
                );
                // Hide parent when no accessible children remain
                if (filteredSubs.length === 0) return null;
                return { ...item, items: filteredSubs };
            }

            // Top-level item without children
            return hasRouteAccess(item.url, role) ? item : null;
        })
        .filter(Boolean) as T[];
}
