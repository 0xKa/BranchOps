import { handleApiError } from "@/lib/error-handler";
import { api } from "@/services/api";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ChangePasswordRequest } from "../types";

const changePassword = async (data: ChangePasswordRequest): Promise<void> => {
    try {
        await api.put("/account-settings/password", data);
    } catch (error) {
        return handleApiError(error);
    }
};

export const useChangePassword = () => {
    return useMutation({
        mutationFn: changePassword,
        onSuccess: () => {
            toast.success("Password changed successfully.");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
};
