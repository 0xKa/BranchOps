using System.ComponentModel.DataAnnotations;

namespace BranchOps.Domain;

public class BranchStock : BaseDomainObject
{
    public Guid BranchId { get; set; }
    public Branch Branch { get; set; } = null!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    [Range(0, int.MaxValue)]
    public int Quantity { get; set; }

    [Range(0, int.MaxValue)]
    public int LowStockThreshold { get; set; } = 10;

    public bool IsLowStock => Quantity <= LowStockThreshold;
}
