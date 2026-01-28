using System.ComponentModel.DataAnnotations;

namespace BranchOps.Domain;

public class Branch : BaseDomainObject
{
    [Required]
    [MaxLength(30)]
    public string Code { get; set; } = string.Empty;

    [Required]
    [MaxLength(120)]
    public string DisplayName { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? AddressLine1 { get; set; }

    [MaxLength(200)]
    public string? AddressLine2 { get; set; }

    [MaxLength(100)]
    public string? City { get; set; }

    [MaxLength(100)]
    public string? Country { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<BranchPhone> Phones { get; set; } = [];
    public ICollection<Employee> Employees { get; set; } = [];

    //public ICollection<BranchMenuItem> BranchMenuItems { get; set; } = [];
    //public ICollection<Order> Orders { get; set; } = [];
}