using DevStackManager.Domain.Interfaces;
using BC = BCrypt.Net.BCrypt;

namespace DevStackManager.Infrastructure.Services
{
    public sealed class PasswordHasher : IPasswordHasher
    {
        private const int WorkFactor = 12;

        public string Hash(string password) => BC.HashPassword(password, BC.GenerateSalt(WorkFactor));

        public bool Verify(string password, string hash) => BC.Verify(password, hash);
    }
}