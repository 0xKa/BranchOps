using BranchOps.Api.Data;
using BranchOps.Api.Dtos;
using BranchOps.Domain;
using Microsoft.EntityFrameworkCore;

namespace BranchOps.Api.Services;

public class BranchService(BranchOpsDbContext db)
{
    public async Task<IReadOnlyList<Branch>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await db.Branches
            .AsNoTracking()
            .OrderBy(x => x.DisplayName)
            .ToListAsync(cancellationToken);
    }

    public async Task<Branch?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await db.Branches
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<ServiceResult<Branch>> CreateAsync(BranchCreateDto dto, CancellationToken cancellationToken = default)
    {
        var codeExists = await db.Branches.AnyAsync(x => x.Code == dto.Code, cancellationToken);
        if (codeExists)
            return ServiceResult<Branch>.Conflict("Branch code already exists.");

        var branch = new Branch
        {
            Id = Guid.NewGuid(),
            Code = dto.Code,
            DisplayName = dto.DisplayName,
            AddressLine1 = dto.AddressLine1,
            AddressLine2 = dto.AddressLine2,
            City = dto.City,
            Country = dto.Country,
            IsActive = dto.IsActive
        };

        db.Branches.Add(branch);
        await db.SaveChangesAsync(cancellationToken);

        return ServiceResult<Branch>.Ok(branch);
    }

    public async Task<ServiceResult<Branch>> UpdateAsync(Guid id, BranchUpdateDto dto, CancellationToken cancellationToken = default)
    {
        var branch = await db.Branches.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (branch == null)
            return ServiceResult<Branch>.NotFound("Branch not found.");

        if (!string.Equals(branch.Code, dto.Code, StringComparison.OrdinalIgnoreCase))
        {
            var codeExists = await db.Branches
                .AnyAsync(x => x.Code == dto.Code && x.Id != id, cancellationToken);
            if (codeExists)
                return ServiceResult<Branch>.Conflict("Branch code already exists.");
        }

        branch.Code = dto.Code;
        branch.DisplayName = dto.DisplayName;
        branch.AddressLine1 = dto.AddressLine1;
        branch.AddressLine2 = dto.AddressLine2;
        branch.City = dto.City;
        branch.Country = dto.Country;
        branch.IsActive = dto.IsActive;

        await db.SaveChangesAsync(cancellationToken);

        return ServiceResult<Branch>.Ok(branch);
    }

    public async Task<ServiceResult<bool>> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var branch = await db.Branches.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (branch == null)
            return ServiceResult<bool>.NotFound("Branch not found.");

        db.Branches.Remove(branch);
        await db.SaveChangesAsync(cancellationToken);

        return ServiceResult<bool>.Ok(true);
    }
}
