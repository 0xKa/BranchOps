import { handleApiError } from "@/lib/error-handler";
import { api } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const deleteEmployee = async (id: string): Promise<void> => {
    try {
        await api.delete(`/employees/${id}`);
    } catch (error) {
        return handleApiError(error);
    }
};

export const useDeleteEmployee = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteEmployee,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["employees"] });
            toast.success("Employee deleted successfully.");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
};
