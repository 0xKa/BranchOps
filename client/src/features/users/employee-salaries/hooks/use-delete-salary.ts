import { handleApiError } from "@/lib/error-handler";
import { api } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const deleteSalary = async (id: string): Promise<void> => {
    try {
        await api.delete(`/employeesalaries/${id}`);
    } catch (error) {
        return handleApiError(error);
    }
};

export const useDeleteSalary = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteSalary,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["employee-salaries"] });
            toast.success("Salary record deleted successfully.");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
};
