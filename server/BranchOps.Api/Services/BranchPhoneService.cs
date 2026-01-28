using BranchOps.Api.Data;
using BranchOps.Api.Dtos;
using BranchOps.Domain;
using Microsoft.EntityFrameworkCore;

namespace BranchOps.Api.Services;

public class BranchPhoneService(BranchOpsDbContext db)
{
    public async Task<IReadOnlyList<BranchPhone>> GetAllAsync(Guid? branchId, CancellationToken cancellationToken = default)
    {
        var query = db.BranchPhones.AsNoTracking();

        if (branchId.HasValue)
            query = query.Where(x => x.BranchId == branchId.Value);

        return await query
            .OrderByDescending(x => x.IsPrimary)
            .ThenBy(x => x.Number)
            .ToListAsync(cancellationToken);
    }

    public async Task<BranchPhone?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await db.BranchPhones
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<ServiceResult<BranchPhone>> CreateAsync(BranchPhoneCreateDto dto, CancellationToken cancellationToken = default)
    {
        var branchExists = await db.Branches.AnyAsync(x => x.Id == dto.BranchId, cancellationToken);
        if (!branchExists)
            return ServiceResult<BranchPhone>.NotFound("Branch not found.");

        var phone = new BranchPhone
        {
            Id = Guid.NewGuid(),
            BranchId = dto.BranchId,
            Number = dto.Number,
            Label = dto.Label,
            IsPrimary = dto.IsPrimary,
            IsActive = dto.IsActive
        };

        db.BranchPhones.Add(phone);
        await db.SaveChangesAsync(cancellationToken);

        return ServiceResult<BranchPhone>.Ok(phone);
    }

    public async Task<ServiceResult<BranchPhone>> UpdateAsync(Guid id, BranchPhoneUpdateDto dto, CancellationToken cancellationToken = default)
    {
        var phone = await db.BranchPhones.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (phone == null)
            return ServiceResult<BranchPhone>.NotFound("Branch phone not found.");

        if (phone.BranchId != dto.BranchId)
        {
            var branchExists = await db.Branches.AnyAsync(x => x.Id == dto.BranchId, cancellationToken);
            if (!branchExists)
                return ServiceResult<BranchPhone>.NotFound("Branch not found.");
        }

        phone.BranchId = dto.BranchId;
        phone.Number = dto.Number;
        phone.Label = dto.Label;
        phone.IsPrimary = dto.IsPrimary;
        phone.IsActive = dto.IsActive;

        await db.SaveChangesAsync(cancellationToken);

        return ServiceResult<BranchPhone>.Ok(phone);
    }

    public async Task<ServiceResult<bool>> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var phone = await db.BranchPhones.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (phone == null)
            return ServiceResult<bool>.NotFound("Branch phone not found.");

        db.BranchPhones.Remove(phone);
        await db.SaveChangesAsync(cancellationToken);

        return ServiceResult<bool>.Ok(true);
    }
}
