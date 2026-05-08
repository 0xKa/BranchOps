import { useAuthStore } from "@/features/auth/auth-store";
import { USER_ROLES } from "@/features/auth/types";
import { useCallback, useRef, useState } from "react";
import type {
  BranchOpsAgentHistoryMessage,
  BranchOpsAgentMessage,
  BranchOpsAgentRequest,
  BranchOpsAgentStreamEvent,
  BranchOpsAgentToolCallEvent,
} from "../types";

interface StartArgs {
  message: string;
  branchId?: string;
  history: BranchOpsAgentHistoryMessage[];
}

export function useBranchOpsAgentStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<BranchOpsAgentMessage[]>([]);
  const [tools, setTools] = useState<BranchOpsAgentToolCallEvent[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const assistantIdRef = useRef<string | null>(null);

  const cancel = useCallback(() => {
    setIsCancelled(true);
    abortRef.current?.abort();
    const assistantId = assistantIdRef.current;
    if (assistantId) {
      setMessages((current) =>
        current.map((message) =>
          message.id === assistantId ? { ...message, status: "cancelled" } : message,
        ),
      );
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setIsCancelled(false);
    setTools([]);
  }, []);

  const appendAssistantText = useCallback((text: string) => {
    const assistantId = assistantIdRef.current;
    if (!assistantId) return;

    setMessages((current) =>
      current.map((message) =>
        message.id === assistantId
          ? { ...message, content: message.content + text }
          : message,
      ),
    );
  }, []);

  const markAssistant = useCallback((status: BranchOpsAgentMessage["status"]) => {
    const assistantId = assistantIdRef.current;
    if (!assistantId) return;

    setMessages((current) =>
      current.map((message) =>
        message.id === assistantId ? { ...message, status } : message,
      ),
    );
  }, []);

  const handleEvent = useCallback(
    (evt: BranchOpsAgentStreamEvent) => {
      if (evt.type === "text-delta") {
        appendAssistantText(String(evt.data.text ?? ""));
        return;
      }

      if (evt.type === "tool-start") {
        setTools((current) => [
          {
            sequence: evt.sequence,
            toolCallId: String(evt.data.toolCallId ?? ""),
            toolName: String(evt.data.toolName ?? "Tool"),
            argumentsJson: String(evt.data.argumentsJson ?? ""),
          },
          ...current,
        ]);
        return;
      }

      if (evt.type === "tool-end") {
        setTools((current) =>
          current.map((tool) =>
            tool.toolCallId === evt.data.toolCallId
              ? {
                  ...tool,
                  durationMs: Number(evt.data.durationMs ?? 0),
                  resultJsonPreview: String(evt.data.resultJsonPreview ?? ""),
                  failed: Boolean(evt.data.failed),
                  error: typeof evt.data.error === "string" ? evt.data.error : null,
                }
              : tool,
          ),
        );
        return;
      }

      if (evt.type === "answer-completed") {
        markAssistant("completed");
        return;
      }

      if (evt.type === "answer-failed") {
        const message = String(evt.data.error ?? "BranchOps Agent failed.");
        setError(message);
        markAssistant("failed");
      }
    },
    [appendAssistantText, markAssistant],
  );

  const start = useCallback(
    async ({ message, branchId, history }: StartArgs) => {
      const trimmed = message.trim();
      const state = useAuthStore.getState();
      const token = state.getAccessToken();
      const user = state.user;
      const effectiveBranchId =
        user?.role === USER_ROLES.Admin ? branchId || undefined : user?.employee?.branch?.id;

      if (!trimmed) {
        setError("Enter a question first.");
        return;
      }

      if (user?.role !== USER_ROLES.Admin && !effectiveBranchId) {
        setError("No accessible branch is assigned to this account.");
        return;
      }

      reset();
      setIsStreaming(true);

      const userMessage: BranchOpsAgentMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
        status: "completed",
      };
      const assistantMessage: BranchOpsAgentMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
        status: "streaming",
      };
      assistantIdRef.current = assistantMessage.id;
      setMessages((current) => [...current, userMessage, assistantMessage]);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        const payload: BranchOpsAgentRequest = {
          message: trimmed,
          branchId: effectiveBranchId,
          history: history.slice(-6),
        };

        const response = await fetch(`${baseUrl}/BranchOpsAgent/stream`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error(await readError(response));
        }

        await readSse(response.body, handleEvent);
      } catch (err) {
        if ((err as DOMException).name === "AbortError") {
          setIsCancelled(true);
          markAssistant("cancelled");
        } else {
          setError(err instanceof Error ? err.message : "Stream failed.");
          markAssistant("failed");
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [handleEvent, markAssistant, reset],
  );

  return {
    isStreaming,
    isCancelled,
    error,
    messages,
    tools,
    start,
    cancel,
    reset,
  };
}

async function readSse(
  body: ReadableStream<Uint8Array>,
  onEvent: (evt: BranchOpsAgentStreamEvent) => void,
) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";

    for (const frame of frames) {
      const dataLine = frame
        .split("\n")
        .find((line) => line.startsWith("data: "));

      if (!dataLine) continue;
      onEvent(JSON.parse(dataLine.slice(6)) as BranchOpsAgentStreamEvent);
    }
  }
}

async function readError(response: Response) {
  try {
    const json = await response.json();
    return json.message ?? json.error ?? "Request failed.";
  } catch {
    return "Request failed.";
  }
}
