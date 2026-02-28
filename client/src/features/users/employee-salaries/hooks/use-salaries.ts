import { handleApiError } from "@/lib/error-handler";
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import type { EmployeeSalary } from "../types";

const fetchSalaries = async (): Promise<EmployeeSalary[]> => {
    try {
        const res = await api.get<EmployeeSalary[]>("/employeesalaries");
        return res.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const useSalaries = () =>
    useQuery({ queryKey: ["employee-salaries"], queryFn: fetchSalaries });
