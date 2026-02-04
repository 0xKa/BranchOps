using BranchOps.Domain;
using System.ComponentModel.DataAnnotations;

namespace BranchOps.Api.Dtos;

// Response DTOs
public record OrderDto(
    Guid Id,
    Guid BranchId,
    string BranchName,
    Guid CreatedByUserId,
    string CreatedByUserName,
    OrderStatus Status,
    decimal Subtotal,
    decimal Discount,
    decimal Tax,
    decimal Total,
    PaymentMethod PaymentMethod,
    decimal AmountPaid,
    DateTime? PaidAtUtc,
    Guid? CancelledByUserId,
    string? CancelledByUserName,
    string? Notes,
    IReadOnlyList<OrderItemDto> Items,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record OrderItemDto(
    Guid Id,
    Guid ProductId,
    string ProductName,
    int Quantity,
    decimal UnitPrice,
    decimal LineTotal);

public record OrderSummaryDto(
    Guid Id,
    Guid BranchId,
    string BranchName,
    OrderStatus Status,
    decimal Total,
    PaymentMethod PaymentMethod,
    int ItemCount,
    DateTime CreatedAt);

// Request DTOs
public record PlaceOrderDto
{
    [Required]
    public Guid BranchId { get; init; }

    [Required]
    [MinLength(1)]
    public List<PlaceOrderItemDto> Items { get; init; } = [];

    [Range(0, double.MaxValue)]
    public decimal Discount { get; init; } = 0;

    [Range(0, double.MaxValue)]
    public decimal Tax { get; init; } = 0;

    public PaymentMethod PaymentMethod { get; init; } = PaymentMethod.Cash;

    [Range(0, double.MaxValue)]
    public decimal AmountPaid { get; init; }

    [MaxLength(300)]
    public string? Notes { get; init; }
}

public record PlaceOrderItemDto
{
    [Required]
    public Guid ProductId { get; init; }

    [Range(1, 999999)]
    public int Quantity { get; init; }
}

public record UpdateOrderDto
{
    public OrderStatus Status { get; init; }

    [Range(0, double.MaxValue)]
    public decimal Discount { get; init; }

    [Range(0, double.MaxValue)]
    public decimal Tax { get; init; }

    public PaymentMethod PaymentMethod { get; init; }

    [Range(0, double.MaxValue)]
    public decimal AmountPaid { get; init; }

    [MaxLength(300)]
    public string? Notes { get; init; }
}

public record CancelOrderDto
{
    [MaxLength(300)]
    public string? Reason { get; init; }
}
