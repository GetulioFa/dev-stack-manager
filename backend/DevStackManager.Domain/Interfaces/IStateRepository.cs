using DevStackManager.Domain.Entities;

namespace DevStackManager.Domain.Interfaces
{
    public interface IStateRepository
    {
        Task<State?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task<State?> GetByUFAsync(string uf, CancellationToken ct = default);
        Task<(IEnumerable<State> Items, int TotalCount)> GetPagedAsync(int page, int pageSize, CancellationToken ct = default);
        Task AddAsync(State state, CancellationToken ct = default);
        void Update(State state);
    }
}
