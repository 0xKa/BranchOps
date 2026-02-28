import { handleApiError } from "@/lib/error-handler";
import { api } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { EmployeeSalary, EmployeeSalaryCreateRequest } from "../types";

const createSalary = async (
    data: EmployeeSalaryCreateRequest,
): Promise<EmployeeSalary> => {
    try {
        const res = await api.post<EmployeeSalary>("/employeesalaries", data);
        return res.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const useCreateSalary = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createSalary,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["employee-salaries"] });
            toast.success("Salary record created successfully.");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
};
