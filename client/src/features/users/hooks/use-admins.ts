import { handleApiError } from "@/lib/error-handler";
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import type { AdminRegisterResponse } from "../types";

const fetchAdmins = async (): Promise<AdminRegisterResponse[]> => {
  try {
    const res = await api.get<AdminRegisterResponse[]>("/auth/users", {
      params: { role: 0 }, // Admin = 0
    });
    return res.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const useAdmins = () =>
  useQuery({ queryKey: ["admins"], queryFn: fetchAdmins });
