using System.ComponentModel.DataAnnotations;

namespace BranchOps.Api.Dtos;

public record ProductDto(
    Guid Id,
    string Name,
    Guid CategoryId,
    string CategoryName,
    decimal Price,
    decimal? Cost,
    bool IsActive,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record ProductCreateDto
{
    [Required]
    [MaxLength(200)]
    public string Name { get; init; } = string.Empty;

    [Required]
    public Guid CategoryId { get; init; }

    [Range(0, double.MaxValue)]
    public decimal Price { get; init; }

    [Range(0, double.MaxValue)]
    public decimal? Cost { get; init; }

    public bool IsActive { get; init; } = true;
}

public record ProductUpdateDto
{
    [Required]
    [MaxLength(200)]
    public string Name { get; init; } = string.Empty;

    [Required]
    public Guid CategoryId { get; init; }

    [Range(0, double.MaxValue)]
    public decimal Price { get; init; }

    [Range(0, double.MaxValue)]
    public decimal? Cost { get; init; }

    public bool IsActive { get; init; } = true;
}
