import { handleApiError } from "@/lib/error-handler";
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import type { BranchStock, PagedResult } from "../types";

interface UseStockParams {
    page?: number;
    pageSize?: number;
    branchId?: string;
    productId?: string;
    lowStockOnly?: boolean;
}

const fetchStock = async (
    params: UseStockParams,
): Promise<PagedResult<BranchStock>> => {
    try {
        const res = await api.get<PagedResult<BranchStock>>("/stock", {
            params: {
                page: params.page,
                pageSize: params.pageSize,
                branchId: params.branchId || undefined,
                productId: params.productId || undefined,
                lowStockOnly: params.lowStockOnly ?? undefined,
            },
        });
        return res.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const useStock = (params: UseStockParams = {}) =>
    useQuery({
        queryKey: ["stock", params],
        queryFn: () => fetchStock(params),
    });
