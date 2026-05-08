using System.Diagnostics;
using System.Text;
using System.Threading.Channels;
using BranchOps.Ai.Abstractions;
using BranchOps.Ai.Agents;
using BranchOps.Ai.Configuration;
using BranchOps.Ai.Models;
using BranchOps.Ai.Streaming;
using BranchOps.Api.Data;
using BranchOps.Api.Dtos;
using BranchOps.Domain.Ai;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Options;

namespace BranchOps.Api.Ai.Orchestration;

public sealed class ReplenishmentRunOrchestrator(
    BranchOpsDbContext db,
    ReplenishmentAdvisorAgent agentFactory,
    ToolBundle tools,
    AgentEventChannel events,
    ISequenceCounter sequence,
    IRunContext runContext,
    IOptions<AiOptions> options,
    ILogger<ReplenishmentRunOrchestrator> logger)
{
    private const string DefaultPrompt =
        "Review this branch's inventory and recent sales. Draft replenishment recommendations for products that need reorder attention.";

    public async Task<ReplenishmentRunStream> StartAsync(
        Guid branchId,
        Guid userId,
        string? userPrompt,
        CancellationToken cancellationToken)
    {
        var branchExists = await db.Branches.AnyAsync(b => b.Id == branchId, cancellationToken);
        if (!branchExists)
            throw new ReplenishmentRunException("Branch not found.");

        var run = new ReplenishmentRun
        {
            BranchId = branchId,
            TriggeredByUserId = userId,
            Status = ReplenishmentRunStatus.Running,
            StartedAt = DateTime.UtcNow,
            ModelId = options.Value.OpenAI.Model
        };

        db.ReplenishmentRuns.Add(run);
        await db.SaveChangesAsync(cancellationToken);

        runContext.Set(run.Id, userId, branchId);

        var task = ExecuteAsync(run.Id, branchId, userPrompt, cancellationToken);
        return new ReplenishmentRunStream(run.Id, events.Reader, task);
    }

    public async Task<PagedResult<ReplenishmentRunSummaryDto>> GetRunsAsync(
        PaginationQuery pagination,
        Guid? branchId,
        CancellationToken cancellationToken)
    {
        var query = db.ReplenishmentRuns
            .AsNoTracking()
            .Include(r => r.Branch)
            .Include(r => r.TriggeredByUser)
            .Include(r => r.Recommendations)
            .AsQueryable();

        if (branchId.HasValue)
            query = query.Where(r => r.BranchId == branchId.Value);

        var totalCount = await query.CountAsync(cancellationToken);
        var totalPages = (int)Math.Ceiling(totalCount / (double)pagination.PageSize);

        var items = await query
            .OrderByDescending(r => r.StartedAt)
            .Skip(pagination.Skip)
            .Take(pagination.PageSize)
            .Select(r => ToSummaryDto(r))
            .ToListAsync(cancellationToken);

        return new PagedResult<ReplenishmentRunSummaryDto>(
            items,
            pagination.Page,
            pagination.PageSize,
            totalCount,
            totalPages);
    }

    public async Task<ReplenishmentRunDetailDto?> GetRunAsync(Guid runId, CancellationToken cancellationToken)
    {
        var run = await db.ReplenishmentRuns
            .AsNoTracking()
            .Include(r => r.Branch)
            .Include(r => r.TriggeredByUser)
            .Include(r => r.Recommendations)
                .ThenInclude(r => r.Product)
            .Include(r => r.Recommendations)
                .ThenInclude(r => r.DecidedByUser)
            .FirstOrDefaultAsync(r => r.Id == runId, cancellationToken);

        return run is null ? null : ToDetailDto(run);
    }

    public async Task<ReplenishmentRecommendationDto?> DecideAsync(
        Guid runId,
        Guid recommendationId,
        RecommendationStatus decision,
        Guid userId,
        string? notes,
        CancellationToken cancellationToken)
    {
        var recommendation = await db.ReplenishmentRecommendations
            .Include(r => r.Run)
                .ThenInclude(r => r.Branch)
            .Include(r => r.Product)
            .Include(r => r.DecidedByUser)
            .FirstOrDefaultAsync(r => r.Id == recommendationId && r.RunId == runId, cancellationToken);

        if (recommendation is null)
            return null;

        if (recommendation.Status != RecommendationStatus.Pending)
            throw new ReplenishmentDecisionConflictException("Recommendation has already been decided.");

        recommendation.Status = decision;
        recommendation.DecidedByUserId = userId;
        recommendation.DecidedAt = DateTime.UtcNow;
        recommendation.DecisionNotes = string.IsNullOrWhiteSpace(notes) ? null : notes.Trim()[..Math.Min(notes.Trim().Length, 500)];

        await db.SaveChangesAsync(cancellationToken);
        return ToRecommendationDto(recommendation);
    }

    private async Task ExecuteAsync(
        Guid runId,
        Guid branchId,
        string? userPrompt,
        CancellationToken cancellationToken)
    {
        var sw = Stopwatch.StartNew();
        var summary = new StringBuilder();

        try
        {
            var agent = agentFactory.Build(branchId, tools);
            var message = new ChatMessage(ChatRole.User, string.IsNullOrWhiteSpace(userPrompt) ? DefaultPrompt : userPrompt.Trim());

            await foreach (var update in agent.RunStreamingAsync([message], cancellationToken: cancellationToken))
            {
                if (!string.IsNullOrEmpty(update.Text))
                {
                    summary.Append(update.Text);
                    await events.Writer.WriteAsync(
                        new TextDeltaEvent(sequence.Next(), update.Text),
                        cancellationToken);
                }
            }

            var persisted = await PersistDraftsAsync(runId, branchId, cancellationToken);
            var finalSummary = Truncate(summary.ToString().Trim(), 2000);

            var run = await db.ReplenishmentRuns.FirstAsync(r => r.Id == runId, cancellationToken);
            run.Status = ReplenishmentRunStatus.Completed;
            run.Summary = string.IsNullOrWhiteSpace(finalSummary) ? "Replenishment analysis completed." : finalSummary;
            run.CompletedAt = DateTime.UtcNow;
            await db.SaveChangesAsync(cancellationToken);

            sw.Stop();
            await events.Writer.WriteAsync(
                new RunCompletedEvent(sequence.Next(), runId, run.Summary, persisted, sw.ElapsedMilliseconds),
                cancellationToken);
        }
        catch (OperationCanceledException)
        {
            await MarkTerminalAsync(runId, ReplenishmentRunStatus.Cancelled, "Run cancelled.", CancellationToken.None);
            await events.Writer.WriteAsync(
                new RunFailedEvent(sequence.Next(), runId, "Run cancelled."),
                CancellationToken.None);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Replenishment run {RunId} failed.", runId);
            await MarkTerminalAsync(runId, ReplenishmentRunStatus.Failed, ex.Message, CancellationToken.None);
            await events.Writer.WriteAsync(
                new RunFailedEvent(sequence.Next(), runId, "Replenishment analysis failed. Please retry later."),
                CancellationToken.None);
        }
        finally
        {
            events.Writer.TryComplete();
        }
    }

    private async Task<int> PersistDraftsAsync(Guid runId, Guid branchId, CancellationToken cancellationToken)
    {
        var max = Math.Max(1, options.Value.Replenishment.MaxProductsPerRun);
        var drafts = tools.Drafts.Drafts
            .Where(d => d.BranchId == branchId && d.SuggestedQty > 0)
            .GroupBy(d => d.ProductId)
            .Select(g => g.First())
            .Take(max)
            .ToList();

        var count = 0;
        foreach (var draft in drafts)
        {
            var stock = await db.BranchStocks
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.BranchId == branchId && s.ProductId == draft.ProductId, cancellationToken);

            if (stock is null)
                continue;

            var productExists = await db.Products
                .AsNoTracking()
                .AnyAsync(p => p.Id == draft.ProductId, cancellationToken);

            if (!productExists)
                continue;

            var entity = new ReplenishmentRecommendation
            {
                RunId = runId,
                BranchId = branchId,
                ProductId = draft.ProductId,
                CurrentStock = stock.Quantity,
                SuggestedQty = draft.SuggestedQty,
                Urgency = draft.Urgency,
                Rationale = Truncate(draft.Rationale, 1500),
                Confidence = Math.Clamp(draft.Confidence, 0m, 1m),
                Status = RecommendationStatus.Pending
            };

            db.ReplenishmentRecommendations.Add(entity);
            await events.Writer.WriteAsync(
                new RecommendationAddedEvent(sequence.Next(), draft),
                cancellationToken);
            count++;
        }

        await db.SaveChangesAsync(cancellationToken);
        return count;
    }

    private async Task MarkTerminalAsync(
        Guid runId,
        ReplenishmentRunStatus status,
        string? error,
        CancellationToken cancellationToken)
    {
        var run = await db.ReplenishmentRuns.FirstOrDefaultAsync(r => r.Id == runId, cancellationToken);
        if (run is null)
            return;

        run.Status = status;
        run.CompletedAt = DateTime.UtcNow;
        run.ErrorMessage = Truncate(error, 1000);
        await db.SaveChangesAsync(cancellationToken);
    }

    private static ReplenishmentRunSummaryDto ToSummaryDto(ReplenishmentRun run)
        => new(
            run.Id,
            run.BranchId,
            run.Branch.DisplayName,
            run.Status,
            run.ModelId,
            run.Summary,
            run.ErrorMessage,
            run.StartedAt,
            run.CompletedAt,
            run.TriggeredByUserId,
            run.TriggeredByUser.Username,
            run.Recommendations.Count);

    private static ReplenishmentRunDetailDto ToDetailDto(ReplenishmentRun run)
        => new(
            run.Id,
            run.BranchId,
            run.Branch.DisplayName,
            run.Status,
            run.ModelId,
            run.Summary,
            run.ErrorMessage,
            run.StartedAt,
            run.CompletedAt,
            run.TriggeredByUserId,
            run.TriggeredByUser.Username,
            run.Recommendations
                .OrderBy(r => r.Status)
                .ThenByDescending(r => r.Urgency)
                .Select(ToRecommendationDto)
                .ToList());

    private static ReplenishmentRecommendationDto ToRecommendationDto(ReplenishmentRecommendation r)
        => new(
            r.Id,
            r.RunId,
            r.BranchId,
            r.Run.Branch.DisplayName,
            r.ProductId,
            r.Product.Name,
            r.CurrentStock,
            r.SuggestedQty,
            r.Urgency,
            r.Rationale,
            r.Confidence,
            r.Status,
            r.DecidedByUserId,
            r.DecidedByUser?.Username,
            r.DecidedAt,
            r.DecisionNotes);

    private static string Truncate(string? value, int max)
    {
        if (string.IsNullOrWhiteSpace(value))
            return string.Empty;

        var trimmed = value.Trim();
        return trimmed.Length <= max ? trimmed : trimmed[..max];
    }
}

public sealed record ReplenishmentRunStream(
    Guid RunId,
    ChannelReader<AgentEvent> Events,
    Task Completion);

public sealed class ReplenishmentRunException(string message) : Exception(message);

public sealed class ReplenishmentDecisionConflictException(string message) : Exception(message);
