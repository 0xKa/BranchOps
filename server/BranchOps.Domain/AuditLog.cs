using BranchOps.Domain.Auth;

namespace BranchOps.Domain;

/// <summary>
/// Records significant actions performed by users in the system.
/// </summary>
public class AuditLog
{
    public Guid Id { get; set; }

    /// <summary>The user who performed the action (null for system-generated entries).</summary>
    public Guid? UserId { get; set; }
    public User? User { get; set; }

    /// <summary>Short verb describing what happened, e.g. "Create", "Update", "Delete", "Login".</summary>
    public string Action { get; set; } = string.Empty;

    /// <summary>The entity type affected, e.g. "Order", "Product", "Branch".</summary>
    public string EntityType { get; set; } = string.Empty;

    /// <summary>The primary key of the affected entity (if applicable).</summary>
    public Guid? EntityId { get; set; }

    /// <summary>Human-readable summary of what changed.</summary>
    public string Details { get; set; } = string.Empty;

    /// <summary>UTC timestamp of when the action occurred.</summary>
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
