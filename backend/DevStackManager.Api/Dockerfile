# ─── Stage 1: Restore & Build ────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy solution and project files first (layer cache optimization)
COPY DevStackManager.sln .
COPY DevStackManager.Domain/DevStackManager.Domain.csproj                     DevStackManager.Domain/
COPY DevStackManager.Application/DevStackManager.Application.csproj           DevStackManager.Application/
COPY DevStackManager.Infrastructure/DevStackManager.Infrastructure.csproj     DevStackManager.Infrastructure/
COPY DevStackManager.Api/DevStackManager.Api.csproj                           DevStackManager.Api/
COPY DevStackManager.Tests/DevStackManager.Tests.csproj                       DevStackManager.Tests/

# Restore dependencies (cached if .csproj files unchanged)
RUN dotnet restore

# Copy all source files
COPY . .

# Run unit tests before building the production image
RUN dotnet test DevStackManager.Tests/DevStackManager.Tests.csproj \
    --no-restore \
    --configuration Release \
    --logger "console;verbosity=minimal"

# Publish the API
RUN dotnet publish DevStackManager.Api/DevStackManager.Api.csproj \
    --no-restore \
    --configuration Release \
    --output /app/publish \
    -p:UseAppHost=false

# ─── Stage 2: Runtime ────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 appgroup \
 && adduser  --system --uid 1001 --ingroup appgroup appuser

# Persistent volume for SQLite database
RUN mkdir -p /app/data && chown appuser:appgroup /app/data

COPY --from=build --chown=appuser:appgroup /app/publish .

USER appuser

EXPOSE 8080

# Override connection string to use the persistent volume path
ENV ConnectionStrings__DefaultConnection="Data Source=/app/data/devstackmanager.db"
ENV ASPNETCORE_URLS="http://+:8080"
ENV ASPNETCORE_ENVIRONMENT="Production"

ENTRYPOINT ["dotnet", "DevStackManager.Api.dll"]
