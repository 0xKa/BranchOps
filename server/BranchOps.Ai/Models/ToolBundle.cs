using BranchOps.Ai.Tools;

namespace BranchOps.Ai.Models;

/// <summary>Per-run bundle of scoped tool instances passed to the agent factory.</summary>
public sealed record ToolBundle(
    InventoryTools Inventory,
    SalesAnalyticsTools Sales,
    ProductTools Products,
    RecommendationDraftTools Drafts);
