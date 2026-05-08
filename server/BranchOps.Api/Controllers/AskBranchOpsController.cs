using System.Text.Json;
using BranchOps.Ai.Configuration;
using BranchOps.Api.Ai.Orchestration;
using BranchOps.Api.Dtos;
using BranchOps.Api.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace BranchOps.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin,StockManager,BranchManager")]
public class AskBranchOpsController(
    AskBranchOpsRunOrchestrator orchestrator,
    IOptions<AiOptions> options,
    ILogger<AskBranchOpsController> logger) : ControllerBase
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    [HttpPost("stream")]
    public async Task<IActionResult> Stream(
        [FromBody] AskBranchOpsRequest request,
        CancellationToken cancellationToken)
    {
        var message = request.Message?.Trim();
        if (string.IsNullOrWhiteSpace(message))
            return BadRequest(new ApiError("Message is required."));

        var maxLength = Math.Clamp(options.Value.AskBranchOps.MaxMessageLength, 100, 4000);
        if (message.Length > maxLength)
            return BadRequest(new ApiError($"Message must be {maxLength} characters or fewer."));

        var userId = User.GetUserId();
        if (userId is null)
            return Unauthorized(new ApiError("Authenticated user id is missing."));

        var effectiveBranchId = ResolveBranchId(request.BranchId);
        if (!User.IsAdmin() && effectiveBranchId is null)
            return Forbid();

        AskBranchOpsRunStream stream;
        try
        {
            stream = await orchestrator.StartAsync(
                userId.Value,
                effectiveBranchId,
                message,
                request.History,
                cancellationToken);
        }
        catch (AskBranchOpsRunException ex)
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
            var payload = AskBranchOpsSsePayload.FromEvent(evt);
            await WriteSseAsync(payload.Type, payload, cancellationToken);
        }

        try
        {
            await stream.Completion;
        }
        catch (OperationCanceledException)
        {
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ask BranchOps stream completion failed after the SSE response started.");
        }

        return new EmptyResult();
    }

    private Guid? ResolveBranchId(Guid? requestedBranchId)
        => User.IsAdmin() ? requestedBranchId : User.GetBranchId();

    private async Task WriteSseAsync(
        string eventType,
        AskBranchOpsSsePayload payload,
        CancellationToken cancellationToken)
    {
        await Response.WriteAsync($"event: {eventType}\n", cancellationToken);
        await Response.WriteAsync($"data: {JsonSerializer.Serialize(payload, JsonOptions)}\n\n", cancellationToken);
        await Response.Body.FlushAsync(cancellationToken);
    }
}
