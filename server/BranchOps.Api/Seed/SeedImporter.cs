using BranchOps.Api.Data;
using BranchOps.Domain;
using BranchOps.Domain.Auth;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace BranchOps.Api.Seed;

public static class SeedImporter
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public static async Task RunAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<BranchOpsDbContext>();
        var suppressAuditInfo = db.SuppressAuditInfo;
        var logger = scope.ServiceProvider
            .GetRequiredService<ILoggerFactory>()
            .CreateLogger(nameof(SeedImporter));

        try
        {
            db.SuppressAuditInfo = true;

            await db.Database.MigrateAsync();

            if (await db.Users.AnyAsync())
                return;

            var seedPath = Path.Combine(AppContext.BaseDirectory, "Seed", "init.json");
            if (!File.Exists(seedPath))
            {
                logger.LogWarning("Seed file not found at {Path}. Skipping seed import.", seedPath);
                return;
            }

            await using var stream = File.OpenRead(seedPath);
            var seed = await JsonSerializer.DeserializeAsync<SeedData>(stream, JsonOptions);
            if (seed is null)
            {
                logger.LogWarning("Seed file deserialized to null. Skipping seed import.");
                return;
            }

            // Batch 1: no FK dependencies
            db.Users.AddRange(seed.Users);
            db.Branches.AddRange(seed.Branches);
            db.ProductCategories.AddRange(seed.ProductCategories);
            await db.SaveChangesAsync();

            // Batch 2: FK → Users, Branches, ProductCategories
            db.BranchPhones.AddRange(seed.BranchPhones);
            db.Products.AddRange(seed.Products);
            db.Employees.AddRange(seed.Employees);
            await db.SaveChangesAsync();

            // Batch 3: FK → Employees, Branches+Products, Branches+Users
            db.EmployeeSalaries.AddRange(seed.EmployeeSalaries);
            db.BranchStocks.AddRange(seed.BranchStocks);
            db.Orders.AddRange(seed.Orders);
            await db.SaveChangesAsync();

            // Batch 4: FK → Orders+Products, BranchStocks+Branches+Products
            db.OrderItems.AddRange(seed.OrderItems);
            db.StockAdjustments.AddRange(seed.StockAdjustments);
            await db.SaveChangesAsync();

            // Batch 5: FK → Users (nullable)
            db.AuditLogs.AddRange(seed.AuditLogs);
            await db.SaveChangesAsync();

            logger.LogInformation("Seed import completed successfully.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Seed import failed.");
        }
        finally
        {
            db.SuppressAuditInfo = suppressAuditInfo;
        }
    }

    private sealed record SeedData(
        List<User> Users,
        List<Branch> Branches,
        List<BranchPhone> BranchPhones,
        List<ProductCategory> ProductCategories,
        List<Product> Products,
        List<Employee> Employees,
        List<EmployeeSalary> EmployeeSalaries,
        List<BranchStock> BranchStocks,
        List<Order> Orders,
        List<OrderItem> OrderItems,
        List<StockAdjustment> StockAdjustments,
        List<AuditLog> AuditLogs
    );
}
