using BranchOps.Domain;
using BranchOps.Domain.Ai;
using BranchOps.Domain.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace BranchOps.Api.Data;

public class BranchOpsDbContext(DbContextOptions<BranchOpsDbContext> options) : DbContext(options)
{
    public DbSet<User> Users { get; set; }
    public DbSet<Branch> Branches { get; set; }
    public DbSet<BranchPhone> BranchPhones { get; set; }
    public DbSet<Employee> Employees { get; set; }
    public DbSet<EmployeeSalary> EmployeeSalaries { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<ProductCategory> ProductCategories { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    public DbSet<BranchStock> BranchStocks { get; set; }
    public DbSet<StockAdjustment> StockAdjustments { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }

    // ── AI / Replenishment Advisor ────────────────────────────────
    public DbSet<ReplenishmentRun> ReplenishmentRuns { get; set; }
    public DbSet<ReplenishmentRecommendation> ReplenishmentRecommendations { get; set; }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(BranchOpsDbContext).Assembly);
    }
    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        ApplyAuditInfo();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void ApplyAuditInfo()
    {
        var now = DateTime.UtcNow;

        foreach (var entry in ChangeTracker.Entries<BaseDomainObject>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = now;
                entry.Entity.UpdatedAt = now;
            }
            else if (entry.State == EntityState.Modified)
                entry.Entity.UpdatedAt = now;
        }
    }
}
