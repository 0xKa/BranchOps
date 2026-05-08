import { handleApiError } from "@/lib/error-handler";
import { api } from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ReplenishmentRecommendation,
  ReplenishmentRunDetail,
  ReplenishmentRunPagedResult,
} from "../types";

interface HistoryParams {
  page: number;
  pageSize: number;
  branchId?: string;
}

const fetchRuns = async (
  params: HistoryParams,
): Promise<ReplenishmentRunPagedResult> => {
  try {
    const res = await api.get<ReplenishmentRunPagedResult>("/Replenishment/runs", {
      params: {
        page: params.page,
        pageSize: params.pageSize,
        branchId: params.branchId || undefined,
      },
    });
    return res.data;
  } catch (error) {
    return handleApiError(error);
  }
};

const fetchRun = async (id: string): Promise<ReplenishmentRunDetail> => {
  try {
    const res = await api.get<ReplenishmentRunDetail>(`/Replenishment/runs/${id}`);
    return res.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const useReplenishmentRuns = (params: HistoryParams) =>
  useQuery({
    queryKey: ["replenishment-runs", params],
    queryFn: () => fetchRuns(params),
  });

export const useReplenishmentRun = (id: string | null) =>
  useQuery({
    queryKey: ["replenishment-run", id],
    queryFn: () => fetchRun(id!),
    enabled: !!id,
  });

export const useRecommendationDecision = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      runId,
      recommendationId,
      decision,
      notes,
    }: {
      runId: string;
      recommendationId: string;
      decision: "approve" | "reject";
      notes?: string;
    }): Promise<ReplenishmentRecommendation> => {
      try {
        const res = await api.post<ReplenishmentRecommendation>(
          `/Replenishment/runs/${runId}/recommendations/${recommendationId}/${decision}`,
          { notes },
        );
        return res.data;
      } catch (error) {
        return handleApiError(error);
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["replenishment-runs"] });
      queryClient.invalidateQueries({
        queryKey: ["replenishment-run", variables.runId],
      });
    },
  });
};
