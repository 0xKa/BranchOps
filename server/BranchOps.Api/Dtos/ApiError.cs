namespace BranchOps.Api.Dtos;

public class ApiError
{
    public string Message { get; init; } = string.Empty;
    public string? Details { get; init; }

    public ApiError() { }
    public ApiError(string message, string? details = null)
    {
        Message = message;
        Details = details;
    }
}
