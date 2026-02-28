import { handleApiError } from "@/lib/error-handler";
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import type { BranchSalesRow } from "../types";

interface UseSalesByBranchParams {
    days?: number | null;
}

const fetchSalesByBranch = async (
    params: UseSalesByBranchParams,
): Promise<BranchSalesRow[]> => {
    try {
        const res = await api.get<BranchSalesRow[]>(
            "/reports/sales-by-branch",
            {
                params: {
                    days: params.days ?? undefined,
                },
            },
        );
        return res.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const useSalesByBranch = (params: UseSalesByBranchParams = {}) =>
    useQuery({
        queryKey: ["reports", "sales-by-branch", params],
        queryFn: () => fetchSalesByBranch(params),
    });
