using System.ComponentModel;
using BranchOps.Ai.Abstractions;
using BranchOps.Ai.Models;

namespace BranchOps.Ai.Tools;

public sealed class ProductTools(IProductReadModel products)
{
    [Description("Get product details, including category and active status.")]
    public Task<ProductSummary?> GetProduct(
        [Description("The product id to look up.")] Guid productId,
        CancellationToken ct = default)
        => products.GetProductAsync(productId, ct);

    [Description("List products in a category, capped by max.")]
    public Task<IReadOnlyList<ProductSummary>> ListProductsByCategory(
        [Description("The category id to list.")] Guid categoryId,
        [Description("Maximum number of rows to return.")] int max = 25,
        CancellationToken ct = default)
        => products.ListProductsByCategoryAsync(categoryId, Math.Clamp(max, 1, 100), ct);
}
