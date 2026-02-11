import { handleApiError } from "@/lib/error-handler";
import { api } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Employee, EmployeeCreateRequest } from "../types";

const createEmployee = async (
  data: EmployeeCreateRequest,
): Promise<Employee> => {
  try {
    const res = await api.post<Employee>("/employees", data);
    return res.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const useCreateEmployee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee created successfully.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
