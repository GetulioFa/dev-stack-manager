
using DevStackManager.Domain.Common;
using System.Xml.Linq;

namespace DevStackManager.Domain.Entities
{
    public sealed class State
    {
        private State() { }

        private State(string name, string uf)
        {
            Id = Guid.NewGuid();
            Name = name;
            UF = uf.ToUpperInvariant();
            CreatedAt = DateTime.UtcNow;
            IsDeleted = false;
        }

        public Guid Id { get; private set; }
        public string Name { get; private set; } = string.Empty;
        public string UF { get; private set; } = string.Empty;
        public DateTime CreatedAt { get; private set; }
        public DateTime? UpdatedAt { get; private set; }
        public bool IsDeleted { get; private set; }
        public DateTime? DeletedAt { get; private set; }

        public ICollection<City> Cities { get; private set; } = [];

        public static Result<State> Create(string name, string uf)
        {
            if (string.IsNullOrWhiteSpace(name))
                return Result<State>.Failure("O nome do estado não pode ser vazio.");

            if (string.IsNullOrWhiteSpace(uf) || uf.Trim().Length != 2)
                return Result<State>.Failure("A UF deve conter exatamente 2 caracteres.");

            if (!uf.Trim().All(char.IsLetter))
                return Result<State>.Failure("A UF deve conter apenas letras.");

            return Result<State>.Success(new State(name.Trim(), uf.Trim()));
        }

        public Result Update(string name, string uf)
        {
            if (string.IsNullOrWhiteSpace(name))
                return Result.Failure("O nome do estado não pode ser vazio.");

            if (string.IsNullOrWhiteSpace(uf) || uf.Trim().Length != 2)
                return Result.Failure("A UF deve conter exatamente 2 caracteres.");

            if (!uf.Trim().All(char.IsLetter))
                return Result.Failure("A UF deve conter apenas letras.");

            Name = name.Trim();
            UF = uf.Trim().ToUpperInvariant();
            UpdatedAt = DateTime.UtcNow;

            return Result.Success();
        }

        public Result SoftDelete()
        {
            if (IsDeleted)
                return Result.Failure("O estado já foi excluído.");

            IsDeleted = true;
            DeletedAt = DateTime.UtcNow;

            return Result.Success();
        }
    }
}
