using BranchOps.Api.Data;
using BranchOps.Api.Dtos;
using BranchOps.Domain.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace BranchOps.Api.Services;

public class AccountSettingsService(BranchOpsDbContext db)
{
    public async Task<AccountProfileDto?> GetProfileAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

        if (user is null)
            return null;

        var employee = await db.Employees
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.UserId == userId, cancellationToken);

        return new AccountProfileDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            Role = user.Role.ToString(),
            FullName = employee?.FullName,
            Phone = employee?.Phone,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };
    }

    public async Task<ServiceResult<AccountProfileDto>> UpdateProfileAsync(
        Guid userId, UpdateProfileDto dto, CancellationToken cancellationToken = default)
    {
        var user = await db.Users
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

        if (user is null)
            return ServiceResult<AccountProfileDto>.NotFound("User not found.");

        if (dto.Username is not null)
        {
            var trimmed = dto.Username.Trim();
            if (await db.Users.AnyAsync(u => u.Username == trimmed && u.Id != userId, cancellationToken))
                return ServiceResult<AccountProfileDto>.Conflict("Username is already taken.");
            user.Username = trimmed;
        }

        if (dto.Email is not null)
        {
            var email = dto.Email.Trim().ToLowerInvariant();
            if (await db.Users.AnyAsync(u => u.Email == email && u.Id != userId, cancellationToken))
                return ServiceResult<AccountProfileDto>.Conflict("Email is already registered.");
            user.Email = email;
        }

        var employee = await db.Employees
            .FirstOrDefaultAsync(e => e.UserId == userId, cancellationToken);

        if (employee is not null)
        {
            if (dto.FullName is not null)
                employee.FullName = dto.FullName.Trim();

            if (dto.Phone is not null)
                employee.Phone = dto.Phone.Trim();
        }

        await db.SaveChangesAsync(cancellationToken);

        var profile = new AccountProfileDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            Role = user.Role.ToString(),
            FullName = employee?.FullName,
            Phone = employee?.Phone,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };

        return ServiceResult<AccountProfileDto>.Ok(profile);
    }

    public async Task<ServiceResult<bool>> ChangePasswordAsync(
        Guid userId, ChangePasswordDto dto, CancellationToken cancellationToken = default)
    {
        var user = await db.Users
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

        if (user is null)
            return ServiceResult<bool>.NotFound("User not found.");

        var hasher = new PasswordHasher<User>();
        var verification = hasher.VerifyHashedPassword(user, user.PasswordHash, dto.CurrentPassword);

        if (verification == PasswordVerificationResult.Failed)
            return ServiceResult<bool>.Invalid("Current password is incorrect.");

        user.PasswordHash = hasher.HashPassword(user, dto.NewPassword);

        await db.SaveChangesAsync(cancellationToken);

        return ServiceResult<bool>.Ok(true);
    }
}
