using BranchOps.Domain.Auth;
using System.ComponentModel.DataAnnotations;

namespace BranchOps.Api.Dtos;

public class UserRegisterDto
{
    [Required]
    [MinLength(3)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [MinLength(4)]
    public string Password { get; set; } = string.Empty;

    [EmailAddress]
    public string? Email { get; set; } = null;

    [Required]
    public UserRole Role { get; set; } = UserRole.User;
}