using DevStackManager.Application.Languages.Commands;
using DevStackManager.Domain.Entities;
using DevStackManager.Domain.Enums;
using DevStackManager.Domain.Interfaces;
using FluentAssertions;
using Moq;

namespace DevStackManager.Tests.Application;

public class DeleteLanguageCommandHandlerTests
{
    private readonly Mock<ILanguageRepository> _languageRepositoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly DeleteLanguageCommandHandler _handler;

    public DeleteLanguageCommandHandlerTests()
    {
        _languageRepositoryMock = new Mock<ILanguageRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();

        _handler = new DeleteLanguageCommandHandler(
            _languageRepositoryMock.Object,
            _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_Deve_RetornarSucesso_Quando_LinguagemExistirEForDeletada()
    {
        // Arrange
        var languageId = Guid.NewGuid();
        var command = new DeleteLanguageCommand(languageId);

        // Criamos uma entidade de domínio válida
        var language = ProgrammingLanguage.Create("Java", LanguageType.BackEnd).Value;

        _languageRepositoryMock.Setup(repo => repo.GetByIdAsync(languageId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(language);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        // Verifica se o método de atualização do repositório foi chamado
        _languageRepositoryMock.Verify(repo => repo.Update(It.IsAny<ProgrammingLanguage>()), Times.Once);
        _unitOfWorkMock.Verify(uow => uow.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_Deve_RetornarFalha_Quando_LinguagemNaoExistir()
    {
        // Arrange
        var command = new DeleteLanguageCommand(Guid.NewGuid());

        _languageRepositoryMock.Setup(repo => repo.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((ProgrammingLanguage)null!);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be("Linguagem não encontrada.");

        // Garante que não houve persistência
        _languageRepositoryMock.Verify(repo => repo.Update(It.IsAny<ProgrammingLanguage>()), Times.Never);
        _unitOfWorkMock.Verify(uow => uow.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }
}