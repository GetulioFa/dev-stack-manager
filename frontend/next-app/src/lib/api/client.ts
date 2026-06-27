import { ApiError, ValidationError } from '@/types';

// console.log("URL de API sendo usada:", process.env.NEXT_PUBLIC_API_URL);

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Token helpers

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('dsm_token');
}

export function setToken(token: string, expiresAt: string): void {
  sessionStorage.setItem('dsm_token', token);
  sessionStorage.setItem('dsm_expiry', expiresAt);
}

export function clearToken(): void {
  sessionStorage.removeItem('dsm_token');
  sessionStorage.removeItem('dsm_expiry');
  sessionStorage.removeItem('dsm_user');
}

export function isTokenExpired(): boolean {
  const expiry = sessionStorage.getItem('dsm_expiry');
  if (!expiry) return true;
  return new Date(expiry) <= new Date();
}

// Error types

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly detail: string,
    public readonly validationErrors?: Array<{ field: string; message: string }>,
  ) {
    super(detail);
  }
}

// Core fetch

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
  auth?: boolean; // defaults to true
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, params, auth = true } = options;

  // Build URL with query params
  
  const normalizedBase = BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`;
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;

  let url = `${normalizedBase}${normalizedPath}`;

  if (params) {
    const qs = Object.entries(params)
      .filter(([, v]) => v != null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&');
    if (qs) url += `?${qs}`;
  }

  // Build headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  // No-content responses
  if (res.status === 204) return undefined as T;

  const contentType = res.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    // ValidationProblemResponse (400)
    if (res.status === 400 && data?.errors) {
      const ve = data as ValidationError;
      throw new ApiClientError(400, ve.title, ve.errors);
    }
    // ProblemResponse (4xx/5xx)
    const err = data as ApiError | null;
    throw new ApiClientError(
      res.status,
      err?.detail ?? err?.title ?? `Erro ${res.status}`,
    );
  }

  return data as T;
}

// Convenience methods

export const api = {
  get:    <T>(path: string, params?: RequestOptions['params'], auth = true) =>
    apiRequest<T>(path, { method: 'GET', params, auth }),

  post:   <T>(path: string, body: unknown, auth = true) =>
    apiRequest<T>(path, { method: 'POST', body, auth }),

  put:    <T>(path: string, body: unknown) =>
    apiRequest<T>(path, { method: 'PUT', body }),

  delete: <T>(path: string, body?: unknown) =>
    apiRequest<T>(path, { method: 'DELETE', body }),
};
