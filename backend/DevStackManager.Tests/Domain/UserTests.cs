using DevStackManager.Domain.Entities;
using FluentAssertions;

namespace DevStackManager.Tests.Domain
{
    public sealed class UserTests
    {
        [Fact]
        public void Create_WithValidData_ShouldSucceed()
        {
            // Arrange
            var name = "Denzel Cruz";
            var email = "denzel@email.com";
            var hash = "hashed_password";

            // Act
            var result = User.Create(name, email, hash);

            // Assert
            result.IsSuccess.Should().BeTrue();
            result.Value.Name.Should().Be(name);
            result.Value.Email.Should().Be(email.ToLowerInvariant());
            result.Value.PasswordHash.Should().Be(hash);
            result.Value.Id.Should().NotBeEmpty();
            result.Value.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
            result.Value.IsDeleted.Should().BeFalse();
        }

        [Fact]
        public void Create_ShouldNormalize_Email_ToLowercase()
        {
            // Arrange
            var name = "Denzel Cruz";
            var email = "DENZEL@EMAIL.COM";
            var hash = "hashed_password";

            // Act
            var result = User.Create(name, email, hash);

            // Assert
            result.IsSuccess.Should().BeTrue();
            result.Value.Email.Should().Be("denzel@email.com");
        }

        [Theory]
        [InlineData("")]
        [InlineData("   ")]
        [InlineData(null)]
        public void Create_WithEmptyName_ShouldFail(string? name)
        {
            // Arrange
            var email = "melish@email.com";
            var hash = "hash_234";

            // Act
            var result = User.Create(name!, email, hash);

            // Assert
            result.IsFailure.Should().BeTrue();
            result.Error.Should().Contain("nome");
        }

        [Theory]
        [InlineData("")]
        [InlineData("   ")]
        [InlineData(null)]
        public void Create_WithEmptyEmail_ShouldFail(string? email)
        {
            // Arrange
            var name = "Melissa";
            var hash = "hash";

            // Act
            var result = User.Create(name, email!, hash);

            // Assert
            result.IsFailure.Should().BeTrue();
            result.Error.Should().Contain("e-mail");
        }

        [Theory]
        [InlineData("not-an-email")]
        [InlineData("missing@")]
        [InlineData("@nodomain.com")]
        public void Create_WithInvalidEmail_ShouldFail(string invalidEmail)
        {
            // Arrange
            var name = "John";
            var hash = "hash";

            // Act
            var result = User.Create(name, invalidEmail, hash);

            // Assert
            result.IsFailure.Should().BeTrue();
            result.Error.Should().Contain("válido");
        }

        [Theory]
        [InlineData("")]
        [InlineData("   ")]
        [InlineData(null)]
        public void Create_WithEmptyPasswordHash_ShouldFail(string? hash)
        {
            // Arrange
            var name = "Melissa";
            var email = "melissa@email.com";

            // Act
            var result = User.Create(name, email, hash!);

            // Assert
            result.IsFailure.Should().BeTrue();
            result.Error.Should().Contain("senha");
        }

        [Fact]
        public void Update_WithValidData_ShouldSucceed()
        {
            // Arrange
            var user = User.Create("Nome", "old@email.com", "hash").Value;

            // Act
            var result = user.Update("Novo Nome", "new@email.com");

            // Assert
            result.IsSuccess.Should().BeTrue();
            user.Name.Should().Be("Novo Nome");
            user.Email.Should().Be("new@email.com");
            user.UpdatedAt.Should().NotBeNull();
        }

        [Fact]
        public void Update_WithEmptyName_ShouldFail()
        {
            // Arrange
            var user = User.Create("Nome", "email@test.com", "hash").Value;

            // Act
            var result = user.Update("", "email@test.com");

            // Assert
            result.IsFailure.Should().BeTrue();
        }


        [Fact]
        public void SoftDelete_ShouldMarkUserAsDeleted()
        {
            // Arrange
            var user = User.Create("Nome", "email@test.com", "hash").Value;

            // Act
            var result = user.SoftDelete();

            // Assert
            result.IsSuccess.Should().BeTrue();
            user.IsDeleted.Should().BeTrue();
            user.DeletedAt.Should().NotBeNull();
        }

        [Fact]
        public void SoftDelete_AlreadyDeleted_ShouldFail()
        {
            // Arrange
            var user = User.Create("Nome", "email@test.com", "hash").Value;
            user.SoftDelete();

            // Act
            var result = user.SoftDelete();

            // Assert
            result.IsFailure.Should().BeTrue();
            result.Error.Should().Contain("excluído");
        }
    }
}
