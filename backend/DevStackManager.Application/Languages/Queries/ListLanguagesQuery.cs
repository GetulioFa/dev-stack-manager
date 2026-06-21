using DevStackManager.Application.DTOs;
using DevStackManager.Application.Languages.Commands;
using DevStackManager.Domain.Common;
using DevStackManager.Domain.Enums;
using DevStackManager.Domain.Interfaces;
using MediatR;

namespace DevStackManager.Application.Languages.Queries;

public record ListLanguagesQuery(int Page = 1, int PageSize = 10, LanguageType? Type = null)
    : IRequest<Result<PagedResultDto<LanguageDto>>>;

public sealed class ListLanguagesQueryHandler(ILanguageRepository languageRepository)
    : IRequestHandler<ListLanguagesQuery, Result<PagedResultDto<LanguageDto>>>
{
    public async Task<Result<PagedResultDto<LanguageDto>>> Handle(ListLanguagesQuery request, CancellationToken cancellationToken)
    {
        var page = Math.Max(1, request.Page);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);

        var (items, totalCount) = await languageRepository.GetPagedAsync(page, pageSize, request.Type, cancellationToken);
        var dtos = items.Select(CreateLanguageCommandHandler.Map);

        return Result<PagedResultDto<LanguageDto>>.Success(
            new PagedResultDto<LanguageDto>(dtos, page, pageSize, totalCount,
                (int)Math.Ceiling(totalCount / (double)pageSize)));
    }
}