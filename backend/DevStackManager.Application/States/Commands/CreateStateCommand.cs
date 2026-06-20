using DevStackManager.Application.DTOs;
using DevStackManager.Domain.Common;
using DevStackManager.Domain.Entities;
using DevStackManager.Domain.Interfaces;
using MediatR;

namespace DevStackManager.Application.States.Commands;

public record CreateStateCommand(string Name, string UF) : IRequest<Result<StateDto>>;

public sealed class CreateStateCommandHandler(
    IStateRepository stateRepository,
    IUnitOfWork unitOfWork
) : IRequestHandler<CreateStateCommand, Result<StateDto>>
{
    public async Task<Result<StateDto>> Handle(CreateStateCommand request, CancellationToken ct)
    {
        var existing = await stateRepository.GetByUFAsync(request.UF, ct);
        if (existing is not null)
            return Result<StateDto>.Failure($"Já existe um estado cadastrado com a UF '{request.UF.ToUpperInvariant()}'.");

        var result = State.Create(request.Name, request.UF);
        if (result.IsFailure)
            return Result<StateDto>.Failure(result.Error!);

        await stateRepository.AddAsync(result.Value, ct);
        await unitOfWork.SaveChangesAsync(ct);

        return Result<StateDto>.Success(Map(result.Value));
    }

    internal static StateDto Map(State s) => new(s.Id, s.Name, s.UF, s.CreatedAt);
}