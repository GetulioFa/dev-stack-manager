using DevStackManager.Domain.Entities;
using DevStackManager.Domain.Enums;
using DevStackManager.Domain.Interfaces;
using DevStackManager.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DevStackManager.Infrastructure.Repositories
{
    public sealed class DeveloperRepository(AppDbContext context) : IDeveloperRepository
    {
        public async Task<Developer?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
            => await context.Developers
                .Include(d => d.City).ThenInclude(c => c.State)
                .Include(d => d.DeveloperLanguage).ThenInclude(dl => dl.ProgrammingLanguage)
                .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);

        public async Task<Developer?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
            => await context.Developers.FirstOrDefaultAsync(
                d => d.Email == email.ToLowerInvariant(), cancellationToken);

        public async Task<(IEnumerable<Developer> Items, int TotalCount)> GetPagedAsync(
            int page,
            int pageSize,
            Seniority? seniority = null,
            Guid? cityId = null,
            Guid? languageId = null,
            CancellationToken ct = default)
        {
            var query = context.Developers
                .AsNoTracking()
                .Include(d => d.City).ThenInclude(c => c.State)
                .Include(d => d.DeveloperLanguage).ThenInclude(dl => dl.ProgrammingLanguage)
                .AsQueryable();

            if (seniority.HasValue)
                query = query.Where(d => d.Seniority == seniority.Value);

            if (cityId.HasValue)
                query = query.Where(d => d.CityId == cityId.Value);

            if (languageId.HasValue)
                query = query.Where(d =>
                    d.DeveloperLanguage.Any(dl => dl.ProgrammingLanguageId == languageId.Value));

            query = query.OrderBy(d => d.Name);
            var totalCount = await query.CountAsync(ct);
            var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
            return (items, totalCount);
        }

        public async Task<IEnumerable<Developer>> GetAllForExportAsync(CancellationToken cancellationToken = default)
            => await context.Developers
                .AsNoTracking()
                .Include(d => d.City).ThenInclude(c => c.State)
                .Include(d => d.DeveloperLanguage).ThenInclude(dl => dl.ProgrammingLanguage)
                .OrderBy(d => d.Name)
                .ToListAsync(cancellationToken);

        public async Task AddAsync(Developer developer, CancellationToken cancellationToken = default)
            => await context.Developers.AddAsync(developer, cancellationToken);

        public void Update(Developer developer) => context.Developers.Update(developer);
    }
}
