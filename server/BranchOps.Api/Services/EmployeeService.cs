using BranchOps.Api.Data;
using BranchOps.Api.Dtos;
using BranchOps.Api.Dtos.Auth;
using BranchOps.Api.Dtos.Auth.ResultObjects;
using BranchOps.Api.Security;
using BranchOps.Domain;
using Microsoft.EntityFrameworkCore;

namespace BranchOps.Api.Services;

public class EmployeeService(BranchOpsDbContext db, Auth auth)
{
    public async Task<IReadOnlyList<Employee>> GetAllAsync(Guid? branchId, CancellationToken cancellationToken = default)
    {
        var query = db.Employees.AsNoTracking();

        if (branchId.HasValue)
            query = query.Where(x => x.BranchId == branchId.Value);

        return await query
            .OrderBy(x => x.FullName)
            .ToListAsync(cancellationToken);
    }

    public async Task<Employee?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await db.Employees
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<ServiceResult<Employee>> CreateAsync(EmployeeCreateDto dto, CancellationToken cancellationToken = default)
    {
        var branchExists = await db.Branches.AnyAsync(x => x.Id == dto.BranchId, cancellationToken);
        if (!branchExists)
            return ServiceResult<Employee>.NotFound("Branch not found.");

        // Register user first
        var userRegisterDto = new UserRegisterRequestDto
        {
            Username = dto.Username,
            Password = dto.Password,
            Email = dto.Email,
            Role = dto.Role,
            FullName = dto.FullName
        };

        var registerResult = await auth.RegisterAsync(userRegisterDto);
        if (!registerResult.Success)
        {
            return registerResult.Error switch
            {
                RegisterError.UsernameTaken => ServiceResult<Employee>.Conflict("Username is already taken."),
                RegisterError.EmailTaken => ServiceResult<Employee>.Conflict("Email is already registered."),
                _ => ServiceResult<Employee>.Invalid("User registration failed.")
            };
        }

        var user = registerResult.User!;

        // Create employee record
        var employee = new Employee
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            BranchId = dto.BranchId,
            FullName = dto.FullName,
            Phone = dto.Phone,
            JobTitle = dto.JobTitle,
            Notes = dto.Notes,
            IsActive = dto.IsActive,
            HiredAt = dto.HiredAt ?? DateTime.UtcNow
        };

        db.Employees.Add(employee);
        await db.SaveChangesAsync(cancellationToken);

        return ServiceResult<Employee>.Ok(employee);
    }

    public async Task<ServiceResult<Employee>> UpdateAsync(Guid id, EmployeeUpdateDto dto, CancellationToken cancellationToken = default)
    {
        var employee = await db.Employees.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
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
        await db.SaveChangesAsync(cancellationToken);

        return ServiceResult<bool>.Ok(true);
    }
}
