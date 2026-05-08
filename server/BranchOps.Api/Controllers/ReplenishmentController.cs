using System.Text.Json;
using BranchOps.Api.Ai.Orchestration;
using BranchOps.Api.Dtos;
using BranchOps.Api.Security;
using BranchOps.Domain.Ai;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;

namespace BranchOps.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin,StockManager,BranchManager")]
public class ReplenishmentController(ReplenishmentRunOrchestrator orchestrator) : ControllerBase
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    [HttpPost("runs")]
    public async Task<IActionResult> StartRun(
        [FromQuery] Guid? branchId,
        [FromBody] StartRunRequest request,
        CancellationToken cancellationToken)
    {
        var effectiveBranchId = ResolveRequiredBranch(branchId);
        if (effectiveBranchId is null)
            return BadRequest(new ApiError("A branchId is required to start a replenishment run."));

        var userId = User.GetUserId();
        if (userId is null)
            return Unauthorized(new ApiError("Authenticated user id is missing."));

        ReplenishmentRunStream stream;
        try
        {
            stream = await orchestrator.StartAsync(
                effectiveBranchId.Value,
                userId.Value,
                request.UserPrompt,
                cancellationToken);
        }
        catch (ReplenishmentRunException ex)
        {
            return BadRequest(new ApiError(ex.Message));
        }

        HttpContext.Features.Get<IHttpResponseBodyFeature>()?.DisableBuffering();
        Response.Headers.CacheControl = "no-cache, no-transform";
        Response.Headers.Connection = "keep-alive";
        Response.Headers.XContentTypeOptions = "nosniff";
        Response.ContentType = "text/event-stream";

        await foreach (var evt in stream.Events.ReadAllAsync(cancellationToken))
        {
            var payload = ReplenishmentSsePayload.FromEvent(evt);
            await WriteSseAsync(payload.Type, payload, cancellationToken);
        }

        await stream.Completion;
        return new EmptyResult();
    }

    [HttpGet("runs")]
    public async Task<ActionResult<PagedResult<ReplenishmentRunSummaryDto>>> GetRuns(
        [FromQuery] PaginationQuery pagination,
        [FromQuery] Guid? branchId,
        CancellationToken cancellationToken)
    {
        var effectiveBranchId = User.GetEffectiveBranchId(branchId);
        var result = await orchestrator.GetRunsAsync(pagination, effectiveBranchId, cancellationToken);
        return Ok(result);
    }

    [HttpGet("runs/{id:guid}")]
    public async Task<ActionResult<ReplenishmentRunDetailDto>> GetRun(
        Guid id,
        CancellationToken cancellationToken)
    {
        var run = await orchestrator.GetRunAsync(id, cancellationToken);
        if (run is null)
            return NotFound(new ApiError("Replenishment run not found."));

        var userBranchId = User.GetBranchId();
        if (userBranchId.HasValue && run.BranchId != userBranchId.Value)
            return Forbid();

        return Ok(run);
    }

    [HttpPost("runs/{runId:guid}/recommendations/{recommendationId:guid}/approve")]
    public Task<ActionResult<ReplenishmentRecommendationDto>> Approve(
        Guid runId,
        Guid recommendationId,
        DecisionRequest request,
        CancellationToken cancellationToken)
        => Decide(runId, recommendationId, RecommendationStatus.Approved, request, cancellationToken);

    [HttpPost("runs/{runId:guid}/recommendations/{recommendationId:guid}/reject")]
    public Task<ActionResult<ReplenishmentRecommendationDto>> Reject(
        Guid runId,
        Guid recommendationId,
        DecisionRequest request,
        CancellationToken cancellationToken)
        => Decide(runId, recommendationId, RecommendationStatus.Rejected, request, cancellationToken);

    private async Task<ActionResult<ReplenishmentRecommendationDto>> Decide(
        Guid runId,
        Guid recommendationId,
        RecommendationStatus decision,
        DecisionRequest request,
        CancellationToken cancellationToken)
    {
        var run = await orchestrator.GetRunAsync(runId, cancellationToken);
        if (run is null)
            return NotFound(new ApiError("Replenishment run not found."));

        var userBranchId = User.GetBranchId();
        if (userBranchId.HasValue && run.BranchId != userBranchId.Value)
            return Forbid();

        var userId = User.GetUserId();
        if (userId is null)
            return Unauthorized(new ApiError("Authenticated user id is missing."));

        try
        {
            var recommendation = await orchestrator.DecideAsync(
                runId,
                recommendationId,
                decision,
                userId.Value,
                request.Notes,
                cancellationToken);

            return recommendation is null
                ? NotFound(new ApiError("Recommendation not found."))
                : Ok(recommendation);
        }
        catch (ReplenishmentDecisionConflictException ex)
        {
            return Conflict(new ApiError(ex.Message));
        }
    }

    private Guid? ResolveRequiredBranch(Guid? requestedBranchId)
    {
        if (User.IsAdmin())
            return requestedBranchId;

        return User.GetBranchId();
    }

    private async Task WriteSseAsync(
        string eventType,
        ReplenishmentSsePayload payload,
        CancellationToken cancellationToken)
    {
        await Response.WriteAsync($"event: {eventType}\n", cancellationToken);
        await Response.WriteAsync($"data: {JsonSerializer.Serialize(payload, JsonOptions)}\n\n", cancellationToken);
        await Response.Body.FlushAsync(cancellationToken);
    }
}
