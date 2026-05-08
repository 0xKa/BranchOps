import type { PagedResult } from "@/features/inventory/types";

export type ReplenishmentRunStatus = 1 | 2 | 3 | 4;
export type RecommendationUrgency = 1 | 2 | 3 | 4;
export type RecommendationStatus = 1 | 2 | 3;

export interface ReplenishmentRunSummary {
  id: string;
  branchId: string;
  branchName: string;
  status: ReplenishmentRunStatus;
  modelId: string;
  summary: string | null;
  errorMessage: string | null;
  startedAt: string;
  completedAt: string | null;
  triggeredByUserId: string;
  triggeredByUsername: string;
  recommendationCount: number;
}

export interface ReplenishmentRunDetail extends ReplenishmentRunSummary {
  recommendations: ReplenishmentRecommendation[];
}

export interface ReplenishmentRecommendation {
  id: string;
  runId: string;
  branchId: string;
  branchName: string;
  productId: string;
  productName: string;
  currentStock: number;
  suggestedQty: number;
  urgency: RecommendationUrgency;
  rationale: string;
  confidence: number;
  status: RecommendationStatus;
  decidedByUserId: string | null;
  decidedByUsername: string | null;
  decidedAt: string | null;
  decisionNotes: string | null;
}

export interface DraftRecommendationEvent {
  branchId: string;
  productId: string;
  suggestedQty: number;
  urgency: RecommendationUrgency;
  rationale: string;
  confidence: number;
}

export interface ToolCallEvent {
  sequence: number;
  toolName?: string;
  toolCallId: string;
  argumentsJson?: string;
  durationMs?: number;
  resultJsonPreview?: string;
  failed?: boolean;
  error?: string | null;
}

export interface StreamEvent {
  sequence: number;
  type:
    | "tool-start"
    | "tool-end"
    | "text-delta"
    | "recommendation-added"
    | "run-completed"
    | "run-failed";
  data: Record<string, unknown>;
}

export type ReplenishmentRunPagedResult = PagedResult<ReplenishmentRunSummary>;

export const RUN_STATUS_LABEL: Record<ReplenishmentRunStatus, string> = {
  1: "Running",
  2: "Completed",
  3: "Failed",
  4: "Cancelled",
};

export const URGENCY_LABEL: Record<RecommendationUrgency, string> = {
  1: "Low",
  2: "Medium",
  3: "High",
  4: "Critical",
};

export const RECOMMENDATION_STATUS_LABEL: Record<RecommendationStatus, string> = {
  1: "Pending",
  2: "Approved",
  3: "Rejected",
};
