import { handleApiError } from "@/lib/error-handler";
import { api } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { BranchStock, SetStockRequest } from "../types";

const setStock = async (data: SetStockRequest): Promise<BranchStock> => {
    try {
        const res = await api.post<BranchStock>("/stock/set", data);
        return res.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const useSetStock = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: setStock,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["stock"] });
            qc.invalidateQueries({ queryKey: ["low-stock"] });
            toast.success("Stock level set successfully.");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
};
