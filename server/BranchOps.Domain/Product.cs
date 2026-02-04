using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BranchOps.Domain;

public class Product : BaseDomainObject
{

    [Required, MaxLength(200)]
    public string Name { get; set; } = null!;

    public Guid CategoryId { get; set; }
    public ProductCategory Category { get; set; } = null!;

    [Column(TypeName = "numeric(18,3)")]
    public decimal Price { get; set; }

    [Column(TypeName = "numeric(18,3)")]
    public decimal? Cost { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<OrderItem> OrderItems { get; set; } = [];

}
