using BranchOps.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BranchOps.Api.Data.Configuration;

internal sealed class EmployeeConfiguration : IEntityTypeConfiguration<Employee>
{
    public void Configure(EntityTypeBuilder<Employee> builder)
    {
        builder.HasIndex(x => x.UserId).IsUnique();

        builder.HasIndex(x => x.BranchId); //for branch staff lookups
    }
}
