using BranchOps.Domain.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BranchOps.Api.Data.Configuration;

internal sealed class EmployeeSalaryConfiguration : IEntityTypeConfiguration<EmployeeSalary>
{
    public void Configure(EntityTypeBuilder<EmployeeSalary> builder)
    {

        builder.Property(x => x.Amount).HasPrecision(18, 3);

    }
}
