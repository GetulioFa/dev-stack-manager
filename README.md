# DevStackManager

Plataforma Full Stack para gestão de desenvolvedores, construída com foco em
**qualidade de código**, **Clean Architecture**, **TDD** e **boas práticas de engenharia de software**.
------

## Índice

- [DevStackManager](#devstackmanager)
  - [**qualidade de código**, **Clean Architecture**, **TDD** e **boas práticas de engenharia de software**.](#qualidade-de-código-clean-architecture-tdd-e-boas-práticas-de-engenharia-de-software)
  - [Índice](#índice)
  - [Visão Geral](#visão-geral)
    - [Funcionalidades](#funcionalidades)
  - [Arquitetura](#arquitetura)
    - [Backend — Clean Architecture](#backend--clean-architecture)
    - [Fluxo de uma requisição](#fluxo-de-uma-requisição)
    - [Frontend — Feature-based Architecture](#frontend--feature-based-architecture)
  - [Stack Tecnológica](#stack-tecnológica)
    - [Backend](#backend)
    - [Frontend](#frontend)
    - [Infraestrutura](#infraestrutura)
  - [Estrutura do Projeto](#estrutura-do-projeto)
  - [Pré-requisitos](#pré-requisitos)
    - [Para rodar com Docker (recomendado)](#para-rodar-com-docker-recomendado)
    - [Para rodar localmente (sem Docker)](#para-rodar-localmente-sem-docker)
  - [Início Rápido com Docker](#início-rápido-com-docker)
    - [1. Clone e configure](#1-clone-e-configure)
    - [2. Suba os containers (produção)](#2-suba-os-containers-produção)
    - [3. Acesse a aplicação](#3-acesse-a-aplicação)
    - [Parar os containers](#parar-os-containers)
    - [Desenvolvimento com Docker (hot-reload)](#desenvolvimento-com-docker-hot-reload)
  - [Execução Local (sem Docker)](#execução-local-sem-docker)
    - [Backend](#backend-1)
    - [Frontend](#frontend-1)
  - [Variáveis de Ambiente](#variáveis-de-ambiente)
    - [Backend (`appsettings.json` / environment)](#backend-appsettingsjson--environment)
    - [Frontend (`environment.ts`)](#frontend-environmentts)
  - [API Reference](#api-reference)
    - [Autenticação](#autenticação)
    - [Usuários — `/api/users`](#usuários--apiusers)
    - [Desenvolvedores — `/api/developers`](#desenvolvedores--apidevelopers)
    - [Estados — `/api/states`](#estados--apistates)
    - [Cidades — `/api/cities`](#cidades--apicities)
    - [Linguagens — `/api/languages`](#linguagens--apilanguages)
    - [Formato de erro](#formato-de-erro)
  - [Dados Iniciais (Seed)](#dados-iniciais-seed)
  - [Testes](#testes)
    - [Testes unitários (backend)](#testes-unitários-backend)
    - [Testes de integração (auth)](#testes-de-integração-auth)
  - [Frontend](#frontend-2)
    - [Rotas](#rotas)
    - [Sessão e segurança](#sessão-e-segurança)
    - [Formulário de desenvolvedor](#formulário-de-desenvolvedor)
  - [Decisões de Design](#decisões-de-design)
    - [Result Pattern em vez de exceções](#result-pattern-em-vez-de-exceções)
    - [Soft Delete via Global Query Filter](#soft-delete-via-global-query-filter)
    - [Tabela de junção N:N explícita](#tabela-de-junção-nn-explícita)
    - [CQRS sem Event Sourcing](#cqrs-sem-event-sourcing)
    - [Signals em vez de RxJS para estado](#signals-em-vez-de-rxjs-para-estado)
  - [Segurança](#segurança)

------

## Visão Geral

O DevStackManager permite cadastrar e visualizar desenvolvedores com suas
senioridades, linguagens de programação dominadas e localizações. O sistema é
composto por uma API REST em .NET 10 e um SPA em Angular 19.

### Funcionalidades

- **Autenticação** com JWT — cadastro, login, sessão com expiração automática
- **Desenvolvedores** — CRUD completo com filtros por senioridade, cidade e linguagem, exportação de dados
- **Linguagens de Programação** — categorizadas por tipo (FrontEnd, BackEnd, Mobile, Database, DevOps)
- **Localizações** — gestão de Estados e Cidades com cascata de seleção no formulário
- **Soft Delete** em todas as entidades — nenhum dado é removido fisicamente
- **Documentação interativa** da API via Scalar (substitui Swagger)

------

## Arquitetura

### Backend — Clean Architecture

```
DevStackManager/
├── DevStackManager.Domain          # Entidades, interfaces, Result Pattern, enums
│   ├── Entities/                   # User, Developer, State, City, ProgrammingLanguage
│   ├── Interfaces/                 # IUserRepository, IDeveloperRepository, IUnitOfWork…
│   ├── Common/                     # Result<T> — sem dependências externas
│   └── Enums/                      # Seniority, LanguageType
│
├── DevStackManager.Application     # Casos de uso — CQRS com MediatR
│   ├── Users/Commands/             # Register, Login, Update, Delete
│   ├── Users/Queries/              # GetById, GetByEmail, List
│   ├── Developers/Commands/        # Create, Update, Delete
│   ├── Developers/Queries/         # GetById, GetByEmail, ListPaged, Export
│   ├── States/ Cities/ Languages/  # CRUD handlers + validators (FluentValidation)
│   ├── DTOs/                       # Records de entrada e saída
│   └── Common/                     # ValidationPipelineBehavior
│
├── DevStackManager.Infrastructure  # Implementações concretas
│   ├── Data/AppDbContext.cs        # EF Core + IUnitOfWork
│   ├── Data/Configurations/        # Fluent API — índices, soft delete, N:N
│   ├── Data/Seed/DataSeeder.cs     # Dados iniciais (estados, cidades, linguagens)
│   ├── Repositories/               # StateRepository, CityRepository, DeveloperRepository…
│   └── Services/                   # PasswordHasher (BCrypt), TokenService (JWT)
│
├── DevStackManager.Api             # Camada de entrega HTTP
│   ├── Controllers/                # UsersController, DevelopersController, StatesController…
│   └── Program.cs                  # DI, CORS, JWT, OpenAPI, migrations automáticas
│
└── DevStackManager.Tests           # Testes unitários (xUnit + Moq + FluentAssertions)
    ├── Domain/                     # UserTests, DeveloperTests
    └── Application/                # Handler tests com repositórios mockados
```

### Fluxo de uma requisição

```
HTTP Request
    │
    ▼
Controller (Api)
    │  envia Command/Query via IMediator
    ▼
Handler (Application)
    │  valida via FluentValidation (Pipeline Behavior)
    │  chama repositório via interface
    ▼
Repository (Infrastructure)
    │  acessa banco via EF Core
    ▼
AppDbContext → SQLite
    │
    ◄── Result<T> volta por todas as camadas
    ▼
Controller → IActionResult (200/201/400/401/404/409)
```

### Frontend — Feature-based Architecture

```
DevStackManager.Web/src/app/
├── core/
│   ├── guards/         authGuard, guestGuard (CanActivateFn)
│   ├── interceptors/   jwtInterceptor (HttpInterceptorFn)
│   ├── models/         Interfaces TypeScript, validators customizados
│   └── services/       AuthService, DeveloperService, StateService…
│
├── shared/
│   ├── components/     ToastContainer, ConfirmModal, FieldError, LanguageBadge…
│   └── layouts/        AuthLayout (split-screen), ShellLayout (sidebar)
│
└── features/
    ├── auth/           LoginComponent, RegisterComponent
    ├── developers/     DeveloperListComponent, DeveloperFormComponent
    ├── languages/      LanguageListComponent
    └── locations/      LocationsComponent (Estados + Cidades com abas)
```

------

## Stack Tecnológica

### Backend

| Camada | Tecnologia | Versão |
|--------|------------|--------|
| Framework | .NET / C# | 10 / 12 |
| ORM | Entity Framework Core | 10.x |
| Banco de dados | SQLite | — |
| Autenticação | JWT Bearer | — |
| Hash de senha | BCrypt.Net-Next (work factor 12) | 4.x |
| CQRS | MediatR | 12.x |
| Validação | FluentValidation | 11.x |
| Documentação | OpenAPI nativo .NET 10 + Scalar | 2.x |
| Testes | xUnit + Moq + FluentAssertions | — |

### Frontend

| Camada | Tecnologia | Versão |
|--------|------------|--------|
| Framework | Angular (Standalone Components) | 19 |
| Estilização | Tailwind CSS | 3.x |
| Estado | Angular Signals (`signal`, `computed`, `effect`) | — |
| Formulários | Angular ReactiveForms | — |
| HTTP | `HttpClient` + `HttpInterceptorFn` | — |
| Build | Angular CLI / `@angular-devkit/build-angular` | 19.x |

### Infraestrutura

| Serviço | Tecnologia |
|---------|------------|
| Containerização | Docker + Docker Compose |
| Servidor web | Nginx 1.27 (Alpine) |
| Runtime API | ASP.NET Core em Alpine |

---

## Estrutura do Projeto

```
devstackmanager/
├── backend/                    # Solution .NET (copiar conteúdo do DevStackManager/)
│   ├── DevStackManager.sln
│   ├── DevStackManager.Domain/
│   ├── DevStackManager.Application/
│   ├── DevStackManager.Infrastructure/
│   ├── DevStackManager.Api/
│   ├── DevStackManager.Tests/
│   ├── Dockerfile
│   └── .dockerignore
│
├── frontend/                   # Projeto Angular (copiar conteúdo do DSM.Web/)
│   ├── src/
│   ├── angular.json
│   ├── package.json
│   ├── tailwind.config.js
│   ├── proxy.conf.json         # Dev local → localhost:5000
│   ├── proxy.conf.docker.json  # Docker dev → backend:8080
│   ├── Dockerfile              # Produção (Nginx)
│   ├── Dockerfile.dev          # Desenvolvimento (ng serve)
│   └── .dockerignore
│
└── docker/
    ├── docker-compose.yml      # Produção / staging
    ├── docker-compose.dev.yml  # Override para desenvolvimento
    └── .env.example            # Variáveis de ambiente (copiar para .env)
```

------

## Pré-requisitos

### Para rodar com Docker (recomendado)

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) ≥ 24.0
- [Docker Compose](https://docs.docker.com/compose/) ≥ 2.20 (incluído no Docker Desktop)

### Para rodar localmente (sem Docker)

- [.NET SDK 10](https://dotnet.microsoft.com/download/dotnet/10.0)
- [Node.js](https://nodejs.org/) ≥ 22 LTS
- [Angular CLI](https://angular.io/cli) ≥ 19

```bash
npm install -g @angular/cli@19
```

---

## Início Rápido com Docker

### 1. Clone e configure

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/devstackmanager.git
cd devstackmanager

# Configure as variáveis de ambiente
cp docker/.env.example docker/.env
```

Edite `docker/.env` e defina um `JWT_SECRET_KEY` seguro:

```bash
# Gera uma chave segura automaticamente
openssl rand -base64 64
```

### 2. Suba os containers (produção)

```bash
cd docker
docker compose up --build -d
```

Aguarde o health check do backend (~20 segundos):

```bash
docker compose ps          # Verifique se ambos estão "healthy"
docker compose logs -f     # Acompanhe os logs
```

### 3. Acesse a aplicação

| Serviço | URL |
|---------|-----|
| **Frontend (Angular)** | http://localhost |
| **API (backend)** | http://localhost:5000 |
| **Documentação interativa (Scalar)** | http://localhost:5000/scalar/v1 |

> O banco SQLite é criado automaticamente com as migrations e seed na primeira execução.

### Parar os containers

```bash
docker compose down          # Para e remove containers (dados persistem no volume)
docker compose down -v       # Para, remove containers E o volume do banco
```

### Desenvolvimento com Docker (hot-reload)

```bash
cd docker
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

- **Backend**: reinicia automaticamente com `dotnet watch` ao salvar arquivos `.cs`
- **Frontend**: http://localhost:4200 com hot-reload do Angular CLI

---

## Execução Local (sem Docker)

### Backend

```bash
cd backend

# Restaurar dependências
dotnet restore

# Criar e aplicar migrations (gera o banco SQLite)
dotnet ef migrations add InitialCreate \
  --project DevStackManager.Infrastructure \
  --startup-project DevStackManager.Api

dotnet ef database update \
  --project DevStackManager.Infrastructure \
  --startup-project DevStackManager.Api

# Rodar a API
dotnet run --project DevStackManager.Api
```

A API estará disponível em `http://localhost:5000`.  
Documentação interativa: `http://localhost:5000/scalar/v1`

### Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
# (proxy.conf.json redireciona /api/* → http://localhost:5000)
npm start
```

O frontend estará disponível em `http://localhost:4200`.

---

## Variáveis de Ambiente

### Backend (`appsettings.json` / environment)

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `ConnectionStrings__DefaultConnection` | String de conexão SQLite | `Data Source=devstackmanager.db` |
| `JwtSettings__SecretKey` | Chave secreta para assinar tokens JWT (≥32 chars) | — ⚠️ **Obrigatório** |
| `JwtSettings__Issuer` | Emissor do token | `DevStackManager` |
| `JwtSettings__Audience` | Audiência do token | `DevStackManager` |
| `JwtSettings__ExpiresInHours` | Tempo de expiração do token | `2` |
| `Cors__AllowedOrigins__0` | Origem permitida (CORS) | `http://localhost:4200` |
| `ASPNETCORE_ENVIRONMENT` | Ambiente (`Development` / `Production`) | `Production` |

> ⚠️ **Nunca commite o `JWT_SECRET_KEY` real no repositório.** Use variáveis de ambiente ou um secrets manager.

### Frontend (`environment.ts`)

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `environment.apiUrl` | URL base da API | `/api` (relativo, via proxy) |
| `environment.production` | Flag de produção | `false` (dev) / `true` (prod) |

---

## API Reference

### Autenticação

Todos os endpoints marcados com 🔒 exigem o header:

```
Authorization: Bearer <token>
```

O token é obtido via `POST /api/users/login` e expira em 2 horas.

---

### Usuários — `/api/users`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `POST` | `/register` | ❌ | Cadastra novo usuário |
| `POST` | `/login` | ❌ | Autentica e retorna JWT |
| `GET` | `/` | 🔒 | Lista usuários (paginado) |
| `GET` | `/{id}` | 🔒 | Busca por ID |
| `GET` | `/by-email?email=` | 🔒 | Busca por e-mail |
| `PUT` | `/{id}` | 🔒 | Atualiza nome e e-mail |
| `DELETE` | `/` | 🔒 | Soft delete por e-mail (body) |

**POST /api/users/register**
```json
// Request
{ "name": "Maria Silva", "email": "maria@dev.com", "password": "Senha@123" }

// Response 201
{ "id": "uuid", "name": "Maria Silva", "email": "maria@dev.com",
  "createdAt": "2024-01-15T10:00:00Z", "updatedAt": null }
```

**POST /api/users/login**
```json
// Request
{ "email": "maria@dev.com", "password": "Senha@123" }

// Response 200
{
  "token": "eyJhbGci...",
  "tokenType": "Bearer",
  "expiresAt": "2024-01-15T12:00:00Z",
  "user": { "id": "uuid", "name": "Maria Silva", "email": "maria@dev.com",
            "createdAt": "2024-01-15T10:00:00Z", "updatedAt": null }
}
```

**DELETE /api/users** (soft delete por e-mail)
```json
// Request body
{ "email": "maria@dev.com" }
// Response 204 No Content
```

---

### Desenvolvedores — `/api/developers`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/` | 🔒 | Lista paginada com filtros |
| `GET` | `/{id}` | 🔒 | Detalhe por ID |
| `GET` | `/by-email?email=` | 🔒 | Busca por e-mail |
| `GET` | `/export` | 🔒 | Exportação sem paginação |
| `POST` | `/` | 🔒 | Cria desenvolvedor |
| `PUT` | `/{id}` | 🔒 | Atualiza desenvolvedor |
| `DELETE` | `/{id}` | 🔒 | Soft delete por ID |

**Filtros disponíveis em GET /**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `page` | `int` | Página (default: 1) |
| `pageSize` | `int` | Itens por página (default: 10, máx: 100) |
| `seniority` | `int` | 1=Junior, 2=Pleno, 3=Senior |
| `cityId` | `guid` | Filtra por cidade |
| `languageId` | `guid` | Filtra por linguagem |

**POST /api/developers**
```json
// Request
{
  "name": "João Dev",
  "email": "joao@dev.com",
  "seniority": 2,
  "cityId": "guid-da-cidade",
  "languageIds": ["guid-lang-1", "guid-lang-2"]
}

// Response 201
{
  "id": "uuid", "name": "João Dev", "email": "joao@dev.com",
  "seniority": 2, "seniorityLabel": "Pleno",
  "cityId": "uuid", "cityName": "São Paulo", "stateUF": "SP",
  "languages": [{ "id": "uuid", "name": "C#", "type": 2, "typeLabel": "BackEnd" }],
  "createdAt": "2024-01-15T10:00:00Z"
}
```

---

### Estados — `/api/states`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/` | ❌ | Lista paginada |
| `GET` | `/{id}` | ❌ | Detalhe por ID |
| `POST` | `/` | 🔒 | Cria estado |
| `PUT` | `/{id}` | 🔒 | Atualiza estado |
| `DELETE` | `/{id}` | 🔒 | Soft delete |

### Cidades — `/api/cities`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/?stateId=` | ❌ | Lista paginada, filtrável por estado |
| `GET` | `/{id}` | ❌ | Detalhe por ID |
| `POST` | `/` | 🔒 | Cria cidade |
| `PUT` | `/{id}` | 🔒 | Atualiza cidade |
| `DELETE` | `/{id}` | 🔒 | Soft delete |

### Linguagens — `/api/languages`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/?type=` | ❌ | Lista paginada, filtrável por tipo |
| `GET` | `/{id}` | ❌ | Detalhe por ID |
| `POST` | `/` | 🔒 | Cria linguagem |
| `PUT` | `/{id}` | 🔒 | Atualiza linguagem |
| `DELETE` | `/{id}` | 🔒 | Soft delete |

### Formato de erro

Todos os erros seguem o padrão RFC 7807:

```json
// Erro de negócio (4xx)
{ "title": "Conflito", "detail": "Já existe um usuário com este e-mail.", "status": 409 }

// Erro de validação (400)
{
  "type": "https://tools.ietf.org/html/rfc7807",
  "title": "Erro de validação",
  "status": 400,
  "errors": [
    { "field": "email",    "message": "O e-mail informado não é válido." },
    { "field": "password", "message": "A senha deve ter no mínimo 8 caracteres." }
  ]
}
```

---

## Dados Iniciais (Seed)

O banco é populado automaticamente na primeira execução com:

**7 Estados:** SP, RJ, MG, BA, RS, PR, SC

**14 Cidades:** São Paulo, Campinas, Santos, Rio de Janeiro, Niterói, Belo Horizonte, Uberlândia, Salvador, Porto Alegre, Caxias do Sul, Curitiba, Londrina, Florianópolis, Joinville

**21 Linguagens de Programação:**

| BackEnd | FrontEnd | Mobile | Database | DevOps |
|---------|----------|--------|----------|--------|
| C#, Python, Java, Go, Node.js | TypeScript, JavaScript, React, Angular, Vue.js | Flutter, React Native, Swift, Kotlin | PostgreSQL, MySQL, MongoDB, Redis | Docker, Kubernetes, Terraform |

---

## Testes

### Testes unitários (backend)

```bash
cd backend
dotnet test --verbosity normal
```

**Cobertura atual:**

| Suite | Testes | Descrição |
|-------|--------|-----------|
| `UserTests` | 10 | Entidade User: Create, Update, SoftDelete — caminhos feliz e falha |
| `DeveloperTests` | 11 | Entidade Developer: validações de linguagem, e-mail, cidade |
| `RegisterUserCommandHandlerTests` | 3 | Handler de cadastro com mock de repositório |
| `DeleteUserCommandHandlerTests` | 5 | Soft delete por e-mail, idempotência |
| `GetUserByEmailQueryHandlerTests` | 4 | Busca por e-mail, normalização, not found |
| `CreateDeveloperCommandHandlerTests` | 5 | CRUD developer: duplicidade, cidade inválida, sem linguagem |
| `GetDeveloperByEmailQueryHandlerTests` | 4 | Busca developer por e-mail |
| **Total** | **42** | |

### Testes de integração (auth)

Valida os endpoints de Login e Register com um servidor mock Node.js:

```bash
# Terminal 1
node integration-test/mock-server/mock-server.js

# Terminal 2
node integration-test/test-runner/integration-tests.js
```

**21 cenários** cobertos: status codes, formato de resposta, CORS, JWT, contrato com o AuthService Angular.

---

## Frontend

### Rotas

| Rota | Componente | Guard | Descrição |
|------|------------|-------|-----------|
| `/auth/login` | `LoginComponent` | `guestGuard` | Autenticação |
| `/auth/register` | `RegisterComponent` | `guestGuard` | Cadastro |
| `/developers` | `DeveloperListComponent` | `authGuard` | Listagem com filtros |
| `/developers/new` | `DeveloperFormComponent` | `authGuard` | Novo desenvolvedor |
| `/developers/:id/edit` | `DeveloperFormComponent` | `authGuard` | Editar desenvolvedor |
| `/languages` | `LanguageListComponent` | `authGuard` | Gestão de linguagens |
| `/locations` | `LocationsComponent` | `authGuard` | Estados e cidades (abas) |

### Sessão e segurança

- O token JWT é armazenado em **`sessionStorage`** (limpo ao fechar a aba)
- Três chaves: `dsm_token`, `dsm_user`, `dsm_expiry`
- Na inicialização da aplicação, `AuthService` verifica se o token expirou antes de restaurar a sessão
- O `jwtInterceptor` anexa `Authorization: Bearer <token>` em todas as requisições autenticadas
- O `guestGuard` redireciona usuários autenticados que tentam acessar `/auth/*` para `/developers`

### Formulário de desenvolvedor

O `DeveloperFormComponent` demonstra padrões avançados de Angular 19:

- **Cascata Estado→Cidade**: um `effect()` monitora o `FormControl` de estado e recarrega as cidades via `CityService.loadByState()`, limpando a seleção anterior automaticamente
- **Multi-select de linguagens**: checkboxes mapeadas para um `FormControl<string[]>` com o validator `minOneSelectedValidator`
- **Modo edição**: detecta `/:id` via `ActivatedRoute`, carrega o developer via `getById()` e preenche o formulário, aguardando o carregamento das cidades para fazer o patch do `cityId`

---

## Decisões de Design

### Result Pattern em vez de exceções

Os handlers da camada Application retornam `Result<T>` em vez de lançar exceções para erros de negócio. Isso torna o fluxo de erros explícito e testável:

```csharp
// Em vez de throw
if (existing is not null)
    return Result<UserDto>.Failure("Já existe um usuário com este e-mail.");

// Controller lê o resultado
return result.IsSuccess ? Ok(result.Value) : Conflict(new ProblemResponse(...));
```

### Soft Delete via Global Query Filter

```csharp
// Configuração (Fluent API)
builder.HasQueryFilter(u => !u.IsDeleted);
```

Todas as queries do EF Core filtram automaticamente registros deletados. Sem código adicional nos repositórios.

### Tabela de junção N:N explícita

O relacionamento Desenvolvedor↔Linguagem usa `DeveloperLanguage` como entidade própria (não shadow join table). Isso permite incluir `AssociatedAt` e ter controle total sobre a relação.

### CQRS sem Event Sourcing

O MediatR separa leitura (Queries) de escrita (Commands) sem a complexidade do Event Sourcing. Cada handler tem uma única responsabilidade e é facilmente testável com Moq.

### Signals em vez de RxJS para estado

No Angular, o estado de autenticação, listas e filtros usa `signal()` e `computed()`. O RxJS é mantido apenas onde é idiomático (Observables do `HttpClient`).

---

## Segurança

| Aspecto | Implementação |
|---------|---------------|
| Senhas | BCrypt com work factor 12 — nunca armazenadas em texto plano |
| Tokens | JWT HS256, expiração em 2 horas, `ClockSkew = Zero` |
| Autenticação | 401 genérico para credenciais inválidas (não revela se o e-mail existe) |
| CORS | Origens permitidas configuradas explicitamente, sem wildcard em produção |
| Container | Processo roda como usuário não-root (`uid 1001`) |
| Dados sensíveis | JWT_SECRET_KEY via variável de ambiente — nunca no repositório |
| Sessão | `sessionStorage` (não `localStorage`) — limpo ao fechar o browser |
| Headers | X-Frame-Options, X-Content-Type-Options, X-XSS-Protection via Nginx |