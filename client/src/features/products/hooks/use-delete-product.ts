import { handleApiError } from "@/lib/error-handler";
import { api } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const deleteProduct = async (id: string): Promise<void> => {
    try {
        await api.delete(`/products/${id}`);
    } catch (error) {
        return handleApiError(error);
    }
};

export const useDeleteProduct = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["products"] });
            toast.success("Product deleted successfully.");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
};
