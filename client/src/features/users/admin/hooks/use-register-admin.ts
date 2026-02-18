import { handleApiError } from "@/lib/error-handler";
import { api } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { UserRole } from "@/features/auth/types";

export interface AdminRegisterRequest {
    username: string;
    password: string;
    email?: string | null;
    fullName: string;
    role: UserRole;
}

export interface AdminRegisterResponse {
    id: string;
    username: string;
    email: string | null;
    fullName: string;
    role: string;
    createdAt: string;
}

const registerAdmin = async (
    data: AdminRegisterRequest,
): Promise<AdminRegisterResponse> => {
    try {
        const res = await api.post<AdminRegisterResponse>("/auth/register", data);
        return res.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const useRegisterAdmin = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: registerAdmin,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admins"] });
            toast.success("Admin registered successfully.");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
};
