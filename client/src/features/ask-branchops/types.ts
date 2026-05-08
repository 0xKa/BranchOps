export interface AskBranchOpsHistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AskBranchOpsMessage extends AskBranchOpsHistoryMessage {
  id: string;
  status?: "streaming" | "completed" | "failed" | "cancelled";
}

export interface AskBranchOpsRequest {
  message: string;
  branchId?: string;
  history?: AskBranchOpsHistoryMessage[];
}

export interface AskToolCallEvent {
  sequence: number;
  toolName: string;
  toolCallId: string;
  argumentsJson?: string;
  durationMs?: number;
  resultJsonPreview?: string;
  failed?: boolean;
  error?: string | null;
}

export interface AskStreamEvent {
  sequence: number;
  type: "tool-start" | "tool-end" | "text-delta" | "answer-completed" | "answer-failed";
  data: Record<string, unknown>;
}
