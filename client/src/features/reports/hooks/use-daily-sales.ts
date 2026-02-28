import { handleApiError } from "@/lib/error-handler";
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import type { DailySalesReport } from "../types";

interface UseDailySalesParams {
    fromDate?: string;
    toDate?: string;
    branchId?: string;
}

const fetchDailySales = async (
    params: UseDailySalesParams,
): Promise<DailySalesReport> => {
    try {
        const res = await api.get<DailySalesReport>("/reports/daily-sales", {
            params: {
                fromDate: params.fromDate || undefined,
                toDate: params.toDate || undefined,
                branchId: params.branchId || undefined,
            },
        });
        return res.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const useDailySales = (params: UseDailySalesParams = {}) =>
    useQuery({
        queryKey: ["daily-sales", params],
        queryFn: () => fetchDailySales(params),
    });
