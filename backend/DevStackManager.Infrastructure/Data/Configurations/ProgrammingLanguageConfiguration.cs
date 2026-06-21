using DevStackManager.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DevStackManager.Infrastructure.Data.Configurations;

public sealed class ProgrammingLanguageConfiguration : IEntityTypeConfiguration<ProgrammingLanguage>
{
    public void Configure(EntityTypeBuilder<ProgrammingLanguage> builder)
    {
        builder.ToTable("ProgrammingLanguages");
        builder.HasKey(l => l.Id);
        builder.Property(l => l.Id).ValueGeneratedNever();
        builder.Property(l => l.Name).IsRequired().HasMaxLength(100);
        builder.Property(l => l.Type).IsRequired().HasConversion<int>();
        builder.Property(l => l.IsDeleted).HasDefaultValue(false);
        builder.Property(l => l.DeletedAt).IsRequired(false);
        builder.Property(l => l.UpdatedAt).IsRequired(false);

        builder.HasQueryFilter(l => !l.IsDeleted);
    }
}