using BranchOps.Domain;
using System.ComponentModel.DataAnnotations;

namespace BranchOps.Api.Dtos;

// ── Response DTOs ──────────────────────────────────────────────

public record BranchStockDto(
    Guid Id,
    Guid BranchId,
    string BranchName,
    Guid ProductId,
    string ProductName,
    int Quantity,
    int LowStockThreshold,
    bool IsLowStock,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record StockAdjustmentDto(
    Guid Id,
    Guid BranchStockId,
    Guid BranchId,
    string BranchName,
    Guid ProductId,
    string ProductName,
    StockAdjustmentType Type,
    int QuantityChange,
    int QuantityAfter,
    Guid? PerformedByUserId,
    string? PerformedByUserName,
    string? Notes,
    DateTime CreatedAt);

public record LowStockAlertDto(
    Guid BranchStockId,
    Guid BranchId,
    string BranchName,
    Guid ProductId,
    string ProductName,
    int Quantity,
    int LowStockThreshold);

// ── Request DTOs ───────────────────────────────────────────────

public record SetStockDto
{
    [Required]
    public Guid BranchId { get; init; }

    [Required]
    public Guid ProductId { get; init; }

    [Range(0, int.MaxValue)]
    public int Quantity { get; init; }

    [Range(0, int.MaxValue)]
    public int LowStockThreshold { get; init; } = 10;
}

public record AdjustStockDto
{
    [Required]
    public Guid BranchId { get; init; }

    [Required]
    public Guid ProductId { get; init; }

    [Required]
    public StockAdjustmentType Type { get; init; }

    /// <summary>
    /// Positive for additions, negative for deductions.
    /// </summary>
    public int QuantityChange { get; init; }

    [MaxLength(300)]
    public string? Notes { get; init; }
}

public record UpdateThresholdDto
{
    [Range(0, int.MaxValue)]
    public int LowStockThreshold { get; init; }
}

public record BulkAdjustStockItemDto
{
    [Required]
    public Guid ProductId { get; init; }

    public int QuantityChange { get; init; }
}

public record BulkAdjustStockDto
{
    [Required]
    public Guid BranchId { get; init; }

    [Required]
    public StockAdjustmentType Type { get; init; }

    [Required]
    [MinLength(1)]
    public List<BulkAdjustStockItemDto> Items { get; init; } = [];

    [MaxLength(300)]
    public string? Notes { get; init; }
}
