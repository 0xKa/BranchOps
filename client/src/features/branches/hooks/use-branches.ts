import { handleApiError } from "@/lib/error-handler";
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

export interface Branch {
  id: string;
  code: string;
  displayName: string;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  country: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const fetchBranches = async (): Promise<Branch[]> => {
  try {
    const res = await api.get<Branch[]>("/branches");
    return res.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const useBranches = () =>
  useQuery({ queryKey: ["branches"], queryFn: fetchBranches });
