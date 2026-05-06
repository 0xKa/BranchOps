using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using BranchOps.Domain.Auth;

namespace BranchOps.Domain.Ai;

/// <summary>
/// One AI-proposed reorder recommendation, awaiting human decision.
/// A run produces N of these; each is approved or rejected independently.
/// Approval never mutates inventory directly (see RecommendationStatus).
/// </summary>
public class ReplenishmentRecommendation : BaseDomainObject
{
    public Guid RunId { get; set; }
    public ReplenishmentRun Run { get; set; } = null!;

    /// <summary>Denormalized for fast filtering; always matches Run.BranchId.</summary>
    public Guid BranchId { get; set; }

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    /// <summary>On-hand quantity at the moment the run captured it.</summary>
    [Range(0, int.MaxValue)]
    public int CurrentStock { get; set; }

    /// <summary>Quantity the agent suggests reordering. Must be positive.</summary>
    [Range(1, int.MaxValue)]
    public int SuggestedQty { get; set; }

    public RecommendationUrgency Urgency { get; set; }

    /// <summary>Concise rationale citing the data the agent observed.</summary>
    [MaxLength(1500)]
    public string Rationale { get; set; } = string.Empty;

    /// <summary>Agent-self-reported confidence in [0, 1]. Stored as numeric(4,3).</summary>
    [Column(TypeName = "numeric(4,3)")]
    public decimal Confidence { get; set; }

    public RecommendationStatus Status { get; set; } = RecommendationStatus.Pending;

    // ── Decision audit ────────────────────────────────────────────
    public Guid? DecidedByUserId { get; set; }
    public User? DecidedByUser { get; set; }
    public DateTime? DecidedAt { get; set; }

    [MaxLength(500)]
    public string? DecisionNotes { get; set; }
}
