using BranchOps.Ai.Models;

namespace BranchOps.Ai.Abstractions;

/// <summary>Read-only product lookup used by ProductTools.</summary>
public interface IProductReadModel
{
    Task<ProductSummary?> GetProductAsync(Guid productId, CancellationToken ct);

    Task<IReadOnlyList<ProductSummary>> ListProductsByCategoryAsync(
        Guid categoryId, int max, CancellationToken ct);
}
