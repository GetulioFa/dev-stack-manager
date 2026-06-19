using DevStackManager.Domain.Entities;
using DevStackManager.Domain.Interfaces;
using DevStackManager.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DevStackManager.Infrastructure.Repositories
{
    public sealed class UserRepository(AppDbContext context) : IUserRepository
    {
        public async Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
            => await context.Users.FirstOrDefaultAsync(u => u.Id == id, cancellationToken);

        public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
            => await context.Users.FirstOrDefaultAsync(u => u.Email == email.ToLowerInvariant(), cancellationToken);

        public async Task<(IEnumerable<User> Items, int TotalCount)> GetPagedAsync(
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
        {
            var query = context.Users.AsNoTracking().OrderBy(u => u.Name);
            var totalCount = await query.CountAsync(cancellationToken);
            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            return (items, totalCount);
        }

        public async Task AddAsync(User user, CancellationToken cancellationToken = default)
            => await context.Users.AddAsync(user, cancellationToken);

        public void Update(User user)
            => context.Users.Update(user);
    }
}
