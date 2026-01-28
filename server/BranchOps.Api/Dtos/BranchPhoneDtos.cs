using System.ComponentModel.DataAnnotations;

namespace BranchOps.Api.Dtos;

public record BranchPhoneDto(
    Guid Id,
    Guid BranchId,
    string Number,
    string? Label,
    bool IsPrimary,
    bool IsActive,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record BranchPhoneCreateDto
{
    [Required]
    public Guid BranchId { get; init; }

    [Required]
    [Phone]
    [MaxLength(20)]
    public string Number { get; init; } = string.Empty;

    [MaxLength(50)]
    public string? Label { get; init; }

    public bool IsPrimary { get; init; }
    public bool IsActive { get; init; } = true;
}

public record BranchPhoneUpdateDto
{
    [Required]
    public Guid BranchId { get; init; }

    [Required]
    [Phone]
    [MaxLength(20)]
    public string Number { get; init; } = string.Empty;

    [MaxLength(50)]
    public string? Label { get; init; }

    public bool IsPrimary { get; init; }
    public bool IsActive { get; init; } = true;
}
