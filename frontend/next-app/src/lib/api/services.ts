import { api } from './client';
import {
  AuthTokenDto, UserDto, StateDto, CityDto, LanguageDto, DeveloperDto,
  PagedResult, LanguageType, Seniority,
} from '@/types';

// Auth

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthTokenDto>('/users/login', { email, password }, false),

  register: (name: string, email: string, password: string) =>
    api.post<UserDto>('/users/register', { name, email, password }, false),
};

// Users

export const usersApi = {
  list: (page = 1, pageSize = 10) =>
    api.get<PagedResult<UserDto>>('/users', { page, pageSize }),

  getById: (id: string) =>
    api.get<UserDto>(`/users/${id}`),

  getByEmail: (email: string) =>
    api.get<UserDto>('/users/by-email', { email }),
  
  update: (currentEmail: string, name: string, email: string) =>
    api.put<UserDto>(`/users/${currentEmail}`, { name, email }),

  delete: (email: string) =>
    api.delete<void>(`/users/${email}`),

};

// States

export const statesApi = {
  list: (page = 1, pageSize = 50, stateId?: string) =>
    api.get<PagedResult<StateDto>>('/states', { page, pageSize, stateId }),

  getById: (id: string) =>
    api.get<StateDto>(`/states/${id}`),

  create: (name: string, uf: string) =>
    api.post<StateDto>('/states', { name, uf }),

  update: (id: string, name: string, uf: string) =>
    api.put<StateDto>(`/states/${id}`, { name, uf }),

  delete: (id: string) =>
    api.delete<void>(`/states/${id}`),
};

// Cities

export const citiesApi = {
  list: (page = 1, pageSize = 100, stateId?: string) =>
    api.get<PagedResult<CityDto>>('/cities', { page, pageSize, stateId }),

  getById: (id: string) =>
    api.get<CityDto>(`/cities/${id}`),

  create: (name: string, stateId: string) =>
    api.post<CityDto>('/cities', { name, stateId }),

  update: (id: string, name: string, stateId: string) =>
    api.put<CityDto>(`/cities/${id}`, { name, stateId }),

  delete: (id: string) =>
    api.delete<void>(`/cities/${id}`),
};

// Languages

export const languagesApi = {
  list: (page = 1, pageSize = 100, type?: LanguageType) =>
    api.get<PagedResult<LanguageDto>>('/languages', { page, pageSize, type }),

  getById: (id: string) =>
    api.get<LanguageDto>(`/languages/${id}`),

  create: (name: string, type: LanguageType) =>
    api.post<LanguageDto>('/languages', { name, type }),

  update: (id: string, name: string, type: LanguageType) =>
    api.put<LanguageDto>(`/languages/${id}`, { name, type }),

  delete: (id: string) =>
    api.delete<void>(`/languages/${id}`),
};

// Developers

export interface DeveloperFilters {
  page?: number;
  pageSize?: number;
  seniority?: Seniority;
  cityId?: string;
  languageId?: string;
  [key: string]: unknown;
}

export const developersApi = {
  list: (filters: DeveloperFilters = {}) =>
    api.get<PagedResult<DeveloperDto>>('/developers', {
      page:       filters.page ?? 1,
      pageSize:   filters.pageSize ?? 10,
      seniority:  filters.seniority,
      cityId:     filters.cityId,
      languageId: filters.languageId,
    }),

  getById: (id: string) =>
    api.get<DeveloperDto>(`/developers/${id}`),

  create: (data: {
    name: string; email: string; seniority: Seniority;
    cityId: string; languageIds: string[];
  }) => api.post<DeveloperDto>('/developers', data),

  update: (id: string, data: {
    name: string; email: string; seniority: Seniority;
    cityId: string; languageIds: string[];
  }) => api.put<DeveloperDto>(`/developers/${id}`, data),

  delete: (id: string) =>
    api.delete<void>(`/developers/${id}`),
};
