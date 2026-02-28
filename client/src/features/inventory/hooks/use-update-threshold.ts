import { handleApiError } from "@/lib/error-handler";
import { api } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { BranchStock, UpdateThresholdRequest } from "../types";

const updateThreshold = async ({
    id,
    data,
}: {
    id: string;
    data: UpdateThresholdRequest;
}): Promise<BranchStock> => {
    try {
        const res = await api.patch<BranchStock>(`/stock/${id}/threshold`, data);
        return res.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const useUpdateThreshold = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: updateThreshold,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["stock"] });
            qc.invalidateQueries({ queryKey: ["low-stock"] });
            toast.success("Threshold updated successfully.");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
};
