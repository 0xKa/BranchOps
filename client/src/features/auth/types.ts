export const USER_ROLES = {
  Admin: 0,
  StockManager: 1,
  BranchManager: 2,
  Cashier: 3,
  Guest: 4,
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const USER_ROLE_LABELS: Record<number, string> = {
  [USER_ROLES.Admin]: "Admin",
  [USER_ROLES.StockManager]: "Stock Manager",
  [USER_ROLES.BranchManager]: "Branch Manager",
  [USER_ROLES.Cashier]: "Cashier",
  [USER_ROLES.Guest]: "Guest",
};

/** PascalCase key names (e.g. 0 → "Admin", 2 → "BranchManager") for i18n keys */
export const USER_ROLE_KEYS: Record<number, string> = Object.fromEntries(
  Object.entries(USER_ROLES).map(([key, value]) => [value, key]),
);


export type User = {
  id: string;
  username: string;
  email: string | null;
  role: UserRole;
  createdAt: string;
  employee: {
    id: string;
    fullName: string;
    phone: string | null;
    jobTitle: string | null;
    isActive: boolean;
    hiredAt: string | null;
    branch: {
      id: string;
      code: string;
      displayName: string;
      city: string | null;
      isActive: boolean;
    };
  } | null;
}
