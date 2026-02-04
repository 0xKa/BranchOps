using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BranchOps.Domain;

public class OrderItem : BaseDomainObject
{
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    [Range(1, 999999)]
    public int Quantity { get; set; }

    [Column(TypeName = "numeric(18,3)")]
    public decimal UnitPrice { get; set; }

    [Column(TypeName = "numeric(18,3)")]
    public decimal LineTotal { get; set; }
}