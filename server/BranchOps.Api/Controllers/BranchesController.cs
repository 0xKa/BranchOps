using BranchOps.Api.Dtos;
using BranchOps.Api.Services;
using BranchOps.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BranchOps.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class BranchesController(BranchService branchService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<BranchDto>>> GetAll(CancellationToken cancellationToken)
    {
        var branches = await branchService.GetAllAsync(cancellationToken);
        return Ok(branches.Select(ToDto));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<BranchDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var branch = await branchService.GetByIdAsync(id, cancellationToken);
        if (branch == null)
            return NotFound(new ApiError("Branch not found."));

        return Ok(ToDto(branch));
    }

    [HttpPost]
    public async Task<ActionResult<BranchDto>> Create(BranchCreateDto dto, CancellationToken cancellationToken)
    {
        var result = await branchService.CreateAsync(dto, cancellationToken);
        if (!result.Success)
            return MapError(result);

        var branchDto = ToDto(result.Value!);
        return CreatedAtAction(nameof(GetById), new { id = branchDto.Id }, branchDto);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<BranchDto>> Update(Guid id, BranchUpdateDto dto, CancellationToken cancellationToken)
    {
        var result = await branchService.UpdateAsync(id, dto, cancellationToken);
        if (!result.Success)
            return MapError(result);

        return Ok(ToDto(result.Value!));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await branchService.DeleteAsync(id, cancellationToken);
        if (!result.Success)
        {
            return result.ErrorType switch
            {
                ServiceErrorType.NotFound => NotFound(new ApiError(result.ErrorMessage ?? "Branch not found.")),
                _ => BadRequest(new ApiError(result.ErrorMessage ?? "Delete failed."))
            };
        }

        return NoContent();
    }

    private static BranchDto ToDto(Branch branch)
        => new(
            branch.Id,
            branch.Code,
            branch.DisplayName,
            branch.AddressLine1,
            branch.AddressLine2,
            branch.City,
            branch.Country,
            branch.IsActive,
            branch.CreatedAt,
            branch.UpdatedAt);

    private ActionResult MapError(ServiceResult<Branch> result)
    {
        return result.ErrorType switch
        {
            ServiceErrorType.NotFound => NotFound(new ApiError(result.ErrorMessage ?? "Branch not found.")),
            ServiceErrorType.Conflict => Conflict(new ApiError(result.ErrorMessage ?? "Branch conflict.")),
            ServiceErrorType.Invalid => BadRequest(new ApiError(result.ErrorMessage ?? "Invalid branch request.")),
            _ => BadRequest(new ApiError(result.ErrorMessage ?? "Request failed."))
        };
    }
}
