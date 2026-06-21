using DevStackManager.Application.DTOs;
using DevStackManager.Domain.Common;
using DevStackManager.Domain.Entities;
using DevStackManager.Domain.Interfaces;
using MediatR;

namespace DevStackManager.Application.Cities.Command;

public record CreateCityCommand(string Name, Guid StateId) : IRequest<Result<CityDto>>;

public sealed class CreateCityCommandHandler(
    ICityRepository cityRepository,
    IStateRepository stateRepository,
    IUnitOfWork unitOfWork
) : IRequestHandler<CreateCityCommand, Result<CityDto>>
{
    public async Task<Result<CityDto>> Handle(CreateCityCommand request, CancellationToken ct)
    {
        var state = await stateRepository.GetByIdAsync(request.StateId, ct);
        if (state is null)
            return Result<CityDto>.Failure("Estado não encontrado.");

        var result = City.Create(request.Name, request.StateId);
        if (result.IsFailure)
            return Result<CityDto>.Failure(result.Error!);

        await cityRepository.AddAsync(result.Value, ct);
        await unitOfWork.SaveChangesAsync(ct);

        return Result<CityDto>.Success(Map(result.Value, state.Name, state.UF));
    }

    internal static CityDto Map(City c, string stateName, string stateUF) =>
        new(c.Id, c.Name, c.StateId, stateName, stateUF, c.CreatedAt);
}