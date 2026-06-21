using DevStackManager.Application.DTOs;
using DevStackManager.Application.States.Commands;
using DevStackManager.Domain.Common;
using DevStackManager.Domain.Interfaces;
using MediatR;

namespace DevStackManager.Application.States.Queries;

public record ListStatesQuery(int Page = 1, int PageSize = 10)
    : IRequest<Result<PagedResultDto<StateDto>>>;

public sealed class ListStatesQueryHandler(IStateRepository stateRepository)
    : IRequestHandler<ListStatesQuery, Result<PagedResultDto<StateDto>>>
{
    public async Task<Result<PagedResultDto<StateDto>>> Handle(ListStatesQuery request, CancellationToken ct)
    {
        var page = Math.Max(1, request.Page);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);

        var (items, totalCount) = await stateRepository.GetPagedAsync(page, pageSize, ct);
        var dtos = items.Select(CreateStateCommandHandler.Map);
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        return Result<PagedResultDto<StateDto>>.Success(
            new PagedResultDto<StateDto>(dtos, page, pageSize, totalCount, totalPages));
    }
}