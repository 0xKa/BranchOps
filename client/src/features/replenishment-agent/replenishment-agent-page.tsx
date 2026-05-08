import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { useQueryClient } from "@tanstack/react-query";
import {
  Bot,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Play,
  RefreshCw,
  Square,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  useRecommendationDecision,
  useReplenishmentRun,
  useReplenishmentRuns,
} from "./hooks/use-replenishment-history";
import { useReplenishmentStream } from "./hooks/use-replenishment-stream";
import {
  RECOMMENDATION_STATUS_LABEL,
  RUN_STATUS_LABEL,
  URGENCY_LABEL,
  type RecommendationStatus,
  type RecommendationUrgency,
  type ReplenishmentRecommendation,
  type ReplenishmentRunSummary,
  type ToolCallEvent,
} from "./types";

export default function ReplenishmentAgentPage() {
  const user = useUser();
  const isAdmin = user?.role === USER_ROLES.Admin;
  const [branchId, setBranchId] = useState("");
  const [prompt, setPrompt] = useState("");
  const [page, setPage] = useState(1);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const stream = useReplenishmentStream();
  const { data: branches } = useBranches();
  const history = useReplenishmentRuns({
    page,
    pageSize: 10,
    branchId: branchId || undefined,
  });
  const detail = useReplenishmentRun(selectedRunId);

  const effectiveBranchId = isAdmin ? branchId : user?.employee?.branch?.id ?? "";
  const canStart = !!effectiveBranchId && !stream.isStreaming;

  useEffect(() => {
    if (stream.completedRunId) {
      queueMicrotask(() => setSelectedRunId(stream.completedRunId));
      queryClient.invalidateQueries({ queryKey: ["replenishment-runs"] });
      queryClient.invalidateQueries({
        queryKey: ["replenishment-run", stream.completedRunId],
      });
    }
  }, [queryClient, stream.completedRunId]);

  return (
    <PageContainer>
      <PageHeader
        title="Replenishment Advisor"
        description="Stream an AI stock review, inspect tool calls, and decide draft reorder recommendations."
      >
        {stream.isStreaming ? (
          <Button variant="outline" onClick={stream.cancel}>
            <Square className="me-2 size-4" />
            Cancel
          </Button>
        ) : (
          <Button
            disabled={!canStart}
            onClick={() => stream.start({ branchId: effectiveBranchId, userPrompt: prompt })}
          >
            <Play className="me-2 size-4" />
            Start Review
          </Button>
        )}
      </PageHeader>

      <section className="grid gap-4 lg:grid-cols-[minmax(280px,360px)_1fr]">
        <div className="surface-1 rounded-xl border border-border/60 p-4">
          <div className="space-y-4">
            <BranchSelector
              value={branchId}
              onValueChange={setBranchId}
              isAdmin={isAdmin}
              branches={branches ?? []}
              branchName={user?.employee?.branch?.displayName}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="advisor-prompt">
                Optional focus
              </label>
              <Textarea
                id="advisor-prompt"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Focus on critical low-stock items and fast movers."
                className="min-h-28 resize-none"
              />
            </div>

            {!effectiveBranchId && (
              <p className="text-sm text-destructive">
                Admin users must choose one branch. All Branches is not valid for this advisor.
              </p>
            )}
          </div>
        </div>

        <div className="surface-1 rounded-xl border border-border/60 p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold">Active Stream</h2>
              <p className="text-sm text-muted-foreground">
                Narrative, tool calls, and draft recommendations from the current run.
              </p>
            </div>
            {stream.isStreaming && <Spinner className="size-5" />}
          </div>

          {stream.error && (
            <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {stream.error}
            </div>
          )}
          {stream.isCancelled && !stream.error && (
            <div className="mb-3 rounded-lg border border-border/60 px-3 py-2 text-sm text-muted-foreground">
              Run cancelled.
            </div>
          )}

          <div className="grid gap-3 xl:grid-cols-2">
            <div className="min-h-52 rounded-lg border border-border/60 p-3">
              <h3 className="mb-2 text-sm font-medium">Narrative</h3>
              <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                {stream.narrative || "No narrative yet."}
              </p>
            </div>
            <div className="min-h-52 rounded-lg border border-border/60 p-3">
              <h3 className="mb-2 text-sm font-medium">Drafts</h3>
              <div className="space-y-2">
                {stream.drafts.length > 0 ? (
                  stream.drafts.map((draft, index) => (
                    <div key={`${draft.productId}-${index}`} className="rounded-md border border-border/60 p-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">Product {draft.productId.slice(0, 8)}</span>
                        <UrgencyBadge urgency={draft.urgency} />
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Qty {draft.suggestedQty} · Confidence {Math.round(draft.confidence * 100)}%
                      </p>
                      <p className="mt-1 text-sm">{draft.rationale}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No recommendations drafted yet.</p>
                )}
              </div>
            </div>
          </div>

          <ToolCallList tools={stream.tools} />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <HistoryPanel
          runs={history.data?.items ?? []}
          isLoading={history.isLoading}
          selectedRunId={selectedRunId}
          onSelect={setSelectedRunId}
          page={page}
          totalPages={history.data?.totalPages ?? 1}
          totalCount={history.data?.totalCount ?? 0}
          onPageChange={setPage}
          onRefresh={() => history.refetch()}
        />
        <RunDetailPanel
          runId={selectedRunId}
          isLoading={detail.isLoading}
          recommendations={detail.data?.recommendations ?? []}
        />
      </section>
    </PageContainer>
  );
}

function BranchSelector({
  value,
  onValueChange,
  isAdmin,
  branches,
  branchName,
}: {
  value: string;
  onValueChange: (value: string) => void;
  isAdmin: boolean;
  branches: { id: string; displayName: string }[];
  branchName?: string;
}) {
  if (!isAdmin) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium">Branch</p>
        <Badge variant="outline" className="h-8 px-3">
          {branchName ?? "Assigned branch"}
        </Badge>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Branch</label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Choose branch" />
        </SelectTrigger>
        <SelectContent>
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

function ToolCallList({ tools }: { tools: ToolCallEvent[] }) {
  return (
    <div className="mt-3 space-y-2">
      <h3 className="text-sm font-medium">Tool Calls</h3>
      {tools.length > 0 ? (
        tools.map((tool) => (
          <Collapsible key={`${tool.toolCallId}-${tool.sequence}`} className="rounded-lg border border-border/60">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="h-auto w-full justify-between px-3 py-2">
                <span className="flex items-center gap-2 text-sm">
                  <Bot className="size-4" />
                  {tool.toolName}
                  {tool.durationMs != null && (
                    <Badge variant={tool.failed ? "destructive" : "outline"}>
                      {tool.failed ? "Failed" : `${tool.durationMs} ms`}
                    </Badge>
                  )}
                </span>
                <ChevronDown className="size-4" />
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

function HistoryPanel({
  runs,
  isLoading,
  selectedRunId,
  onSelect,
  page,
  totalPages,
  totalCount,
  onPageChange,
  onRefresh,
}: {
  runs: ReplenishmentRunSummary[];
  isLoading: boolean;
  selectedRunId: string | null;
  onSelect: (id: string) => void;
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}) {
  return (
    <div className="surface-1 rounded-xl border border-border/60 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold">Run History</h2>
          <p className="text-sm text-muted-foreground">Previous advisor runs for the selected branch scope.</p>
        </div>
        <Button variant="outline" size="icon" onClick={onRefresh}>
          <RefreshCw className="size-4" />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner className="size-6" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border/60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Branch</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Recommendations</TableHead>
                <TableHead>Started</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs.length > 0 ? (
                runs.map((run) => (
                  <TableRow key={run.id} className={selectedRunId === run.id ? "bg-muted/50" : undefined}>
                    <TableCell className="font-medium">{run.branchName}</TableCell>
                    <TableCell>
                      <RunStatusBadge status={run.status} />
                    </TableCell>
                    <TableCell>{run.recommendationCount}</TableCell>
                    <TableCell>{new Date(run.startedAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => onSelect(run.id)}>
                        <Eye className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    No replenishment runs found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-3 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} ({totalCount} total)
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="outline" size="icon" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function RunDetailPanel({
  runId,
  isLoading,
  recommendations,
}: {
  runId: string | null;
  isLoading: boolean;
  recommendations: ReplenishmentRecommendation[];
}) {
  return (
    <div className="surface-1 rounded-xl border border-border/60 p-4">
      <h2 className="text-base font-semibold">Recommendations</h2>
      <p className="mb-3 text-sm text-muted-foreground">Approve or reject pending drafts. Stock is not changed.</p>

      {!runId ? (
        <p className="text-sm text-muted-foreground">Select a run to view recommendations.</p>
      ) : isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner className="size-6" />
        </div>
      ) : recommendations.length > 0 ? (
        <div className="space-y-3">
          {recommendations.map((recommendation) => (
            <RecommendationCard key={recommendation.id} recommendation={recommendation} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">This run did not produce recommendations.</p>
      )}
    </div>
  );
}

function RecommendationCard({ recommendation }: { recommendation: ReplenishmentRecommendation }) {
  const [decision, setDecision] = useState<"approve" | "reject" | null>(null);
  const mutation = useRecommendationDecision();
  const pending = recommendation.status === 1;

  return (
    <div className="rounded-lg border border-border/60 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">{recommendation.productName}</h3>
          <p className="text-sm text-muted-foreground">
            Current {recommendation.currentStock} · Suggested {recommendation.suggestedQty}
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-1">
          <UrgencyBadge urgency={recommendation.urgency} />
          <RecommendationStatusBadge status={recommendation.status} />
        </div>
      </div>
      <p className="mt-2 text-sm">{recommendation.rationale}</p>
      <p className="mt-2 text-xs text-muted-foreground">
        Confidence {Math.round(recommendation.confidence * 100)}%
      </p>

      {pending && (
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={() => setDecision("approve")}>
            <Check className="me-2 size-4" />
            Approve
          </Button>
          <Button size="sm" variant="outline" onClick={() => setDecision("reject")}>
            <X className="me-2 size-4" />
            Reject
          </Button>
        </div>
      )}

      <AlertDialog open={!!decision} onOpenChange={(open) => !open && setDecision(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {decision === "approve" ? "Approve recommendation?" : "Reject recommendation?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              This records the decision only. Inventory quantities and stock adjustments are not changed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={mutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={mutation.isPending}
              variant={decision === "reject" ? "destructive" : "default"}
              onClick={() => {
                if (!decision) return;
                mutation.mutate(
                  {
                    runId: recommendation.runId,
                    recommendationId: recommendation.id,
                    decision,
                  },
                  { onSuccess: () => setDecision(null) },
                );
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function RunStatusBadge({ status }: { status: ReplenishmentRunSummary["status"] }) {
  const variant = status === 2 ? "default" : status === 3 ? "destructive" : "outline";
  return <Badge variant={variant}>{RUN_STATUS_LABEL[status]}</Badge>;
}

function UrgencyBadge({ urgency }: { urgency: RecommendationUrgency }) {
  const variant = urgency >= 3 ? "destructive" : urgency === 2 ? "secondary" : "outline";
  return <Badge variant={variant}>{URGENCY_LABEL[urgency]}</Badge>;
}

function RecommendationStatusBadge({ status }: { status: RecommendationStatus }) {
  const variant = status === 2 ? "default" : status === 3 ? "secondary" : "outline";
  return <Badge variant={variant}>{RECOMMENDATION_STATUS_LABEL[status]}</Badge>;
}
