import { handleApiError } from "@/lib/error-handler";
import { api } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { EmployeeSalary, EmployeeSalaryUpdateRequest } from "../types";

const updateSalary = async ({
    id,
    data,
}: {
    id: string;
    data: EmployeeSalaryUpdateRequest;
}): Promise<EmployeeSalary> => {
    try {
        const res = await api.put<EmployeeSalary>(`/employeesalaries/${id}`, data);
        return res.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const useUpdateSalary = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: updateSalary,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["employee-salaries"] });
            toast.success("Salary record updated successfully.");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
};
