using DevStackManager.Application.DTOs;
using DevStackManager.Domain.Common;
using DevStackManager.Domain.Interfaces;
using MediatR;

namespace DevStackManager.Application.Users.Queries;

public record GetUserByIdQuery(Guid Id) : IRequest<Result<UserDto>>;

public record GetUserByEmailQuery(string Email): IRequest<Result<UserDto>>;

public sealed class GetUserByIdQueryHandler(IUserRepository userRepository)
    : IRequestHandler<GetUserByIdQuery, Result<UserDto>>
{
    public async Task<Result<UserDto>> Handle(
        GetUserByIdQuery request,
        CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByIdAsync(request.Id, cancellationToken);
        if (user is null)
            return Result<UserDto>.Failure("Usuário não encontrado.");

        return Result<UserDto>.Success(
            new UserDto(user.Id, user.Name, user.Email, user.CreatedAt, user.UpdatedAt));
    }
}
public record ListUsersQuery(int Page = 1, int PageSize = 10) : IRequest<Result<PagedResultDto<UserDto>>>;

public sealed class ListUsersQueryHandler(IUserRepository userRepository)
    : IRequestHandler<ListUsersQuery, Result<PagedResultDto<UserDto>>>
{
    public async Task<Result<PagedResultDto<UserDto>>> Handle(
        ListUsersQuery request,
        CancellationToken cancellationToken)
    {
        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = request.PageSize is < 1 or > 100 ? 10 : request.PageSize;

        var (items, totalCount) = await userRepository.GetPagedAsync(page, pageSize, cancellationToken);

        var dtos = items.Select(u =>
            new UserDto(u.Id, u.Name, u.Email, u.CreatedAt, u.UpdatedAt));

        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        return Result<PagedResultDto<UserDto>>.Success(
            new PagedResultDto<UserDto>(dtos, page, pageSize, totalCount, totalPages));
    }
}
