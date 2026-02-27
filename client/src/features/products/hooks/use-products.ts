import { handleApiError } from "@/lib/error-handler";
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import type { PagedResult, Product } from "../types";

interface UseProductsParams {
    page?: number;
    pageSize?: number;
    categoryId?: string;
    isActive?: boolean;
    search?: string;
}

const fetchProducts = async (
    params: UseProductsParams,
): Promise<PagedResult<Product>> => {
    try {
        const res = await api.get<PagedResult<Product>>("/products", {
            params: {
                page: params.page,
                pageSize: params.pageSize,
                categoryId: params.categoryId,
                isActive: params.isActive,
                search: params.search || undefined,
            },
        });
        return res.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const useProducts = (params: UseProductsParams = {}) =>
    useQuery({
        queryKey: ["products", params],
        queryFn: () => fetchProducts(params),
    });
