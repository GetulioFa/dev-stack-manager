using DevStackManager.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DevStackManager.Infrastructure.Data.Configurations;

public sealed class DeveloperConfiguration : IEntityTypeConfiguration<Developer>
{
    public void Configure(EntityTypeBuilder<Developer> builder)
    {
        builder.ToTable("Developers");
        builder.HasKey(d => d.Id);
        builder.Property(d => d.Id).ValueGeneratedNever();
        builder.Property(d => d.Name).IsRequired().HasMaxLength(150);
        builder.Property(d => d.Email).IsRequired().HasMaxLength(254);
        builder.Property(d => d.Seniority).IsRequired().HasConversion<int>();
        builder.Property(d => d.CityId).IsRequired();
        builder.Property(d => d.IsDeleted).HasDefaultValue(false);
        builder.Property(d => d.DeletedAt).IsRequired(false);
        builder.Property(d => d.UpdatedAt).IsRequired(false);

        // Unique index on Developer Email
        builder.HasIndex(d => d.Email)
            .IsUnique()
            .HasDatabaseName("IX_Developers_Email");

        builder.HasQueryFilter(d => !d.IsDeleted);

        // Backing field for DeveloperLanguages collection
        builder.Navigation(d => d.DeveloperLanguage).HasField("_developerLanguages");
    }
}