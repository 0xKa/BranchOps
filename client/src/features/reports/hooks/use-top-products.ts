import { handleApiError } from "@/lib/error-handler";
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import type { TopProductRow } from "../types";

interface UseTopProductsParams {
    count?: number;
    days?: number | null;
    branchId?: string;
}

const fetchTopProducts = async (
    params: UseTopProductsParams,
): Promise<TopProductRow[]> => {
    try {
        const res = await api.get<TopProductRow[]>("/reports/top-products", {
            params: {
                count: params.count ?? undefined,
                days: params.days ?? undefined,
                branchId: params.branchId || undefined,
            },
        });
        return res.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const useTopProducts = (params: UseTopProductsParams = {}) =>
    useQuery({
        queryKey: ["reports", "top-products", params],
        queryFn: () => fetchTopProducts(params),
    });
