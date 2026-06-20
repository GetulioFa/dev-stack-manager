using DevStackManager.Application.DTOs;
using DevStackManager.Domain.Common;
using DevStackManager.Domain.Interfaces;
using MediatR;

namespace DevStackManager.Application.States.Commands;

public record UpdateStateCommand(Guid Id, string Name, string UF) : IRequest<Result<StateDto>>;

public sealed class UpdateStateCommandHandler(
    IStateRepository stateRepository,
    IUnitOfWork unitOfWork
) : IRequestHandler<UpdateStateCommand, Result<StateDto>>
{
    public async Task<Result<StateDto>> Handle(UpdateStateCommand request, CancellationToken ct)
    {
        var state = await stateRepository.GetByIdAsync(request.Id, ct);
        if (state is null)
            return Result<StateDto>.Failure("Estado não encontrado.");

        var ufOwner = await stateRepository.GetByUFAsync(request.UF, ct);
        if (ufOwner is not null && ufOwner.Id != request.Id)
            return Result<StateDto>.Failure($"Já existe um estado cadastrado com a UF '{request.UF.ToUpperInvariant()}'.");

        var updateResult = state.Update(request.Name, request.UF);
        if (updateResult.IsFailure)
            return Result<StateDto>.Failure(updateResult.Error!);

        stateRepository.Update(state);
        await unitOfWork.SaveChangesAsync(ct);

        return Result<StateDto>.Success(CreateStateCommandHandler.Map(state));
    }
}