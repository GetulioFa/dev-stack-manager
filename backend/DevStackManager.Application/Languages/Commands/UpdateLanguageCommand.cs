using DevStackManager.Application.DTOs;
using DevStackManager.Domain.Common;
using DevStackManager.Domain.Enums;
using DevStackManager.Domain.Interfaces;
using MediatR;

namespace DevStackManager.Application.Languages.Commands;

public record UpdateLanguageCommand(Guid Id, string Name, LanguageType Type) : IRequest<Result<LanguageDto>>;

public sealed class UpdateLanguageCommandHandler(
    ILanguageRepository languageRepository,
    IUnitOfWork unitOfWork
) : IRequestHandler<UpdateLanguageCommand, Result<LanguageDto>>
{
    public async Task<Result<LanguageDto>> Handle(UpdateLanguageCommand request, CancellationToken cancellationToken)
    {
        var language = await languageRepository.GetByIdAsync(request.Id, cancellationToken);
        if (language is null) return Result<LanguageDto>.Failure("Linguagem não encontrada.");

        var updateResult = language.Update(request.Name, request.Type);
        if (updateResult.IsFailure) return Result<LanguageDto>.Failure(updateResult.Error!);

        languageRepository.Update(language);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<LanguageDto>.Success(CreateLanguageCommandHandler.Map(language));
    }
}