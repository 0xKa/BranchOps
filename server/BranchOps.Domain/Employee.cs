using BranchOps.Domain.Auth;
using System.ComponentModel.DataAnnotations;

namespace BranchOps.Domain;

public class Employee : BaseDomainObject
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid BranchId { get; set; }
    public Branch Branch { get; set; } = null!;

    [Required]
    [MaxLength(200)]
    public string FullName { get; set; } = string.Empty;

    [Phone]
    [MaxLength(20)]
    public string? Phone { get; set; }

    [MaxLength(100)]
    public string? JobTitle { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }

    public bool IsActive { get; set; } = true;
    public DateTime? HiredAt { get; set; }

    public ICollection<EmployeeSalary> Salaries { get; set; } = [];
}