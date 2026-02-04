using BranchOps.Api.Dtos;
using BranchOps.Api.Services;
using BranchOps.Domain;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BranchOps.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
//[Authorize(Roles = "Admin")]
public class OrdersController(OrderService orderService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<OrderSummaryDto>>> GetAll(
        [FromQuery] PaginationQuery pagination,
        [FromQuery] Guid? branchId,
        [FromQuery] OrderStatus? status,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        CancellationToken cancellationToken)
    {
        var result = await orderService.GetAllAsync(pagination, branchId, status, fromDate, toDate, cancellationToken);

        return Ok(new PagedResult<OrderSummaryDto>(
            result.Items.Select(ToSummaryDto).ToList(),
            result.Page,
            result.PageSize,
            result.TotalCount,
            result.TotalPages));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<OrderDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var order = await orderService.GetByIdAsync(id, cancellationToken);
        if (order == null)
            return NotFound(new ApiError("Order not found."));

        return Ok(ToDto(order));
    }

    [HttpPost]
    public async Task<ActionResult<OrderDto>> PlaceOrder(
        PlaceOrderDto dto,
        CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized(new ApiError("User not authenticated."));

        var result = await orderService.PlaceOrderAsync(dto, userId.Value, cancellationToken);
        if (!result.Success)
            return MapError(result);

        var orderDto = ToDto(result.Value!);
        return CreatedAtAction(nameof(GetById), new { id = orderDto.Id }, orderDto);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<OrderDto>> Update(
        Guid id,
        UpdateOrderDto dto,
        CancellationToken cancellationToken)
    {
        var result = await orderService.UpdateOrderAsync(id, dto, cancellationToken);
        if (!result.Success)
            return MapError(result);

        return Ok(ToDto(result.Value!));
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<ActionResult<OrderDto>> Cancel(
        Guid id,
        CancelOrderDto dto,
        CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized(new ApiError("User not authenticated."));

        var result = await orderService.CancelOrderAsync(id, userId.Value, dto.Reason, cancellationToken);
        if (!result.Success)
            return MapError(result);

        return Ok(ToDto(result.Value!));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await orderService.DeleteOrderAsync(id, cancellationToken);
        if (!result.Success)
        {
            return result.ErrorType switch
            {
                ServiceErrorType.NotFound => NotFound(new ApiError(result.ErrorMessage ?? "Order not found.")),
                _ => BadRequest(new ApiError(result.ErrorMessage ?? "Delete failed."))
            };
        }

        return NoContent();
    }

    private Guid? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdClaim, out var userId) ? userId : null;
    }

    private static OrderDto ToDto(Order order)
        => new(
            order.Id,
            order.BranchId,
            order.Branch?.DisplayName ?? string.Empty,
            order.CreatedByUserId,
            order.CreatedByUser?.Username ?? string.Empty,
            order.Status,
            order.Subtotal,
            order.Discount,
            order.Tax,
            order.Total,
            order.PaymentMethod,
            order.AmountPaid,
            order.PaidAtUtc,
            order.CancelledByUserId,
            order.CancelledByUser?.Username,
            order.Notes,
            order.Items.Select(ToItemDto).ToList(),
            order.CreatedAt,
            order.UpdatedAt);

    private static OrderItemDto ToItemDto(OrderItem item)
        => new(
            item.Id,
            item.ProductId,
            item.Product?.Name ?? string.Empty,
            item.Quantity,
            item.UnitPrice,
            item.LineTotal);

    private static OrderSummaryDto ToSummaryDto(Order order)
        => new(
            order.Id,
            order.BranchId,
            order.Branch?.DisplayName ?? string.Empty,
            order.Status,
            order.Total,
            order.PaymentMethod,
            order.Items.Count,
            order.CreatedAt);

    private ActionResult MapError(ServiceResult<Order> result)
    {
        return result.ErrorType switch
        {
            ServiceErrorType.NotFound => NotFound(new ApiError(result.ErrorMessage ?? "Order not found.")),
            ServiceErrorType.Conflict => Conflict(new ApiError(result.ErrorMessage ?? "Order conflict.")),
            ServiceErrorType.Invalid => BadRequest(new ApiError(result.ErrorMessage ?? "Invalid order request.")),
            _ => BadRequest(new ApiError(result.ErrorMessage ?? "Request failed."))
        };
    }
}
