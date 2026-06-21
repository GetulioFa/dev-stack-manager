using DevStackManager.Application.DTOs;
using DevStackManager.Application.Languages.Commands;
using DevStackManager.Domain.Common;
using DevStackManager.Domain.Interfaces;
using MediatR;

namespace DevStackManager.Application.Developers.Queries;

public record GetDeveloperByEmailQuery(string Email) : IRequest<Result<DeveloperDto>>;

public sealed class GetDeveloperByEmailQueryHandler(IDeveloperRepository developerRepository)
    : IRequestHandler<GetDeveloperByEmailQuery, Result<DeveloperDto>>
{
    public async Task<Result<DeveloperDto>> Handle(
        GetDeveloperByEmailQuery request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
            return Result<DeveloperDto>.Failure("O e-mail não pode ser vazio.");

        var dev = await developerRepository.GetByEmailAsync(request.Email.Trim().ToLowerInvariant(), cancellationToken);
        
        if (dev is null)
            return Result<DeveloperDto>.Failure("Desenvolvedor não encontrado.");

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