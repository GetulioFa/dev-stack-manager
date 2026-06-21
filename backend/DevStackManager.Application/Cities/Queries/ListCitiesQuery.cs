
using DevStackManager.Application.DTOs;
using DevStackManager.Domain.Common;
using DevStackManager.Domain.Interfaces;
using MediatR;

namespace DevStackManager.Application.Cities.Queries;

public record ListCitiesQuery(int Page = 1, int PageSize = 10, Guid? StateId = null)
    : IRequest<Result<PagedResultDto<CityDto>>>;

public sealed class Handler(ICityRepository cityRepository)
    : IRequestHandler<ListCitiesQuery, Result<PagedResultDto<CityDto>>>
{
    public async Task<Result<PagedResultDto<CityDto>>> Handle(ListCitiesQuery request, CancellationToken ct)
    {
        var page = Math.Max(1, request.Page);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);

        var (items, totalCount) = await cityRepository.GetPagedAsync(page, pageSize, request.StateId, ct);
        var dtos = items.Select(c =>
            new CityDto(c.Id, c.Name, c.StateId, c.State.Name, c.State.UF, c.CreatedAt));

        return Result<PagedResultDto<CityDto>>.Success(
            new PagedResultDto<CityDto>(dtos, page, pageSize, totalCount,
                (int)Math.Ceiling(totalCount / (double)pageSize)));
    }
}