namespace BranchOps.Api.Dtos.Auth;

public class UserRegisterResponseDto
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;

    public string? Email { get; set; } = string.Empty;

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string Role { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
