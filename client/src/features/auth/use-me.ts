import { api } from "@/services/api";
import { handleApiError } from "@/lib/error-handler";
import { useAuthStore, type User } from "./auth-store";
import { USER_ROLE_LABELS } from "./types";

interface MeResponse {
  id: string;
  username: string;
  email: string | null;
  role: number;
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

export async function fetchMe(): Promise<User> {
  try {
    const res = await api.get<MeResponse>("/auth/me");
    const data = res.data;

    return {
      id: data.id,
      username: data.username,
      email: data.email,
      role: USER_ROLE_LABELS[data.role],
      fullName: data.employee?.fullName ?? data.username,
      employee: data.employee
        ? {
            id: data.employee.id,
            fullName: data.employee.fullName,
            phone: data.employee.phone,
            jobTitle: data.employee.jobTitle,
            isActive: data.employee.isActive,
            hiredAt: data.employee.hiredAt,
            branch: data.employee.branch,
          }
        : null,
    };
  } catch (error) {
    return handleApiError(error);
  }
}

/** Call after login to populate full user profile in store */
export async function fetchAndStoreMe(): Promise<User> {
  const user = await fetchMe();
  useAuthStore.getState().setUser(user);
  return user;
}
