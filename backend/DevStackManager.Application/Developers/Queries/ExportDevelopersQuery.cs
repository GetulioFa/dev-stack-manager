using DevStackManager.Application.DTOs;
using DevStackManager.Domain.Common;
using DevStackManager.Domain.Enums;
using DevStackManager.Domain.Interfaces;
using MediatR;

namespace DevStackManager.Application.Developers.Queries;

public record ExportDevelopersQuery(
    Seniority? Seniority = null,
    Guid? CityId = null,
    Guid? LanguageId = null
) : IRequest<Result<IEnumerable<DeveloperExportDto>>>;

public sealed class ExportDevelopersQueryHandler(IDeveloperRepository developerRepository)
    : IRequestHandler<ExportDevelopersQuery, Result<IEnumerable<DeveloperExportDto>>>
{
    public async Task<Result<IEnumerable<DeveloperExportDto>>> Handle(ExportDevelopersQuery request, CancellationToken ct)
    {
        var developers = await developerRepository.GetAllForExportAsync(ct);

        var filtered = developers.AsEnumerable();

        if (request.Seniority.HasValue)
            filtered = filtered.Where(d => d.Seniority == request.Seniority.Value);

        if (request.CityId.HasValue)
            filtered = filtered.Where(d => d.CityId == request.CityId.Value);

        if (request.LanguageId.HasValue)
            filtered = filtered.Where(d =>
                d.DeveloperLanguage.Any(dl => dl.ProgrammingLanguageId == request.LanguageId.Value));

        var dtos = filtered.Select(dev => new DeveloperExportDto(
            dev.Name,
            dev.Email,
            dev.Seniority.ToString(),
            dev.City.Name,
            dev.City.State?.UF ?? string.Empty,
            string.Join(", ", dev.DeveloperLanguage.Select(dl => dl.ProgrammingLanguage.Name)),
            dev.CreatedAt
        ));

        return Result<IEnumerable<DeveloperExportDto>>.Success(dtos);
    }
}