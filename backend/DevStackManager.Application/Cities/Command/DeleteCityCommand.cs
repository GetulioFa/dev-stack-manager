using DevStackManager.Domain.Common;
using DevStackManager.Domain.Interfaces;
using MediatR;

namespace DevStackManager.Application.Cities.Command;

public record DeleteCityCommand(Guid Id) : IRequest<Result>;

public sealed class DeleteCityCommandHandler(
    ICityRepository cityRepository,
    IUnitOfWork unitOfWork
) : IRequestHandler<DeleteCityCommand, Result>
{
    public async Task<Result> Handle(DeleteCityCommand request, CancellationToken ct)
    {
        var city = await cityRepository.GetByIdAsync(request.Id, ct);
        if (city is null) return Result.Failure("Cidade não encontrada.");

        var deleteResult = city.SoftDelete();
        if (deleteResult.IsFailure) return deleteResult;

        cityRepository.Update(city);
        await unitOfWork.SaveChangesAsync(ct);
        return Result.Success();
    }
}