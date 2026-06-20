using DevStackManager.Domain.Entities;
using DevStackManager.Domain.Enums;

namespace DevStackManager.Domain.Interfaces;

public interface ILanguageRepository 
{
    Task<ProgrammingLanguage?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IEnumerable<ProgrammingLanguage>> GetByIdsAsync(IEnumerable<Guid> ids, CancellationToken ct = default);
    Task<(IEnumerable<ProgrammingLanguage> Items, int TotalCount)> GetPagedAsync(int page, int pageSize, LanguageType? type = null, CancellationToken ct = default);
    Task AddAsync(ProgrammingLanguage language, CancellationToken ct = default);
    void Update(ProgrammingLanguage language);
}