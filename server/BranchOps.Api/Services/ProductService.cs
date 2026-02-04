using BranchOps.Api.Data;
using BranchOps.Api.Dtos;
using BranchOps.Domain;
using Microsoft.EntityFrameworkCore;

namespace BranchOps.Api.Services;

public class ProductService(BranchOpsDbContext db)
{
    public async Task<PagedResult<Product>> GetAllAsync(
        PaginationQuery pagination,
        Guid? categoryId = null,
        bool? isActive = null,
        string? search = null,
        CancellationToken cancellationToken = default)
    {
        var query = db.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .AsQueryable();

        if (categoryId.HasValue)
            query = query.Where(x => x.CategoryId == categoryId.Value);

        if (isActive.HasValue)
            query = query.Where(x => x.IsActive == isActive.Value);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(x => x.Name.ToLower().Contains(search.ToLower()));

        var totalCount = await query.CountAsync(cancellationToken);
        var totalPages = (int)Math.Ceiling(totalCount / (double)pagination.PageSize);

        var items = await query
            .OrderBy(x => x.Name)
            .Skip(pagination.Skip)
            .Take(pagination.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<Product>(
            items,
            pagination.Page,
            pagination.PageSize,
            totalCount,
            totalPages);
    }

    public async Task<Product?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await db.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<ServiceResult<Product>> CreateAsync(
        ProductCreateDto dto,
        CancellationToken cancellationToken = default)
    {
        var categoryExists = await db.ProductCategories
            .AnyAsync(x => x.Id == dto.CategoryId, cancellationToken);

        if (!categoryExists)
            return ServiceResult<Product>.NotFound("Category not found.");

        var product = new Product
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            CategoryId = dto.CategoryId,
            Price = dto.Price,
            Cost = dto.Cost,
            IsActive = dto.IsActive
        };

        db.Products.Add(product);
        await db.SaveChangesAsync(cancellationToken);

        // Reload with category
        var result = await GetByIdAsync(product.Id, cancellationToken);
        return ServiceResult<Product>.Ok(result!);
    }

    public async Task<ServiceResult<Product>> UpdateAsync(
        Guid id,
        ProductUpdateDto dto,
        CancellationToken cancellationToken = default)
    {
        var product = await db.Products.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (product == null)
            return ServiceResult<Product>.NotFound("Product not found.");

        var categoryExists = await db.ProductCategories
            .AnyAsync(x => x.Id == dto.CategoryId, cancellationToken);

        if (!categoryExists)
            return ServiceResult<Product>.NotFound("Category not found.");

        product.Name = dto.Name;
        product.CategoryId = dto.CategoryId;
        product.Price = dto.Price;
        product.Cost = dto.Cost;
        product.IsActive = dto.IsActive;

        await db.SaveChangesAsync(cancellationToken);

        // Reload with category
        var result = await GetByIdAsync(product.Id, cancellationToken);
        return ServiceResult<Product>.Ok(result!);
    }

    public async Task<ServiceResult<bool>> DeleteAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var product = await db.Products.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (product == null)
            return ServiceResult<bool>.NotFound("Product not found.");

        // Check if product is used in any orders
        var hasOrders = await db.OrderItems.AnyAsync(x => x.ProductId == id, cancellationToken);
        if (hasOrders)
            return ServiceResult<bool>.Conflict("Cannot delete product with associated orders. Consider deactivating instead.");

        db.Products.Remove(product);
        await db.SaveChangesAsync(cancellationToken);

        return ServiceResult<bool>.Ok(true);
    }
}
