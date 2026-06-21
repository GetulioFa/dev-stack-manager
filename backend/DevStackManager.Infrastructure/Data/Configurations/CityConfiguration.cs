using DevStackManager.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DevStackManager.Infrastructure.Data.Configurations;

public sealed class CityConfiguration : IEntityTypeConfiguration<City>
{
    public void Configure(EntityTypeBuilder<City> builder)
    {
        builder.ToTable("Cities");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).ValueGeneratedNever();
        builder.Property(c => c.Name).IsRequired().HasMaxLength(150);
        builder.Property(c => c.StateId).IsRequired();
        builder.Property(c => c.IsDeleted).HasDefaultValue(false);
        builder.Property(c => c.DeletedAt).IsRequired(false);
        builder.Property(c => c.UpdatedAt).IsRequired(false);

        builder.HasIndex(c => c.StateId).HasDatabaseName("IX_Cities_StateId");
        builder.HasQueryFilter(c => !c.IsDeleted);

        builder.HasMany(c => c.Developers)
            .WithOne(d => d.City)
            .HasForeignKey(d => d.CityId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}