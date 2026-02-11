import type { UserRole } from "@/features/auth/types";

// -- Employee types --

export interface Employee {
  id: string;
  userId: string;
  branchId: string;
  fullName: string;
  phone: string | null;
  jobTitle: string | null;
  notes: string | null;
  isActive: boolean;
  hiredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeCreateRequest {
  username: string;
  password: string;
  email?: string | null;
  role: UserRole;
  branchId: string;
  fullName: string;
  phone?: string | null;
  jobTitle?: string | null;
  notes?: string | null;
  isActive: boolean;
  hiredAt?: string | null;
}

export interface EmployeeUpdateRequest {
  userId: string;
  branchId: string;
  fullName: string;
  phone?: string | null;
  jobTitle?: string | null;
  notes?: string | null;
  isActive: boolean;
  hiredAt?: string | null;
}

// -- Admin types (registered via /auth/register) --

export interface AdminRegisterRequest {
  username: string;
  password: string;
  email?: string | null;
  fullName: string;
  role: UserRole;
}

export interface AdminRegisterResponse {
  id: string;
  username: string;
  email: string | null;
  fullName: string;
  role: string;
  createdAt: string;
}
