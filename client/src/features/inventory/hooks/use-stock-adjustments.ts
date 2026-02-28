import { handleApiError } from "@/lib/error-handler";
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import type { PagedResult, StockAdjustment, StockAdjustmentType } from "../types";

interface UseStockAdjustmentsParams {
    page?: number;
    pageSize?: number;
    branchId?: string;
    productId?: string;
    type?: StockAdjustmentType;
}

const fetchAdjustments = async (
    params: UseStockAdjustmentsParams,
): Promise<PagedResult<StockAdjustment>> => {
    try {
        const res = await api.get<PagedResult<StockAdjustment>>("/stock/adjustments", {
            params: {
                page: params.page,
                pageSize: params.pageSize,
                branchId: params.branchId || undefined,
                productId: params.productId || undefined,
                type: params.type ?? undefined,
            },
        });
        return res.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const useStockAdjustments = (params: UseStockAdjustmentsParams = {}) =>
    useQuery({
        queryKey: ["stock-adjustments", params],
        queryFn: () => fetchAdjustments(params),
    });
