using BranchOps.Domain.Ai;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BranchOps.Api.Data.Configuration.Ai;

internal class ReplenishmentRunConfiguration : IEntityTypeConfiguration<ReplenishmentRun>
{
    public void Configure(EntityTypeBuilder<ReplenishmentRun> builder)
    {
        builder.HasKey(x => x.Id);

        // Indexes for the common query patterns:
        //  - "list runs for branch X, newest first" (run history page)
        builder.HasIndex(x => new { x.BranchId, x.StartedAt });
        //  - "find still-running runs" (cleanup / monitoring)
        builder.HasIndex(x => x.Status);

        // Restrict deletion: a run row is historical and shouldn't disappear
        // because a branch or user was archived.
        builder.HasOne(x => x.Branch)
            .WithMany()
            .HasForeignKey(x => x.BranchId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.TriggeredByUser)
            .WithMany()
            .HasForeignKey(x => x.TriggeredByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Recommendations cascade with the parent run -- they have no meaning without it.
        builder.HasMany(x => x.Recommendations)
            .WithOne(r => r.Run)
            .HasForeignKey(r => r.RunId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
