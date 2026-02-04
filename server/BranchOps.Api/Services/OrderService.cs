using BranchOps.Api.Data;
using BranchOps.Api.Dtos;
using BranchOps.Domain;
using Microsoft.EntityFrameworkCore;

namespace BranchOps.Api.Services;

public class OrderService(BranchOpsDbContext db)
{
    public async Task<PagedResult<Order>> GetAllAsync(
        PaginationQuery pagination,
        Guid? branchId = null,
        OrderStatus? status = null,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        CancellationToken cancellationToken = default)
    {
        var query = db.Orders
            .AsNoTracking()
            .Include(o => o.Branch)
            .Include(o => o.CreatedByUser)
            .Include(o => o.Items)
            .AsQueryable();

        if (branchId.HasValue)
            query = query.Where(x => x.BranchId == branchId.Value);

        if (status.HasValue)
            query = query.Where(x => x.Status == status.Value);

        if (fromDate.HasValue)
            query = query.Where(x => x.CreatedAt >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(x => x.CreatedAt <= toDate.Value);

        var totalCount = await query.CountAsync(cancellationToken);
        var totalPages = (int)Math.Ceiling(totalCount / (double)pagination.PageSize);

        var items = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip(pagination.Skip)
            .Take(pagination.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<Order>(
            items,
            pagination.Page,
            pagination.PageSize,
            totalCount,
            totalPages);
    }

    public async Task<Order?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await db.Orders
            .AsNoTracking()
            .Include(o => o.Branch)
            .Include(o => o.CreatedByUser)
            .Include(o => o.CancelledByUser)
            .Include(o => o.Items)
                .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<ServiceResult<Order>> PlaceOrderAsync(
        PlaceOrderDto dto,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        // Validate branch
        var branchExists = await db.Branches.AnyAsync(x => x.Id == dto.BranchId, cancellationToken);
        if (!branchExists)
            return ServiceResult<Order>.NotFound("Branch not found.");

        // Get products for price lookup
        var productIds = dto.Items.Select(i => i.ProductId).Distinct().ToList();
        var products = await db.Products
            .Where(p => productIds.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id, cancellationToken);

        // Validate all products exist and are active
        foreach (var item in dto.Items)
        {
            if (!products.TryGetValue(item.ProductId, out var product))
                return ServiceResult<Order>.NotFound($"Product {item.ProductId} not found.");

            if (!product.IsActive)
                return ServiceResult<Order>.Invalid($"Product '{product.Name}' is not available.");
        }

        // Build order items
        var orderItems = dto.Items.Select(i =>
        {
            var product = products[i.ProductId];
            return new OrderItem
            {
                Id = Guid.NewGuid(),
                ProductId = i.ProductId,
                Quantity = i.Quantity,
                UnitPrice = product.Price,
                LineTotal = product.Price * i.Quantity
            };
        }).ToList();

        var subtotal = orderItems.Sum(i => i.LineTotal);
        var total = subtotal - dto.Discount + dto.Tax;

        var order = new Order
        {
            Id = Guid.NewGuid(),
            BranchId = dto.BranchId,
            CreatedByUserId = userId,
            Status = OrderStatus.Paid,
            Subtotal = subtotal,
            Discount = dto.Discount,
            Tax = dto.Tax,
            Total = total,
            PaymentMethod = dto.PaymentMethod,
            AmountPaid = dto.AmountPaid,
            PaidAtUtc = DateTime.UtcNow,
            Notes = dto.Notes,
            Items = orderItems
        };

        db.Orders.Add(order);
        await db.SaveChangesAsync(cancellationToken);

        // Reload with navigation properties
        var result = await GetByIdAsync(order.Id, cancellationToken);
        return ServiceResult<Order>.Ok(result!);
    }

    public async Task<ServiceResult<Order>> UpdateOrderAsync(
        Guid id,
        UpdateOrderDto dto,
        CancellationToken cancellationToken = default)
    {
        var order = await db.Orders.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (order == null)
            return ServiceResult<Order>.NotFound("Order not found.");

        if (order.Status == OrderStatus.Cancelled)
            return ServiceResult<Order>.Invalid("Cannot update a cancelled order.");

        order.Status = dto.Status;
        order.Discount = dto.Discount;
        order.Tax = dto.Tax;
        order.Total = order.Subtotal - dto.Discount + dto.Tax;
        order.PaymentMethod = dto.PaymentMethod;
        order.AmountPaid = dto.AmountPaid;
        order.Notes = dto.Notes;

        await db.SaveChangesAsync(cancellationToken);

        var result = await GetByIdAsync(order.Id, cancellationToken);
        return ServiceResult<Order>.Ok(result!);
    }

    public async Task<ServiceResult<Order>> CancelOrderAsync(
        Guid id,
        Guid cancelledByUserId,
        string? reason = null,
        CancellationToken cancellationToken = default)
    {
        var order = await db.Orders.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (order == null)
            return ServiceResult<Order>.NotFound("Order not found.");

        if (order.Status == OrderStatus.Cancelled)
            return ServiceResult<Order>.Invalid("Order is already cancelled.");

        order.Status = OrderStatus.Cancelled;
        order.CancelledByUserId = cancelledByUserId;
        if (!string.IsNullOrWhiteSpace(reason))
            order.Notes = string.IsNullOrWhiteSpace(order.Notes)
                ? $"Cancelled: {reason}"
                : $"{order.Notes} | Cancelled: {reason}";

        await db.SaveChangesAsync(cancellationToken);

        var result = await GetByIdAsync(order.Id, cancellationToken);
        return ServiceResult<Order>.Ok(result!);
    }

    public async Task<ServiceResult<bool>> DeleteOrderAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var order = await db.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (order == null)
            return ServiceResult<bool>.NotFound("Order not found.");

        db.OrderItems.RemoveRange(order.Items);
        db.Orders.Remove(order);
        await db.SaveChangesAsync(cancellationToken);

        return ServiceResult<bool>.Ok(true);
    }
}
