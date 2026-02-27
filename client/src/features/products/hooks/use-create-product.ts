import { handleApiError } from "@/lib/error-handler";
import { api } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Product } from "../types";

export interface ProductCreateRequest {
    name: string;
    categoryId: string;
    price: number;
    cost?: number | null;
    isActive: boolean;
}

const createProduct = async (
    data: ProductCreateRequest,
): Promise<Product> => {
    try {
        const res = await api.post<Product>("/products", data);
        return res.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const useCreateProduct = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createProduct,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["products"] });
            toast.success("Product created successfully.");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
};
