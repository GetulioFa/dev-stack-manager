using DevStackManager.Domain.Entities;
using DevStackManager.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using System;

namespace DevStackManager.Infrastructure.Data.Seed;

public static class DataSeeder
{
    // 10 GUIDs fixos para os Estados (Mantendo a idempotência)
    private static readonly Guid SpId = new("11111111-0000-0000-0000-000000000001");
    private static readonly Guid RjId = new("11111111-0000-0000-0000-000000000002");
    private static readonly Guid MgId = new("11111111-0000-0000-0000-000000000003");
    private static readonly Guid BaId = new("11111111-0000-0000-0000-000000000004");
    private static readonly Guid RsId = new("11111111-0000-0000-0000-000000000005");
    private static readonly Guid PrId = new("11111111-0000-0000-0000-000000000006");
    private static readonly Guid ScId = new("11111111-0000-0000-0000-000000000007");
    private static readonly Guid PeId = new("11111111-0000-0000-0000-000000000008");
    private static readonly Guid CeId = new("11111111-0000-0000-0000-000000000009");
    private static readonly Guid GoId = new("11111111-0000-0000-0000-000000000010");

    public static void Seed(ModelBuilder modelBuilder)
    {
        SeedStatesAndCities(modelBuilder);
        SeedLanguages(modelBuilder);
        SeedUsers(modelBuilder); // <-- Chamada para o seed de utilizadores adicionada aqui
    }

    private static void SeedStatesAndCities(ModelBuilder modelBuilder)
    {
        // Exatamente 10 Estados
        var states = new[]
        {
            CreateState(SpId, "São Paulo", "SP"),
            CreateState(RjId, "Rio de Janeiro", "RJ"),
            CreateState(MgId, "Minas Gerais", "MG"),
            CreateState(BaId, "Bahia", "BA"),
            CreateState(RsId, "Rio Grande do Sul", "RS"),
            CreateState(PrId, "Paraná", "PR"),
            CreateState(ScId, "Santa Catarina", "SC"),
            CreateState(PeId, "Pernambuco", "PE"),
            CreateState(CeId, "Ceará", "CE"),
            CreateState(GoId, "Goiás", "GO")
        };

        modelBuilder.Entity<State>().HasData(states);

        // Exatamente 10 Cidades (1 para cada Estado)
        var cities = new[]
        {
            CreateCity(new("22222222-0000-0000-0000-000000000001"), "São Paulo", SpId),
            CreateCity(new("22222222-0000-0000-0000-000000000002"), "Rio de Janeiro", RjId),
            CreateCity(new("22222222-0000-0000-0000-000000000003"), "Belo Horizonte", MgId),
            CreateCity(new("22222222-0000-0000-0000-000000000004"), "Salvador", BaId),
            CreateCity(new("22222222-0000-0000-0000-000000000005"), "Porto Alegre", RsId),
            CreateCity(new("22222222-0000-0000-0000-000000000006"), "Curitiba", PrId),
            CreateCity(new("22222222-0000-0000-0000-000000000007"), "Florianópolis", ScId),
            CreateCity(new("22222222-0000-0000-0000-000000000008"), "Recife", PeId),
            CreateCity(new("22222222-0000-0000-0000-000000000009"), "Fortaleza", CeId),
            CreateCity(new("22222222-0000-0000-0000-000000000010"), "Goiânia", GoId)
        };

        modelBuilder.Entity<City>().HasData(cities);
    }

    private static void SeedLanguages(ModelBuilder modelBuilder)
    {
        // Exatamente 10 Linguagens variando os tipos
        var languages = new[]
        {
            CreateLanguage(new("33333333-0000-0000-0000-000000000001"), "C#", LanguageType.BackEnd),
            CreateLanguage(new("33333333-0000-0000-0000-000000000002"), "Python", LanguageType.BackEnd),
            CreateLanguage(new("33333333-0000-0000-0000-000000000003"), "Java", LanguageType.BackEnd),
            CreateLanguage(new("33333333-0000-0000-0000-000000000004"), "TypeScript", LanguageType.FrontEnd),
            CreateLanguage(new("33333333-0000-0000-0000-000000000005"), "JavaScript", LanguageType.FrontEnd),
            CreateLanguage(new("33333333-0000-0000-0000-000000000006"), "React", LanguageType.FrontEnd),
            CreateLanguage(new("33333333-0000-0000-0000-000000000007"), "Flutter", LanguageType.Mobile),
            CreateLanguage(new("33333333-0000-0000-0000-000000000008"), "PostgreSQL", LanguageType.Database),
            CreateLanguage(new("33333333-0000-0000-0000-000000000009"), "MongoDB", LanguageType.Database),
            CreateLanguage(new("33333333-0000-0000-0000-000000000010"), "Docker", LanguageType.DevOps)
        };

        modelBuilder.Entity<ProgrammingLanguage>().HasData(languages);
    }

    private static void SeedUsers(ModelBuilder modelBuilder)
    {
        // 3 Registos para a tabela Users com todos os campos de auditoria
        var users = new[]
        {
            CreateUser(new("44444444-0000-0000-0000-000000000001"), "Admin Geral", "admin@devstack.com", "PasswordHashAquiAdmin"),
            CreateUser(new("44444444-0000-0000-0000-000000000002"), "João Silva", "joao.silva@devstack.com", "PasswordHashAquiJoao"),
            CreateUser(new("44444444-0000-0000-0000-000000000003"), "Maria Santos", "maria.santos@devstack.com", "PasswordHashAquiMaria")
        };

        modelBuilder.Entity<User>().HasData(users);
    }

    // Bypass private constructors via object initializers (EF Seed pattern)
    private static object CreateState(Guid id, string name, string uf) => new
    {
        Id = id,
        Name = name,
        UF = uf,
        CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
        UpdatedAt = (DateTime?)null,
        IsDeleted = false,
        DeletedAt = (DateTime?)null
    };

    private static object CreateCity(Guid id, string name, Guid stateId) => new
    {
        Id = id,
        Name = name,
        StateId = stateId,
        CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
        UpdatedAt = (DateTime?)null,
        IsDeleted = false,
        DeletedAt = (DateTime?)null
    };

    private static object CreateLanguage(Guid id, string name, LanguageType type) => new
    {
        Id = id,
        Name = name,
        Type = type,
        CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
        UpdatedAt = (DateTime?)null,
        IsDeleted = false,
        DeletedAt = (DateTime?)null
    };

    private static object CreateUser(Guid id, string name, string email, string passwordHash) => new
    {
        Id = id,
        Name = name,
        Email = email,
        PasswordHash = passwordHash,
        CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
        UpdatedAt = (DateTime?)null,
        IsDeleted = false,
        DeletedAt = (DateTime?)null
    };
}