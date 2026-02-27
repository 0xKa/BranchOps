import { handleApiError } from "@/lib/error-handler";
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import type { Order } from "../types";

const fetchOrder = async (id: string): Promise<Order> => {
    try {
        const res = await api.get<Order>(`/orders/${id}`);
        return res.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const useOrder = (id: string | null) =>
    useQuery({
        queryKey: ["orders", id],
        queryFn: () => fetchOrder(id!),
        enabled: !!id,
    });
