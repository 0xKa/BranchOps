using BranchOps.Domain.Ai;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BranchOps.Api.Data.Configuration.Ai;

internal class ReplenishmentRecommendationConfiguration : IEntityTypeConfiguration<ReplenishmentRecommendation>
{
    public void Configure(EntityTypeBuilder<ReplenishmentRecommendation> builder)
    {
        builder.HasKey(x => x.Id);

        // Indexes for the common access patterns:
        //  - "all recommendations for run X" (run detail page)
        builder.HasIndex(x => x.RunId);
        //  - "show pending recommendations for product Y at branch Z"
        builder.HasIndex(x => new { x.BranchId, x.ProductId });
        //  - "filter by approval state" (queues/dashboards)
        builder.HasIndex(x => x.Status);

        // Product relationship -- restrict so we don't lose audit context if a
        // product is deactivated or removed; soft-deletes should be preferred upstream.
        builder.HasOne(x => x.Product)
            .WithMany()
            .HasForeignKey(x => x.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        // Decider may be null (still pending) or may have been deleted later;
        // SetNull keeps the recommendation row intact for history.
        builder.HasOne(x => x.DecidedByUser)
            .WithMany()
            .HasForeignKey(x => x.DecidedByUserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
