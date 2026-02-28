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
[Authorize(Roles = "Admin,BranchManager,Cashier")]
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
        var effectiveBranchId = User.GetEffectiveBranchId(branchId);
        var result = await orderService.GetAllAsync(pagination, effectiveBranchId, status, fromDate, toDate, cancellationToken);

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

        // Non-admin users can only view orders from their own branch
        var userBranchId = User.GetBranchId();
        if (userBranchId.HasValue && order.BranchId != userBranchId.Value)
            return Forbid();

        return Ok(ToDto(order));
    }

    [HttpPost]
    public async Task<ActionResult<OrderDto>> PlaceOrder(
        PlaceOrderDto dto,
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId == null)
            return Unauthorized(new ApiError("User not authenticated."));

        // Non-admin users can only place orders for their own branch
        var userBranchId = User.GetBranchId();
        if (userBranchId.HasValue && dto.BranchId != userBranchId.Value)
            return Forbid();

        var result = await orderService.PlaceOrderAsync(dto, userId.Value, cancellationToken);
        if (!result.Success)
            return MapError(result);

        var orderDto = ToDto(result.Value!);
        return CreatedAtAction(nameof(GetById), new { id = orderDto.Id }, orderDto);
    }

    [Authorize(Roles = "Admin,BranchManager")]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<OrderDto>> Update(
        Guid id,
        UpdateOrderDto dto,
        CancellationToken cancellationToken)
    {
        // Non-admin users can only update orders from their own branch
        var order = await orderService.GetByIdAsync(id, cancellationToken);
        if (order == null)
            return NotFound(new ApiError("Order not found."));

        var userBranchId = User.GetBranchId();
        if (userBranchId.HasValue && order.BranchId != userBranchId.Value)
            return Forbid();

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
        var userId = User.GetUserId();
        if (userId == null)
            return Unauthorized(new ApiError("User not authenticated."));

        // Non-admin users can only cancel orders from their own branch
        var order = await orderService.GetByIdAsync(id, cancellationToken);
        if (order == null)
            return NotFound(new ApiError("Order not found."));

        var userBranchId = User.GetBranchId();
        if (userBranchId.HasValue && order.BranchId != userBranchId.Value)
            return Forbid();

        var result = await orderService.CancelOrderAsync(id, userId.Value, dto.Reason, cancellationToken);
        if (!result.Success)
            return MapError(result);

        return Ok(ToDto(result.Value!));
    }

    [Authorize(Roles = "Admin,BranchManager")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        // Non-admin users can only delete orders from their own branch
        var order = await orderService.GetByIdAsync(id, cancellationToken);
        if (order == null)
            return NotFound(new ApiError("Order not found."));

        var userBranchId = User.GetBranchId();
        if (userBranchId.HasValue && order.BranchId != userBranchId.Value)
            return Forbid();

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
