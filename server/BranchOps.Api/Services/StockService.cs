using BranchOps.Api.Data;
using BranchOps.Api.Dtos;
using BranchOps.Domain;
using Microsoft.EntityFrameworkCore;

namespace BranchOps.Api.Services;

public class StockService(BranchOpsDbContext db)
{
    // ── Queries ────────────────────────────────────────────────

    public async Task<PagedResult<BranchStock>> GetAllAsync(
        PaginationQuery pagination,
        Guid? branchId = null,
        Guid? productId = null,
        bool? lowStockOnly = null,
        CancellationToken cancellationToken = default)
    {
        var query = db.BranchStocks
            .AsNoTracking()
            .Include(s => s.Branch)
            .Include(s => s.Product)
            .AsQueryable();

        if (branchId.HasValue)
            query = query.Where(x => x.BranchId == branchId.Value);

        if (productId.HasValue)
            query = query.Where(x => x.ProductId == productId.Value);

        if (lowStockOnly == true)
            query = query.Where(x => x.Quantity <= x.LowStockThreshold);

        var totalCount = await query.CountAsync(cancellationToken);
        var totalPages = (int)Math.Ceiling(totalCount / (double)pagination.PageSize);

        var items = await query
            .OrderBy(x => x.Product.Name)
            .ThenBy(x => x.Branch.DisplayName)
            .Skip(pagination.Skip)
            .Take(pagination.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<BranchStock>(items, pagination.Page, pagination.PageSize, totalCount, totalPages);
    }

    public async Task<BranchStock?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await db.BranchStocks
            .AsNoTracking()
            .Include(s => s.Branch)
            .Include(s => s.Product)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<BranchStock?> GetByBranchAndProductAsync(
        Guid branchId, Guid productId, CancellationToken cancellationToken = default)
    {
        return await db.BranchStocks
            .AsNoTracking()
            .Include(s => s.Branch)
            .Include(s => s.Product)
            .FirstOrDefaultAsync(x => x.BranchId == branchId && x.ProductId == productId, cancellationToken);
    }

    public async Task<IReadOnlyList<BranchStock>> GetLowStockAlertsAsync(
        Guid? branchId = null,
        CancellationToken cancellationToken = default)
    {
        var query = db.BranchStocks
            .AsNoTracking()
            .Include(s => s.Branch)
            .Include(s => s.Product)
            .Where(x => x.Quantity <= x.LowStockThreshold);

        if (branchId.HasValue)
            query = query.Where(x => x.BranchId == branchId.Value);

        return await query
            .OrderBy(x => x.Quantity)
            .ToListAsync(cancellationToken);
    }

    public async Task<PagedResult<StockAdjustment>> GetAdjustmentsAsync(
        PaginationQuery pagination,
        Guid? branchId = null,
        Guid? productId = null,
        StockAdjustmentType? type = null,
        CancellationToken cancellationToken = default)
    {
        var query = db.StockAdjustments
            .AsNoTracking()
            .Include(a => a.Branch)
            .Include(a => a.Product)
            .Include(a => a.PerformedByUser)
            .AsQueryable();

        if (branchId.HasValue)
            query = query.Where(x => x.BranchId == branchId.Value);

        if (productId.HasValue)
            query = query.Where(x => x.ProductId == productId.Value);

        if (type.HasValue)
            query = query.Where(x => x.Type == type.Value);

        var totalCount = await query.CountAsync(cancellationToken);
        var totalPages = (int)Math.Ceiling(totalCount / (double)pagination.PageSize);

        var items = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip(pagination.Skip)
            .Take(pagination.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<StockAdjustment>(items, pagination.Page, pagination.PageSize, totalCount, totalPages);
    }

    // ── Commands ───────────────────────────────────────────────

    public async Task<ServiceResult<BranchStock>> SetStockAsync(
        SetStockDto dto,
        Guid? userId = null,
        CancellationToken cancellationToken = default)
    {
        if (!await db.Branches.AnyAsync(x => x.Id == dto.BranchId, cancellationToken))
            return ServiceResult<BranchStock>.NotFound("Branch not found.");

        if (!await db.Products.AnyAsync(x => x.Id == dto.ProductId, cancellationToken))
            return ServiceResult<BranchStock>.NotFound("Product not found.");

        var stock = await db.BranchStocks
            .FirstOrDefaultAsync(x => x.BranchId == dto.BranchId && x.ProductId == dto.ProductId, cancellationToken);

        int previousQty;

        if (stock == null)
        {
            previousQty = 0;
            stock = new BranchStock
            {
                Id = Guid.NewGuid(),
                BranchId = dto.BranchId,
                ProductId = dto.ProductId,
                Quantity = dto.Quantity,
                LowStockThreshold = dto.LowStockThreshold
            };
            db.BranchStocks.Add(stock);
        }
        else
        {
            previousQty = stock.Quantity;
            stock.Quantity = dto.Quantity;
            stock.LowStockThreshold = dto.LowStockThreshold;
        }

        // Record adjustment if quantity changed
        var diff = dto.Quantity - previousQty;
        if (diff != 0)
        {
            db.StockAdjustments.Add(new StockAdjustment
            {
                Id = Guid.NewGuid(),
                BranchStockId = stock.Id,
                BranchId = dto.BranchId,
                ProductId = dto.ProductId,
                Type = StockAdjustmentType.ManualAdjustment,
                QuantityChange = diff,
                QuantityAfter = dto.Quantity,
                PerformedByUserId = userId,
                Notes = $"Stock set to {dto.Quantity} (was {previousQty})"
            });
        }

        await db.SaveChangesAsync(cancellationToken);

        var result = await GetByIdAsync(stock.Id, cancellationToken);
        return ServiceResult<BranchStock>.Ok(result!);
    }

    public async Task<ServiceResult<BranchStock>> AdjustStockAsync(
        AdjustStockDto dto,
        Guid? userId = null,
        CancellationToken cancellationToken = default)
    {
        if (dto.QuantityChange == 0)
            return ServiceResult<BranchStock>.Invalid("Quantity change cannot be zero.");

        if (!await db.Branches.AnyAsync(x => x.Id == dto.BranchId, cancellationToken))
            return ServiceResult<BranchStock>.NotFound("Branch not found.");

        if (!await db.Products.AnyAsync(x => x.Id == dto.ProductId, cancellationToken))
            return ServiceResult<BranchStock>.NotFound("Product not found.");

        var stock = await db.BranchStocks
            .FirstOrDefaultAsync(x => x.BranchId == dto.BranchId && x.ProductId == dto.ProductId, cancellationToken);

        if (stock == null)
        {
            if (dto.QuantityChange < 0)
                return ServiceResult<BranchStock>.Invalid("Cannot deduct stock that does not exist. Set initial stock first.");

            stock = new BranchStock
            {
                Id = Guid.NewGuid(),
                BranchId = dto.BranchId,
                ProductId = dto.ProductId,
                Quantity = dto.QuantityChange,
                LowStockThreshold = 10
            };
            db.BranchStocks.Add(stock);
        }
        else
        {
            var newQty = stock.Quantity + dto.QuantityChange;
            if (newQty < 0)
                return ServiceResult<BranchStock>.Invalid(
                    $"Insufficient stock. Current: {stock.Quantity}, attempted change: {dto.QuantityChange}.");

            stock.Quantity = newQty;
        }

        db.StockAdjustments.Add(new StockAdjustment
        {
            Id = Guid.NewGuid(),
            BranchStockId = stock.Id,
            BranchId = dto.BranchId,
            ProductId = dto.ProductId,
            Type = dto.Type,
            QuantityChange = dto.QuantityChange,
            QuantityAfter = stock.Quantity,
            PerformedByUserId = userId,
            Notes = dto.Notes
        });

        await db.SaveChangesAsync(cancellationToken);

        var result = await GetByIdAsync(stock.Id, cancellationToken);
        return ServiceResult<BranchStock>.Ok(result!);
    }

    public async Task<ServiceResult<IReadOnlyList<BranchStock>>> BulkAdjustStockAsync(
        BulkAdjustStockDto dto,
        Guid? userId = null,
        CancellationToken cancellationToken = default)
    {
        if (!await db.Branches.AnyAsync(x => x.Id == dto.BranchId, cancellationToken))
            return ServiceResult<IReadOnlyList<BranchStock>>.NotFound("Branch not found.");

        var productIds = dto.Items.Select(i => i.ProductId).Distinct().ToList();
        var products = await db.Products
            .Where(p => productIds.Contains(p.Id))
            .Select(p => p.Id)
            .ToListAsync(cancellationToken);

        var missing = productIds.Except(products).ToList();
        if (missing.Count > 0)
            return ServiceResult<IReadOnlyList<BranchStock>>.NotFound(
                $"Products not found: {string.Join(", ", missing)}");

        // Load existing stocks for this branch
        var existingStocks = await db.BranchStocks
            .Where(x => x.BranchId == dto.BranchId && productIds.Contains(x.ProductId))
            .ToDictionaryAsync(x => x.ProductId, cancellationToken);

        var affectedStockIds = new List<Guid>();

        foreach (var item in dto.Items)
        {
            if (item.QuantityChange == 0)
                continue;

            if (!existingStocks.TryGetValue(item.ProductId, out var stock))
            {
                if (item.QuantityChange < 0)
                    return ServiceResult<IReadOnlyList<BranchStock>>.Invalid(
                        $"Cannot deduct from product {item.ProductId} — no stock record exists.");

                stock = new BranchStock
                {
                    Id = Guid.NewGuid(),
                    BranchId = dto.BranchId,
                    ProductId = item.ProductId,
                    Quantity = item.QuantityChange,
                    LowStockThreshold = 10
                };
                db.BranchStocks.Add(stock);
                existingStocks[item.ProductId] = stock;
            }
            else
            {
                var newQty = stock.Quantity + item.QuantityChange;
                if (newQty < 0)
                    return ServiceResult<IReadOnlyList<BranchStock>>.Invalid(
                        $"Insufficient stock for product {item.ProductId}. Current: {stock.Quantity}, change: {item.QuantityChange}.");
                stock.Quantity = newQty;
            }

            db.StockAdjustments.Add(new StockAdjustment
            {
                Id = Guid.NewGuid(),
                BranchStockId = stock.Id,
                BranchId = dto.BranchId,
                ProductId = item.ProductId,
                Type = dto.Type,
                QuantityChange = item.QuantityChange,
                QuantityAfter = stock.Quantity,
                PerformedByUserId = userId,
                Notes = dto.Notes
            });

            affectedStockIds.Add(stock.Id);
        }

        await db.SaveChangesAsync(cancellationToken);

        var result = await db.BranchStocks
            .AsNoTracking()
            .Include(s => s.Branch)
            .Include(s => s.Product)
            .Where(x => affectedStockIds.Contains(x.Id))
            .ToListAsync(cancellationToken);

        return ServiceResult<IReadOnlyList<BranchStock>>.Ok(result);
    }

    public async Task<ServiceResult<BranchStock>> UpdateThresholdAsync(
        Guid id,
        UpdateThresholdDto dto,
        CancellationToken cancellationToken = default)
    {
        var stock = await db.BranchStocks.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (stock == null)
            return ServiceResult<BranchStock>.NotFound("Stock record not found.");

        stock.LowStockThreshold = dto.LowStockThreshold;
        await db.SaveChangesAsync(cancellationToken);

        var result = await GetByIdAsync(stock.Id, cancellationToken);
        return ServiceResult<BranchStock>.Ok(result!);
    }

    public async Task<ServiceResult<bool>> DeleteStockAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var stock = await db.BranchStocks
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (stock == null)
            return ServiceResult<bool>.NotFound("Stock record not found.");

        // Remove related adjustments
        var adjustments = await db.StockAdjustments
            .Where(x => x.BranchStockId == id)
            .ToListAsync(cancellationToken);

        db.StockAdjustments.RemoveRange(adjustments);
        db.BranchStocks.Remove(stock);
        await db.SaveChangesAsync(cancellationToken);

        return ServiceResult<bool>.Ok(true);
    }
}
