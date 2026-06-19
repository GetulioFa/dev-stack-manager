using DevStackManager.Application.Users.Commands;
using DevStackManager.Domain.Entities;
using DevStackManager.Domain.Interfaces;
using FluentAssertions;
using Moq;

namespace DevStackManager.Tests.Application
{
    public sealed class RegisterUserCommandHandlerTests
    {
        private readonly Mock<IUserRepository> _userRepositoryMock = new();
        private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
        private readonly Mock<IPasswordHasher> _passwordHasherMock = new();

        private RegisterUserCommandHandler CreateHandler() =>
            new(_userRepositoryMock.Object, _unitOfWorkMock.Object, _passwordHasherMock.Object);

        [Fact]
        public async Task Handle_WithValidCommand_ShouldRegisterUserSuccessfully()
        {
            // Arrange
            var command = new RegisterUserCommand("Carlos Paulo", "carlos@email.com", "PasswOrd1");
            const string fakeHash = "hashed_password_bcrypt";

            _userRepositoryMock
                .Setup(r => r.GetByEmailAsync(command.Email, It.IsAny<CancellationToken>()))
                .ReturnsAsync((User?)null);

            _passwordHasherMock
                .Setup(h => h.Hash(command.Password))
                .Returns(fakeHash);
            
            _userRepositoryMock
                .Setup(r => r.AddAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()))
                .Returns(Task.CompletedTask);

            _unitOfWorkMock
                .Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(1);

            var handler = CreateHandler();

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.IsSuccess.Should().BeTrue();
            result.Value.Name.Should().Be(command.Name);
            result.Value.Email.Should().Be(command.Email.ToLowerInvariant());
            result.Value.Id.Should().NotBeEmpty();

            _userRepositoryMock.Verify(r =>
                r.AddAsync(It.Is<User>(u => u.Email == command.Email && u.PasswordHash == fakeHash),
                It.IsAny<CancellationToken>()), Times.Once);

            _unitOfWorkMock.Verify(u =>
                u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task Handle_withDuplicateEmail_ShouldReturnFailure()
        {
            // Arrange
            var command = new RegisterUserCommand("Outro Usuário", "joao@email.com", "Password1");
            var existingUser = User.Create("João Silva", "joao@email.com", "some_hash").Value;

            _userRepositoryMock
                .Setup(r => r.GetByEmailAsync(command.Email, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existingUser);

            var handler = CreateHandler();

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.IsFailure.Should().BeTrue();
            result.Error.Should().Contain("e-mail");

            _passwordHasherMock.Verify(h => h.Hash(It.IsAny<string>()), Times.Never);
            _userRepositoryMock.Verify(r =>
                r.AddAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()), Times.Never);
            _unitOfWorkMock.Verify(u =>
                u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
        }

        [Fact]
        public async Task Handle_ShouldNeverStoreRawPassword()
        {
            // Arrange
            const string rawPassword = "MySecret1";
            const string hashedPassword = "$5572$12$hashvalue";

            var command = new RegisterUserCommand("Nome", "user@test.com", rawPassword);

            _userRepositoryMock
                .Setup(r => r.GetByEmailAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((User?)null);

            _passwordHasherMock
                .Setup(h => h.Hash(rawPassword))
                .Returns(hashedPassword);

            _unitOfWorkMock
                .Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(1);

            User? capturedUser = null;
            _userRepositoryMock
                .Setup(r => r.AddAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()))
                .Callback<User, CancellationToken>((u, _) => capturedUser = u)
                .Returns(Task.CompletedTask);

            var handler = CreateHandler();

            // Act
            await handler.Handle(command, CancellationToken.None);

            // Assert
            capturedUser.Should().NotBeNull();
            capturedUser!.PasswordHash.Should().NotBe(rawPassword);
            capturedUser.PasswordHash.Should().Be(hashedPassword);
        }
    }
}
