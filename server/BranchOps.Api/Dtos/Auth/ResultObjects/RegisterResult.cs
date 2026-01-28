using BranchOps.Domain.Auth;

namespace BranchOps.Api.Dtos.Auth.ResultObjects;

public enum RegisterError
{
    UsernameTaken,
    EmailTaken
}

public sealed record RegisterResult(bool Success, User? User, RegisterError? Error)
{
    public static RegisterResult Ok(User user) => new(true, user, null);
    public static RegisterResult Fail(RegisterError error) => new(false, null, error);
}