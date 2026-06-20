using DevStackManager.Domain.Common;
using DevStackManager.Domain.Enums;

namespace DevStackManager.Domain.Entities;

public sealed class ProgrammingLanguage
{
    private ProgrammingLanguage() { }

    private ProgrammingLanguage(string name, LanguageType type)
    {
        Id = Guid.NewGuid();
        Name = name;
        Type = type;
        CreatedAt = DateTime.UtcNow;
        IsDeleted = false;
    }

    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public LanguageType Type { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    public bool IsDeleted { get; private set; }
    public DateTime? DeletedAt { get; private set; }

    // Navigation (join table managed by Developer)
    public ICollection<DeveloperLanguage> DeveloperLanguages { get; private set; } = [];

    public static Result<ProgrammingLanguage> Create(string name, LanguageType type)
    {
        if (string.IsNullOrWhiteSpace(name))
            return Result<ProgrammingLanguage>.Failure("O nome da linguagem não pode ser vazio.");

        if (!Enum.IsDefined(type))
            return Result<ProgrammingLanguage>.Failure("O tipo de linguagem informado é inválido.");

        return Result<ProgrammingLanguage>.Success(new ProgrammingLanguage(name.Trim(), type));
    }

    public Result Update(string name, LanguageType type)
    {
        if (string.IsNullOrWhiteSpace(name))
            return Result.Failure("O nome da linguagem não pode ser vazio.");

        if (!Enum.IsDefined(type))
            return Result.Failure("O tipo de linguagem informado é inválido.");

        Name = name.Trim();
        Type = type;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result SoftDelete()
    {
        if (IsDeleted)
            return Result.Failure("A linguagem já foi excluída.");

        IsDeleted = true;
        DeletedAt = DateTime.UtcNow;

        return Result.Success();
    }
}