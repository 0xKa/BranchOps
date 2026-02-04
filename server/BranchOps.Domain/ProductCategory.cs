using System.ComponentModel.DataAnnotations;

namespace BranchOps.Domain;

public class ProductCategory : BaseDomainObject
{
    [Required, MaxLength(120)]
    public string Name { get; set; } = null!;

    public bool IsActive { get; set; } = true;

    public ICollection<Product> Products { get; set; } = [];
}
