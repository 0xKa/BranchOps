import { handleApiError } from "@/lib/error-handler";
import { api } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const deleteStock = async (id: string): Promise<void> => {
    try {
        await api.delete(`/stock/${id}`);
    } catch (error) {
        return handleApiError(error);
    }
};

export const useDeleteStock = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteStock,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["stock"] });
            qc.invalidateQueries({ queryKey: ["low-stock"] });
            toast.success("Stock record deleted successfully.");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
};
