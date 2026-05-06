using System.ComponentModel.DataAnnotations;
using BranchOps.Domain.Auth;

namespace BranchOps.Domain.Ai;

/// <summary>
/// One end-to-end run of the Stock Replenishment Advisor agent.
/// Created when a manager triggers analysis; carries lifecycle status and
/// the agent's final summary; owns the resulting recommendations.
/// </summary>
public class ReplenishmentRun : BaseDomainObject
{
    public Guid BranchId { get; set; }
    public Branch Branch { get; set; } = null!;

    public Guid TriggeredByUserId { get; set; }
    public User TriggeredByUser { get; set; } = null!;

    public ReplenishmentRunStatus Status { get; set; } = ReplenishmentRunStatus.Running;

    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }

    /// <summary>OpenAI model id used (e.g. "gpt-5-mini"). Captured per-run for reproducibility.</summary>
    [MaxLength(50)]
    public string ModelId { get; set; } = string.Empty;

    /// <summary>Final natural-language narrative the agent produced. Null while still running.</summary>
    [MaxLength(2000)]
    public string? Summary { get; set; }

    /// <summary>Populated when Status == Failed. Truncated to fit.</summary>
    [MaxLength(1000)]
    public string? ErrorMessage { get; set; }

    public ICollection<ReplenishmentRecommendation> Recommendations { get; set; } = [];
}
