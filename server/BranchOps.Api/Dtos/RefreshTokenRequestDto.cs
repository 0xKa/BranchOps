using System.ComponentModel.DataAnnotations;

namespace BranchOps.Api.Dtos;

public class RefreshTokenRequestDto
{
    [Required]
    public Guid UserId { get; set; }
    [Required]
    public required string RefreshToken { get; set; }
}