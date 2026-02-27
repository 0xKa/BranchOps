import { handleApiError } from "@/lib/error-handler";
import { api } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Product } from "../types";

export interface ProductUpdateRequest {
    name: string;
    categoryId: string;
    price: number;
    cost?: number | null;
    isActive: boolean;
}

const updateProduct = async ({
    id,
    data,
}: {
    id: string;
    data: ProductUpdateRequest;
}): Promise<Product> => {
    try {
        const res = await api.put<Product>(`/products/${id}`, data);
        return res.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const useUpdateProduct = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: updateProduct,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["products"] });
            toast.success("Product updated successfully.");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
};
