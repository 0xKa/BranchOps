import { handleApiError } from "@/lib/error-handler";
import { api } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Branch } from "./use-branches";

export interface BranchCreateRequest {
  code: string;
  displayName: string;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  country?: string | null;
  isActive: boolean;
}

const createBranch = async (data: BranchCreateRequest): Promise<Branch> => {
  try {
    const res = await api.post<Branch>("/branches", data);
    return res.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const useCreateBranch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createBranch,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["branches"] });
      toast.success("Branch created successfully.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
