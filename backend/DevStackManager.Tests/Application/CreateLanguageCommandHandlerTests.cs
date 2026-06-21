using DevStackManager.Application.DTOs;
using DevStackManager.Application.Languages.Commands;
using DevStackManager.Domain.Entities;
using DevStackManager.Domain.Enums;
using DevStackManager.Domain.Interfaces;
using FluentAssertions;
using Moq;

namespace DevStackManager.Tests.Application;

public class CreateLanguageCommandHandlerTests
{
    private readonly Mock<ILanguageRepository> _languageRepositoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly CreateLanguageCommandHandler _handler;

    public CreateLanguageCommandHandlerTests()
    {
        // Setup: Inicializa os mocks antes de cada teste
        _languageRepositoryMock = new Mock<ILanguageRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();

        _handler = new CreateLanguageCommandHandler(
            _languageRepositoryMock.Object,
            _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_Deve_RetornarSucesso_Quando_LinguagemForCriadaCorretamente()
    {
        // Arrange
        var command = new CreateLanguageCommand("C#", LanguageType.BackEnd);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.Should().BeOfType<LanguageDto>();
        result.Value.Name.Should().Be("C#");

        _languageRepositoryMock.Verify(repo =>
            repo.AddAsync(It.Is<ProgrammingLanguage>(l => l.Name == "C#"), It.IsAny<CancellationToken>()),
            Times.Once);

        _unitOfWorkMock.Verify(uow =>
            uow.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_Deve_RetornarFalha_Quando_ValidacaoDeDominioFalhar()
    {
        // Arrange
        var command = new CreateLanguageCommand("", LanguageType.BackEnd);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().NotBeNullOrEmpty();
        
        _languageRepositoryMock.Verify(repo =>
            repo.AddAsync(It.IsAny<ProgrammingLanguage>(), It.IsAny<CancellationToken>()),
            Times.Never);

        _unitOfWorkMock.Verify(uow =>
            uow.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Never);
    }
}