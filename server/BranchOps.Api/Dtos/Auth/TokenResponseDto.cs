namespace BranchOps.Api.Dtos.Auth;

public class TokenResponseDto
{
    public required string AccessToken { get; set; }
    public required string RefreshToken { get; set; }
    public DateTime AccessTokenExpiresAt { get; set; }
    public Guid UserId { get; set; }
    public required string Username { get; set; }
}