using BranchOps.Api.Dtos;
using BranchOps.Api.Services;
using BranchOps.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BranchOps.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
// [Authorize(Roles = "Admin")]
public class EmployeesController(EmployeeService employeeService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<EmployeeDto>>> GetAll([FromQuery] Guid? branchId, CancellationToken cancellationToken)
    {
        var employees = await employeeService.GetAllAsync(branchId, cancellationToken);
        return Ok(employees.Select(ToDto));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<EmployeeDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var employee = await employeeService.GetByIdAsync(id, cancellationToken);
        if (employee == null)
            return NotFound(new ApiError("Employee not found."));

        return Ok(ToDto(employee));
    }

    [HttpPost]
    public async Task<ActionResult<EmployeeDto>> Create(EmployeeCreateDto dto, CancellationToken cancellationToken)
    {
        var result = await employeeService.CreateAsync(dto, cancellationToken);
        if (!result.Success)
            return MapError(result);

        var employeeDto = ToDto(result.Value!);
        return CreatedAtAction(nameof(GetById), new { id = employeeDto.Id }, employeeDto);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<EmployeeDto>> Update(Guid id, EmployeeUpdateDto dto, CancellationToken cancellationToken)
    {
        var result = await employeeService.UpdateAsync(id, dto, cancellationToken);
        if (!result.Success)
            return MapError(result);

        return Ok(ToDto(result.Value!));
    }

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
