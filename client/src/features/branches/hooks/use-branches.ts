import { handleApiError } from "@/lib/error-handler";
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import type { Branch } from "../types";

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
