namespace BranchOps.Ai.Models;

/// <summary>One row of a "best-selling products" listing returned to the agent.</summary>
public sealed record TopProductRow(
    Guid ProductId,
    string ProductName,
    int TotalQuantitySold,
    decimal TotalRevenue);
