namespace BranchOps.Api.Services;

public enum ServiceErrorType
{
    NotFound,
    Conflict,
    Invalid
}

public sealed record ServiceResult<T>(bool Success, T? Value, ServiceErrorType? ErrorType, string? ErrorMessage)
{
    public static ServiceResult<T> Ok(T value) => new(true, value, null, null);
    public static ServiceResult<T> NotFound(string message) => new(false, default, ServiceErrorType.NotFound, message);
    public static ServiceResult<T> Conflict(string message) => new(false, default, ServiceErrorType.Conflict, message);
    public static ServiceResult<T> Invalid(string message) => new(false, default, ServiceErrorType.Invalid, message);
}
