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
public class BranchPhonesController(BranchPhoneService branchPhoneService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<BranchPhoneDto>>> GetAll([FromQuery] Guid? branchId, CancellationToken cancellationToken)
    {
        var effectiveBranchId = User.GetEffectiveBranchId(branchId);
        var phones = await branchPhoneService.GetAllAsync(effectiveBranchId, cancellationToken);
        return Ok(phones.Select(ToDto));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<BranchPhoneDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var phone = await branchPhoneService.GetByIdAsync(id, cancellationToken);
        if (phone == null)
            return NotFound(new ApiError("Branch phone not found."));

        // Non-admin users can only view phones from their own branch
        var userBranchId = User.GetBranchId();
        if (userBranchId.HasValue && phone.BranchId != userBranchId.Value)
            return Forbid();

        return Ok(ToDto(phone));
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<BranchPhoneDto>> Create(BranchPhoneCreateDto dto, CancellationToken cancellationToken)
    {
        var result = await branchPhoneService.CreateAsync(dto, cancellationToken);
        if (!result.Success)
            return MapError(result);

        var phoneDto = ToDto(result.Value!);
        return CreatedAtAction(nameof(GetById), new { id = phoneDto.Id }, phoneDto);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<BranchPhoneDto>> Update(Guid id, BranchPhoneUpdateDto dto, CancellationToken cancellationToken)
    {
        var result = await branchPhoneService.UpdateAsync(id, dto, cancellationToken);
        if (!result.Success)
            return MapError(result);

        return Ok(ToDto(result.Value!));
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await branchPhoneService.DeleteAsync(id, cancellationToken);
        if (!result.Success)
        {
            return result.ErrorType switch
            {
                ServiceErrorType.NotFound => NotFound(new ApiError(result.ErrorMessage ?? "Branch phone not found.")),
                _ => BadRequest(new ApiError(result.ErrorMessage ?? "Delete failed."))
            };
        }

        return NoContent();
    }

    private static BranchPhoneDto ToDto(BranchPhone phone)
        => new(
            phone.Id,
            phone.BranchId,
            phone.Number,
            phone.Label,
            phone.IsPrimary,
            phone.IsActive,
            phone.CreatedAt,
            phone.UpdatedAt);

    private ActionResult MapError(ServiceResult<BranchPhone> result)
    {
        return result.ErrorType switch
        {
            ServiceErrorType.NotFound => NotFound(new ApiError(result.ErrorMessage ?? "Branch not found.")),
            ServiceErrorType.Conflict => Conflict(new ApiError(result.ErrorMessage ?? "Branch phone conflict.")),
            ServiceErrorType.Invalid => BadRequest(new ApiError(result.ErrorMessage ?? "Invalid branch phone request.")),
            _ => BadRequest(new ApiError(result.ErrorMessage ?? "Request failed."))
        };
    }
}
