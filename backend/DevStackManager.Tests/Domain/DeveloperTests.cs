using DevStackManager.Domain.Entities;
using DevStackManager.Domain.Enums;
using FluentAssertions;

namespace DevStackManager.Tests.Domain;

public sealed class DeveloperTests
{
    private static readonly Guid ValidCityId = Guid.NewGuid();
    private static readonly Guid LangId1 = Guid.NewGuid();
    private static readonly Guid LangId2 = Guid.NewGuid();

    [Fact]
    public void Create_WithValidData_ShouldSucceed()
    {
        var result = Developer.Create(
            "Maria Silva", "maria@dev.com", Seniority.Senior, ValidCityId, [LangId1, LangId2]);

        result.IsSuccess.Should().BeTrue();
        result.Value.Name.Should().Be("Maria Silva");
        result.Value.Email.Should().Be("maria@dev.com");
        result.Value.Seniority.Should().Be(Seniority.Senior);
        result.Value.CityId.Should().Be(ValidCityId);
        result.Value.DeveloperLanguage.Should().HaveCount(2);
        result.Value.IsDeleted.Should().BeFalse();
        result.Value.Id.Should().NotBeEmpty();
    }

    [Fact]
    public void Create_ShouldDeduplicate_DuplicateLanguageIds()
    {
        var result = Developer.Create("Dev", "dev@test.com", Seniority.Pleno, ValidCityId,
            [LangId1, LangId1, LangId2]);

        result.IsSuccess.Should().BeTrue();
        result.Value.DeveloperLanguage.Should().HaveCount(2);
    }

    [Fact]
    public void Create_WithNoLanguages_ShouldFail()
    {
        var result = Developer.Create("Dev", "dev@test.com", Seniority.Junior, ValidCityId, []);

        result.IsFailure.Should().BeTrue();
        result.Error.Should().Contain("linguagem");
    }

    [Fact]
    public void Create_WithNullLanguages_ShouldFail()
    {
        var result = Developer.Create("Dev", "dev@test.com", Seniority.Junior, ValidCityId, null!);

        result.IsFailure.Should().BeTrue();
        result.Error.Should().Contain("linguagem");
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Create_WithEmptyName_ShouldFail(string? name)
    {
        var result = Developer.Create(name!, "dev@test.com", Seniority.Junior, ValidCityId, [LangId1]);

        result.IsFailure.Should().BeTrue();
        result.Error.Should().Contain("nome");
    }

    [Theory]
    [InlineData("notanemail")]
    [InlineData("missing@")]
    [InlineData("@nodomain.com")]
    public void Create_WithInvalidEmail_ShouldFail(string email)
    {
        var result = Developer.Create("Dev", email, Seniority.Junior, ValidCityId, [LangId1]);

        result.IsFailure.Should().BeTrue();
        result.Error.Should().Contain("e-mail");
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Create_WithEmptyEmail_ShouldFail(string? email)
    {
        var result = Developer.Create("Dev", email!, Seniority.Junior, ValidCityId, [LangId1]);

        result.IsFailure.Should().BeTrue();
        result.Error.Should().Contain("e-mail");
    }

    [Fact]
    public void Create_WithEmptyCityId_ShouldFail()
    {
        var result = Developer.Create("Dev", "dev@test.com", Seniority.Junior, Guid.Empty, [LangId1]);

        result.IsFailure.Should().BeTrue();
        result.Error.Should().Contain("cidade");
    }

    [Fact]
    public void Update_WithValidData_ShouldSucceed_AndReplaceLanguages()
    {
        var dev = Developer.Create("Dev", "dev@test.com", Seniority.Junior, ValidCityId, [LangId1]).Value;
        var newLangId = Guid.NewGuid();

        var result = dev.Update("Dev Atualizado", "updated@test.com", Seniority.Senior, ValidCityId, [LangId1, newLangId]);

        result.IsSuccess.Should().BeTrue();
        dev.Name.Should().Be("Dev Atualizado");
        dev.Seniority.Should().Be(Seniority.Senior);
        dev.DeveloperLanguage.Should().HaveCount(2);
        dev.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void Update_WithNoLanguages_ShouldFail()
    {
        var dev = Developer.Create("Dev", "dev@test.com", Seniority.Junior, ValidCityId, [LangId1]).Value;

        var result = dev.Update("Dev", "dev@test.com", Seniority.Junior, ValidCityId, []);

        result.IsFailure.Should().BeTrue();
        result.Error.Should().Contain("linguagem");
    }

    [Fact]
    public void SoftDelete_ShouldMarkDeveloperAsDeleted()
    {
        var dev = Developer.Create("Dev", "dev@test.com", Seniority.Junior, ValidCityId, [LangId1]).Value;

        var result = dev.SoftDelete();

        result.IsSuccess.Should().BeTrue();
        dev.IsDeleted.Should().BeTrue();
        dev.DeletedAt.Should().NotBeNull();
    }

    [Fact]
    public void SoftDelete_Twice_ShouldFail()
    {
        var dev = Developer.Create("Dev", "dev@test.com", Seniority.Junior, ValidCityId, [LangId1]).Value;
        dev.SoftDelete();

        var result = dev.SoftDelete();

        result.IsFailure.Should().BeTrue();
        result.Error.Should().Contain("excluído");
    }
}