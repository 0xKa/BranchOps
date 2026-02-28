using BranchOps.Domain.Auth;
using System.ComponentModel.DataAnnotations;

namespace BranchOps.Api.Dtos;

public record EmployeeDto(
    Guid Id,
    Guid UserId,
    Guid BranchId,
    string FullName,
    string Username,
    string? Phone,
    string? JobTitle,
    string? Notes,
    bool IsActive,
    DateTime? HiredAt,
    string Role,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record EmployeeCreateDto
{
    // User Registration Fields
    [Required]
    [MinLength(3)]
    public string Username { get; init; } = string.Empty;

    [Required]
    [MinLength(4)]
    public string Password { get; init; } = string.Empty;

    [EmailAddress]
    public string? Email { get; init; }

    [Required]
    [EnumDataType(typeof(UserRole))]
    public UserRole Role { get; init; } = UserRole.Cashier;

    // Employee Fields
    [Required]
    public Guid BranchId { get; init; }

    [Required]
    [MaxLength(200)]
    public string FullName { get; init; } = string.Empty;

    [Phone]
    [MaxLength(20)]
    public string? Phone { get; init; }

    [MaxLength(100)]
    public string? JobTitle { get; init; }

    [MaxLength(1000)]
    public string? Notes { get; init; }

    public bool IsActive { get; init; } = true;
    public DateTime? HiredAt { get; init; }
}

public record EmployeeUpdateDto
{
    [Required]
    public Guid UserId { get; init; }

    [Required]
    public Guid BranchId { get; init; }

    [Required]
    [MaxLength(200)]
    public string FullName { get; init; } = string.Empty;

    [Phone]
    [MaxLength(20)]
    public string? Phone { get; init; }

    [MaxLength(100)]
    public string? JobTitle { get; init; }

    [MaxLength(1000)]
    public string? Notes { get; init; }

    public bool IsActive { get; init; } = true;
    public DateTime? HiredAt { get; init; }
}
