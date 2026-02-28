import { handleApiError } from "@/lib/error-handler";
import { api } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AdjustStockRequest, BranchStock } from "../types";

const adjustStock = async (data: AdjustStockRequest): Promise<BranchStock> => {
    try {
        const res = await api.post<BranchStock>("/stock/adjust", data);
        return res.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const useAdjustStock = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: adjustStock,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["stock"] });
            qc.invalidateQueries({ queryKey: ["low-stock"] });
            qc.invalidateQueries({ queryKey: ["stock-adjustments"] });
            toast.success("Stock adjusted successfully.");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
};
