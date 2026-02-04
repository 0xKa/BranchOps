using BranchOps.Domain.Auth;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BranchOps.Domain;

public enum OrderStatus { Paid = 1, Cancelled = 2 }

public enum PaymentMethod { Cash = 1, Card = 2, Mixed = 3 }

public class Order : BaseDomainObject
{
    public Guid BranchId { get; set; }
    public Branch Branch { get; set; } = null!;

    public Guid CreatedByUserId { get; set; }
    public User CreatedByUser { get; set; } = null!;

    public OrderStatus Status { get; set; } = OrderStatus.Paid;

    [Column(TypeName = "numeric(18,3)")]
    public decimal Subtotal { get; set; }

    [Column(TypeName = "numeric(18,3)")]
    public decimal Discount { get; set; } = 0m;

    [Column(TypeName = "numeric(18,3)")]
    public decimal Tax { get; set; } = 0m;

    [Column(TypeName = "numeric(18,3)")]
    public decimal Total { get; set; }

    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;

    [Column(TypeName = "numeric(18,3)")]
    public decimal AmountPaid { get; set; }

    public DateTime? PaidAtUtc { get; set; }

    public Guid? CancelledByUserId { get; set; }
    public User? CancelledByUser { get; set; }

    [MaxLength(300)]
    public string? Notes { get; set; }

    public ICollection<OrderItem> Items { get; set; } = [];
}
