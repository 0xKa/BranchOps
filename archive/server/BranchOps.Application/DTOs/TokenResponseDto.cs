namespace BranchOps.Application.DTOs;

public class TokenResponseDto
{
    public required string AccessToken { get; set; }
    public required string RefreshToken { get; set; }
    public DateTime AccessTokenExpiresAt { get; set; }
    public Guid UserId { get; set; }
    public string Username { get; set; } = null!;
}
