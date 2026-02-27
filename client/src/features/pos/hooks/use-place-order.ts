import { handleApiError } from "@/lib/error-handler";
import { api } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Order, PlaceOrderRequest } from "../types";

const placeOrder = async (data: PlaceOrderRequest): Promise<Order> => {
    try {
        const res = await api.post<Order>("/orders", data);
        return res.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const usePlaceOrder = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: placeOrder,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["orders"] });
            toast.success("Order placed successfully.");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
};
