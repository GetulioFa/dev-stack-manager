using DevStackManager.Application.States.Commands;
using DevStackManager.Domain.Entities;
using DevStackManager.Domain.Interfaces;
using FluentAssertions;
using Moq;

namespace DevStackManager.Tests.Application;

public class DeleteStateCommandHandlerTests
{
    private readonly Mock<IStateRepository> _stateRepositoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly DeleteStateCommandHandler _handler;

    public DeleteStateCommandHandlerTests()
    {
        _stateRepositoryMock = new Mock<IStateRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();

        _handler = new DeleteStateCommandHandler(
            _stateRepositoryMock.Object,
            _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_Should_ReturnFailure_When_StateDoesNotExist()
    {
        // Arrange
        var command = new DeleteStateCommand(Guid.NewGuid());

        _stateRepositoryMock.Setup(repo => repo.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((State)null!);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be("Estado não encontrado.");

        _stateRepositoryMock.Verify(repo => repo.Update(It.IsAny<State>()), Times.Never);
        _unitOfWorkMock.Verify(uow => uow.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_Should_ReturnSuccess_When_StateExistsAndIsDeletedSuccessfully()
    {
        // Arrange
        var stateId = Guid.NewGuid();
        var command = new DeleteStateCommand(stateId);

        var dummyState = State.Create("Minas Gerais", "MG").Value;

        _stateRepositoryMock.Setup(repo => repo.GetByIdAsync(stateId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(dummyState);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        _stateRepositoryMock.Verify(repo => repo.Update(It.Is<State>(s => s.Id == dummyState.Id)), Times.Once);
        _unitOfWorkMock.Verify(uow => uow.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}