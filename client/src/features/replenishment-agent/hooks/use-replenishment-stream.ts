import { useAuthStore } from "@/features/auth/auth-store";
import { USER_ROLES } from "@/features/auth/types";
import { useCallback, useRef, useState } from "react";
import type { DraftRecommendationEvent, StreamEvent, ToolCallEvent } from "../types";

interface StartRunArgs {
  branchId?: string;
  userPrompt?: string;
}

export function useReplenishmentStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [narrative, setNarrative] = useState("");
  const [tools, setTools] = useState<ToolCallEvent[]>([]);
  const [drafts, setDrafts] = useState<DraftRecommendationEvent[]>([]);
  const [completedRunId, setCompletedRunId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    setError(null);
    setNarrative("");
    setTools([]);
    setDrafts([]);
    setCompletedRunId(null);
    setIsCancelled(false);
  }, []);

  const cancel = useCallback(() => {
    setIsCancelled(true);
    abortRef.current?.abort();
  }, []);

  const handleEvent = useCallback((evt: StreamEvent) => {
    if (evt.type === "text-delta") {
      setNarrative((current) => current + String(evt.data.text ?? ""));
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

    if (evt.type === "recommendation-added") {
      const recommendation = evt.data.recommendation as DraftRecommendationEvent;
      if (recommendation) {
        setDrafts((current) => [recommendation, ...current]);
      }
      return;
    }

    if (evt.type === "run-completed") {
      setCompletedRunId(String(evt.data.runId ?? ""));
      return;
    }

    if (evt.type === "run-failed") {
      setError(String(evt.data.error ?? "Run failed."));
    }
  }, []);

  const start = useCallback(
    async ({ branchId, userPrompt }: StartRunArgs) => {
      const state = useAuthStore.getState();
      const user = state.user;
      const token = state.getAccessToken();
      const effectiveBranchId =
        user?.role === USER_ROLES.Admin ? branchId : user?.employee?.branch?.id;

      if (!effectiveBranchId) {
        setError("Select a branch before starting the advisor.");
        return;
      }

      reset();
      setIsStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        const url = new URL(`${baseUrl}/Replenishment/runs`);
        url.searchParams.set("branchId", effectiveBranchId);

        const response = await fetch(url.toString(), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ userPrompt: userPrompt || undefined }),
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error(await readError(response));
        }

        await readSse(response.body, handleEvent);
      } catch (err) {
        if ((err as DOMException).name === "AbortError") {
          setIsCancelled(true);
        } else {
          setError(err instanceof Error ? err.message : "Stream failed.");
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [handleEvent, reset],
  );

  return {
    isStreaming,
    isCancelled,
    error,
    narrative,
    tools,
    drafts,
    completedRunId,
    start,
    cancel,
    reset,
  };
}

async function readSse(
  body: ReadableStream<Uint8Array>,
  onEvent: (evt: StreamEvent) => void,
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

      onEvent(JSON.parse(dataLine.slice(6)) as StreamEvent);
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
