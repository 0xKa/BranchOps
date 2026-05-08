namespace BranchOps.Ai.Models;

/// <summary>Lightweight product context returned to the agent.</summary>
public sealed record ProductSummary(
    Guid ProductId,
    string Name,
    Guid CategoryId,
    string CategoryName,
    decimal Price,
    decimal? Cost,
    bool IsActive);
