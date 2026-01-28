namespace BranchOps.Domain.Auth;


public class User : BaseDomainObject
{
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? Email { get; set; } = null;
    public UserRole Role { get; set; } = UserRole.User;

    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiryTime { get; set; }

}