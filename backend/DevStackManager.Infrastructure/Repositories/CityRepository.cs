using DevStackManager.Domain.Entities;
using DevStackManager.Domain.Interfaces;
using DevStackManager.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DevStackManager.Infrastructure.Repositories
{
    public sealed class CityRepository(AppDbContext context) : ICityRepository
    {
        public async Task<City?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
            => await context.Cities
                .Include(c => c.State)
                .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        public async Task<(IEnumerable<City> Items, int TotalCount)> GetPagedAsync(
            int page, int pageSize, Guid? stateId = null, CancellationToken cancellationToken = default)
        {
            var query = context.Cities
                .AsNoTracking()
                .Include(c => c.State)
                .AsQueryable();

            if (stateId.HasValue)
                query = query.Where(c => c.StateId == stateId.Value);

            query = query.OrderBy(c => c.Name);
            var totalCount = await query.CountAsync(cancellationToken);
            var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);
            return (items, totalCount);
        }

        public async Task AddAsync(City city, CancellationToken cancellationToken = default)
            => await context.Cities.AddAsync(city, cancellationToken);

        public void Update(City city) => context.Cities.Update(city);
    }
}
