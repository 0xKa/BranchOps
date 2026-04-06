import { handleApiError } from "@/lib/error-handler";
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import type { DashboardOverview, SalesChart } from "../types";

const fetchOverview = async (): Promise<DashboardOverview> => {
    try {
        const res = await api.get<DashboardOverview>("/dashboard/overview");
        return res.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const useDashboardOverview = () =>
    useQuery({
        queryKey: ["dashboard", "overview"],
        queryFn: fetchOverview,
        staleTime: 1000 * 60 * 2, // 2 minutes
        refetchInterval: 1000 * 60 * 5, // auto-refresh every 5 minutes
    });

const fetchSalesChart = async (
    period: string,
    branchId?: string,
): Promise<SalesChart> => {
    try {
        const params: Record<string, string> = { period };
        if (branchId) params.branchId = branchId;
        const res = await api.get<SalesChart>("/dashboard/sales-chart", { params });
        return res.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const useSalesChart = (period: string, branchId?: string) =>
    useQuery({
        queryKey: ["dashboard", "sales-chart", period, branchId],
        queryFn: () => fetchSalesChart(period, branchId),
        staleTime: 1000 * 60 * 2,
    });
