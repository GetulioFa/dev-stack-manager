using DevStackManager.Domain.Entities;
using DevStackManager.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DevStackManager.Infrastructure.Data
{
    public sealed class AppDbContext(DbContextOptions<AppDbContext> options)
        : DbContext(options), IUnitOfWork
    {
        public DbSet<User> Users => Set<User>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
            => base.SaveChangesAsync(cancellationToken);
    }
}
