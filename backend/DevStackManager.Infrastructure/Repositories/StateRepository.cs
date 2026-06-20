using DevStackManager.Domain.Entities;
using DevStackManager.Domain.Interfaces;
using DevStackManager.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DevStackManager.Infrastructure.Repositories
{
    public sealed class StateRepository(AppDbContext context) : IStateRepository
    {
        public async Task<State?> GetByIdAsync(Guid id, CancellationToken cancellationToke = default)
        => await context.States
            .Include(s => s.Cities)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToke);

        public async Task<State?> GetByUFAsync(string uf, CancellationToken cancellationToke = default)
            => await context.States.FirstOrDefaultAsync(
                s => s.UF == uf.ToUpperInvariant(), cancellationToke);

        public async Task<(IEnumerable<State> Items, int TotalCount)> GetPagedAsync(
            int page, int pageSize, CancellationToken cancellationToke = default)
        {
            var query = context.States.AsNoTracking().OrderBy(s => s.Name);
            var totalCount = await query.CountAsync(cancellationToke);
            var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToke);
            return (items, totalCount);
        }

        public async Task AddAsync(State state, CancellationToken cancellationToke = default)
            => await context.States.AddAsync(state, cancellationToke);

        public void Update(State state) => context.States.Update(state);
    }
}
