using BranchOps.Domain.Auth;

namespace BranchOps.Api.Dtos.Auth;

public class UserMeResponseDto
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string? Email { get; set; }
    public UserRole Role { get; set; }
    public DateTime CreatedAt { get; set; }

    public EmployeeInfoDto? Employee { get; set; }
}

public class EmployeeInfoDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? JobTitle { get; set; }
    public bool IsActive { get; set; }
    public DateTime? HiredAt { get; set; }

    public BranchInfoDto Branch { get; set; } = null!;
}

public class BranchInfoDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? City { get; set; }
    public bool IsActive { get; set; }
}
