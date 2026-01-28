using BranchOps.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BranchOps.Infrastructure.Persistence.Configurations;

internal class UserConfig : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.Property(x => x.PasswordHash).IsRequired();
        builder.Property(x => x.Username).IsRequired().HasMaxLength(50);
        builder.Property(x => x.Email).IsRequired().HasMaxLength(100);

        builder.HasIndex(x => x.Username).IsUnique();
        builder.HasIndex(x => x.Email).IsUnique();

    }
}
