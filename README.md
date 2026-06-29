# DevStackManager

Plataforma Full Stack para gestão de desenvolvedores, construída com foco em
**qualidade de código**, **Clean Architecture**, **TDD** e **boas práticas de
engenharia de software**.

---

## Índice

- [Visão Geral](#visão-geral)
- [Histórico de Versões](#histórico-de-versões)
- [Arquitetura](#arquitetura)
- [Stack Tecnológica](#stack-tecnológica)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Início Rápido com Docker](#início-rápido-com-docker)
- [Execução Local (sem Docker)](#execução-local-sem-docker)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [API Reference](#api-reference)
- [Frontend — Next.js](#frontend--nextjs)
- [Relatório PDF de Desenvolvedores](#relatório-pdf-de-desenvolvedores)
- [Dados Iniciais (Seed)](#dados-iniciais-seed)
- [Testes](#testes)
- [Decisões de Design](#decisões-de-design)
- [Segurança](#segurança)

---

## Visão Geral

O DevStackManager permite cadastrar e gerenciar desenvolvedores com suas
senioridades, linguagens de programação e localizações. O sistema é composto
por uma **API REST em .NET 10** e dois frontends:

- **Angular 19** — SPA com Signals, Tailwind CSS e Dark Mode nativo
- **Next.js 14 + React 18** — SPA alternativo com shadcn/ui, Dark Mode e geração de relatório PDF

### Funcionalidades

- **Autenticação** com JWT — cadastro, login, sessão com expiração automática
- **Desenvolvedores** — CRUD completo com filtros por senioridade, cidade e linguagem
- **Relatório PDF** — exportação de desenvolvedores diretamente no browser (jsPDF)
- **Linguagens de Programação** — categorizadas por tipo (FrontEnd, BackEnd, Mobile, Database, DevOps)
- **Localizações** — gestão de Estados e Cidades com cascata de seleção no formulário
- **Soft Delete** em todas as entidades — dados preservados, nunca removidos fisicamente
- **Dark Mode** — suporte nativo em ambos os frontends, respeitando preferência do sistema
- **Documentação interativa** da API via Scalar (substitui Swagger)
- **Seed automático** — Estados, Cidades e Linguagens populados na primeira execução

---

## Histórico de Versões

### v2.0 — Frontend React/Next.js (atual)

- ✅ Novo frontend **Next.js 14** com **React 18**
- ✅ UI com **shadcn/ui** + **Radix UI** + **Tailwind CSS**
- ✅ Dark Mode via `next-themes` com opções: Claro / Escuro / Sistema
- ✅ Validação de formulários com **react-hook-form** + **Zod**
- ✅ Arquitetura **Generic CRUD** — `useCrud` hook + `CrudPage` componente reutilizáveis
- ✅ **Relatório PDF de Desenvolvedores** gerado no browser com **jsPDF** + **jspdf-autotable**
- ✅ Proxy reverso no Next.js (`next.config.ts`) eliminando CORS em produção
- ✅ Correções de integração: loop infinito por `useMemo`, DELETE com body, token JWT em edições
- ✅ Indicador de força de senha em tempo real no registro
- ✅ Filtros server-side para Desenvolvedores, Cidades e Linguagens; client-side para Estados
- ✅ Importação dinâmica de jsPDF (bundle size otimizado)
- ✅ Contrato `DeveloperExportDto` alinhado entre backend e frontend

### v1.1 — Frontend Angular + Integração

- ✅ Correções de integração entre Angular 19 e .NET 10:
  - CORS configurado no backend com origens explícitas
  - JWT 401 retorna JSON em vez de redirect HTML
  - `AddJsonOptions` com `CamelCase` para serialização correta
  - URL relativa `/api` no Angular (proxy CLI) em vez de absoluta
- ✅ Dark Mode no Angular via `darkMode: 'class'` + `ThemeService`
- ✅ Endpoint `DELETE /api/users` por e-mail (body) em vez de por ID na rota
- ✅ Novos endpoints `GET /api/users/by-email` e `GET /api/developers/by-email`
- ✅ Testes de integração Auth (21 cenários) com servidor mock Node.js

### v1.0 — Backend + Angular inicial

- ✅ API REST .NET 10 com Clean Architecture
- ✅ Módulo 1: Usuários e Autenticação (JWT, BCrypt, Soft Delete)
- ✅ Módulo 2: Estados, Cidades, Linguagens e Desenvolvedores (N:N explícito)
- ✅ CQRS com MediatR, Result Pattern, FluentValidation pipeline
- ✅ Seed automático com EF Core `HasData`
- ✅ Documentação com OpenAPI nativo .NET 10 + Scalar
- ✅ Docker Compose com multi-stage build e health check
- ✅ 42 testes unitários (xUnit + Moq + FluentAssertions)
- ✅ Frontend Angular 19 com Signals, lazy loading e guards

---

## Arquitetura

### Backend — Clean Architecture

```
DevStackManager/
├── DevStackManager.Domain          # Entidades, interfaces, Result Pattern, enums
│   ├── Entities/                   # User, Developer, State, City, ProgrammingLanguage,
│   │                               #   DeveloperLanguage (join table explícita)
│   ├── Interfaces/                 # IUserRepository, IDeveloperRepository, IUnitOfWork…
│   ├── Common/                     # Result<T> — sem dependências externas
│   └── Enums/                      # Seniority (Junior/Pleno/Senior), LanguageType
│
├── DevStackManager.Application     # Casos de uso — CQRS com MediatR
│   ├── Users/Commands/             # Register, Login, Update, Delete (por email)
│   ├── Users/Queries/              # GetById, GetByEmail, List
│   ├── Developers/Commands/        # Create, Update, Delete
│   ├── Developers/Queries/         # GetById, GetByEmail, ListPaged, Export
│   ├── States/ Cities/ Languages/  # CRUD handlers + FluentValidation
│   ├── DTOs/                       # Records camelCase (serialização automática)
│   └── Common/                     # ValidationPipelineBehavior
│
├── DevStackManager.Infrastructure  # Implementações concretas
│   ├── Data/AppDbContext.cs        # EF Core + IUnitOfWork + Seed
│   ├── Data/Configurations/        # Fluent API — índices únicos, soft delete global,
│   │                               #   chave composta N:N, HasQueryFilter
│   ├── Data/Seed/DataSeeder.cs     # 7 estados, 14 cidades, 21 linguagens (HasData)
│   ├── Repositories/               # StateRepository, CityRepository, DeveloperRepository…
│   └── Services/                   # PasswordHasher (BCrypt wf=12), TokenService (JWT)
│
├── DevStackManager.Api             # Camada HTTP
│   ├── Controllers/                # UsersController, DevelopersController,
│   │                               #   StatesController, CitiesController, LanguagesController
│   └── Program.cs                  # DI, CORS, JWT Bearer, OpenAPI, migrations auto
│
└── DevStackManager.Tests           # xUnit + Moq + FluentAssertions (42 testes)
    ├── Domain/                     # UserTests (10), DeveloperTests (11)
    └── Application/                # Handler tests com mocks (21)
```

### Frontend Next.js — Feature-based Architecture

```
dsm-next/src/
├── app/                            # Next.js App Router
│   ├── auth/
│   │   ├── login/page.tsx          # Tela de login com show/hide senha
│   │   └── register/page.tsx       # Cadastro com indicador de força de senha
│   ├── dashboard/
│   │   ├── layout.tsx              # Shell: sidebar + theme switcher + logout
│   │   ├── developers/page.tsx     # CRUD + filtros + botão Exportar PDF
│   │   ├── languages/page.tsx      # CRUD com badges por tipo
│   │   ├── cities/page.tsx         # CRUD com cascata Estado→Cidade
│   │   ├── states/page.tsx         # CRUD sem filtro (client-side)
│   │   └── users/page.tsx          # CRUD (edição + soft delete por email)
│   ├── layout.tsx                  # ThemeProvider + AuthProvider + Toaster
│   └── globals.css                 # Tokens CSS shadcn/ui light + dark
│
├── components/
│   ├── crud/
│   │   ├── crud-page.tsx           # Componente genérico: header + filtros + tabela + dialogs
│   │   └── data-table.tsx          # Tabela genérica com skeleton e paginação
│   └── ui/
│       └── report-button.tsx       # Dropdown PDF: todos / filtro atual / por senioridade
│
├── lib/
│   ├── api/
│   │   ├── client.ts               # Fetch wrapper: JWT, erros tipados, URL relativa/SSR
│   │   └── services.ts             # authApi, usersApi, statesApi, citiesApi,
│   │                               #   languagesApi, developersApi (incl. export)
│   ├── hooks/
│   │   ├── use-auth.tsx            # AuthContext + sessionStorage
│   │   ├── use-crud.ts             # Generic CRUD hook com ref para evitar loop
│   │   └── use-pdf-report.ts       # Gera PDF com jsPDF + autotable
│   └── schemas/
│       └── index.ts                # Zod schemas (login, register, user, state,
│                                   #   city, language, developer)
└── types/
    └── index.ts                    # Enums, DTOs, DeveloperExportDto, PagedResult
```

---

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

### Frontend Next.js (v2.0)

| Camada | Tecnologia | Versão |
|--------|------------|--------|
| Framework | Next.js | 14.2.13 |
| UI Library | React | 18.3.1 |
| Linguagem | TypeScript | 5.6.x |
| Componentes | shadcn/ui + Radix UI | — |
| Estilização | Tailwind CSS | 3.4.x |
| Dark Mode | next-themes | 0.3.x |
| Formulários | react-hook-form | 7.53.x |
| Validação | Zod | 3.23.x |
| Toasts | Sonner | 1.5.x |
| Ícones | Lucide React | 0.441.x |
| Geração de PDF | jsPDF + jspdf-autotable | 2.5.x / 3.8.x |
| Utilitários | clsx + tailwind-merge | — |

### Frontend Angular (v1.x)

| Camada | Tecnologia | Versão |
|--------|------------|--------|
| Framework | Angular (Standalone Components) | 19 |
| Estilização | Tailwind CSS | 3.4.x |
| Estado | Angular Signals | — |
| HTTP | HttpClient + HttpInterceptorFn | — |

### Infraestrutura

| Serviço | Tecnologia |
|---------|------------|
| Containerização | Docker + Docker Compose |
| Servidor web | Nginx 1.27 (Alpine) — frontend prod |
| Runtime API | ASP.NET Core (Alpine) |
| Proxy dev (Next.js) | `next.config.ts` rewrites `/api/*` → backend |
| Proxy dev (Angular) | `proxy.conf.json` → `localhost:5000` |

---

## Estrutura do Projeto

```
devstackmanager/
├── backend/                        # Solution .NET
│   ├── DevStackManager.sln
│   ├── DevStackManager.Domain/
│   ├── DevStackManager.Application/
│   ├── DevStackManager.Infrastructure/
│   ├── DevStackManager.Api/
│   ├── DevStackManager.Tests/
│   ├── Dockerfile
│   └── .dockerignore
│
├── frontend-angular/               # Angular 19
│   ├── src/
│   ├── angular.json
│   ├── package.json
│   ├── proxy.conf.json
│   ├── Dockerfile
│   └── nginx.conf
│
├── frontend-next/                  # Next.js 14 + React 18  ← NOVO
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── types/
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── components.json
│   └── package.json
│
└── docker/
    ├── docker-compose.yml
    ├── docker-compose.dev.yml
    └── .env.example
```

---

## Pré-requisitos

### Docker (recomendado)
- Docker Desktop ≥ 24.0

### Local — Backend
- .NET SDK 10

### Local — Frontend Next.js
- Node.js ≥ 22 LTS

### Local — Frontend Angular
- Node.js ≥ 22 LTS
- Angular CLI 19: `npm install -g @angular/cli@19`

---

## Início Rápido com Docker

```bash
# 1. Configure as variáveis de ambiente
cp docker/.env.example docker/.env
# Edite docker/.env e defina JWT_SECRET_KEY:
#   openssl rand -base64 64

# 2. Suba os containers
cd docker
docker compose up --build -d

# 3. Aguarde o health check (~20s)
docker compose ps
```

| Serviço | URL |
|---------|-----|
| Frontend Angular | http://localhost |
| API Backend | http://localhost:5000 |
| Documentação Scalar | http://localhost:5000/scalar/v1 |

---

## Execução Local (sem Docker)

### Backend

```bash
cd backend

dotnet restore

# Criar e aplicar migrations (gera banco SQLite + seed automático)
dotnet ef migrations add InitialCreate \
  --project DevStackManager.Infrastructure \
  --startup-project DevStackManager.Api

dotnet ef database update \
  --project DevStackManager.Infrastructure \
  --startup-project DevStackManager.Api

dotnet run --project DevStackManager.Api
# API em http://localhost:5000
# Scalar em http://localhost:5000/scalar/v1
```

### Frontend Next.js

```bash
cd frontend-next

# Instalar dependências (inclui jsPDF para relatório PDF)
npm install

# Instalar componentes shadcn/ui
npx shadcn-ui@latest add button input label card badge
npx shadcn-ui@latest add dialog alert-dialog dropdown-menu
npx shadcn-ui@latest add select table avatar separator
npx shadcn-ui@latest add checkbox scroll-area skeleton

# Copiar e configurar .env
cp .env.local.example .env.local
# BACKEND_URL=http://localhost:5000 (já é o padrão)

npm run dev
# Disponível em http://localhost:3000
```

### Frontend Angular

```bash
cd frontend-angular
npm install
npm start
# Disponível em http://localhost:4200
# Proxy: /api/* → http://localhost:5000
```

---

## Variáveis de Ambiente

### Backend

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `ConnectionStrings__DefaultConnection` | SQLite connection string | `Data Source=devstackmanager.db` |
| `JwtSettings__SecretKey` | Chave secreta JWT (≥ 32 chars) | — ⚠️ **Obrigatório trocar** |
| `JwtSettings__Issuer` | Emissor do token | `DevStackManager` |
| `JwtSettings__Audience` | Audiência do token | `DevStackManager` |
| `JwtSettings__ExpiresInHours` | Expiração do token | `2` |
| `Cors__AllowedOrigins__0` | Origem CORS permitida | `http://localhost:4200` |
| `Cors__AllowedOrigins__1` | Origem CORS adicional | `http://localhost:3000` |
| `ASPNETCORE_ENVIRONMENT` | Ambiente | `Production` |

> ⚠️ Nunca commite o `JwtSettings__SecretKey` real. Use variáveis de ambiente ou um secrets manager.

### Frontend Next.js

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `BACKEND_URL` | URL do backend (server-side/SSR) | `http://localhost:5000` |
| `NEXT_PUBLIC_API_URL` | URL da API (browser — raramente necessário) | `/api` |

> O Next.js usa o rewrite `/api/*` → `BACKEND_URL/api/*` em todos os ambientes, eliminando CORS.

---

## API Reference

### Autenticação

Endpoints marcados com 🔒 exigem header:
```
Authorization: Bearer <token>
```
Token obtido via `POST /api/users/login`. Expira em 2 horas.

---

### Usuários `/api/users`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `POST` | `/register` | ❌ | Cadastra novo usuário |
| `POST` | `/login` | ❌ | Autentica e retorna JWT |
| `GET` | `/` | 🔒 | Lista usuários (paginado) |
| `GET` | `/{id}` | 🔒 | Busca por ID |
| `GET` | `/by-email?email=` | 🔒 | Busca por e-mail |
| `PUT` | `/{id}` | 🔒 | Atualiza nome e e-mail |
| `DELETE` | `/` | 🔒 | **Soft delete por e-mail** (body `{ email }`) |

> **Nota:** O DELETE de usuário usa body `{ email: string }` em vez de ID na rota. Isso permite exclusão sem expor IDs internos e respeita o contrato de identidade por e-mail único.

### Desenvolvedores `/api/developers`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/` | 🔒 | Lista paginada + filtros |
| `GET` | `/{id}` | 🔒 | Detalhe completo |
| `GET` | `/by-email?email=` | 🔒 | Busca por e-mail |
| `GET` | `/export` | 🔒 | **Exportação para relatório** (sem paginação) |
| `POST` | `/` | 🔒 | Cria desenvolvedor |
| `PUT` | `/{id}` | 🔒 | Atualiza desenvolvedor |
| `DELETE` | `/{id}` | 🔒 | Soft delete por ID |

**Filtros em `GET /` e `GET /export`:**

| Parâmetro | Tipo | Valores |
|-----------|------|---------|
| `page` | int | default: 1 |
| `pageSize` | int | default: 10, máx: 100 |
| `seniority` | int | 1=Junior, 2=Pleno, 3=Senior |
| `cityId` | guid | — |
| `languageId` | guid | — |

**`GET /export` — shape de retorno (`DeveloperExportDto`):**
```json
[
  {
    "name":      "João Silva",
    "email":     "joao@dev.com",
    "seniority": "Senior",
    "city":      "São Paulo",
    "state":     "SP",
    "languages": "C#, TypeScript, Docker",
    "createdAt": "2024-01-15T10:00:00Z"
  }
]
```

> Diferente do `DeveloperDto` (usado na listagem), o `DeveloperExportDto` retorna strings pré-formatadas — sem paginação, ideal para relatórios.

### Estados, Cidades, Linguagens

| Controller | GET list | GET by-id | POST | PUT | DELETE | Auth mutações |
|-----------|----------|-----------|------|-----|--------|----------------|
| `/api/states` | ❌ | ❌ | 🔒 | 🔒 | 🔒 | ✅ |
| `/api/cities?stateId=` | ❌ | ❌ | 🔒 | 🔒 | 🔒 | ✅ |
| `/api/languages?type=` | ❌ | ❌ | 🔒 | 🔒 | 🔒 | ✅ |

### Formato de erro (RFC 7807)

```json
// Erro de negócio
{ "title": "Conflito", "detail": "Já existe um estado com a UF 'SP'.", "status": 409 }

// Erro de validação
{
  "title": "Erro de validação",
  "status": 400,
  "errors": [
    { "field": "email",    "message": "O e-mail informado não é válido." },
    { "field": "password", "message": "A senha deve ter no mínimo 8 caracteres." }
  ]
}
```

---

## Frontend — Next.js

### Rotas

| Rota | Componente | Guard | Descrição |
|------|------------|-------|-----------|
| `/auth/login` | `LoginPage` | `guestGuard` | Login com show/hide senha |
| `/auth/register` | `RegisterPage` | `guestGuard` | Registro com strength indicator |
| `/dashboard/developers` | `DevelopersPage` | `authGuard` | CRUD + filtros + **Exportar PDF** |
| `/dashboard/languages` | `LanguagesPage` | `authGuard` | CRUD + badges por tipo |
| `/dashboard/cities` | `CitiesPage` | `authGuard` | CRUD + filtro por estado |
| `/dashboard/states` | `StatesPage` | `authGuard` | CRUD simples |
| `/dashboard/users` | `UsersPage` | `authGuard` | CRUD + soft delete por email |

### Arquitetura Generic CRUD

O padrão elimina duplicação entre os 5 módulos de listagem:

```
useCrud<T, F>()              ← hook: estado, paginação, loading, CRUD actions
    ↓
CrudPage<T>                  ← componente: header + filtros + tabela + dialogs
    ↓
DataTable<T>                 ← tabela: columns config, skeleton, paginação
```

Cada página define apenas:
1. `CRUD_OPTIONS` — `listFn`, `createFn`, `updateFn`, `deleteFn` (fora do componente para evitar loop)
2. `columns` — array `{ key, header, cell }`
3. Formulário específico da entidade

### Dark Mode

Controlado via `next-themes`. O dropdown no rodapé da sidebar oferece três opções:
- ☀️ **Claro** — força tema claro
- 🌙 **Escuro** — força tema escuro
- 💻 **Sistema** — segue a preferência do OS

Implementado com tokens CSS HSL no `globals.css` — todos os componentes shadcn/ui respondem automaticamente.

### Sessão e Segurança

- Token JWT armazenado em **`sessionStorage`** (apagado ao fechar a aba)
- Chaves: `dsm_token`, `dsm_expiry`, `dsm_user`
- `AuthProvider` verifica expiração do token na inicialização
- `jwtInterceptor` em `client.ts` injeta `Authorization: Bearer` em toda requisição autenticada
- URL **sempre relativa** (`/api`) no browser → sem CORS; absoluta só no SSR via `BACKEND_URL`

---

## Relatório PDF de Desenvolvedores

Gerado inteiramente no browser, sem dependência de servidor. Usa o endpoint
existente `GET /api/developers/export`.

### Como gerar

1. Acesse `/dashboard/developers`
2. Clique em **"Exportar PDF"** (ao lado de "Novo desenvolvedor")
3. Escolha o escopo no dropdown:
   - **Todos os desenvolvedores** — sem filtro
   - **Apenas filtro atual** — espelha os filtros ativos na listagem
   - **Por senioridade** — Júnior / Pleno / Sênior individualmente
4. O PDF é baixado automaticamente

### Estrutura do PDF gerado

```
┌──────────────────────────────────────────────────────────────┐
│  DevStackManager             Gerado em: 28/06/2026 14:30     │  ← slate-800
│  Relatório de Desenvolvedores                                │
├──────────────────────────────────────────────────────────────┤
│  Total: 42 desenvolvedores   Júnior: 15  Pleno: 18  Sênior: 9  │
├────┬───────────────┬─────────────┬────────────┬─────────────────┬──────────────┤
│  # │ Nome          │ Localização │ Senioridade│ Linguagens      │ E-mail       │
├────┼───────────────┼─────────────┼────────────┼─────────────────┼──────────────┤
│  1 │ João Silva    │ SP, São Paulo│ Sênior    │ C#, TypeScript  │ joao@...     │
└────┴───────────────┴─────────────┴────────────┴─────────────────┴──────────────┘
 DevStackManager — Relatório Confidencial             Página 1 de N
```

### Dependências do relatório

```json
"jspdf":           "^2.5.1",
"jspdf-autotable": "^3.8.2"
```

Importadas dinamicamente (`import()`) — não afetam o bundle inicial da aplicação.

### Arquivos relacionados

| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/lib/hooks/use-pdf-report.ts` | Hook: busca dados + gera PDF |
| `src/components/ui/report-button.tsx` | Dropdown com opções de escopo |
| `src/lib/api/services.ts` → `developersApi.export()` | Chamada a `GET /api/developers/export` |
| `src/types/index.ts` → `DeveloperExportDto` | Tipo alinhado com o backend |

---

## Dados Iniciais (Seed)

Populados automaticamente na primeira execução via EF Core `HasData` com GUIDs fixos (idempotente):

**7 Estados:** SP, RJ, MG, BA, RS, PR, SC

**14 Cidades:** São Paulo, Campinas, Santos, Rio de Janeiro, Niterói, Belo Horizonte, Uberlândia, Salvador, Porto Alegre, Caxias do Sul, Curitiba, Londrina, Florianópolis, Joinville

**21 Linguagens:**

| BackEnd | FrontEnd | Mobile | Database | DevOps |
|---------|----------|--------|----------|--------|
| C#, Python, Java, Go, Node.js | TypeScript, JavaScript, React, Angular, Vue.js | Flutter, React Native, Swift, Kotlin | PostgreSQL, MySQL, MongoDB, Redis | Docker, Kubernetes, Terraform |

---

## Testes

### Testes unitários (Backend)

```bash
cd backend
dotnet test --verbosity normal
```

| Suite | Testes | Cobertura |
|-------|--------|-----------|
| `UserTests` | 10 | Entidade User: Create, Update, SoftDelete |
| `DeveloperTests` | 11 | Entidade Developer: linguagens, email, cidade |
| `RegisterUserCommandHandlerTests` | 3 | Cadastro, email duplicado, senha nunca em texto plano |
| `DeleteUserCommandHandlerTests` | 5 | Soft delete por email, idempotência, não persiste em falha |
| `GetUserByEmailQueryHandlerTests` | 4 | Busca por email, normalização, not found, input vazio |
| `CreateDeveloperCommandHandlerTests` | 5 | Criação, duplicidade, cidade inválida, sem linguagem |
| `GetDeveloperByEmailQueryHandlerTests` | 4 | Busca developer por email |
| **Total** | **42** | |

### Testes de integração Auth (Next.js / Angular)

Valida os endpoints de Login e Register com servidor mock Node.js:

```bash
# Terminal 1
node integration-test/mock-server/mock-server.js

# Terminal 2
node integration-test/test-runner/integration-tests.js
```

**21 cenários:** status codes, formato de resposta, CORS, JWT, contrato com AuthService.

---

## Decisões de Design

### `CRUD_OPTIONS` fora do componente React

Funções definidas dentro de componentes com `useMemo` não garantem estabilidade de referência entre re-renders. Como o `useCrud` usa `listFn` como dependência de `useEffect`, identidades instáveis causam loop infinito. A solução é definir as opções no escopo do módulo.

```ts
// ❌ Loop infinito — useMemo recria funções a cada render
const opts = useMemo(() => ({ listFn: ..., deleteFn: ... }), []);

// ✅ Estável — definido uma vez no módulo
const CRUD_OPTIONS = { listFn: ..., deleteFn: ... };
```

### DELETE de usuário por e-mail (não por ID)

O backend implementa `DELETE /api/users` com body `{ email }` em vez de `DELETE /api/users/{id}`. Isso:
- Evita expor IDs internos na rota
- Garante que a exclusão seja feita pela identidade de negócio (email único)
- Previne exclusões acidentais por ID incorreto

### `DeveloperExportDto` vs `DeveloperDto`

O endpoint `/export` retorna um DTO flat otimizado para relatórios: `Languages` como string CSV, `City`/`State` como strings simples. Isso elimina joins no cliente e reduz o payload. O frontend define `DeveloperExportDto` espelhando exatamente esse contrato, sem conversões.

### Result Pattern em vez de exceções

```csharp
// Handlers retornam Result<T> — fluxo de erro explícito e testável
if (existing is not null)
    return Result<UserDto>.Failure("Já existe um usuário com este e-mail.");
```

### Soft Delete via Global Query Filter

```csharp
builder.HasQueryFilter(u => !u.IsDeleted);
```

Filtro global no EF Core — todas as queries excluem registros deletados automaticamente, sem código adicional nos repositórios.

### Proxy reverso no Next.js

```ts
// next.config.ts — elimina CORS em todos os ambientes
rewrites: () => [{ source: '/api/:path*', destination: `${BACKEND_URL}/api/:path*` }]
```

No browser, toda chamada vai para `/api/...` (relativo). O Next.js Server intercepta e encaminha para o backend. Zero configuração de CORS necessária em produção.

---

## Segurança

| Aspecto | Implementação |
|---------|---------------|
| Senhas | BCrypt com work factor 12 — nunca armazenadas em texto plano |
| Tokens | JWT HS256, expiração 2h, `ClockSkew = Zero` |
| Autenticação | 401 genérico para credenciais inválidas (não revela se e-mail existe) |
| CORS | Origens explícitas — sem wildcard em produção |
| Containers | Processo como usuário não-root (`uid 1001`) |
| Segredos | `JwtSettings__SecretKey` via variável de ambiente — nunca no repositório |
| Sessão | `sessionStorage` — limpa ao fechar o browser |
| Headers HTTP | `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection` via Nginx |
| URL da API | Sempre relativa no browser — sem tokens em URLs absolutas |
