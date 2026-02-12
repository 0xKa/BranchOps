import { handleApiError } from "@/lib/error-handler";
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import type { AdminRegisterResponse } from "../hooks/use-register-admin";
import { USER_ROLES } from "@/features/auth/types";

const fetchAdmins = async (): Promise<AdminRegisterResponse[]> => {
  try {
    const res = await api.get<AdminRegisterResponse[]>("/auth/users", {
      params: { role: USER_ROLES.Admin },
    });
    return res.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const useAdmins = () =>
  useQuery({ queryKey: ["admins"], queryFn: fetchAdmins });
