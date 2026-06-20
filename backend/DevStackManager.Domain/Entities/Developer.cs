using DevStackManager.Domain.Common;
using DevStackManager.Domain.Enums;

namespace DevStackManager.Domain.Entities
{
    public sealed class Developer
    {
        private Developer() { }

        private Developer(string name, string email, Seniority seniority, Guid cityId) 
        { 
            Id = Guid.NewGuid();
            Name = name;
            Email = email;
            Seniority = seniority;
            CityId = cityId;
            CreatedAt = DateTime.UtcNow;
            IsDeleted = false;
            _developerLanguages = [];
        }

        public Guid Id { get; private set; }
        public string Name { get; private set; } = string.Empty;
        public string Email { get; private set; }
        public Seniority Seniority { get; private set;  }
        public Guid CityId { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime? UpdatedAt { get; private set; }
        public bool IsDeleted { get; private set; }
        public DateTime? DeletedAt { get; private set; }

        // Navigation
        public City City { get; private set; } = null;

        private readonly List<DeveloperLanguage> _developerLanguages;

        public IReadOnlyCollection<DeveloperLanguage> DeveloperLanguage =>
            _developerLanguages.AsReadOnly();

        public static Result<Developer> Create(string name, string email, Seniority seniority, Guid cityId, IEnumerable<Guid> languageIds)
        {
            var languageList = languageIds?.ToList() ?? [];

            if (string.IsNullOrWhiteSpace(name))
                return Result<Developer>.Failure("O nome do desenvolvedor não pode ser vazio.");

            if (!IsValidEmail(email))
                return Result<Developer>.Failure("O e-mail informado não é válido.");

            if (!Enum.IsDefined(seniority))
                return Result<Developer>.Failure("A senioridade informada é inválida.");

            if (cityId == Guid.Empty)
                return Result<Developer>.Failure("A cidade é obrigatória.");

            if (languageList.Count == 0)
                return Result<Developer>.Failure("O desenvolvedor deve ter ao menos uma linguagem de programação associada.");

            if (languageList.Any(id => id == Guid.Empty))
                return Result<Developer>.Failure("Um ou mais IDs de linguagem são inválidos.");

            var developer = new Developer(name.Trim(), email, seniority, cityId);

            foreach (var langId in languageList.Distinct())
                developer._developerLanguages.Add(new DeveloperLanguage(developer.Id, langId));

            return Result<Developer>.Success(developer);
        }
        public Result Update(string name, string email, Seniority seniority, Guid cityId, IEnumerable<Guid> languageIds)
        {
            var languageList = languageIds?.ToList() ?? [];

            if (string.IsNullOrWhiteSpace(name))
                return Result.Failure("O nome do desenvolvedor não pode ser vazio.");

            if (string.IsNullOrWhiteSpace(email))
                return Result.Failure("O e-mail não pode ser vazio.");

            if (!IsValidEmail(email))
                return Result.Failure("O e-mail informado não é válido.");

            if (!Enum.IsDefined(seniority))
                return Result.Failure("A senioridade informada é inválida.");

            if (cityId == Guid.Empty)
                return Result.Failure("A cidade é obrigatória.");

            if (languageList.Count == 0)
                return Result.Failure("O desenvolvedor deve ter ao menos uma linguagem de programação associada.");

            if (languageList.Any(id => id == Guid.Empty))
                return Result.Failure("Um ou mais IDs de linguagem são inválidos.");

            Name = name.Trim();
            Email = email.ToLowerInvariant();
            Seniority = seniority;
            CityId = cityId;
            UpdatedAt = DateTime.UtcNow;

            _developerLanguages.Clear();
            foreach (var langId in languageList.Distinct())
                _developerLanguages.Add(new DeveloperLanguage(Id, langId));

            return Result.Success();
        }

        public Result SoftDelete()
        {
            if (IsDeleted)
                return Result.Failure("O desenvolvedor já foi excluído.");

            IsDeleted = true;
            DeletedAt = DateTime.UtcNow;

            return Result.Success();
        }

        private static bool IsValidEmail(string email)
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);

                return addr.Address == email.ToLowerInvariant();
            }
            catch { return false; }
        }
    }
}
