using BranchOps.Application.DTOs;
using BranchOps.Application.Interfaces;
using BranchOps.Domain.Entities;
using BranchOps.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace BranchOps.Infrastructure.Security;

public class Auth(BranchOpsDbContext context, IOptions<JwtSettings> options) : IAuth
{
    private readonly JwtSettings _jwtSettings = options.Value;

    public async Task<User?> RegisterAsync(UserRegisterDto userDto)
    {
        if (await context.Users.AnyAsync(u => u.Username == userDto.Username))
            return null;

        User user = new();
        var hashPassword = new PasswordHasher<User>().HashPassword(user, userDto.Password);

        user.Username = userDto.Username.Trim();
        user.PasswordHash = hashPassword;
        user.Email = userDto.Email.Trim().ToLowerInvariant();
        user.Role = userDto.Role;

        context.Users.Add(user);
        await context.SaveChangesAsync();

        return user;
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
            new(ClaimTypes.Email, user.Email),
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

}