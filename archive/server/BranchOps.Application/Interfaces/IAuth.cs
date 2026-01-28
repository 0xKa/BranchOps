using BranchOps.Application.DTOs;
using BranchOps.Domain.Entities;

namespace BranchOps.Application.Interfaces;

public interface IAuth
{
    Task<User?> RegisterAsync(UserRegisterDto userDto);
    Task<TokenResponseDto?> LoginAsync(UserLoginDto userDto);
    Task<TokenResponseDto?> RefreshTokensAsync(RefreshTokenRequestDto requestDto);
}
