using DevStackManager.Domain.Common;
using DevStackManager.Domain.Interfaces;
using MediatR;

namespace DevStackManager.Application.States.Commands;

public record DeleteStateCommand(Guid Id) : IRequest<Result>;

public sealed class DeleteStateCommandHandler(
    IStateRepository stateRepository,
    IUnitOfWork unitOfWork
) : IRequestHandler<DeleteStateCommand, Result>
{
    public async Task<Result> Handle(DeleteStateCommand request, CancellationToken ct)
    {
        var state = await stateRepository.GetByIdAsync(request.Id, ct);
        if (state is null)
            return Result.Failure("Estado não encontrado.");

        var deleteResult = state.SoftDelete();
        if (deleteResult.IsFailure)
            return deleteResult;

        stateRepository.Update(state);
        await unitOfWork.SaveChangesAsync(ct);

        return Result.Success();
    }
}