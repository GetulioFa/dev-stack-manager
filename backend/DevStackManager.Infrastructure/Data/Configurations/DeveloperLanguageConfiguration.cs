using DevStackManager.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DevStackManager.Infrastructure.Data.Configurations;

public sealed class DeveloperLanguageConfiguration : IEntityTypeConfiguration<DeveloperLanguage>
{
    public void Configure(EntityTypeBuilder<DeveloperLanguage> builder)
    {
        builder.ToTable("DeveloperLanguages");

        // Composite primary key on the join table
        builder.HasKey(dl => new { dl.DeveloperId, dl.ProgrammingLanguageId });

        builder.Property(dl => dl.AssociatedAt).IsRequired();

        builder.HasOne(dl => dl.Developer)
            .WithMany(d => d.DeveloperLanguage)
            .HasForeignKey(dl => dl.DeveloperId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(dl => dl.ProgrammingLanguage)
            .WithMany(l => l.DeveloperLanguages)
            .HasForeignKey(dl => dl.ProgrammingLanguageId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}