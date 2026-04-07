import { useAuthStore } from "@/features/auth/auth-store";

export type ExportGranularity = "OrderSummary" | "ItemDetail";
export type ExportStatus = "Paid" | "Cancelled";

export interface ExportSalesParams {
    fromDate: string;
    toDate: string;
    branchId?: string;
    status?: ExportStatus;
    granularity: ExportGranularity;
}

export async function exportSalesCsv(params: ExportSalesParams): Promise<void> {
    const state = useAuthStore.getState();
    const token = state.getAccessToken();
    const baseURL = import.meta.env.VITE_API_BASE_URL;

    const query = new URLSearchParams({
        fromDate: params.fromDate,
        toDate: params.toDate,
        granularity: params.granularity,
    });

    if (params.branchId) query.set("branchId", params.branchId);
    if (params.status) query.set("status", params.status);

    const response = await fetch(`${baseURL}/reports/export/sales?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.message ?? `Export failed (${response.status})`);
    }

    const disposition = response.headers.get("Content-Disposition");
    const filenameMatch = disposition?.match(/filename="?([^"]+)"?/);
    const filename = filenameMatch?.[1] ?? "sales_export.csv";

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}
