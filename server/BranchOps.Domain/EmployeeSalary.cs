using System.ComponentModel.DataAnnotations;

namespace BranchOps.Domain.Auth;

public class EmployeeSalary : BaseDomainObject
{
    public Guid EmployeeId { get; set; }
    public Employee Employee { get; set; } = default!;

    public decimal Amount { get; set; }

    [Required]
    [MaxLength(3)]
    public string Currency { get; set; } = "OMR";

    public DateTime EffectiveFrom { get; set; }
    public DateTime? EffectiveTo { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }
}