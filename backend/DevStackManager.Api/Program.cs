
using DevStackManager.Application.Common;
using DevStackManager.Application.Users.Validators;
using DevStackManager.Domain.Interfaces;
using DevStackManager.Infrastructure.Data;
using DevStackManager.Infrastructure.Repositories;
using DevStackManager.Infrastructure.Services;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Controllers
builder.Services.AddControllers();

// Database: SQLite + EF Core
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(
        builder.Configuration.GetConnectionString("DefaultConnection")
            ?? "Data Source=devstackmanager.db", b => b.MigrationsAssembly("DevStackManager.Infrastructure")
    )
);

// Domain / Infrastructure Services
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IStateRepository, StateRepository>();
builder.Services.AddScoped<ICityRepository, CityRepository>();
builder.Services.AddScoped<ILanguageRepository, LanguageRepository>();
builder.Services.AddScoped<IDeveloperRepository, DeveloperRepository>();

// Shared Infrastructure
builder.Services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<AppDbContext>());

// MediatR
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(
    typeof(DevStackManager.Application.Users.Commands.RegisterUserCommand).Assembly));

// FluentValidation
builder.Services.AddValidatorsFromAssemblyContaining<RegisterUserCommandValidator>();
builder.Services.AddValidatorsFromAssemblyContaining<CreateDeveloperCommandValidator>();
builder.Services.AddValidatorsFromAssemblyContaining<CreateStateCommandValidator>();

builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationPipelineBehavior<,>));

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey is not configured.");

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"] ?? "DevStackManager",
            ValidAudience = jwtSettings["Audience"] ?? "DevStackManager",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// OpenAPI (.NET 10 native) + Scalar
builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer((document, context, ct) =>
    {
        document.Info = new()
        {
            Title = "DevStackManager API",
            Version = "v1",
            Description = "API para gerenciamento de desenvolvedores"
        };

        // 1. Cria o esquema de segurança JWT Bearer (Sem a propriedade Reference)
        var securityScheme = new Microsoft.OpenApi.OpenApiSecurityScheme
        {
            Type = Microsoft.OpenApi.SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            Description = "Insira o token JWT. Exemplo: eyJhbGci..."
        };

        // 2. Adiciona o esquema aos componentes usando o novo método nativo do .NET 10
        document.AddComponent("Bearer", securityScheme);

        // 3. Cria o requisito de segurança usando a nova classe de referência do .NET 10
        var requirement = new Microsoft.OpenApi.OpenApiSecurityRequirement
        {
            [new Microsoft.OpenApi.OpenApiSecuritySchemeReference("Bearer", document)] = new List<string>()
        };

        // 4. Inicializa a lista de segurança global e adiciona o requisito
        document.Security ??= new List<Microsoft.OpenApi.OpenApiSecurityRequirement>();
        document.Security.Add(requirement);

        return Task.CompletedTask;
    });
});

// Build
var app = builder.Build();

// Auto apply Migrations
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
}

// Middleware Pipeline
if (app.Environment.IsDevelopment())
{
    // Native .NET 10 OpenAPI endpoint
    app.MapOpenApi();

    // Scalar UI at /scalar/v1
    app.MapScalarApiReference(options =>
    {
        options.WithTitle("DevStackManager API")
               .WithTheme(ScalarTheme.Purple)
               .WithDefaultHttpClient(ScalarTarget.CSharp, ScalarClient.HttpClient);
    });
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// ─── Global Exception Handler for FluentValidation ──────────────────────────
app.Use(async (context, next) =>
{
    try
    {
        await next(context);
    }
    catch (FluentValidation.ValidationException ex)
    {
        context.Response.StatusCode = StatusCodes.Status400BadRequest;
        context.Response.ContentType = "application/problem+json";
        var errors = ex.Errors.Select(e => new { field = e.PropertyName, message = e.ErrorMessage });
        await context.Response.WriteAsJsonAsync(new
        {
            type = "https://tools.ietf.org/html/rfc7807",
            title = "Erro de validação",
            status = 400,
            errors
        });
    }
});

await app.RunAsync();

// Expose for integration tests
public partial class Program { }