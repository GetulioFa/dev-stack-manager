using DevStackManager.Application.DTOs;
using DevStackManager.Application.Languages.Commands;
using DevStackManager.Domain.Entities;

namespace DevStackManager.Application.Developers.Mappings;

public static class DeveloperMapper
{
    public static DeveloperDto ToDto(this Developer developer, City city, List<ProgrammingLanguage> languages)
    {
        return new DeveloperDto(
            developer.Id,
            developer.Name,
            developer.Email, 
            developer.Seniority,
            developer.Seniority.ToString(),
            developer.CityId,
            city.Name,
            city.State?.UF ?? string.Empty,
            languages.Select(CreateLanguageCommandHandler.Map), // mover esse Map de linguagem para cá também!
            developer.CreatedAt
        );
    }
}
