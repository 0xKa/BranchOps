using BranchOps.Ai.Abstractions;
using BranchOps.Ai.Models;
using BranchOps.Api.Dtos;
using BranchOps.Api.Services;
using BranchOps.Domain;

namespace BranchOps.Api.Ai.Adapters;

public sealed class ProductReadModelAdapter(ProductService products) : IProductReadModel
{
    public async Task<ProductSummary?> GetProductAsync(Guid productId, CancellationToken ct)
    {
        var product = await products.GetByIdAsync(productId, ct);
        return product is null ? null : Map(product);
    }

    public async Task<IReadOnlyList<ProductSummary>> ListProductsByCategoryAsync(
        Guid categoryId,
        int max,
        CancellationToken ct)
    {
        var rows = await products.GetAllAsync(
            new PaginationQuery { Page = 1, PageSize = max },
            categoryId: categoryId,
            isActive: true,
            cancellationToken: ct);

        return rows.Items.Select(Map).ToList();
    }

    private static ProductSummary Map(Product product)
        => new(
            product.Id,
            product.Name,
            product.CategoryId,
            product.Category.Name,
            product.Price,
            product.Cost,
            product.IsActive);
}
