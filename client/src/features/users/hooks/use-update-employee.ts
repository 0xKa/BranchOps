import { handleApiError } from "@/lib/error-handler";
import { api } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Employee, EmployeeUpdateRequest } from "../types";

const updateEmployee = async ({
  id,
  data,
}: {
  id: string;
  data: EmployeeUpdateRequest;
}): Promise<Employee> => {
  try {
    const res = await api.put<Employee>(`/employees/${id}`, data);
    return res.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const useUpdateEmployee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateEmployee,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee updated successfully.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
