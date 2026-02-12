using BranchOps.Api.Data;
using BranchOps.Api.Dtos;
using BranchOps.Api.Dtos.Auth;
using BranchOps.Domain;
using BranchOps.Domain.Auth;
using Microsoft.EntityFrameworkCore;

namespace BranchOps.Api.Services;

public class EmployeeService(BranchOpsDbContext db)
{
    public async Task<IReadOnlyList<Employee>> GetAllAsync(Guid? branchId, CancellationToken cancellationToken = default)
    {
        var query = db.Employees.AsNoTracking();

        if (branchId.HasValue)
            query = query.Where(x => x.BranchId == branchId.Value);

        return await query
            .Include(e => e.User)
            .OrderBy(x => x.FullName)
            .ToListAsync(cancellationToken);
    }

    public async Task<Employee?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await db.Employees
            .AsNoTracking()
            .Include(e => e.User)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<Employee?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await db.Employees
            .AsNoTracking()
            .Include(e => e.User)
            .FirstOrDefaultAsync(x => x.UserId == userId, cancellationToken);
    }

    public async Task<Employee?> CreateEmployeeForUserAsync(
        Guid userId,
        UserRole role,
        UserRegisterRequestDto userDto,
        CancellationToken cancellationToken = default)
    {
        Guid? branchId = userDto.BranchId;

        // If no branch specified, use default
        if (!branchId.HasValue)
        {
            var defaultBranch = await db.Branches
                .Where(b => b.IsActive)
                .OrderBy(b => b.CreatedAt)
                .FirstOrDefaultAsync(cancellationToken);
            branchId = defaultBranch?.Id;
        }

        if (!branchId.HasValue)
            return null;

        var employee = new Employee
        {
            UserId = userId,
            BranchId = branchId.Value,
            FullName = userDto.FullName,
            Phone = userDto.Phone,
            JobTitle = string.IsNullOrWhiteSpace(userDto.JobTitle)
                ? FormatRoleAsJobTitle(role)
                : userDto.JobTitle,
            Notes = userDto.Notes,
            IsActive = userDto.IsActive ?? true,
            HiredAt = userDto.HiredAt ?? DateTime.UtcNow
        };

        db.Employees.Add(employee);
        await db.SaveChangesAsync(cancellationToken);

        return employee;
    }

    private static string FormatRoleAsJobTitle(UserRole role)
    {
        var roleName = role.ToString();
        return System.Text.RegularExpressions.Regex.Replace(roleName, "([a-z])([A-Z])", "$1 $2");
    }



    public async Task<ServiceResult<Employee>> UpdateAsync(Guid id, EmployeeUpdateDto dto, CancellationToken cancellationToken = default)
    {
        var employee = await db.Employees
            .Include(e => e.User)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (employee == null)
            return ServiceResult<Employee>.NotFound("Employee not found.");

        var branchExists = await db.Branches.AnyAsync(x => x.Id == dto.BranchId, cancellationToken);
        if (!branchExists)
            return ServiceResult<Employee>.NotFound("Branch not found.");

        var userExists = await db.Users.AnyAsync(x => x.Id == dto.UserId, cancellationToken);
        if (!userExists)
            return ServiceResult<Employee>.NotFound("User not found.");

        if (employee.UserId != dto.UserId)
        {
            var userAssigned = await db.Employees.AnyAsync(x => x.UserId == dto.UserId && x.Id != id, cancellationToken);
            if (userAssigned)
                return ServiceResult<Employee>.Conflict("User is already assigned to an employee record.");
        }

        employee.UserId = dto.UserId;
        employee.BranchId = dto.BranchId;
        employee.FullName = dto.FullName;
        employee.Phone = dto.Phone;
        employee.JobTitle = dto.JobTitle;
        employee.Notes = dto.Notes;
        employee.IsActive = dto.IsActive;
        employee.HiredAt = dto.HiredAt;

        await db.SaveChangesAsync(cancellationToken);

        return ServiceResult<Employee>.Ok(employee);
    }

    public async Task<ServiceResult<bool>> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var employee = await db.Employees.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (employee == null)
            return ServiceResult<bool>.NotFound("Employee not found.");

        db.Employees.Remove(employee);
        db.Users.RemoveRange(db.Users.Where(u => u.Id == employee.UserId));

        await db.SaveChangesAsync(cancellationToken);
        return ServiceResult<bool>.Ok(true);
    }
}
