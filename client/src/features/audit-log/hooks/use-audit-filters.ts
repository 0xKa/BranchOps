import { handleApiError } from "@/lib/error-handler";
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

const fetchActions = async (): Promise<string[]> => {
    try {
        const res = await api.get<string[]>("/auditlog/actions");
        return res.data;
    } catch (error) {
        return handleApiError(error);
    }
};

const fetchEntityTypes = async (): Promise<string[]> => {
    try {
        const res = await api.get<string[]>("/auditlog/entity-types");
        return res.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const useAuditActions = () =>
    useQuery({
        queryKey: ["audit-logs", "actions"],
        queryFn: fetchActions,
        staleTime: 1000 * 60 * 5,
    });

export const useAuditEntityTypes = () =>
    useQuery({
        queryKey: ["audit-logs", "entity-types"],
        queryFn: fetchEntityTypes,
        staleTime: 1000 * 60 * 5,
    });
