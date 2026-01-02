using BranchOps.Application.DTOs;
using BranchOps.Application.Interfaces;
using BranchOps.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BranchOps.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController(IAuth authService) : ControllerBase
    {


        [HttpPost("register")]
        public async Task<ActionResult<User>> Register(UserRegisterDto dto)
        {
            if (!ModelState.IsValid)
                return Ok(ModelState);

            var user = await authService.RegisterAsync(dto);

            if (user == null)
                return BadRequest("Username already exists");

            return Ok(user);
        }

        [HttpPost("login")]
        public async Task<ActionResult<TokenResponseDto>> Login(UserLoginDto userDto)
        {
            var result = await authService.LoginAsync(userDto);

            if (result == null)
                return Unauthorized("Invalid username or password");

            return Ok(result);
        }

        [HttpPost("refresh-token")]
        public async Task<ActionResult<TokenResponseDto>> RefreshToken(RefreshTokenRequestDto tokenRequest)
        {
            var result = await authService.RefreshTokensAsync(tokenRequest);
            if (result == null || result.AccessToken == null || result.RefreshToken == null)
                return Unauthorized("Invalid token");
            return Ok(result);
        }

        [Authorize]
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


    }
}