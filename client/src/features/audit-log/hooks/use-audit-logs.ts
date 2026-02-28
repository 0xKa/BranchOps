import { handleApiError } from "@/lib/error-handler";
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import type { AuditLogPagedResult } from "../types";

interface UseAuditLogsParams {
    page?: number;
    pageSize?: number;
    userId?: string;
    action?: string;
    entityType?: string;
    fromDate?: string;
    toDate?: string;
}

const fetchAuditLogs = async (
    params: UseAuditLogsParams,
): Promise<AuditLogPagedResult> => {
    try {
        const res = await api.get<AuditLogPagedResult>("/auditlog", {
            params: {
                page: params.page,
                pageSize: params.pageSize,
                userId: params.userId || undefined,
                action: params.action || undefined,
                entityType: params.entityType || undefined,
                fromDate: params.fromDate || undefined,
                toDate: params.toDate || undefined,
            },
        });
        return res.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const useAuditLogs = (params: UseAuditLogsParams = {}) =>
    useQuery({
        queryKey: ["audit-logs", params],
        queryFn: () => fetchAuditLogs(params),
    });
