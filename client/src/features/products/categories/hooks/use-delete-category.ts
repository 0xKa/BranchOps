import { handleApiError } from "@/lib/error-handler";
import { api } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const deleteCategory = async (id: string): Promise<void> => {
    try {
        await api.delete(`/productcategories/${id}`);
    } catch (error) {
        return handleApiError(error);
    }
};

export const useDeleteCategory = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteCategory,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["categories"] });
            toast.success("Category deleted successfully.");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
};
