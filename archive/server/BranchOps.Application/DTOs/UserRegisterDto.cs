using BranchOps.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace BranchOps.Application.DTOs;

public class UserRegisterDto
{
    [Required]
    [MinLength(3)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [MinLength(4)]
    public string Password { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public UserRole Role { get; set; } = UserRole.User;
}