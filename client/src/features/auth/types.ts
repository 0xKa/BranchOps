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
