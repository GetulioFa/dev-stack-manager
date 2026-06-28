using DevStackManager.Application.Developers.Mappings;
using DevStackManager.Application.DTOs;
using DevStackManager.Application.Languages.Commands;
using DevStackManager.Domain.Common;
using DevStackManager.Domain.Entities;
using DevStackManager.Domain.Enums;
using DevStackManager.Domain.Interfaces;
using MediatR;

namespace DevStackManager.Application.Developers.Commands;

public record UpdateDeveloperCommand(
    Guid id,
    string Name,
    string Email,
    Seniority Seniority,
    Guid CityId,
    IEnumerable<Guid> LanguageIds
) : IRequest<Result<DeveloperDto>>;

public sealed class UpdateDeveloperCommandHandler(
    IDeveloperRepository developerRepository,
    ICityRepository cityRepository,
    ILanguageRepository languageRepository,
    IUnitOfWork unitOfWork
) : IRequestHandler<UpdateDeveloperCommand, Result<DeveloperDto>>
{
    public async Task<Result<DeveloperDto>> Handle(UpdateDeveloperCommand request, CancellationToken cancellationToken)
    {
        var developer = await developerRepository.GetByIdAsync(request.id, cancellationToken);
        if (developer is null)
            return Result<DeveloperDto>.Failure("Desenvolvedor não encontrado.");

        var emailOwner = await developerRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (emailOwner is not null && emailOwner.Id != developer.Id)
            return Result<DeveloperDto>.Failure("Já existe um desenvolvedor cadastrado com este e-mail.");

        var city = await cityRepository.GetByIdAsync(request.CityId, cancellationToken);
        if (city is null)
            return Result<DeveloperDto>.Failure("Cidade não encontrada.");

        var languageIds = request.LanguageIds.ToList();
        var languages = (await languageRepository.GetByIdsAsync(languageIds, cancellationToken)).ToList();
        if (languages.Count != languageIds.Distinct().Count())
            return Result<DeveloperDto>.Failure("Uma ou mais linguagens informadas não foram encontradas.");

        var result = developer.Update(request.Name, request.Email, request.Seniority, request.CityId, languageIds);
        if (result.IsFailure)
            return Result<DeveloperDto>.Failure(result.Error!);

        developerRepository.Update(developer);

        await unitOfWork.SaveChangesAsync(cancellationToken);
        
        return Result<DeveloperDto>.Success(developer.ToDto(city, languages));

        //return Result<DeveloperDto>.Success(MapToDto(developer, city, languages));
    }

    internal static DeveloperDto MapToDto(Developer dev, City city, List<ProgrammingLanguage> languages) =>
        new(
            dev.Id,
            dev.Name,
            dev.Email,
            dev.Seniority,
            dev.Seniority.ToString(),
            dev.CityId,
            city.Name,
            city.State?.UF ?? string.Empty,
            languages.Select(CreateLanguageCommandHandler.Map),
            dev.CreatedAt
        );
}