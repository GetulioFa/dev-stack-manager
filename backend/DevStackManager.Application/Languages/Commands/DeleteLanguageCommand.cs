using DevStackManager.Domain.Common;
using DevStackManager.Domain.Interfaces;
using MediatR;

namespace DevStackManager.Application.Languages.Commands;

public record DeleteLanguageCommand(Guid Id) : IRequest<Result>;

public sealed class DeleteLanguageCommandHandler(
    ILanguageRepository languageRepository,
    IUnitOfWork unitOfWork
) : IRequestHandler<DeleteLanguageCommand, Result>
{
    public async Task<Result> Handle(DeleteLanguageCommand request, CancellationToken cancellationToken)
    {
        var language = await languageRepository.GetByIdAsync(request.Id, cancellationToken);
        if (language is null) return Result.Failure("Linguagem não encontrada.");

        var deleteResult = language.SoftDelete();
        if (deleteResult.IsFailure) return deleteResult;

        languageRepository.Update(language);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}