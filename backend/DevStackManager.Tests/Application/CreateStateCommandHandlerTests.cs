using DevStackManager.Application.DTOs;
using DevStackManager.Application.States.Commands;
using DevStackManager.Domain.Entities;
using DevStackManager.Domain.Interfaces;
using FluentAssertions;
using Moq;

namespace DevStackManager.Tests.Application;

public class CreateStateCommandHandlerTests
{
    private readonly Mock<IStateRepository> _stateRepositoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly CreateStateCommandHandler _handler;

    public CreateStateCommandHandlerTests()
    {
        _stateRepositoryMock = new Mock<IStateRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();

        _handler = new CreateStateCommandHandler(
            _stateRepositoryMock.Object,
            _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_Should_ReturnFailure_When_UfAlreadyExists()
    {
        // Arrange
        var command = new CreateStateCommand("Minas Gerais", "MG");

        var existingState = State.Create("Existing State", "MG").Value;
        _stateRepositoryMock.Setup(repo => repo.GetByUFAsync("MG", It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingState);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Contain("Já existe um estado cadastrado com a UF 'MG'");

        _stateRepositoryMock.Verify(repo => repo.AddAsync(It.IsAny<State>(), It.IsAny<CancellationToken>()), Times.Never);
        _unitOfWorkMock.Verify(uow => uow.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_Should_ReturnFailure_When_DomainValidationFails()
    {
        // Arrange
        var command = new CreateStateCommand("", "");

        _stateRepositoryMock.Setup(repo => repo.GetByUFAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((State)null!);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().NotBeNullOrEmpty();

        _stateRepositoryMock.Verify(repo => repo.AddAsync(It.IsAny<State>(), It.IsAny<CancellationToken>()), Times.Never);
        _unitOfWorkMock.Verify(uow => uow.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_Should_ReturnSuccess_When_StateIsValidAndUfIsUnique()
    {
        // Arrange
        var command = new CreateStateCommand("São Paulo", "SP");

        _stateRepositoryMock.Setup(repo => repo.GetByUFAsync("SP", It.IsAny<CancellationToken>()))
            .ReturnsAsync((State)null!);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.Should().BeOfType<StateDto>();
        result.Value.Name.Should().Be("São Paulo");
        result.Value.UF.Should().Be("SP");

        _stateRepositoryMock.Verify(repo =>
            repo.AddAsync(It.Is<State>(s => s.Name == "São Paulo" && s.UF == "SP"), It.IsAny<CancellationToken>()),
            Times.Once);

        _unitOfWorkMock.Verify(uow => uow.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}