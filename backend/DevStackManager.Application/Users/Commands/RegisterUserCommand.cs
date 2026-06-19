using DevStackManager.Application.DTOs;
using DevStackManager.Domain.Common;
using DevStackManager.Domain.Entities;
using DevStackManager.Domain.Interfaces;
using MediatR;

namespace DevStackManager.Application.Users.Commands
{
    public record RegisterUserCommand(string Name, string Email, string Password) : IRequest<Result<UserDto>>;
    
    public sealed class RegisterUserCommandHandler(
        IUserRepository userRepository,
        IUnitOfWork unitOfWork,
        IPasswordHasher passwordHasher
    ) : IRequestHandler<RegisterUserCommand, Result<UserDto>>
    {
        public async Task<Result<UserDto>> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
        {
            var existingUser = await userRepository.GetByEmailAsync(request.Email, cancellationToken);
            if (existingUser is not null)
                return Result<UserDto>.Failure("Já existe um usuário cadastrado com este e-mail.");

            var passwordHash = passwordHasher.Hash(request.Password);

            var userResult = User.Create(request.Name, request.Email, passwordHash);
            if (userResult.IsFailure)
                return Result<UserDto>.Failure(userResult.Error!);

            await userRepository.AddAsync(userResult.Value, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<UserDto>.Success(MapToDto(userResult.Value));
        }

        private static UserDto MapToDto(User user)
            => new(user.Id, user.Name, user.Email, user.CreatedAt, user.UpdatedAt);
    }
}
