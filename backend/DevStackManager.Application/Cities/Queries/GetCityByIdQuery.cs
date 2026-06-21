using DevStackManager.Application.DTOs;
using DevStackManager.Domain.Common;
using DevStackManager.Domain.Interfaces;
using MediatR;

namespace DevStackManager.Application.Cities.Queries;

public record GetCityByIdQuery(Guid Id) : IRequest<Result<CityDto>>;

public sealed class GetCityByIdQueryHandler(ICityRepository cityRepository)
    : IRequestHandler<GetCityByIdQuery, Result<CityDto>>
{
    public async Task<Result<CityDto>> Handle(GetCityByIdQuery request, CancellationToken ct)
    {
        var city = await cityRepository.GetByIdAsync(request.Id, ct);
        if (city is null) return Result<CityDto>.Failure("Cidade não encontrada.");

        return Result<CityDto>.Success(
            new CityDto(city.Id, city.Name, city.StateId, city.State.Name, city.State.UF, city.CreatedAt));
    }
}