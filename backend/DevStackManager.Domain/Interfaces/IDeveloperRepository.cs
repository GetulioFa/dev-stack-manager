using DevStackManager.Domain.Entities;
using DevStackManager.Domain.Enums;

namespace DevStackManager.Domain.Interfaces
{
    public interface IDeveloperRepository
    {
        Task<Developer?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
        Task<(IEnumerable<Developer> Items, int TotalCount)> GetPagedAsync(
            int page,
            int pageSize,
            Seniority? seniority = null,
            Guid? cityId = null,
            Guid? languageId = null,
            CancellationToken cancellationToken = default);
        Task<IEnumerable<Developer>> GetAllForExportAsync(CancellationToken cancellationToken = default);
        Task AddAsync(Developer developer, CancellationToken cancellationToken = default);
        void Update(Developer developer);
    }
}
