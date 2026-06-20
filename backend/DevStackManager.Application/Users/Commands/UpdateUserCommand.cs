using DevStackManager.Application.DTOs;
using DevStackManager.Domain.Common;
using DevStackManager.Domain.Interfaces;
using MediatR;

namespace DevStackManager.Application.Users.Commands;

public record UpdateUserCommand(
    string CurrentEmail,
    string Name,
    string Email
) : IRequest<Result<UserDto>>;

public sealed class UpdateUserCommandHandler(
    IUserRepository userRepository,
    IUnitOfWork unitOfWork
) : IRequestHandler<UpdateUserCommand, Result<UserDto>>
{
    public async Task<Result<UserDto>> Handle(
        UpdateUserCommand request,
        CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByEmailAsync(request.CurrentEmail, cancellationToken);
        if (user is null)
            return Result<UserDto>.Failure("Usuário não encontrado.");

        var emailOwner = await userRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (emailOwner is not null && emailOwner.Id != user.Id)
            return Result<UserDto>.Failure("Já existe um usuário cadastrado com este e-mail.");

        var updateResult = user.Update(request.Name, request.Email);
        if (updateResult.IsFailure)
            return Result<UserDto>.Failure(updateResult.Error!);

        userRepository.Update(user);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<UserDto>.Success(new UserDto(user.Id, user.Name, user.Email, user.CreatedAt, user.UpdatedAt));
    }
}