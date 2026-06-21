using DevStackManager.Application.Languages.Commands;
using DevStackManager.Domain.Entities;
using DevStackManager.Domain.Enums;
using DevStackManager.Domain.Interfaces;
using FluentAssertions;
using Moq;

namespace DevStackManager.Tests.Application;

public class UpdateLanguageCommandHandlerTests
{
    private readonly Mock<ILanguageRepository> _languageRepositoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly UpdateLanguageCommandHandler _handler;

    public UpdateLanguageCommandHandlerTests()
    {
        _languageRepositoryMock = new Mock<ILanguageRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();

        _handler = new UpdateLanguageCommandHandler(
            _languageRepositoryMock.Object,
            _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_Deve_RetornarSucesso_Quando_LinguagemExistirEAtualizarComSucesso()
    {
        // Arrange
        var languageId = Guid.NewGuid();
        var command = new UpdateLanguageCommand(languageId, "TypeScript", LanguageType.FrontEnd);

        
        var language = ProgrammingLanguage.Create("JavaScript", LanguageType.FrontEnd).Value;

        _languageRepositoryMock.Setup(repo => repo.GetByIdAsync(languageId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(language);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Name.Should().Be("TypeScript");

        _languageRepositoryMock.Verify(repo => repo.Update(It.IsAny<ProgrammingLanguage>()), Times.Once);
        _unitOfWorkMock.Verify(uow => uow.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_Deve_RetornarFalha_Quando_LinguagemNaoExistir()
    {
        // Arrange
        var command = new UpdateLanguageCommand(Guid.NewGuid(), "C#", LanguageType.BackEnd);

        _languageRepositoryMock.Setup(repo => repo.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((ProgrammingLanguage)null!);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be("Linguagem não encontrada.");

        _languageRepositoryMock.Verify(repo => repo.Update(It.IsAny<ProgrammingLanguage>()), Times.Never);
    }

    [Fact]
    public async Task Handle_Deve_RetornarFalha_Quando_DominioRecusarAtualizacao()
    {
        // Arrange
        var languageId = Guid.NewGuid();
        var command = new UpdateLanguageCommand(languageId, "", LanguageType.BackEnd);

        var language = ProgrammingLanguage.Create("Java", LanguageType.BackEnd).Value;

        _languageRepositoryMock.Setup(repo => repo.GetByIdAsync(languageId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(language);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();

        // Verifica se o repositório não prosseguiu com a atualização no banco
        _languageRepositoryMock.Verify(repo => repo.Update(It.IsAny<ProgrammingLanguage>()), Times.Never);
    }
}
