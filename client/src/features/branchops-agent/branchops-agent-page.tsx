import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/features/auth/auth-store";
import { USER_ROLES } from "@/features/auth/types";
import { useBranches } from "@/features/branches/hooks";
import PageContainer, { PageHeader } from "@/layouts/page-container";
import {
  Bot,
  ChevronDown,
  CornerDownLeft,
  RefreshCw,
  Send,
  Sparkles,
  Square,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useBranchOpsAgentStream } from "./hooks/use-branchops-agent-stream";
import type {
  BranchOpsAgentHistoryMessage,
  BranchOpsAgentMessage,
  BranchOpsAgentToolCallEvent,
} from "./types";

const SUGGESTED_PROMPTS = [
  "How are sales tracking vs last week?",
  "What are my top 5 products this week?",
  "Which items are running low?",
  "Which branch is performing best this month?",
];

const ALL_BRANCHES_VALUE = "__all__";

export default function BranchOpsAgentPage() {
  const user = useUser();
  const isAdmin = user?.role === USER_ROLES.Admin;
  const [question, setQuestion] = useState("");
  const [branchId, setBranchId] = useState(ALL_BRANCHES_VALUE);
  const stream = useBranchOpsAgentStream();
  const { data: branches } = useBranches();

  const history = useMemo<BranchOpsAgentHistoryMessage[]>(
    () =>
      stream.messages
        .filter((message) => message.status !== "streaming")
        .map((message) => ({ role: message.role, content: message.content }))
        .slice(-6),
    [stream.messages],
  );

  const selectedBranchId =
    isAdmin && branchId !== ALL_BRANCHES_VALUE ? branchId : undefined;

  const submitQuestion = (prompt = question) => {
    const text = prompt.trim();
    if (!text || stream.isStreaming) return;

    void stream.start({
      message: text,
      branchId: selectedBranchId,
      history,
    });
    setQuestion("");
  };

  return (
    <PageContainer>
      <PageHeader
        title="BranchOps Agent"
        description="Query read-only operational data across sales, products, branches, and stock."
      >
        {stream.isStreaming ? (
          <Button variant="outline" onClick={stream.cancel}>
            <Square className="me-2 size-4" />
            Cancel
          </Button>
        ) : (
          <Button variant="outline" onClick={stream.reset}>
            <RefreshCw className="me-2 size-4" />
            Reset Status
          </Button>
        )}
      </PageHeader>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="surface-1 flex min-h-[620px] flex-col rounded-xl border border-border/60">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
            <BranchScopeControl
              isAdmin={isAdmin}
              value={branchId}
              onValueChange={setBranchId}
              branches={branches ?? []}
              branchName={user?.employee?.branch?.displayName}
            />
            {stream.isStreaming && (
              <Badge variant="outline" className="gap-2">
                <Spinner className="size-3" />
                Streaming
              </Badge>
            )}
          </div>

          <div className="flex-1 space-y-4 overflow-auto px-4 py-4">
            {stream.messages.length === 0 ? (
              <EmptyConversation onPick={submitQuestion} />
            ) : (
              stream.messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))
            )}
          </div>

          <div className="border-t border-border/60 p-4">
            {stream.error && (
              <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {stream.error}
              </div>
            )}
            {stream.isCancelled && !stream.error && (
              <div className="mb-3 rounded-lg border border-border/60 px-3 py-2 text-sm text-muted-foreground">
                Answer cancelled.
              </div>
            )}
            <div className="flex gap-2">
              <Textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
                    submitQuestion();
                  }
                }}
                placeholder="Query sales, branches, top products, recent orders, or low-stock items."
                className="min-h-20 resize-none"
                disabled={stream.isStreaming}
              />
              <Button
                className="h-20 w-12 shrink-0"
                size="icon"
                disabled={!question.trim() || stream.isStreaming}
                onClick={() => submitQuestion()}
                aria-label="Send question"
              >
                <Send className="size-4" />
              </Button>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <CornerDownLeft className="size-3" />
              Ctrl+Enter to send
            </div>
          </div>
        </div>

        <ToolActivityPanel tools={stream.tools} />
      </section>
    </PageContainer>
  );
}

function BranchScopeControl({
  isAdmin,
  value,
  onValueChange,
  branches,
  branchName,
}: {
  isAdmin: boolean;
  value: string;
  onValueChange: (value: string) => void;
  branches: { id: string; displayName: string }[];
  branchName?: string;
}) {
  if (!isAdmin) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Scope</span>
        <Badge variant="outline">{branchName ?? "Assigned branch"}</Badge>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">Scope</span>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-56">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_BRANCHES_VALUE}>All Branches</SelectItem>
          {branches.map((branch) => (
            <SelectItem key={branch.id} value={branch.id}>
              {branch.displayName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function EmptyConversation({ onPick }: { onPick: (prompt: string) => void }) {
  return (
    <div className="flex h-full min-h-96 flex-col justify-center gap-4">
      <div className="flex items-center gap-2 text-base font-semibold">
        <Sparkles className="size-5 text-primary" />
        Start with an operations question
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <Button
            key={prompt}
            variant="outline"
            className="h-auto justify-start whitespace-normal py-3 text-left"
            onClick={() => onPick(prompt)}
          >
            {prompt}
          </Button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: BranchOpsAgentMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[900px] rounded-lg border border-border/60 px-4 py-3 ${
          isUser ? "bg-primary text-primary-foreground" : "bg-surface-2"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap text-sm">{message.content}</p>
        ) : (
          <AnswerRenderer text={message.content || "Thinking..."} />
        )}
        {message.status && message.status !== "completed" && (
          <div className="mt-2">
            <Badge variant={message.status === "failed" ? "destructive" : "outline"}>
              {message.status}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}

function AnswerRenderer({ text }: { text: string }) {
  const blocks = parseMarkdownTables(text);

  return (
    <div className="space-y-3 text-sm leading-6">
      {blocks.map((block, index) =>
        block.type === "table" ? (
          <div key={index} className="overflow-hidden rounded-lg border border-border/60">
            <Table>
              <TableHeader>
                <TableRow>
                  {block.headers.map((header) => (
                    <TableHead key={header}>{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {block.rows.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <TableCell key={`${rowIndex}-${cellIndex}`}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div key={index} className="space-y-2">
            {block.text
              .split(/\n{2,}/)
              .filter(Boolean)
              .map((paragraph, paragraphIndex) => (
                <p key={paragraphIndex} className="whitespace-pre-wrap">
                  {paragraph}
                </p>
              ))}
          </div>
        ),
      )}
    </div>
  );
}

type AnswerBlock =
  | { type: "text"; text: string }
  | { type: "table"; headers: string[]; rows: string[][] };

function parseMarkdownTables(text: string): AnswerBlock[] {
  const lines = text.split("\n");
  const blocks: AnswerBlock[] = [];
  let textBuffer: string[] = [];
  let index = 0;

  const flushText = () => {
    const value = textBuffer.join("\n").trim();
    if (value) blocks.push({ type: "text", text: value });
    textBuffer = [];
  };

  while (index < lines.length) {
    const line = lines[index];
    const separator = lines[index + 1];

    if (isTableRow(line) && isSeparatorRow(separator)) {
      flushText();
      const headers = splitTableRow(line);
      const rows: string[][] = [];
      index += 2;

      while (index < lines.length && isTableRow(lines[index])) {
        const cells = splitTableRow(lines[index]);
        if (cells.length === headers.length) rows.push(cells);
        index += 1;
      }

      blocks.push({ type: "table", headers, rows });
      continue;
    }

    textBuffer.push(line);
    index += 1;
  }

  flushText();
  return blocks.length > 0 ? blocks : [{ type: "text", text }];
}

function isTableRow(line?: string) {
  return !!line && line.includes("|") && splitTableRow(line).length >= 2;
}

function isSeparatorRow(line?: string) {
  if (!line || !line.includes("|")) return false;
  return splitTableRow(line).every((cell) => /^:?-{3,}:?$/.test(cell));
}

function splitTableRow(line: string) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function ToolActivityPanel({ tools }: { tools: BranchOpsAgentToolCallEvent[] }) {
  return (
    <aside className="surface-1 rounded-xl border border-border/60 p-4">
      <div className="mb-3">
        <h2 className="text-base font-semibold">Tool Activity</h2>
        <p className="text-sm text-muted-foreground">Read-only data calls used for the answer.</p>
      </div>

      <div className="space-y-2">
        {tools.length > 0 ? (
          tools.map((tool) => (
            <Collapsible key={`${tool.toolCallId}-${tool.sequence}`} className="rounded-lg border border-border/60">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="h-auto w-full justify-between px-3 py-2">
                  <span className="flex min-w-0 items-center gap-2 text-sm">
                    <Bot className="size-4 shrink-0" />
                    <span className="truncate">{tool.toolName}</span>
                    {tool.durationMs != null && (
                      <Badge variant={tool.failed ? "destructive" : "outline"}>
                        {tool.failed ? "Failed" : `${tool.durationMs} ms`}
                      </Badge>
                    )}
                  </span>
                  <ChevronDown className="size-4 shrink-0" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-2 border-t border-border/60 p-3">
                  <Preview label="Arguments" value={tool.argumentsJson} />
                  <Preview label="Result" value={tool.error ?? tool.resultJsonPreview} />
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No tool calls yet.</p>
        )}
      </div>
    </aside>
  );
}

function Preview({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      <pre className="max-h-36 overflow-auto rounded-md bg-muted px-2 py-2 text-xs">
        {value || "Pending"}
      </pre>
    </div>
  );
}
