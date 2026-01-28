using System.ComponentModel.DataAnnotations;

namespace BranchOps.Api.Dtos;

public record EmployeeSalaryDto(
    Guid Id,
    Guid EmployeeId,
    decimal Amount,
    string Currency,
    DateTime EffectiveFrom,
    DateTime? EffectiveTo,
    string? Notes,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record EmployeeSalaryCreateDto
{
    [Required]
    public Guid EmployeeId { get; init; }

    public decimal Amount { get; init; }

    [Required]
    [MaxLength(3)]
    public string Currency { get; init; } = "OMR";

    public DateTime EffectiveFrom { get; init; }
    public DateTime? EffectiveTo { get; init; }

    [MaxLength(1000)]
    public string? Notes { get; init; }
}

public record EmployeeSalaryUpdateDto
{
    [Required]
    public Guid EmployeeId { get; init; }

    public decimal Amount { get; init; }

    [Required]
    [MaxLength(3)]
    public string Currency { get; init; } = "OMR";

    public DateTime EffectiveFrom { get; init; }
    public DateTime? EffectiveTo { get; init; }

    [MaxLength(1000)]
    public string? Notes { get; init; }
}
