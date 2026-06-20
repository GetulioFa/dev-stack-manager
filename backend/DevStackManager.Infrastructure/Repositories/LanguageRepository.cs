using DevStackManager.Domain.Entities;
using DevStackManager.Domain.Enums;
using DevStackManager.Domain.Interfaces;
using DevStackManager.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DevStackManager.Infrastructure.Repositories
{
    public sealed class LanguageRepository(AppDbContext context) : ILanguageRepository
    {
        public async Task<ProgrammingLanguage?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
            => await context.ProgrammingLanguages.FirstOrDefaultAsync(l => l.Id == id, cancellationToken);

        public async Task<IEnumerable<ProgrammingLanguage>> GetByIdsAsync(
            IEnumerable<Guid> ids, CancellationToken cancellationToken = default)
        {
            var idList = ids.ToList();
            return await context.ProgrammingLanguages
                .Where(l => idList.Contains(l.Id))
                .ToListAsync(cancellationToken);
        }

        public async Task<(IEnumerable<ProgrammingLanguage> Items, int TotalCount)> GetPagedAsync(
            int page, int pageSize, LanguageType? type = null, CancellationToken cancellationToken = default)
        {
            var query = context.ProgrammingLanguages.AsNoTracking().AsQueryable();

            if (type.HasValue)
                query = query.Where(l => l.Type == type.Value);

            query = query.OrderBy(l => l.Name);
            var totalCount = await query.CountAsync(cancellationToken);
            var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);
            return (items, totalCount);
        }

        public async Task AddAsync(ProgrammingLanguage language, CancellationToken cancellationToken = default)
            => await context.ProgrammingLanguages.AddAsync(language, cancellationToken);

        public void Update(ProgrammingLanguage language)
            => context.ProgrammingLanguages.Update(language);
    }
}
