import { handleApiError } from "@/lib/error-handler";
import { api } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AccountProfile, UpdateProfileRequest } from "../types";
import { useAuthStore } from "@/features/auth/auth-store";

const updateProfile = async (
    data: UpdateProfileRequest,
): Promise<AccountProfile> => {
    try {
        const res = await api.put<AccountProfile>("/account-settings", data);
        return res.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const useUpdateProfile = () => {
    const qc = useQueryClient();
    const user = useAuthStore.getState().user;
    const setUser = useAuthStore.getState().setUser;

    return useMutation({
        mutationFn: updateProfile,
        onSuccess: (profile) => {
            qc.invalidateQueries({ queryKey: ["account-profile"] });

            // Sync auth store with updated profile
            if (user) {
                setUser({
                    ...user,
                    username: profile.username,
                    email: profile.email,
                    ...(user.employee && profile.fullName
                        ? {
                            employee: {
                                ...user.employee,
                                fullName: profile.fullName,
                                phone: profile.phone,
                            },
                        }
                        : {}),
                });
            }

            toast.success("Profile updated successfully.");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
};
