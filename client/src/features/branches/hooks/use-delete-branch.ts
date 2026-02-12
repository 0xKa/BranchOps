import { handleApiError } from "@/lib/error-handler";
import { api } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const deleteBranch = async (id: string): Promise<void> => {
  try {
    await api.delete(`/branches/${id}`);
  } catch (error) {
    return handleApiError(error);
  }
};

export const useDeleteBranch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteBranch,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["branches"] });
      toast.success("Branch deleted successfully.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
