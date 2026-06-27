// ─── Enums ────────────────────────────────────────────────────────────────────

export enum LanguageType {
  FrontEnd = 1,
  BackEnd = 2,
  Mobile = 3,
  Database = 4,
  DevOps = 5,
}

export enum Seniority {
  Junior = 1,
  Pleno = 2,
  Senior = 3,
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface UserDto {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface AuthTokenDto {
  token: string;
  tokenType: string;
  expiresAt: string;
  user: UserDto;
}

// ─── State ────────────────────────────────────────────────────────────────────

export interface StateDto {
  id: string;
  name: string;
  uf: string;
  createdAt: string;
}

export interface CreateStateRequest {
  name: string;
  uf: string;
}

// ─── City ─────────────────────────────────────────────────────────────────────

export interface CityDto {
  id: string;
  name: string;
  stateId: string;
  stateName: string;
  stateUF: string;
  createdAt: string;
}

export interface CreateCityRequest {
  name: string;
  stateId: string;
}

// ─── ProgrammingLanguage ──────────────────────────────────────────────────────

export interface LanguageDto {
  id: string;
  name: string;
  type: LanguageType;
  typeLabel: string;
  createdAt: string;
}

export interface CreateLanguageRequest {
  name: string;
  type: LanguageType;
}

// ─── Developer ────────────────────────────────────────────────────────────────

export interface DeveloperDto {
  id: string;
  name: string;
  email: string;
  seniority: Seniority;
  seniorityLabel: string;
  cityId: string;
  cityName: string;
  stateUF: string;
  languages: LanguageDto[];
  createdAt: string;
}

export interface CreateDeveloperRequest {
  name: string;
  email: string;
  seniority: Seniority;
  cityId: string;
  languageIds: string[];
}

export interface UpdateDeveloperRequest extends CreateDeveloperRequest {}

// ─── Shared ───────────────────────────────────────────────────────────────────

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface ProblemResponse {
  title: string;
  detail: string;
  status: number;
}

export interface ValidationProblemResponse {
  title: string;
  status: number;
  errors: Array<{ field: string; message: string }>;
}

// ─── App auth state ───────────────────────────────────────────────────────────

export interface AuthState {
  user: UserDto | null;
  token: string | null;
  isAuthenticated: boolean;
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

export interface SelectOption<T = string> {
  value: T;
  label: string;
}
