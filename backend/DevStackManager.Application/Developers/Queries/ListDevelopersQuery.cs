using DevStackManager.Application.DTOs;
using DevStackManager.Application.Languages.Commands;
using DevStackManager.Domain.Common;
using DevStackManager.Domain.Enums;
using DevStackManager.Domain.Interfaces;
using MediatR;

namespace DevStackManager.Application.Developers.Queries;

public record ListDevelopersQuery(
    int Page = 1,
    int PageSize = 10,
    Seniority? Seniority = null,
    Guid? CityId = null,
    Guid? LanguageId = null
) : IRequest<Result<PagedResultDto<DeveloperDto>>>;

public sealed class ListDevelopersQueryHandler(IDeveloperRepository developerRepository)
    : IRequestHandler<ListDevelopersQuery, Result<PagedResultDto<DeveloperDto>>>
{
    public async Task<Result<PagedResultDto<DeveloperDto>>> Handle(ListDevelopersQuery request, CancellationToken ct)
    {
        var page = Math.Max(1, request.Page);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);

        var (items, totalCount) = await developerRepository.GetPagedAsync(
            page, pageSize, request.Seniority, request.CityId, request.LanguageId, ct);

        var dtos = items.Select(dev =>
        {
            var languages = dev.DeveloperLanguage
                .Select(dl => dl.ProgrammingLanguage)
                .ToList();

            return new DeveloperDto(
                dev.Id, dev.Name, dev.Email, dev.Seniority, dev.Seniority.ToString(),
                dev.CityId, dev.City.Name, dev.City.State?.UF ?? string.Empty,
                languages.Select(CreateLanguageCommandHandler.Map),
                dev.CreatedAt);
        });

        return Result<PagedResultDto<DeveloperDto>>.Success(
            new PagedResultDto<DeveloperDto>(dtos, page, pageSize, totalCount,
                (int)Math.Ceiling(totalCount / (double)pageSize)));
    }
}