using BranchOps.Api.Dtos;
using BranchOps.Api.Security;
using BranchOps.Api.Services;
using BranchOps.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BranchOps.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin,BranchManager")]
public class EmployeesController(EmployeeService employeeService, Security.Auth auth) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<EmployeeDto>>> GetAll([FromQuery] Guid? branchId, CancellationToken cancellationToken)
    {
        var effectiveBranchId = User.GetEffectiveBranchId(branchId);
        var employees = await employeeService.GetAllAsync(effectiveBranchId, cancellationToken);
        return Ok(employees.Select(ToDto));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<EmployeeDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var employee = await employeeService.GetByIdAsync(id, cancellationToken);
        if (employee == null)
            return NotFound(new ApiError("Employee not found."));

        // Non-admin users can only view employees from their own branch
        var userBranchId = User.GetBranchId();
        if (userBranchId.HasValue && employee.BranchId != userBranchId.Value)
            return Forbid();

        return Ok(ToDto(employee));
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<EmployeeDto>> Create(EmployeeCreateDto dto, CancellationToken cancellationToken)
    {
        // Map to user registration DTO
        var userRegisterDto = new Dtos.Auth.UserRegisterRequestDto
        {
            Username = dto.Username,
            Password = dto.Password,
            Email = dto.Email,
            FullName = dto.FullName,
            Role = dto.Role,
            BranchId = dto.BranchId,
            Phone = dto.Phone,
            JobTitle = dto.JobTitle,
            Notes = dto.Notes,
            IsActive = dto.IsActive,
            HiredAt = dto.HiredAt
        };

        var registerResult = await auth.RegisterAsync(userRegisterDto);
        if (!registerResult.Success)
        {
            return registerResult.Error switch
            {
                Dtos.Auth.ResultObjects.RegisterError.UsernameTaken => Conflict(new ApiError("Username is already taken.")),
                Dtos.Auth.ResultObjects.RegisterError.EmailTaken => Conflict(new ApiError("Email is already registered.")),
                _ => BadRequest(new ApiError("Registration failed."))
            };
        }

        // Fetch the created employee by UserId
        var employee = await employeeService.GetByUserIdAsync(registerResult.User!.Id, cancellationToken);
        if (employee == null)
            return NotFound(new ApiError("Employee not found after creation."));

        var employeeDto = ToDto(employee);
        return CreatedAtAction(nameof(GetById), new { id = employeeDto.Id }, employeeDto);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<EmployeeDto>> Update(Guid id, EmployeeUpdateDto dto, CancellationToken cancellationToken)
    {
        var result = await employeeService.UpdateAsync(id, dto, cancellationToken);
        if (!result.Success)
            return MapError(result);

        return Ok(ToDto(result.Value!));
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await employeeService.DeleteAsync(id, cancellationToken);
        if (!result.Success)
        {
            return result.ErrorType switch
            {
                ServiceErrorType.NotFound => NotFound(new ApiError(result.ErrorMessage ?? "Employee not found.")),
                _ => BadRequest(new ApiError(result.ErrorMessage ?? "Delete failed."))
            };
        }

        return NoContent();
    }

    private static EmployeeDto ToDto(Employee employee)
        => new(
            employee.Id,
            employee.UserId,
            employee.BranchId,
            employee.FullName,
            employee.Phone,
            employee.JobTitle,
            employee.Notes,
            employee.IsActive,
            employee.HiredAt,
            employee.User.Role.ToString(),
            employee.CreatedAt,
            employee.UpdatedAt);

    private ActionResult MapError(ServiceResult<Employee> result)
    {
        return result.ErrorType switch
        {
            ServiceErrorType.NotFound => NotFound(new ApiError(result.ErrorMessage ?? "Employee not found.")),
            ServiceErrorType.Conflict => Conflict(new ApiError(result.ErrorMessage ?? "Employee conflict.")),
            ServiceErrorType.Invalid => BadRequest(new ApiError(result.ErrorMessage ?? "Invalid employee request.")),
            _ => BadRequest(new ApiError(result.ErrorMessage ?? "Request failed."))
        };
    }
}
