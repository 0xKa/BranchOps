import { handleApiError } from "@/lib/error-handler";
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import type { OrderStatus, OrdersPagedResult } from "../types";

interface UseOrdersParams {
    page?: number;
    pageSize?: number;
    branchId?: string;
    status?: OrderStatus;
    fromDate?: string;
    toDate?: string;
}

const fetchOrders = async (
    params: UseOrdersParams,
): Promise<OrdersPagedResult> => {
    try {
        const res = await api.get<OrdersPagedResult>("/orders", {
            params: {
                page: params.page,
                pageSize: params.pageSize,
                branchId: params.branchId || undefined,
                status: params.status ?? undefined,
                fromDate: params.fromDate || undefined,
                toDate: params.toDate || undefined,
            },
        });
        return res.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const useOrders = (params: UseOrdersParams = {}) =>
    useQuery({
        queryKey: ["orders", params],
        queryFn: () => fetchOrders(params),
    });
