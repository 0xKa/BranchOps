using System.Security.Claims;

namespace BranchOps.Api.Security;

/// <summary>
/// Extension methods for extracting user context from ClaimsPrincipal (JWT claims).
/// </summary>
public static class UserContextExtensions
{
    /// <summary>
    /// Gets the authenticated user's BranchId from the JWT "BranchId" claim.
    /// Returns null for Admin users (who have no branch restriction).
    /// </summary>
    public static Guid? GetBranchId(this ClaimsPrincipal user)
    {
        var branchClaim = user.FindFirst("BranchId")?.Value;
        return Guid.TryParse(branchClaim, out var branchId) ? branchId : null;
    }

    /// <summary>
    /// Gets the authenticated user's Id from the NameIdentifier claim.
    /// </summary>
    public static Guid? GetUserId(this ClaimsPrincipal user)
    {
        var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdClaim, out var userId) ? userId : null;
    }

    /// <summary>
    /// Returns true if the authenticated user has the Admin role.
    /// </summary>
    public static bool IsAdmin(this ClaimsPrincipal user)
        => user.IsInRole("Admin");

    /// <summary>
    /// Resolves the effective branchId for a request:
    /// - Admin users: returns the client-provided branchId (or null for "all branches")
    /// - Non-Admin users: always returns the user's own branch, ignoring client input
    /// </summary>
    public static Guid? GetEffectiveBranchId(this ClaimsPrincipal user, Guid? requestedBranchId)
    {
        if (user.IsAdmin())
            return requestedBranchId;

        // Non-admin users are always scoped to their own branch
        return user.GetBranchId();
    }
}
