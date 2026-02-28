import type { PagedResult } from "@/features/products/types";

export interface AuditLogEntry {
    id: string;
    userId: string | null;
    username: string | null;
    action: string;
    entityType: string;
    entityId: string | null;
    details: string;
    timestamp: string;
}

export type AuditLogPagedResult = PagedResult<AuditLogEntry>;
