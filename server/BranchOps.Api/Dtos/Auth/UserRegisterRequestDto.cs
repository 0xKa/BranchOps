using BranchOps.Domain.Auth;
using System.ComponentModel.DataAnnotations;

namespace BranchOps.Api.Dtos.Auth;

public class UserRegisterRequestDto
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
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;


    [Required]
    [EnumDataType(typeof(UserRole))]
    public UserRole Role { get; set; } = UserRole.Employee;
}