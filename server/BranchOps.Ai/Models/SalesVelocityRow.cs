namespace BranchOps.Ai.Models;

/// <summary>
/// Sales velocity for one product at one branch over the requested lookback window.
/// Velocity is (units sold) / (lookback days), allowing a fractional value for
/// products that move slowly. Computed only from paid orders.
/// </summary>
public sealed record SalesVelocityRow(
    Guid ProductId,
    int LookbackDays,
    int TotalUnitsSold,
    double AverageUnitsPerDay);
