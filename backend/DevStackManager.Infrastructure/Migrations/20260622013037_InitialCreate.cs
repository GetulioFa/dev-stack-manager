using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace DevStackManager.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ProgrammingLanguages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Type = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false),
                    DeletedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProgrammingLanguages", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "States",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    UF = table.Column<string>(type: "TEXT", maxLength: 2, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false),
                    DeletedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_States", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 150, nullable: false),
                    Email = table.Column<string>(type: "TEXT", maxLength: 254, nullable: false),
                    PasswordHash = table.Column<string>(type: "TEXT", maxLength: 512, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false),
                    DeletedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Cities",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 150, nullable: false),
                    StateId = table.Column<Guid>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false),
                    DeletedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Cities_States_StateId",
                        column: x => x.StateId,
                        principalTable: "States",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Developers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 150, nullable: false),
                    Email = table.Column<string>(type: "TEXT", maxLength: 254, nullable: false),
                    Seniority = table.Column<int>(type: "INTEGER", nullable: false),
                    CityId = table.Column<Guid>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false),
                    DeletedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Developers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Developers_Cities_CityId",
                        column: x => x.CityId,
                        principalTable: "Cities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DeveloperLanguages",
                columns: table => new
                {
                    DeveloperId = table.Column<Guid>(type: "TEXT", nullable: false),
                    ProgrammingLanguageId = table.Column<Guid>(type: "TEXT", nullable: false),
                    AssociatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeveloperLanguages", x => new { x.DeveloperId, x.ProgrammingLanguageId });
                    table.ForeignKey(
                        name: "FK_DeveloperLanguages_Developers_DeveloperId",
                        column: x => x.DeveloperId,
                        principalTable: "Developers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DeveloperLanguages_ProgrammingLanguages_ProgrammingLanguageId",
                        column: x => x.ProgrammingLanguageId,
                        principalTable: "ProgrammingLanguages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "ProgrammingLanguages",
                columns: new[] { "Id", "CreatedAt", "DeletedAt", "Name", "Type", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("33333333-0000-0000-0000-000000000001"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "C#", 2, null },
                    { new Guid("33333333-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Python", 2, null },
                    { new Guid("33333333-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Java", 2, null },
                    { new Guid("33333333-0000-0000-0000-000000000004"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "TypeScript", 1, null },
                    { new Guid("33333333-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "JavaScript", 1, null },
                    { new Guid("33333333-0000-0000-0000-000000000006"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "React", 1, null },
                    { new Guid("33333333-0000-0000-0000-000000000007"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Flutter", 3, null },
                    { new Guid("33333333-0000-0000-0000-000000000008"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "PostgreSQL", 4, null },
                    { new Guid("33333333-0000-0000-0000-000000000009"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "MongoDB", 4, null },
                    { new Guid("33333333-0000-0000-0000-000000000010"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Docker", 5, null }
                });

            migrationBuilder.InsertData(
                table: "States",
                columns: new[] { "Id", "CreatedAt", "DeletedAt", "Name", "UF", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("11111111-0000-0000-0000-000000000001"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "São Paulo", "SP", null },
                    { new Guid("11111111-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Rio de Janeiro", "RJ", null },
                    { new Guid("11111111-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Minas Gerais", "MG", null },
                    { new Guid("11111111-0000-0000-0000-000000000004"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Bahia", "BA", null },
                    { new Guid("11111111-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Rio Grande do Sul", "RS", null },
                    { new Guid("11111111-0000-0000-0000-000000000006"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Paraná", "PR", null },
                    { new Guid("11111111-0000-0000-0000-000000000007"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Santa Catarina", "SC", null },
                    { new Guid("11111111-0000-0000-0000-000000000008"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Pernambuco", "PE", null },
                    { new Guid("11111111-0000-0000-0000-000000000009"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Ceará", "CE", null },
                    { new Guid("11111111-0000-0000-0000-000000000010"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Goiás", "GO", null }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CreatedAt", "DeletedAt", "Email", "Name", "PasswordHash", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("44444444-0000-0000-0000-000000000001"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "admin@devstack.com", "Admin Geral", "PasswordHashAquiAdmin", null },
                    { new Guid("44444444-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "joao.silva@devstack.com", "João Silva", "PasswordHashAquiJoao", null },
                    { new Guid("44444444-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "maria.santos@devstack.com", "Maria Santos", "PasswordHashAquiMaria", null }
                });

            migrationBuilder.InsertData(
                table: "Cities",
                columns: new[] { "Id", "CreatedAt", "DeletedAt", "Name", "StateId", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("22222222-0000-0000-0000-000000000001"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "São Paulo", new Guid("11111111-0000-0000-0000-000000000001"), null },
                    { new Guid("22222222-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Rio de Janeiro", new Guid("11111111-0000-0000-0000-000000000002"), null },
                    { new Guid("22222222-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Belo Horizonte", new Guid("11111111-0000-0000-0000-000000000003"), null },
                    { new Guid("22222222-0000-0000-0000-000000000004"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Salvador", new Guid("11111111-0000-0000-0000-000000000004"), null },
                    { new Guid("22222222-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Porto Alegre", new Guid("11111111-0000-0000-0000-000000000005"), null },
                    { new Guid("22222222-0000-0000-0000-000000000006"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Curitiba", new Guid("11111111-0000-0000-0000-000000000006"), null },
                    { new Guid("22222222-0000-0000-0000-000000000007"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Florianópolis", new Guid("11111111-0000-0000-0000-000000000007"), null },
                    { new Guid("22222222-0000-0000-0000-000000000008"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Recife", new Guid("11111111-0000-0000-0000-000000000008"), null },
                    { new Guid("22222222-0000-0000-0000-000000000009"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Fortaleza", new Guid("11111111-0000-0000-0000-000000000009"), null },
                    { new Guid("22222222-0000-0000-0000-000000000010"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Goiânia", new Guid("11111111-0000-0000-0000-000000000010"), null }
                });

            migrationBuilder.InsertData(
                table: "Developers",
                columns: new[] { "Id", "CityId", "CreatedAt", "DeletedAt", "Email", "Name", "Seniority", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("55555555-0000-0000-0000-000000000001"), new Guid("22222222-0000-0000-0000-000000000001"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "lucas.almeida@email.com", "Lucas Almeida", 2, null },
                    { new Guid("55555555-0000-0000-0000-000000000002"), new Guid("22222222-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "camila.rocha@email.com", "Camila Rocha", 3, null },
                    { new Guid("55555555-0000-0000-0000-000000000003"), new Guid("22222222-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "felipe.santos@email.com", "Felipe Santos", 1, null },
                    { new Guid("55555555-0000-0000-0000-000000000004"), new Guid("22222222-0000-0000-0000-000000000004"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "juliana.costa@email.com", "Juliana Costa", 2, null },
                    { new Guid("55555555-0000-0000-0000-000000000005"), new Guid("22222222-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "rafael.lima@email.com", "Rafael Lima", 3, null },
                    { new Guid("55555555-0000-0000-0000-000000000006"), new Guid("22222222-0000-0000-0000-000000000006"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "amanda.castro@email.com", "Amanda Castro", 1, null },
                    { new Guid("55555555-0000-0000-0000-000000000007"), new Guid("22222222-0000-0000-0000-000000000007"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "diego.fernandes@email.com", "Diego Fernandes", 2, null },
                    { new Guid("55555555-0000-0000-0000-000000000008"), new Guid("22222222-0000-0000-0000-000000000008"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "beatriz.sousa@email.com", "Beatriz Sousa", 3, null },
                    { new Guid("55555555-0000-0000-0000-000000000009"), new Guid("22222222-0000-0000-0000-000000000009"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "thiago.oliveira@email.com", "Thiago Oliveira", 1, null },
                    { new Guid("55555555-0000-0000-0000-000000000010"), new Guid("22222222-0000-0000-0000-000000000010"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "mariana.silva@email.com", "Mariana Silva", 2, null },
                    { new Guid("55555555-0000-0000-0000-000000000011"), new Guid("22222222-0000-0000-0000-000000000001"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "bruno.pereira@email.com", "Bruno Pereira", 3, null },
                    { new Guid("55555555-0000-0000-0000-000000000012"), new Guid("22222222-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "larissa.gomes@email.com", "Larissa Gomes", 2, null },
                    { new Guid("55555555-0000-0000-0000-000000000013"), new Guid("22222222-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "gabriel.martins@email.com", "Gabriel Martins", 1, null },
                    { new Guid("55555555-0000-0000-0000-000000000014"), new Guid("22222222-0000-0000-0000-000000000004"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "leticia.ribeiro@email.com", "Letícia Ribeiro", 3, null },
                    { new Guid("55555555-0000-0000-0000-000000000015"), new Guid("22222222-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "marcelo.dias@email.com", "Marcelo Dias", 2, null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Cities_StateId",
                table: "Cities",
                column: "StateId");

            migrationBuilder.CreateIndex(
                name: "IX_DeveloperLanguages_ProgrammingLanguageId",
                table: "DeveloperLanguages",
                column: "ProgrammingLanguageId");

            migrationBuilder.CreateIndex(
                name: "IX_Developers_CityId",
                table: "Developers",
                column: "CityId");

            migrationBuilder.CreateIndex(
                name: "IX_Developers_Email",
                table: "Developers",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_States_UF",
                table: "States",
                column: "UF",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DeveloperLanguages");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Developers");

            migrationBuilder.DropTable(
                name: "ProgrammingLanguages");

            migrationBuilder.DropTable(
                name: "Cities");

            migrationBuilder.DropTable(
                name: "States");
        }
    }
}
