using System.ComponentModel.DataAnnotations;

namespace BranchOps.Api.Dtos;

public record ProductCategoryDto(
    Guid Id,
    string Name,
    bool IsActive,
    int ProductCount,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record ProductCategoryCreateDto
{
    [Required]
    [MaxLength(120)]
    public string Name { get; init; } = string.Empty;

    public bool IsActive { get; init; } = true;
}

public record ProductCategoryUpdateDto
{
    [Required]
    [MaxLength(120)]
    public string Name { get; init; } = string.Empty;

    public bool IsActive { get; init; } = true;
}
