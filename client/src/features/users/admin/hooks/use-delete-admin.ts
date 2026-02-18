import { handleApiError } from "@/lib/error-handler";
import { api } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const deleteAdmin = async (id: string): Promise<void> => {
    try {
        await api.delete(`/auth/users/${id}`);
    } catch (error) {
        return handleApiError(error);
    }
};

export const useDeleteAdmin = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteAdmin,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admins"] });
            toast.success("Admin deleted successfully.");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
};
