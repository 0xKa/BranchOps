import { handleApiError } from "@/lib/error-handler";
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import type { LowStockAlert } from "../types";

interface UseLowStockAlertsParams {
    branchId?: string;
}

const fetchLowStockAlerts = async (
    params: UseLowStockAlertsParams,
): Promise<LowStockAlert[]> => {
    try {
        const res = await api.get<LowStockAlert[]>("/stock/low-stock", {
            params: {
                branchId: params.branchId || undefined,
            },
        });
        return res.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const useLowStockAlerts = (params: UseLowStockAlertsParams = {}) =>
    useQuery({
        queryKey: ["low-stock", params],
        queryFn: () => fetchLowStockAlerts(params),
    });
