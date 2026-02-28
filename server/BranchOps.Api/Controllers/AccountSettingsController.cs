using BranchOps.Api.Dtos;
using BranchOps.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BranchOps.Api.Controllers;

[Route("api/account-settings")]
[ApiController]
[Authorize]
public class AccountSettingsController(AccountSettingsService accountSettingsService) : ControllerBase
{
    private Guid UserId =>
        Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : Guid.Empty;

    [HttpGet]
    public async Task<ActionResult<AccountProfileDto>> GetProfile(CancellationToken cancellationToken)
    {
        var profile = await accountSettingsService.GetProfileAsync(UserId, cancellationToken);

        if (profile is null)
            return NotFound(new ApiError("User not found."));

        return Ok(profile);
    }

    [HttpPut]
    public async Task<ActionResult<AccountProfileDto>> UpdateProfile(
        UpdateProfileDto dto, CancellationToken cancellationToken)
    {
        var result = await accountSettingsService.UpdateProfileAsync(UserId, dto, cancellationToken);

        if (!result.Success)
            return MapError(result);

        return Ok(result.Value);
    }

    [HttpPut("password")]
    public async Task<IActionResult> ChangePassword(
        ChangePasswordDto dto, CancellationToken cancellationToken)
    {
        var result = await accountSettingsService.ChangePasswordAsync(UserId, dto, cancellationToken);

        if (!result.Success)
        {
            return result.ErrorType switch
            {
                ServiceErrorType.NotFound => NotFound(new ApiError(result.ErrorMessage ?? "User not found.")),
                ServiceErrorType.Invalid => BadRequest(new ApiError(result.ErrorMessage ?? "Password change failed.")),
                _ => BadRequest(new ApiError(result.ErrorMessage ?? "Password change failed."))
            };
        }

        return NoContent();
    }

    private ActionResult MapError<T>(ServiceResult<T> result)
    {
        return result.ErrorType switch
        {
            ServiceErrorType.NotFound => NotFound(new ApiError(result.ErrorMessage ?? "Not found.")),
            ServiceErrorType.Conflict => Conflict(new ApiError(result.ErrorMessage ?? "Conflict.")),
            ServiceErrorType.Invalid => BadRequest(new ApiError(result.ErrorMessage ?? "Invalid request.")),
            _ => BadRequest(new ApiError(result.ErrorMessage ?? "An error occurred."))
        };
    }
}
