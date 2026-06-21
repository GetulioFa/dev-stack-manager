using DevStackManager.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DevStackManager.Infrastructure.Data.Configurations;

public sealed class StateConfiguration : IEntityTypeConfiguration<State>
{
    public void Configure(EntityTypeBuilder<State> builder)
    {
        builder.ToTable("States");
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).ValueGeneratedNever();
        builder.Property(s => s.Name).IsRequired().HasMaxLength(100);
        builder.Property(s => s.UF).IsRequired().HasMaxLength(2);
        builder.Property(s => s.IsDeleted).HasDefaultValue(false);
        builder.Property(s => s.DeletedAt).IsRequired(false);
        builder.Property(s => s.UpdatedAt).IsRequired(false);

        // Unique index on UF
        builder.HasIndex(s => s.UF)
            .IsUnique()
            .HasDatabaseName("IX_States_UF");

        builder.HasQueryFilter(s => !s.IsDeleted);

        builder.HasMany(s => s.Cities)
            .WithOne(c => c.State)
            .HasForeignKey(c => c.StateId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
