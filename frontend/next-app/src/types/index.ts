// ─── Enums (mirror backend DevStackManager.Domain.Enums) ──────────────────────

export enum LanguageType {
  FrontEnd = 1,
  BackEnd  = 2,
  Mobile   = 3,
  Database = 4,
  DevOps   = 5,
}

export const LANGUAGE_TYPE_LABELS: Record<LanguageType, string> = {
  [LanguageType.FrontEnd]: 'Front-End',
  [LanguageType.BackEnd]:  'Back-End',
  [LanguageType.Mobile]:   'Mobile',
  [LanguageType.Database]: 'Database',
  [LanguageType.DevOps]:   'DevOps',
};

export enum Seniority {
  Junior = 1,
  Pleno  = 2,
  Senior = 3,
}

export const SENIORITY_LABELS: Record<Seniority, string> = {
  [Seniority.Junior]: 'Júnior',
  [Seniority.Pleno]:  'Pleno',
  [Seniority.Senior]: 'Sênior',
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

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

// ─── City ─────────────────────────────────────────────────────────────────────

export interface CityDto {
  id: string;
  name: string;
  stateId: string;
  stateName: string;
  stateUF: string;
  createdAt: string;
}

// ─── Language ─────────────────────────────────────────────────────────────────

export interface LanguageDto {
  id: string;
  name: string;
  type: LanguageType;
  typeLabel: string;
  createdAt: string;
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

// ─── Shared ───────────────────────────────────────────────────────────────────

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface ApiError {
  title: string;
  detail: string;
  status: number;
}

export interface ValidationError {
  title: string;
  status: number;
  errors: Array<{ field: string; message: string }>;
}
