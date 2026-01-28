using BranchOps.Api.Dtos;
using BranchOps.Api.Services;
using BranchOps.Domain.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BranchOps.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class EmployeeSalariesController(EmployeeSalaryService employeeSalaryService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<EmployeeSalaryDto>>> GetAll([FromQuery] Guid? employeeId, CancellationToken cancellationToken)
    {
        var salaries = await employeeSalaryService.GetAllAsync(employeeId, cancellationToken);
        return Ok(salaries.Select(ToDto));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<EmployeeSalaryDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var salary = await employeeSalaryService.GetByIdAsync(id, cancellationToken);
        if (salary == null)
            return NotFound(new ApiError("Employee salary not found."));

        return Ok(ToDto(salary));
    }

    [HttpPost]
    public async Task<ActionResult<EmployeeSalaryDto>> Create(EmployeeSalaryCreateDto dto, CancellationToken cancellationToken)
    {
        var result = await employeeSalaryService.CreateAsync(dto, cancellationToken);
        if (!result.Success)
            return MapError(result);

        var salaryDto = ToDto(result.Value!);
        return CreatedAtAction(nameof(GetById), new { id = salaryDto.Id }, salaryDto);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<EmployeeSalaryDto>> Update(Guid id, EmployeeSalaryUpdateDto dto, CancellationToken cancellationToken)
    {
        var result = await employeeSalaryService.UpdateAsync(id, dto, cancellationToken);
        if (!result.Success)
            return MapError(result);

        return Ok(ToDto(result.Value!));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await employeeSalaryService.DeleteAsync(id, cancellationToken);
        if (!result.Success)
        {
            return result.ErrorType switch
            {
                ServiceErrorType.NotFound => NotFound(new ApiError(result.ErrorMessage ?? "Employee salary not found.")),
                _ => BadRequest(new ApiError(result.ErrorMessage ?? "Delete failed."))
            };
        }

        return NoContent();
    }

    private static EmployeeSalaryDto ToDto(EmployeeSalary salary)
        => new(
            salary.Id,
            salary.EmployeeId,
            salary.Amount,
            salary.Currency,
            salary.EffectiveFrom,
            salary.EffectiveTo,
            salary.Notes,
            salary.CreatedAt,
            salary.UpdatedAt);

    private ActionResult MapError(ServiceResult<EmployeeSalary> result)
    {
        return result.ErrorType switch
        {
            ServiceErrorType.NotFound => NotFound(new ApiError(result.ErrorMessage ?? "Employee salary not found.")),
            ServiceErrorType.Conflict => Conflict(new ApiError(result.ErrorMessage ?? "Employee salary conflict.")),
            ServiceErrorType.Invalid => BadRequest(new ApiError(result.ErrorMessage ?? "Invalid employee salary request.")),
            _ => BadRequest(new ApiError(result.ErrorMessage ?? "Request failed."))
        };
    }
}
