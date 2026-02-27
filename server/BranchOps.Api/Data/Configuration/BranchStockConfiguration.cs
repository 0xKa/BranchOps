using BranchOps.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BranchOps.Api.Data.Configuration;

public class BranchStockConfiguration : IEntityTypeConfiguration<BranchStock>
{
    public void Configure(EntityTypeBuilder<BranchStock> builder)
    {
        builder.HasIndex(x => new { x.BranchId, x.ProductId })
               .IsUnique();
    }
}
