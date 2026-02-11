import { handleApiError } from "@/lib/error-handler";
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import type { Employee } from "../types";

const fetchEmployees = async (): Promise<Employee[]> => {
  try {
    const res = await api.get<Employee[]>("/employees");
    return res.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const useEmployees = () =>
  useQuery({ queryKey: ["employees"], queryFn: fetchEmployees });
