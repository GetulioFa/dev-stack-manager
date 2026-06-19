using DevStackManager.Domain.Entities;

namespace DevStackManager.Domain.Interfaces
{
    public interface ITokenService
    {
        string GenerateToken(User user);
    }
}
