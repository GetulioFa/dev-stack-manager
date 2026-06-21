using DevStackManager.Application.DTOs;
using DevStackManager.Application.Languages.Commands;
using DevStackManager.Domain.Common;
using DevStackManager.Domain.Interfaces;
using MediatR;

namespace DevStackManager.Application.Developers.Queries;

public record GetDeveloperByIdQuery(Guid Id) : IRequest<Result<DeveloperDto>>;

public sealed class GetDeveloperByIdQueryHandler(IDeveloperRepository developerRepository)
    : IRequestHandler<GetDeveloperByIdQuery, Result<DeveloperDto>>
{
    public async Task<Result<DeveloperDto>> Handle(GetDeveloperByIdQuery request, CancellationToken cancellationToken)
    {
        var dev = await developerRepository.GetByIdAsync(request.Id, cancellationToken);
        if (dev is null) return Result<DeveloperDto>.Failure("Desenvolvedor não encontrado.");

        var languages = dev.DeveloperLanguage
            .Select(dl => dl.ProgrammingLanguage)
            .ToList();

        return Result<DeveloperDto>.Success(new DeveloperDto(
            dev.Id, dev.Name, dev.Email, dev.Seniority, dev.Seniority.ToString(),
            dev.CityId, dev.City.Name, dev.City.State?.UF ?? string.Empty,
            languages.Select(CreateLanguageCommandHandler.Map),
            dev.CreatedAt));
    }
}