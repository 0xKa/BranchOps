using System.Globalization;
using System.Text;
using BranchOps.Api.Data;
using BranchOps.Domain;
using CsvHelper;
using Microsoft.EntityFrameworkCore;

namespace BranchOps.Api.Services;

public enum ExportGranularity { OrderSummary, ItemDetail }

public class SalesExportService(BranchOpsDbContext db)
{
    public async Task<string?> GetBranchCodeAsync(Guid branchId, CancellationToken ct)
        => await db.Branches
            .Where(b => b.Id == branchId)
            .Select(b => b.Code)
            .FirstOrDefaultAsync(ct);

    public async Task WriteSalesCsvAsync(
        Stream output,
        DateTime fromDate, DateTime toDate,
        Guid? branchId, OrderStatus? status,
        ExportGranularity granularity,
        CancellationToken ct)
    {
        var from = DateTime.SpecifyKind(fromDate.Date, DateTimeKind.Utc);
        var to = DateTime.SpecifyKind(toDate.Date.AddDays(1), DateTimeKind.Utc);

        var query = db.Orders
            .AsNoTracking()
            .Include(o => o.Branch)
            .Include(o => o.CreatedByUser)
            .Include(o => o.Items)
            .Where(o => o.CreatedAt >= from && o.CreatedAt < to);

        if (granularity == ExportGranularity.ItemDetail)
            query = query.Include(o => o.Items).ThenInclude(i => i.Product).ThenInclude(p => p.Category);

        if (branchId.HasValue)
            query = query.Where(o => o.BranchId == branchId.Value);

        if (status.HasValue)
            query = query.Where(o => o.Status == status.Value);

        query = query.OrderBy(o => o.CreatedAt);

        await using var writer = new StreamWriter(output, new UTF8Encoding(true), leaveOpen: true);
        await using var csv = new CsvWriter(writer, CultureInfo.InvariantCulture);

        if (granularity == ExportGranularity.ItemDetail)
            WriteItemDetailHeader(csv);
        else
            WriteOrderSummaryHeader(csv);

        await csv.NextRecordAsync();

        var rowCount = 0;
        await foreach (var order in query.AsAsyncEnumerable().WithCancellation(ct))
        {
            if (granularity == ExportGranularity.ItemDetail)
            {
                foreach (var item in order.Items)
                {
                    WriteItemDetailRow(csv, order, item);
                    await csv.NextRecordAsync();
                    rowCount++;
                }
            }
            else
            {
                WriteOrderSummaryRow(csv, order);
                await csv.NextRecordAsync();
                rowCount++;
            }

            if (rowCount % 500 == 0)
                await csv.FlushAsync();
        }

        await csv.FlushAsync();
    }

    // Order Summary 
    private static void WriteOrderSummaryHeader(CsvWriter csv)
    {
        csv.WriteField("OrderId");
        csv.WriteField("BranchCode");
        csv.WriteField("BranchName");
        csv.WriteField("Date");
        csv.WriteField("Time");
        csv.WriteField("Status");
        csv.WriteField("ItemCount");
        csv.WriteField("Subtotal");
        csv.WriteField("Discount");
        csv.WriteField("Tax");
        csv.WriteField("Total");
        csv.WriteField("PaymentMethod");
        csv.WriteField("AmountPaid");
        csv.WriteField("CreatedBy");
        csv.WriteField("Notes");
    }

    private static void WriteOrderSummaryRow(CsvWriter csv, Order order)
    {
        csv.WriteField(order.Id);
        csv.WriteField(order.Branch.Code);
        csv.WriteField(order.Branch.DisplayName);
        csv.WriteField(order.CreatedAt.ToString("yyyy-MM-dd"));
        csv.WriteField(order.CreatedAt.ToString("HH:mm:ss"));
        csv.WriteField(order.Status.ToString());
        csv.WriteField(order.Items.Count);
        csv.WriteField(order.Subtotal);
        csv.WriteField(order.Discount);
        csv.WriteField(order.Tax);
        csv.WriteField(order.Total);
        csv.WriteField(order.PaymentMethod.ToString());
        csv.WriteField(order.AmountPaid);
        csv.WriteField(order.CreatedByUser.Username);
        csv.WriteField(order.Notes);
    }

    // Item Detail 
    private static void WriteItemDetailHeader(CsvWriter csv)
    {
        csv.WriteField("OrderId");
        csv.WriteField("BranchCode");
        csv.WriteField("BranchName");
        csv.WriteField("Date");
        csv.WriteField("Time");
        csv.WriteField("Status");
        csv.WriteField("PaymentMethod");
        csv.WriteField("ProductName");
        csv.WriteField("CategoryName");
        csv.WriteField("Quantity");
        csv.WriteField("UnitPrice");
        csv.WriteField("LineTotal");
        csv.WriteField("ProductCost");
        csv.WriteField("Profit");
    }

    private static void WriteItemDetailRow(CsvWriter csv, Order order, OrderItem item)
    {
        csv.WriteField(order.Id);
        csv.WriteField(order.Branch.Code);
        csv.WriteField(order.Branch.DisplayName);
        csv.WriteField(order.CreatedAt.ToString("yyyy-MM-dd"));
        csv.WriteField(order.CreatedAt.ToString("HH:mm:ss"));
        csv.WriteField(order.Status.ToString());
        csv.WriteField(order.PaymentMethod.ToString());
        csv.WriteField(item.Product.Name);
        csv.WriteField(item.Product.Category.Name);
        csv.WriteField(item.Quantity);
        csv.WriteField(item.UnitPrice);
        csv.WriteField(item.LineTotal);
        csv.WriteField(item.Product.Cost?.ToString(CultureInfo.InvariantCulture) ?? "");
        csv.WriteField(item.Product.Cost.HasValue
            ? (item.LineTotal - item.Product.Cost.Value * item.Quantity).ToString(CultureInfo.InvariantCulture)
            : "");
    }
}
