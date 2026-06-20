using DevStackManager.Domain.Common;
using System.Text.RegularExpressions;

namespace DevStackManager.Domain.ValueObjects
{
    public sealed class Email : IEquatable<Email>
    {
        private static readonly Regex EmailRegex = new(
        @"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.Compiled | RegexOptions.IgnoreCase);

        public string Value { get; }

        private Email(string value)
        {
            Value = value;
        }

        public static Result<Email> Create(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return Result<Email>.Failure("O e-mail não pode ser vazio.");

            string cleanedEmail = email.Trim();

            if (!EmailRegex.IsMatch(cleanedEmail))
                return Result<Email>.Failure("O formato do e-mail é inválido.");

            return Result<Email>.Success(new Email(cleanedEmail));
        }

        public bool Equals(Email? other) => other is not null && Value == other.Value;
        public override bool Equals(object? obj) => obj is Email other && Equals(other);
        public override int GetHashCode() => Value.GetHashCode();

        // Conversão para string
        public static implicit operator string(Email email) => email.Value;
    }
}
