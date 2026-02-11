using BranchOps.Api.Data;
using BranchOps.Api.Dtos.Auth;
using BranchOps.Api.Dtos.Auth.ResultObjects;
using BranchOps.Domain.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace BranchOps.Api.Security;

public class Auth(BranchOpsDbContext context, IOptions<JwtSettings> options)
{
    private readonly JwtSettings _jwtSettings = options.Value;

    public async Task<RegisterResult> RegisterAsync(UserRegisterRequestDto userDto)
    {
        var username = userDto.Username.Trim();
        var email = userDto.Email?.Trim().ToLowerInvariant();

        if (await context.Users.AnyAsync(u => u.Username == userDto.Username))
            return RegisterResult.Fail(RegisterError.UsernameTaken);

        if (userDto.Email is not null && await context.Users.AnyAsync(u => u.Email == userDto.Email))
            return RegisterResult.Fail(RegisterError.EmailTaken);

        User user = new();
        var hashPassword = new PasswordHasher<User>().HashPassword(user, userDto.Password);
        user.Username = username;
        user.PasswordHash = hashPassword;
        user.Email = email;
        user.Role = userDto.Role;

        context.Users.Add(user);
        await context.SaveChangesAsync();

        // Create employee record for non-admin users
        if (userDto.Role != UserRole.Admin)
        {
            var defaultBranch = await context.Branches
                .Where(b => b.IsActive)
                .OrderBy(b => b.CreatedAt)
                .FirstOrDefaultAsync();

            if (defaultBranch is not null)
            {
                var employee = new Domain.Employee
                {
                    UserId = user.Id,
                    BranchId = defaultBranch.Id,
                    FullName = userDto.FullName,
                    IsActive = true,
                    HiredAt = DateTime.UtcNow
                };

                context.Employees.Add(employee);
                await context.SaveChangesAsync();
            }
        }

        return RegisterResult.Ok(user);
    }

    public async Task<TokenResponseDto?> LoginAsync(UserLoginDto userDto)
    {
        User? user = await context.Users.FirstOrDefaultAsync(u => u.Username == userDto.Username);
        if (user is null)
            return null;

        if (new PasswordHasher<User>()
            .VerifyHashedPassword(user, user.PasswordHash, userDto.Password)
            == PasswordVerificationResult.Failed)
            return null;

        return await CreateTokenResponse(user);
    }

    public async Task<TokenResponseDto?> RefreshTokensAsync(RefreshTokenRequestDto requestDto)
    {
        User? user = await ValidateRefreshTokecnAsync(requestDto);
        if (user is null)
            return null;
        return await CreateTokenResponse(user);
    }

    public async Task<bool> RevokeRefreshTokenAsync(string refreshToken, string userId)
    {
        if (!Guid.TryParse(userId, out var userGuid))
            return false;

        var user = await context.Users.FirstOrDefaultAsync(u => u.Id == userGuid);
        if (user is null || user.RefreshToken != refreshToken)
            return false;

        user.RefreshToken = null;
        user.RefreshTokenExpiryTime = null;

        return await context.SaveChangesAsync() > 0;
    }

    private async Task<User?> ValidateRefreshTokecnAsync(RefreshTokenRequestDto requestDto)
    {
        User? user = await context.Users.FirstOrDefaultAsync(u => u.Id == requestDto.UserId);
        if (user is null
            || user.RefreshToken != requestDto.RefreshToken
            || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            return null;

        return user;
    }

    private async Task<TokenResponseDto> CreateTokenResponse(User user)
    {
        TokenResponseDto tokenResponse = new()
        {
            AccessToken = CreateToken(user),
            RefreshToken = await GenerateAndSaveRefreshTokenAsync(user),
            AccessTokenExpiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes),
            UserId = user.Id,
            Username = user.Username
        };
        return tokenResponse;
    }

    private static string CreateRefreshToken()
    {
        var randomNumber = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);

    }

    private async Task<string> GenerateAndSaveRefreshTokenAsync(User user)
    {
        string refreshToken = CreateRefreshToken();
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays);
        await context.SaveChangesAsync();

        return refreshToken;
    }

    private string CreateToken(User user)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.Name, user.Username),
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email ?? string.Empty),
            new(ClaimTypes.Role, user.Role.ToString()),
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_jwtSettings.Key));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512);

        var expires = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes);

        var tokenDescriptor = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: expires,
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);
    }


    public async Task<IReadOnlyList<UserRegisterResponseDto>> GetUsersByRoleAsync(UserRole? role)
    {
        var query = context.Users.AsNoTracking();

        if (role.HasValue)
            query = query.Where(u => u.Role == role.Value);

        var users = await query.OrderBy(u => u.Username).ToListAsync();

        return [.. users.Select(u => new UserRegisterResponseDto
        {
            Id = u.Id,
            Username = u.Username,
            Email = u.Email,
            FullName = u.Username, // Admins only have username
            Role = u.Role.ToString(),
            CreatedAt = u.CreatedAt
        })];
    }

    public async Task<bool> DeleteUserAsync(Guid userId)
    {
        var user = await context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user is null)
            return false;

        context.Users.Remove(user);
        return await context.SaveChangesAsync() > 0;
    }

    public async Task<UserMeResponseDto?> GetUserWithEmployeeInfoAsync(Guid userId)
    {
        var user = await context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user is null)
            return null;

        var response = new UserMeResponseDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            Role = user.Role,
            CreatedAt = user.CreatedAt
        };

        // Fetch employee information if user is not an Admin
        if (user.Role != UserRole.Admin)
        {
            var employee = await context.Employees
                .Include(e => e.Branch)
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.UserId == user.Id);

            if (employee is not null)
            {
                response.Employee = new EmployeeInfoDto
                {
                    Id = employee.Id,
                    FullName = employee.FullName,
                    Phone = employee.Phone,
                    JobTitle = employee.JobTitle,
                    IsActive = employee.IsActive,
                    HiredAt = employee.HiredAt,
                    Branch = new BranchInfoDto
                    {
                        Id = employee.Branch.Id,
                        Code = employee.Branch.Code,
                        DisplayName = employee.Branch.DisplayName,
                        City = employee.Branch.City,
                        IsActive = employee.Branch.IsActive
                    }
                };
            }
        }

        return response;
    }

}

