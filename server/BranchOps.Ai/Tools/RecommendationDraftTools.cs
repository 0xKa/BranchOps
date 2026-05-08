using System.ComponentModel;
using BranchOps.Ai.Models;
using BranchOps.Domain.Ai;

namespace BranchOps.Ai.Tools;

public sealed class RecommendationDraftTools
{
    private readonly List<DraftRecommendation> _drafts = [];
    private Guid? _branchId;

    public IReadOnlyList<DraftRecommendation> Drafts => _drafts;

    public RecommendationDraftTools BindBranch(Guid branchId)
    {
        _branchId = branchId;
        return this;
    }

    [Description("Draft a reorder recommendation for human review. This does not change inventory or persist data.")]
    public DraftAck ProposeReorder(
        [Description("The product id that needs replenishment.")] Guid productId,
        [Description("Suggested reorder quantity. Must be positive.")] int suggestedQty,
        [Description("Urgency from 1 Low, 2 Medium, 3 High, 4 Critical.")] RecommendationUrgency urgency,
        [Description("Short business rationale for the recommendation.")] string rationale,
        [Description("Confidence from 0.0 to 1.0.")] decimal confidence)
    {
        if (suggestedQty <= 0)
            return new DraftAck(false, _drafts.Count);

        var branchId = _branchId
            ?? throw new InvalidOperationException("RecommendationDraftTools must be bound to a branch before use.");

        _drafts.Add(new DraftRecommendation(
            branchId,
            productId,
            suggestedQty,
            urgency,
            string.IsNullOrWhiteSpace(rationale) ? "No rationale provided." : rationale.Trim(),
            Math.Clamp(confidence, 0m, 1m)));

        return new DraftAck(true, _drafts.Count);
    }
}
