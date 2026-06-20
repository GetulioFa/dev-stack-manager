using DevStackManager.Application.DTOs;
using DevStackManager.Domain.Common;
using DevStackManager.Domain.Entities;
using DevStackManager.Domain.Enums;
using DevStackManager.Domain.Interfaces;
using MediatR;

namespace DevStackManager.Application.Languages.Commands;

public record CreateLanguageCommand(string Name, LanguageType Type) : IRequest<Result<LanguageDto>>;
public sealed class CreateLanguageCommandHandler(
    ILanguageRepository languageRepository,
    IUnitOfWork unitOfWork
) : IRequestHandler<CreateLanguageCommand, Result<LanguageDto>>
{
    public async Task<Result<LanguageDto>> Handle(CreateLanguageCommand request, CancellationToken ct)
    {
        var result = ProgrammingLanguage.Create(request.Name, request.Type);
        if (result.IsFailure) return Result<LanguageDto>.Failure(result.Error!);

        await languageRepository.AddAsync(result.Value, ct);
        await unitOfWork.SaveChangesAsync(ct);

        return Result<LanguageDto>.Success(Map(result.Value));
    }

    internal static LanguageDto Map(ProgrammingLanguage l) =>
        new(l.Id, l.Name, l.Type, l.Type.ToString(), l.CreatedAt);
}