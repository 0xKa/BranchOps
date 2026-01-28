using System.ComponentModel.DataAnnotations;

namespace BranchOps.Domain;

public class BranchPhone : BaseDomainObject
{
    public Guid BranchId { get; set; }
    public Branch Branch { get; set; } = null!;

    [Required]
    [Phone]
    [MaxLength(20)]
    public string Number { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? Label { get; set; }

    public bool IsPrimary { get; set; }
    public bool IsActive { get; set; } = true;
}
