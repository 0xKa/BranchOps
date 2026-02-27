import { handleApiError } from "@/lib/error-handler";
import { api } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const deleteOrder = async (id: string): Promise<void> => {
    try {
        await api.delete(`/orders/${id}`);
    } catch (error) {
        return handleApiError(error);
    }
};

export const useDeleteOrder = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteOrder,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["orders"] });
            toast.success("Order deleted successfully.");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
};
