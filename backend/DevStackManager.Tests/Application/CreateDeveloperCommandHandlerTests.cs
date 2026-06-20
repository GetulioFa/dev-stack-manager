using DevStackManager.Application.Developers.Commands;
using DevStackManager.Domain.Entities;
using DevStackManager.Domain.Enums;
using DevStackManager.Domain.Interfaces;
using FluentAssertions;
using Moq;

namespace DevStackManager.Tests.Application;
public sealed class CreateDeveloperCommandHandlerTests
{
    private readonly Mock<IDeveloperRepository> _developerRepoMock = new();
    private readonly Mock<ICityRepository> _cityRepoMock = new();
    private readonly Mock<ILanguageRepository> _languageRepoMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();

    private static readonly Guid CityId = new("aaaaaaaa-0000-0000-0000-000000000001");
    private static readonly Guid StateId = new("bbbbbbbb-0000-0000-0000-000000000001");
    private static readonly Guid LangId1 = new("cccccccc-0000-0000-0000-000000000001");
    private static readonly Guid LangId2 = new("cccccccc-0000-0000-0000-000000000002");

    private CreateDeveloperCommandHandler CreateHandler() =>
    new(_developerRepoMock.Object, _cityRepoMock.Object,
        _languageRepoMock.Object, _unitOfWorkMock.Object);

    private static City BuildCity()
    {
        // Instantiate via reflection since constructor is private
        var city = (City)System.Runtime.CompilerServices.RuntimeHelpers
            .GetUninitializedObject(typeof(City));

        typeof(City).GetProperty(nameof(City.Id))!
            .SetValue(city, CityId);
        typeof(City).GetProperty(nameof(City.Name))!
            .SetValue(city, "São Paulo");
        typeof(City).GetProperty(nameof(City.StateId))!
            .SetValue(city, StateId);
        typeof(City).GetProperty(nameof(City.IsDeleted))!
            .SetValue(city, false);

        return city;
    }

    private static ProgrammingLanguage BuildLanguage(Guid id, string name, LanguageType type)
    {
        var lang = (ProgrammingLanguage)System.Runtime.CompilerServices.RuntimeHelpers
            .GetUninitializedObject(typeof(ProgrammingLanguage));

        typeof(ProgrammingLanguage).GetProperty(nameof(ProgrammingLanguage.Id))!
            .SetValue(lang, id);
        typeof(ProgrammingLanguage).GetProperty(nameof(ProgrammingLanguage.Name))!
            .SetValue(lang, name);
        typeof(ProgrammingLanguage).GetProperty(nameof(ProgrammingLanguage.Type))!
            .SetValue(lang, type);
        typeof(ProgrammingLanguage).GetProperty(nameof(ProgrammingLanguage.IsDeleted))!
            .SetValue(lang, false);
        typeof(ProgrammingLanguage).GetProperty(nameof(ProgrammingLanguage.CreatedAt))!
            .SetValue(lang, DateTime.UtcNow);

        return lang;
    }

    [Fact]
    public async Task Handle_WithValidCommand_ShouldCreateDeveloperSuccessfully()
    {
        // Arrange
        var command = new CreateDeveloperCommand(
            "João Dev", "joao@dev.com", Seniority.Pleno, CityId, [LangId1, LangId2]);

        var city = BuildCity();
        var languages = new List<ProgrammingLanguage>
        {
            BuildLanguage(LangId1, "C#", LanguageType.BackEnd),
            BuildLanguage(LangId2, "TypeScript", LanguageType.FrontEnd)
        };

        _developerRepoMock
            .Setup(r => r.GetByEmailAsync(command.Email, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Developer?)null);

        _cityRepoMock
            .Setup(r => r.GetByIdAsync(CityId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(city);

        _languageRepoMock
            .Setup(r => r.GetByIdsAsync(It.IsAny<IEnumerable<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(languages);

        _developerRepoMock
            .Setup(r => r.AddAsync(It.IsAny<Developer>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        _unitOfWorkMock
            .Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        var handler = CreateHandler();

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Name.Should().Be("João Dev");
        result.Value.Email.Should().Be("joao@dev.com");
        result.Value.Seniority.Should().Be(Seniority.Pleno);
        result.Value.Languages.Should().HaveCount(2);

        _developerRepoMock.Verify(r =>
            r.AddAsync(It.Is<Developer>(d =>
                d.Email == "joao@dev.com" &&
                d.DeveloperLanguage.Count == 2),
            It.IsAny<CancellationToken>()), Times.Once);

        _unitOfWorkMock.Verify(u =>
            u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WithDuplicateEmail_ShouldReturnFailure()
    {
        // Arrange
        var command = new CreateDeveloperCommand(
            "Outro Dev", "joao@dev.com", Seniority.Junior, CityId, [LangId1]);

        var existingDev = Developer.Create(
            "João Dev", "joao@dev.com", Seniority.Pleno, CityId, [LangId1]).Value;

        _developerRepoMock
            .Setup(r => r.GetByEmailAsync(command.Email, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingDev);

        var handler = CreateHandler();

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Contain("e-mail");

        _cityRepoMock.Verify(r =>
            r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Never);
        _developerRepoMock.Verify(r =>
            r.AddAsync(It.IsAny<Developer>(), It.IsAny<CancellationToken>()), Times.Never);
        _unitOfWorkMock.Verify(u =>
            u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WithInvalidCity_ShouldReturnFailure()
    {
        var command = new CreateDeveloperCommand(
            "Dev", "dev@test.com", Seniority.Junior, Guid.NewGuid(), [LangId1]);

        _developerRepoMock
            .Setup(r => r.GetByEmailAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Developer?)null);

        _cityRepoMock
            .Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((City?)null);

        var handler = CreateHandler();

        var result = await handler.Handle(command, CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error.Should().Contain("Cidade");
        _unitOfWorkMock.Verify(u =>
            u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WithInvalidLanguageId_ShouldReturnFailure()
    {
        var command = new CreateDeveloperCommand(
            "Dev", "dev@test.com", Seniority.Junior, CityId, [LangId1, Guid.NewGuid()]);

        var city = BuildCity();

        _developerRepoMock
            .Setup(r => r.GetByEmailAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Developer?)null);

        _cityRepoMock
            .Setup(r => r.GetByIdAsync(CityId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(city);

        // Returns only one language instead of two → mismatch
        _languageRepoMock
            .Setup(r => r.GetByIdsAsync(It.IsAny<IEnumerable<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([BuildLanguage(LangId1, "C#", LanguageType.BackEnd)]);

        var handler = CreateHandler();

        var result = await handler.Handle(command, CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error.Should().Contain("linguagens");
        _unitOfWorkMock.Verify(u =>
            u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WithEmptyLanguageList_ShouldReturnFailure_FromDomainValidation()
    {
        var command = new CreateDeveloperCommand(
            "Dev", "dev@test.com", Seniority.Junior, CityId, []);

        var city = BuildCity();

        _developerRepoMock
            .Setup(r => r.GetByEmailAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Developer?)null);

        _cityRepoMock
            .Setup(r => r.GetByIdAsync(CityId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(city);

        _languageRepoMock
            .Setup(r => r.GetByIdsAsync(It.IsAny<IEnumerable<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);

        var handler = CreateHandler();

        var result = await handler.Handle(command, CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error.Should().Contain("linguagem");
        _unitOfWorkMock.Verify(u =>
            u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }
}
