import { handleApiError } from "@/lib/error-handler";
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import type { AccountProfile } from "../types";

const fetchProfile = async (): Promise<AccountProfile> => {
    try {
        const res = await api.get<AccountProfile>("/account-settings");
        return res.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const useAccountProfile = () =>
    useQuery({ queryKey: ["account-profile"], queryFn: fetchProfile });
