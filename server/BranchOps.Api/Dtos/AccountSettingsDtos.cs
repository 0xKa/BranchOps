using System.ComponentModel.DataAnnotations;

namespace BranchOps.Api.Dtos;

public record UpdateProfileDto
{
    [StringLength(50, MinimumLength = 3)]
    public string? Username { get; init; }

    [EmailAddress]
    public string? Email { get; init; }

    [StringLength(200)]
    public string? FullName { get; init; }

    [Phone]
    [StringLength(20)]
    public string? Phone { get; init; }
}

public record ChangePasswordDto
{
    [Required]
    public string CurrentPassword { get; init; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 6)]
    public string NewPassword { get; init; } = string.Empty;
}

public record AccountProfileDto
{
    public Guid Id { get; init; }
    public string Username { get; init; } = string.Empty;
    public string? Email { get; init; }
    public string Role { get; init; } = string.Empty;
    public string? FullName { get; init; }
    public string? Phone { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}
