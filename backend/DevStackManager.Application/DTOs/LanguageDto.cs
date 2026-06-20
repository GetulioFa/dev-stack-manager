using DevStackManager.Domain.Enums;

namespace DevStackManager.Application.DTOs
{
    public record LanguageDto(Guid Id, string Name, LanguageType Type, string TypeLabel, DateTime CreatedAt);
}
