using System.ComponentModel.DataAnnotations;

namespace BranchOps.Api.Dtos.Auth;

public class UserLoginDto
{
    [Required]
    [MinLength(3)]
    public string Username { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}