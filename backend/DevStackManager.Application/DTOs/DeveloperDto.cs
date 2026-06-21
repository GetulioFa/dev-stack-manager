using DevStackManager.Domain.Enums;

namespace DevStackManager.Application.DTOs
{
    public record DeveloperDto(
        Guid Id,
        string Name,
        string Email,
        Seniority Seniority,
        string SeniorityLabel,
        Guid CityId,
        string CityName,
        string StateUF,
        IEnumerable<LanguageDto> Languages,
        DateTime CreatedAt
    );

    public record DeveloperExportDto(
        string Name,
        string Email,
        string Seniority,
        string City,
        string State,
        string Languages,
        DateTime CreatedAt
    );
}
