export const USER_ROLES = {
  ADMIN: 0,
  EMPLOYEE: 1,
  BRANCH_MANAGER: 2,
  GUEST: 3,
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
