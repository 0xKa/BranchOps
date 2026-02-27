import { handleApiError } from "@/lib/error-handler";
import { api } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ProductCategory } from "../../types";

export interface CategoryUpdateRequest {
    name: string;
    isActive: boolean;
}

const updateCategory = async ({
    id,
    data,
}: {
    id: string;
    data: CategoryUpdateRequest;
}): Promise<ProductCategory> => {
    try {
        const res = await api.put<ProductCategory>(
            `/productcategories/${id}`,
            data,
        );
        return res.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const useUpdateCategory = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: updateCategory,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["categories"] });
            toast.success("Category updated successfully.");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
};
