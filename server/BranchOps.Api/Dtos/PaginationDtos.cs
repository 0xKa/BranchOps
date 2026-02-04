namespace BranchOps.Api.Dtos;

public record PagedResult<T>(
    IReadOnlyList<T> Items,
    int Page,
    int PageSize,
    int TotalCount,
    int TotalPages);

public record PaginationQuery
{
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;

    public int Skip => (Page - 1) * PageSize;
}
