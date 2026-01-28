using System.ComponentModel.DataAnnotations;

namespace BranchOps.Api.Dtos;

public record BranchDto(
    Guid Id,
    string Code,
    string DisplayName,
    string? AddressLine1,
    string? AddressLine2,
    string? City,
    string? Country,
    bool IsActive,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record BranchCreateDto
{
    [Required]
    [MaxLength(30)]
    public string Code { get; init; } = string.Empty;

    [Required]
    [MaxLength(120)]
    public string DisplayName { get; init; } = string.Empty;

    [MaxLength(200)]
    public string? AddressLine1 { get; init; }

    [MaxLength(200)]
    public string? AddressLine2 { get; init; }

    [MaxLength(100)]
    public string? City { get; init; }

    [MaxLength(100)]
    public string? Country { get; init; }

    public bool IsActive { get; init; } = true;
}

public record BranchUpdateDto
{
    [Required]
    [MaxLength(30)]
    public string Code { get; init; } = string.Empty;

    [Required]
    [MaxLength(120)]
    public string DisplayName { get; init; } = string.Empty;

    [MaxLength(200)]
    public string? AddressLine1 { get; init; }

    [MaxLength(200)]
    public string? AddressLine2 { get; init; }

    [MaxLength(100)]
    public string? City { get; init; }

    [MaxLength(100)]
    public string? Country { get; init; }

    public bool IsActive { get; init; } = true;
}
