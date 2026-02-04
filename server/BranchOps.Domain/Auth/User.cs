using System.ComponentModel.DataAnnotations;

namespace BranchOps.Domain.Auth;


public class User : BaseDomainObject
{
    [StringLength(50)]
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    [EmailAddress]
    public string? Email { get; set; } = null;
    public UserRole Role { get; set; } = UserRole.Cashier;

    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiryTime { get; set; }

}