using BranchOps.Api.Dtos;
using BranchOps.Api.Security;
using BranchOps.Api.Services;
using BranchOps.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BranchOps.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin,StockManager,BranchManager,Cashier")]
public class StockController(StockService stockService) : ControllerBase
{
    // ── Stock levels ───────────────────────────────────────────

    [HttpGet]
    public async Task<ActionResult<PagedResult<BranchStockDto>>> GetAll(
        [FromQuery] PaginationQuery pagination,
        [FromQuery] Guid? branchId,
        [FromQuery] Guid? productId,
        [FromQuery] bool? lowStockOnly,
        CancellationToken cancellationToken)
    {
        var effectiveBranchId = User.GetEffectiveBranchId(branchId);
        var result = await stockService.GetAllAsync(pagination, effectiveBranchId, productId, lowStockOnly, cancellationToken);

        return Ok(new PagedResult<BranchStockDto>(
            result.Items.Select(ToDto).ToList(),
            result.Page,
            result.PageSize,
            result.TotalCount,
            result.TotalPages));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<BranchStockDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var stock = await stockService.GetByIdAsync(id, cancellationToken);
        if (stock == null)
            return NotFound(new ApiError("Stock record not found."));

        // Non-admin users can only view stock from their own branch
        var userBranchId = User.GetBranchId();
        if (userBranchId.HasValue && stock.BranchId != userBranchId.Value)
            return Forbid();

        return Ok(ToDto(stock));
    }

    [HttpGet("by-branch-product")]
    public async Task<ActionResult<BranchStockDto>> GetByBranchAndProduct(
        [FromQuery] Guid branchId,
        [FromQuery] Guid productId,
        CancellationToken cancellationToken)
    {
        // Non-admin users can only query their own branch
        var userBranchId = User.GetBranchId();
        if (userBranchId.HasValue && branchId != userBranchId.Value)
            return Forbid();

        var stock = await stockService.GetByBranchAndProductAsync(branchId, productId, cancellationToken);
        if (stock == null)
            return NotFound(new ApiError("Stock record not found."));

        return Ok(ToDto(stock));
    }

    [HttpGet("low-stock")]
    public async Task<ActionResult<IReadOnlyList<LowStockAlertDto>>> GetLowStockAlerts(
        [FromQuery] Guid? branchId,
        CancellationToken cancellationToken)
    {
        var effectiveBranchId = User.GetEffectiveBranchId(branchId);
        var alerts = await stockService.GetLowStockAlertsAsync(effectiveBranchId, cancellationToken);
        return Ok(alerts.Select(s => new LowStockAlertDto(
            s.Id,
            s.BranchId,
            s.Branch?.DisplayName ?? string.Empty,
            s.ProductId,
            s.Product?.Name ?? string.Empty,
            s.Quantity,
            s.LowStockThreshold)).ToList());
    }

    // ── Stock adjustments history ──────────────────────────────

    [HttpGet("adjustments")]
    public async Task<ActionResult<PagedResult<StockAdjustmentDto>>> GetAdjustments(
        [FromQuery] PaginationQuery pagination,
        [FromQuery] Guid? branchId,
        [FromQuery] Guid? productId,
        [FromQuery] StockAdjustmentType? type,
        CancellationToken cancellationToken)
    {
        var effectiveBranchId = User.GetEffectiveBranchId(branchId);
        var result = await stockService.GetAdjustmentsAsync(pagination, effectiveBranchId, productId, type, cancellationToken);

        return Ok(new PagedResult<StockAdjustmentDto>(
            result.Items.Select(ToAdjustmentDto).ToList(),
            result.Page,
            result.PageSize,
            result.TotalCount,
            result.TotalPages));
    }

    // ── Commands ───────────────────────────────────────────────

    [Authorize(Roles = "Admin,StockManager,BranchManager")]
    [HttpPost("set")]
    public async Task<ActionResult<BranchStockDto>> SetStock(
        SetStockDto dto,
        CancellationToken cancellationToken)
    {
        // Non-admin users can only set stock for their own branch
        var userBranchId = User.GetBranchId();
        if (userBranchId.HasValue && dto.BranchId != userBranchId.Value)
            return Forbid();

        var userId = User.GetUserId();
        var result = await stockService.SetStockAsync(dto, userId, cancellationToken);
        if (!result.Success)
            return MapError(result);

        return Ok(ToDto(result.Value!));
    }

    [Authorize(Roles = "Admin,StockManager,BranchManager")]
    [HttpPost("adjust")]
    public async Task<ActionResult<BranchStockDto>> AdjustStock(
        AdjustStockDto dto,
        CancellationToken cancellationToken)
    {
        // Non-admin users can only adjust stock for their own branch
        var userBranchId = User.GetBranchId();
        if (userBranchId.HasValue && dto.BranchId != userBranchId.Value)
            return Forbid();

        var userId = User.GetUserId();
        var result = await stockService.AdjustStockAsync(dto, userId, cancellationToken);
        if (!result.Success)
            return MapError(result);

        return Ok(ToDto(result.Value!));
    }

    [Authorize(Roles = "Admin,StockManager,BranchManager")]
    [HttpPost("bulk-adjust")]
    public async Task<ActionResult<IReadOnlyList<BranchStockDto>>> BulkAdjustStock(
        BulkAdjustStockDto dto,
        CancellationToken cancellationToken)
    {
        // Non-admin users can only bulk-adjust stock for their own branch
        var userBranchId = User.GetBranchId();
        if (userBranchId.HasValue && dto.BranchId != userBranchId.Value)
            return Forbid();

        var userId = User.GetUserId();
        var result = await stockService.BulkAdjustStockAsync(dto, userId, cancellationToken);
        if (!result.Success)
        {
            return result.ErrorType switch
            {
                ServiceErrorType.NotFound => NotFound(new ApiError(result.ErrorMessage ?? "Not found.")),
                ServiceErrorType.Invalid => BadRequest(new ApiError(result.ErrorMessage ?? "Invalid request.")),
                _ => BadRequest(new ApiError(result.ErrorMessage ?? "Request failed."))
            };
        }

        return Ok(result.Value!.Select(ToDto).ToList());
    }

    [Authorize(Roles = "Admin,StockManager")]
    [HttpPatch("{id:guid}/threshold")]
    public async Task<ActionResult<BranchStockDto>> UpdateThreshold(
        Guid id,
        UpdateThresholdDto dto,
        CancellationToken cancellationToken)
    {
        var result = await stockService.UpdateThresholdAsync(id, dto, cancellationToken);
        if (!result.Success)
            return MapError(result);

        return Ok(ToDto(result.Value!));
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await stockService.DeleteStockAsync(id, cancellationToken);
        if (!result.Success)
        {
            return result.ErrorType switch
            {
                ServiceErrorType.NotFound => NotFound(new ApiError(result.ErrorMessage ?? "Stock record not found.")),
                _ => BadRequest(new ApiError(result.ErrorMessage ?? "Delete failed."))
            };
        }

        return NoContent();
    }

    // ── Helpers ────────────────────────────────────────────────

    private static BranchStockDto ToDto(BranchStock stock)
        => new(
            stock.Id,
            stock.BranchId,
            stock.Branch?.DisplayName ?? string.Empty,
            stock.ProductId,
            stock.Product?.Name ?? string.Empty,
            stock.Quantity,
            stock.LowStockThreshold,
            stock.IsLowStock,
            stock.CreatedAt,
            stock.UpdatedAt);

    private static StockAdjustmentDto ToAdjustmentDto(StockAdjustment adj)
        => new(
            adj.Id,
            adj.BranchStockId,
            adj.BranchId,
            adj.Branch?.DisplayName ?? string.Empty,
            adj.ProductId,
            adj.Product?.Name ?? string.Empty,
            adj.Type,
            adj.QuantityChange,
            adj.QuantityAfter,
            adj.PerformedByUserId,
            adj.PerformedByUser?.Username,
            adj.Notes,
            adj.CreatedAt);

    private ActionResult MapError<T>(ServiceResult<T> result)
    {
        return result.ErrorType switch
        {
            ServiceErrorType.NotFound => NotFound(new ApiError(result.ErrorMessage ?? "Not found.")),
            ServiceErrorType.Conflict => Conflict(new ApiError(result.ErrorMessage ?? "Conflict.")),
            ServiceErrorType.Invalid => BadRequest(new ApiError(result.ErrorMessage ?? "Invalid request.")),
            _ => BadRequest(new ApiError(result.ErrorMessage ?? "Request failed."))
        };
    }
}
