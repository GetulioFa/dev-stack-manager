using DevStackManager.Domain.Common;
using DevStackManager.Domain.Interfaces;
using MediatR;

namespace DevStackManager.Application.Developers.Commands;

public record DeleteDeveloperCommand(string Email) : IRequest<Result>;

public sealed class DeleteDeveloperCommandHandler(
    IDeveloperRepository developerRepository,
    IUnitOfWork unitOfWork
) : IRequestHandler<DeleteDeveloperCommand, Result>
{
    public async Task<Result> Handle(DeleteDeveloperCommand request, CancellationToken ct)
    {
        var developer = await developerRepository.GetByEmailAsync(request.Email, ct);
        if (developer is null) return Result.Failure("Desenvolvedor não encontrado.");

        var deleteResult = developer.SoftDelete();
        if (deleteResult.IsFailure) return deleteResult;

        developerRepository.Update(developer);
        await unitOfWork.SaveChangesAsync(ct);
        return Result.Success();
    }
}