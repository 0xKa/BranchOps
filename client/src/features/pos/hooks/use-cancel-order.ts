import { handleApiError } from "@/lib/error-handler";
import { api } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Order } from "../types";

const cancelOrder = async ({
    id,
    reason,
}: {
    id: string;
    reason?: string;
}): Promise<Order> => {
    try {
        const res = await api.post<Order>(`/orders/${id}/cancel`, { reason });
        return res.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const useCancelOrder = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: cancelOrder,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["orders"] });
            toast.success("Order cancelled successfully.");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
};
