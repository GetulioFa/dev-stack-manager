using DevStackManager.Domain.Common;
using System.Xml.Linq;

namespace DevStackManager.Domain.Entities;

public sealed class City
{
    private City() { }

    private City(string name, Guid stateId)
    {
        Id = Guid.NewGuid();
        Name = name;
        StateId = stateId;
        CreatedAt = DateTime.UtcNow;
        IsDeleted = false;
    }

    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public Guid StateId { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    public bool IsDeleted { get; private set; }
    public DateTime? DeletedAt { get; private set; }

    // Navigation
    public State State { get; private set; } = null!;
    public ICollection<Developer> Developers { get; private set; } = [];

    public static Result<City> Create(string name, Guid stateId)
    {
        if (string.IsNullOrWhiteSpace(name))
            return Result<City>.Failure("O nome da cidade não pode ser vazio.");

        if (stateId == Guid.Empty)
            return Result<City>.Failure("O estado é obrigatório.");

        return Result<City>.Success(new City(name.Trim(), stateId));
    }

    public Result Update(string name, Guid stateId)
    {
        if (string.IsNullOrWhiteSpace(name))
            return Result.Failure("O nome da cidade não pode ser vazio.");

        if (stateId == Guid.Empty)
            return Result.Failure("O estado é obrigatório.");

        Name = name.Trim();
        StateId = stateId;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result SoftDelete()
    {
        if (IsDeleted)
            return Result.Failure("A cidade já foi excluída.");

        IsDeleted = true;
        DeletedAt = DateTime.UtcNow;

        return Result.Success();
    }
}