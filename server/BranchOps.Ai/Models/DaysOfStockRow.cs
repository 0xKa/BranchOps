namespace BranchOps.Ai.Models;

/// <summary>
/// "Days of stock" -- how many days of selling cover currently stand in inventory,
/// computed as CurrentStock / AverageUnitsPerDay. When AverageUnitsPerDay is zero
/// (no recent sales) the value is null and the agent is expected to mark the
/// product Low urgency and explain the conservative call.
/// </summary>
public sealed record DaysOfStockRow(
    Guid ProductId,
    int CurrentStock,
    double AverageUnitsPerDay,
    double? DaysOfStock);
