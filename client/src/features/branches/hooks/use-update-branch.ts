import { handleApiError } from "@/lib/error-handler";
import { api } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Branch } from "./use-branches";

export interface BranchUpdateRequest {
  code: string;
  displayName: string;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  country?: string | null;
  isActive: boolean;
}

const updateBranch = async ({
  id,
  data,
}: {
  id: string;
  data: BranchUpdateRequest;
}): Promise<Branch> => {
  try {
    const res = await api.put<Branch>(`/branches/${id}`, data);
    return res.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const useUpdateBranch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateBranch,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["branches"] });
      toast.success("Branch updated successfully.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
