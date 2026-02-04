using BranchOps.Api.Data;
using BranchOps.Api.Dtos;
using BranchOps.Domain;
using Microsoft.EntityFrameworkCore;

namespace BranchOps.Api.Services;

public class ProductCategoryService(BranchOpsDbContext db)
{
    public async Task<IReadOnlyList<(ProductCategory Category, int ProductCount)>> GetAllAsync(
        bool? isActive = null,
        CancellationToken cancellationToken = default)
    {
        var query = db.ProductCategories.AsNoTracking();

        if (isActive.HasValue)
            query = query.Where(x => x.IsActive == isActive.Value);

        return await query
            .OrderBy(x => x.Name)
            .Select(c => new ValueTuple<ProductCategory, int>(c, c.Products.Count))
            .ToListAsync(cancellationToken);
    }

    public async Task<(ProductCategory? Category, int ProductCount)> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var result = await db.ProductCategories
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(c => new { Category = c, ProductCount = c.Products.Count })
            .FirstOrDefaultAsync(cancellationToken);

        return result == null ? (null, 0) : (result.Category, result.ProductCount);
    }

    public async Task<ServiceResult<ProductCategory>> CreateAsync(
        ProductCategoryCreateDto dto,
        CancellationToken cancellationToken = default)
    {
        var nameExists = await db.ProductCategories
            .AnyAsync(x => x.Name.ToLower() == dto.Name.ToLower(), cancellationToken);

        if (nameExists)
            return ServiceResult<ProductCategory>.Conflict("Category name already exists.");

        var category = new ProductCategory
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            IsActive = dto.IsActive
        };

        db.ProductCategories.Add(category);
        await db.SaveChangesAsync(cancellationToken);

        return ServiceResult<ProductCategory>.Ok(category);
    }

    public async Task<ServiceResult<ProductCategory>> UpdateAsync(
        Guid id,
        ProductCategoryUpdateDto dto,
        CancellationToken cancellationToken = default)
    {
        var category = await db.ProductCategories.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (category == null)
            return ServiceResult<ProductCategory>.NotFound("Category not found.");

        var nameExists = await db.ProductCategories
            .AnyAsync(x => x.Name.ToLower() == dto.Name.ToLower() && x.Id != id, cancellationToken);

        if (nameExists)
            return ServiceResult<ProductCategory>.Conflict("Category name already exists.");

        category.Name = dto.Name;
        category.IsActive = dto.IsActive;

        await db.SaveChangesAsync(cancellationToken);

        return ServiceResult<ProductCategory>.Ok(category);
    }

    public async Task<ServiceResult<bool>> DeleteAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var category = await db.ProductCategories
            .Include(c => c.Products)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (category == null)
            return ServiceResult<bool>.NotFound("Category not found.");

        if (category.Products.Count > 0)
            return ServiceResult<bool>.Conflict("Cannot delete category with associated products.");

        db.ProductCategories.Remove(category);
        await db.SaveChangesAsync(cancellationToken);

        return ServiceResult<bool>.Ok(true);
    }
}
