using BranchOps.Domain.Auth;
using System.ComponentModel.DataAnnotations;

namespace BranchOps.Domain;

public enum StockAdjustmentType
{
    Restock = 1,
    Sale = 2,
    Return = 3,
    Damage = 4,
    ManualAdjustment = 5,
    Transfer = 6
}

public class StockAdjustment : BaseDomainObject
{
    public Guid BranchStockId { get; set; }
    public BranchStock BranchStock { get; set; } = null!;

    public Guid BranchId { get; set; }
    public Branch Branch { get; set; } = null!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public StockAdjustmentType Type { get; set; }

    /// <summary>
    /// Positive for additions, negative for deductions.
    /// </summary>
    public int QuantityChange { get; set; }

    /// <summary>
    /// The resulting quantity after this adjustment was applied.
    /// </summary>
    [Range(0, int.MaxValue)]
    public int QuantityAfter { get; set; }

    public Guid? PerformedByUserId { get; set; }
    public User? PerformedByUser { get; set; }

    [MaxLength(300)]
    public string? Notes { get; set; }
}
