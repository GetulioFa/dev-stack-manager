using DevStackManager.Domain.Entities;
using DevStackManager.Domain.Interfaces;
using DevStackManager.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;

namespace DevStackManager.Infrastructure.Data
{
    public sealed class AppDbContext(DbContextOptions<AppDbContext> options)
        : DbContext(options), IUnitOfWork
    {
        public DbSet<User> Users => Set<User>();
        public DbSet<Developer> Developers => Set<Developer>();
        public DbSet<State> States => Set<State>();
        public DbSet<City> Cities => Set<City>();
        public DbSet<ProgrammingLanguage> ProgrammingLanguages => Set<ProgrammingLanguage>();
        public DbSet<DeveloperLanguage> DeveloperLanguages => Set<DeveloperLanguage>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
            
            // Pendente - Criar arquivo
            //DataSeeder.Seed(modelBuilder);
        }
        
        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
            => base.SaveChangesAsync(cancellationToken);
    }
}
