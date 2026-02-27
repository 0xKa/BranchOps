import { handleApiError } from "@/lib/error-handler";
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import type { ProductCategory } from "../../types";

const fetchCategories = async (
    isActive?: boolean,
): Promise<ProductCategory[]> => {
    try {
        const res = await api.get<ProductCategory[]>("/productcategories", {
            params: { isActive },
        });
        return res.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const useCategories = (isActive?: boolean) =>
    useQuery({
        queryKey: ["categories", isActive],
        queryFn: () => fetchCategories(isActive),
    });
