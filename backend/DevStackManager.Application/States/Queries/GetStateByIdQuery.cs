using DevStackManager.Application.DTOs;
using DevStackManager.Application.States.Commands;
using DevStackManager.Domain.Common;
using DevStackManager.Domain.Interfaces;
using MediatR;

namespace DevStackManager.Application.States.Queries;

public record GetStateByIdQuery(Guid Id) : IRequest<Result<StateDto>>;

public sealed class GetStateByIdQueryHandler(IStateRepository stateRepository)
    : IRequestHandler<GetStateByIdQuery, Result<StateDto>>
{
    public async Task<Result<StateDto>> Handle(GetStateByIdQuery request, CancellationToken ct)
    {
        var state = await stateRepository.GetByIdAsync(request.Id, ct);
        return state is null
            ? Result<StateDto>.Failure("Estado não encontrado.")
            : Result<StateDto>.Success(CreateStateCommandHandler.Map(state));
    }
}