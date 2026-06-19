using DevStackManager.Application.DTOs;
using DevStackManager.Domain.Common;
using DevStackManager.Domain.Interfaces;
using MediatR;

namespace DevStackManager.Application.Users.Commands;
public record LoginUserCommand(
string Email,
string Password
) : IRequest<Result<AuthTokenDto>>;

public sealed class LoginUserCommandHandler(
    IUserRepository userRepository,
    IPasswordHasher passwordHasher,
    ITokenService tokenService
) : IRequestHandler<LoginUserCommand, Result<AuthTokenDto>>
{
    public async Task<Result<AuthTokenDto>> Handle(
        LoginUserCommand request,
        CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByEmailAsync(request.Email, cancellationToken);

        if (user is null || !passwordHasher.Verify(request.Password, user.PasswordHash))
            return Result<AuthTokenDto>.Failure("E-mail ou senha inválidos.");

        var token = tokenService.GenerateToken(user);
        var expiresAt = DateTime.UtcNow.AddHours(2);

        var userDto = new UserDto(user.Id, user.Name, user.Email, user.CreatedAt, user.UpdatedAt);
        var authToken = new AuthTokenDto(token, "Bearer", expiresAt, userDto);

        return Result<AuthTokenDto>.Success(authToken);
    }
}