using DevStackManager.Domain.Common;

namespace DevStackManager.Domain.Entities
{
    public sealed class User
    {
        private User() { }

        private User(string name, string email, string passwordHash)
        {
            Id = Guid.NewGuid();
            Name = name;
            Email = email;
            PasswordHash = passwordHash;
            CreatedAt = DateTime.UtcNow;
            IsDeleted = false;
        }
        public Guid Id { get; private set; }
        public string Name { get; private set; } = string.Empty;
        public string Email { get; private set; } = string.Empty;
        public string PasswordHash { get; private set; } = string.Empty;
        public DateTime CreatedAt { get; private set; }
        public DateTime? UpdatedAt { get; private set; }
        public bool IsDeleted { get; private set; }
        public DateTime? DeletedAt { get; private set; }

        public static Result<User> Create(string name, string email, string passwordHash)
        {
            if (string.IsNullOrWhiteSpace(name))
                return Result<User>.Failure("O nome não pode ser vazio.");

            if (string.IsNullOrWhiteSpace(email))
                return Result<User>.Failure("O e-mail não pode ser vazio.");

            if (!IsValidEmail(email))
                return Result<User>.Failure("O e-mail informado não é válido.");

            if (string.IsNullOrWhiteSpace(passwordHash))
                return Result<User>.Failure("A senha precisa ser informada.");

            return Result<User>.Success(new User(name, email.ToLowerInvariant(), passwordHash));
        }

        public Result Update(string name, string email)
        {
            if (string.IsNullOrWhiteSpace(name))
                return Result.Failure("O nome não pode ser vazio.");

            if (string.IsNullOrWhiteSpace(email))
                return Result.Failure("O e-mail não pode ser vazio.");

            if (!IsValidEmail(email))
                return Result.Failure("O e-mail informado não é válido.");

            Name =  name;
            Email = email;
            UpdatedAt = DateTime.UtcNow;

            return Result<User>.Success();
        }

        public Result SoftDelete()
        {
            if (IsDeleted)
                return Result.Failure("O usuário já foi excluído.");

            IsDeleted = true;
            DeletedAt = DateTime.UtcNow;

            return Result.Success();
        }

        private static bool IsValidEmail(string email)
        {
            try
            {
                var address = new System.Net.Mail.MailAddress(email);
                return string.Equals(address.Address, email, StringComparison.OrdinalIgnoreCase);
            }
            catch
            {
                return false;
            }
        }
    }
}
