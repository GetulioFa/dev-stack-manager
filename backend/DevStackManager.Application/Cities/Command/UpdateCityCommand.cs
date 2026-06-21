using DevStackManager.Application.DTOs;
using DevStackManager.Domain.Common;
using DevStackManager.Domain.Interfaces;
using MediatR;

namespace DevStackManager.Application.Cities.Command;

public record UpdateCityCommand(Guid Id, string Name, Guid StateId) : IRequest<Result<CityDto>>;

public sealed class UpdateCityCommandHandler(
    ICityRepository cityRepository,
    IStateRepository stateRepository,
    IUnitOfWork unitOfWork
) : IRequestHandler<UpdateCityCommand, Result<CityDto>>
{
    public async Task<Result<CityDto>> Handle(UpdateCityCommand request, CancellationToken ct)
    {
        var city = await cityRepository.GetByIdAsync(request.Id, ct);
        if (city is null)
            return Result<CityDto>.Failure("Cidade não encontrada.");

        var state = await stateRepository.GetByIdAsync(request.StateId, ct);
        if (state is null)
            return Result<CityDto>.Failure("Estado não encontrado.");

        var updateResult = city.Update(request.Name, request.StateId);
        if (updateResult.IsFailure)
            return Result<CityDto>.Failure(updateResult.Error!);

        cityRepository.Update(city);
        await unitOfWork.SaveChangesAsync(ct);

        return Result<CityDto>.Success(CreateCityCommandHandler.Map(city, state.Name, state.UF));
    }
}