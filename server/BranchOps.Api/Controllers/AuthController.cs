using BranchOps.Api.Dtos;
using BranchOps.Api.Dtos.Auth;
using BranchOps.Api.Dtos.Auth.ResultObjects;
using BranchOps.Api.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BranchOps.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class AuthController(Auth auth) : ControllerBase
{
    private Guid UserId => GetAuthenticatedUserId();

    [AllowAnonymous]
    [HttpGet]
    public IActionResult Get() => Ok($"Auth controller is working! UserId: {UserId}");

    [HttpGet("me")]
    public async Task<ActionResult<UserMeResponseDto>> Me()
    {
        var response = await auth.GetUserWithEmployeeInfoAsync(UserId);

        if (response is null)
            return Unauthorized(new ApiError("No authenticated user found."));

        return Ok(response);
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<ActionResult<UserRegisterResponseDto>> Register(UserRegisterRequestDto dto)
    {
        var result = await auth.RegisterAsync(dto);

        if (!result.Success)
        {
            return result.Error switch
            {
                RegisterError.UsernameTaken => Conflict(new ApiError("Username is already taken.")),
                RegisterError.EmailTaken => Conflict(new ApiError("Email is already registered.")),
                _ => BadRequest(new ApiError("Registration failed."))
            };
        }
        var user = result.User!;

        var responseDto = new UserRegisterResponseDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            FullName = dto.FullName,
            Role = user.Role.ToString(),
            CreatedAt = user.CreatedAt
        };
        return CreatedAtAction(nameof(Register), new { id = user.Id }, responseDto);

    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<TokenResponseDto>> Login(UserLoginDto userDto)
    {
        var result = await auth.LoginAsync(userDto);

        if (result == null)
            return Unauthorized(new ApiError("Invalid username or password"));

        return Ok(result);
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout(RefreshTokenRequestDto tokenRequest)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var success = await auth.RevokeRefreshTokenAsync(tokenRequest.RefreshToken, userId);

        if (!success)
            return BadRequest(new ApiError("Logout failed."));

        return Ok();
    }

    [HttpPost("refresh-token")]
    public async Task<ActionResult<TokenResponseDto>> RefreshToken(RefreshTokenRequestDto tokenRequest)
    {
        var result = await auth.RefreshTokensAsync(tokenRequest);
        if (result == null || result.AccessToken == null || result.RefreshToken == null)
            return Unauthorized(new ApiError("Invalid token"));
        return Ok(result);
    }

    [HttpGet("auth-only")]
    public async Task<IActionResult> AuthOnly()
    {
        return Ok("Auth controller is working!");
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("admin-only")]
    public async Task<IActionResult> AdminOnly()
    {
        return Ok("Admin controller is working!");
    }

    [Authorize(Roles = "Guest")]
    [HttpGet("guest-only")]
    public async Task<IActionResult> GuestOnly()
    {
        return Ok("Guest controller is working!");
    }

    [Authorize(Roles = "Admin,User")]
    [HttpGet("user-and-admin")]
    public async Task<IActionResult> UserAndAdmin()
    {
        return Ok("User and Admin controller is working!");
    }

    private Guid GetAuthenticatedUserId()
    {
        //return Guid.Parse("019b6dd3-30bd-77d4-a1f8-3f248ada5690"); //temp
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
    }

}
