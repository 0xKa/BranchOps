import { handleApiError } from "@/lib/error-handler";
import { api } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ProductCategory } from "../../types";

export interface CategoryCreateRequest {
    name: string;
    isActive: boolean;
}

const createCategory = async (
    data: CategoryCreateRequest,
): Promise<ProductCategory> => {
    try {
        const res = await api.post<ProductCategory>("/productcategories", data);
        return res.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const useCreateCategory = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createCategory,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["categories"] });
            toast.success("Category created successfully.");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
};
