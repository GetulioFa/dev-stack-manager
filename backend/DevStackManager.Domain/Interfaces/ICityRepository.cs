using DevStackManager.Domain.Entities;

namespace DevStackManager.Domain.Interfaces;

public interface ICityRepository
{
    Task<City?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<(IEnumerable<City> Items, int TotalCount)> GetPagedAsync(int page, int pageSize, Guid? stateId = null, CancellationToken ct = default);
    Task AddAsync(City city, CancellationToken ct = default);
    void Update(City city);
}