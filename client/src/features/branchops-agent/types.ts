export interface BranchOpsAgentHistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export interface BranchOpsAgentMessage extends BranchOpsAgentHistoryMessage {
  id: string;
  status?: "streaming" | "completed" | "failed" | "cancelled";
}

export interface BranchOpsAgentRequest {
  message: string;
  branchId?: string;
  history?: BranchOpsAgentHistoryMessage[];
}

export interface BranchOpsAgentToolCallEvent {
  sequence: number;
  toolName: string;
  toolCallId: string;
  argumentsJson?: string;
  durationMs?: number;
  resultJsonPreview?: string;
  failed?: boolean;
  error?: string | null;
}

export interface BranchOpsAgentStreamEvent {
  sequence: number;
  type: "tool-start" | "tool-end" | "text-delta" | "answer-completed" | "answer-failed";
  data: Record<string, unknown>;
}
