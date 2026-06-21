using DevStackManager.Application.DTOs;
using DevStackManager.Application.Languages.Commands;
using DevStackManager.Domain.Common;
using DevStackManager.Domain.Interfaces;
using MediatR;

namespace DevStackManager.Application.Languages.Queries;

public record GetLanguageByIdQuery(Guid Id) : IRequest<Result<LanguageDto>>;

public sealed class GetLanguageByIdQueryHandler(ILanguageRepository languageRepository)
    : IRequestHandler<GetLanguageByIdQuery, Result<LanguageDto>>
{
    public async Task<Result<LanguageDto>> Handle(GetLanguageByIdQuery request, CancellationToken cancellationToken)
    {
        var lang = await languageRepository.GetByIdAsync(request.Id, cancellationToken);
        return lang is null
            ? Result<LanguageDto>.Failure("Linguagem não encontrada.")
            : Result<LanguageDto>.Success(CreateLanguageCommandHandler.Map(lang));
    }
}