using DevStackManager.Domain.Common;
using DevStackManager.Domain.Interfaces;
using MediatR;

namespace DevStackManager.Application.Developers.Commands;

public record DeleteDeveloperCommand(Guid Id) : IRequest<Result>;

public sealed class DeleteDeveloperCommandHandler(
    IDeveloperRepository developerRepository,
    IUnitOfWork unitOfWork
) : IRequestHandler<DeleteDeveloperCommand, Result>
{
    public async Task<Result> Handle(DeleteDeveloperCommand request, CancellationToken cancellationToken)
    {
        var developer = await developerRepository.GetByIdAsync(request.Id, cancellationToken);
        if (developer is null) return Result.Failure("Desenvolvedor não encontrado.");

        var deleteResult = developer.SoftDelete();
        if (deleteResult.IsFailure) return deleteResult;

        developerRepository.Update(developer);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}