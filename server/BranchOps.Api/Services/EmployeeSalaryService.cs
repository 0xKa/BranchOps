using BranchOps.Api.Data;
using BranchOps.Api.Dtos;
using BranchOps.Domain.Auth;
using Microsoft.EntityFrameworkCore;

namespace BranchOps.Api.Services;

public class EmployeeSalaryService(BranchOpsDbContext db)
{
    public async Task<IReadOnlyList<EmployeeSalary>> GetAllAsync(Guid? employeeId, CancellationToken cancellationToken = default)
    {
        var query = db.EmployeeSalaries.AsNoTracking();

        if (employeeId.HasValue)
            query = query.Where(x => x.EmployeeId == employeeId.Value);

        return await query
            .Include(x => x.Employee)
            .OrderByDescending(x => x.EffectiveFrom)
            .ToListAsync(cancellationToken);
    }

    public async Task<EmployeeSalary?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await db.EmployeeSalaries
            .AsNoTracking()
            .Include(x => x.Employee)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<ServiceResult<EmployeeSalary>> CreateAsync(EmployeeSalaryCreateDto dto, CancellationToken cancellationToken = default)
    {
        if (dto.EffectiveTo.HasValue && dto.EffectiveTo.Value < dto.EffectiveFrom)
            return ServiceResult<EmployeeSalary>.Invalid("EffectiveTo must be on or after EffectiveFrom.");

        var employeeExists = await db.Employees.AnyAsync(x => x.Id == dto.EmployeeId, cancellationToken);
        if (!employeeExists)
            return ServiceResult<EmployeeSalary>.NotFound("Employee not found.");

        var salary = new EmployeeSalary
        {
            Id = Guid.NewGuid(),
            EmployeeId = dto.EmployeeId,
            Amount = dto.Amount,
            Currency = dto.Currency,
            EffectiveFrom = dto.EffectiveFrom,
            EffectiveTo = dto.EffectiveTo,
            Notes = dto.Notes
        };

        db.EmployeeSalaries.Add(salary);
        await db.SaveChangesAsync(cancellationToken);

        await db.Entry(salary).Reference(s => s.Employee).LoadAsync(cancellationToken);

        return ServiceResult<EmployeeSalary>.Ok(salary);
    }

    public async Task<ServiceResult<EmployeeSalary>> UpdateAsync(Guid id, EmployeeSalaryUpdateDto dto, CancellationToken cancellationToken = default)
    {
        var salary = await db.EmployeeSalaries
            .Include(x => x.Employee)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (salary == null)
            return ServiceResult<EmployeeSalary>.NotFound("Employee salary not found.");

        if (dto.EffectiveTo.HasValue && dto.EffectiveTo.Value < dto.EffectiveFrom)
            return ServiceResult<EmployeeSalary>.Invalid("EffectiveTo must be on or after EffectiveFrom.");

        var employeeExists = await db.Employees.AnyAsync(x => x.Id == dto.EmployeeId, cancellationToken);
        if (!employeeExists)
            return ServiceResult<EmployeeSalary>.NotFound("Employee not found.");

        salary.EmployeeId = dto.EmployeeId;
        salary.Amount = dto.Amount;
        salary.Currency = dto.Currency;
        salary.EffectiveFrom = dto.EffectiveFrom;
        salary.EffectiveTo = dto.EffectiveTo;
        salary.Notes = dto.Notes;

        await db.SaveChangesAsync(cancellationToken);

        // Reload employee if it changed
        await db.Entry(salary).Reference(s => s.Employee).LoadAsync(cancellationToken);

        return ServiceResult<EmployeeSalary>.Ok(salary);
    }

    public async Task<ServiceResult<bool>> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var salary = await db.EmployeeSalaries.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (salary == null)
            return ServiceResult<bool>.NotFound("Employee salary not found.");

        db.EmployeeSalaries.Remove(salary);
        await db.SaveChangesAsync(cancellationToken);

        return ServiceResult<bool>.Ok(true);
    }
}
