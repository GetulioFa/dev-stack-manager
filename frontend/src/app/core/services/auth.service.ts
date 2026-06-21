import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthState, AuthTokenDto, LoginRequest, RegisterRequest, UserDto } from '../models/models';

const TOKEN_KEY  = 'dsm_token';
const USER_KEY   = 'dsm_user';
const EXPIRY_KEY = 'dsm_expiry';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http   = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _state = signal<AuthState>(this._loadState());

  readonly currentUser     = computed(() => this._state().user);
  readonly isAuthenticated = computed(() => this._state().isAuthenticated);
  readonly token           = computed(() => this._state().token);

  login(payload: LoginRequest): Observable<AuthTokenDto> {
    return this.http
      .post<AuthTokenDto>(`${environment.apiUrl}/users/login`, payload)
      .pipe(tap(r => this._persist(r)));
  }

  register(payload: RegisterRequest): Observable<UserDto> {
    return this.http.post<UserDto>(`${environment.apiUrl}/users/register`, payload);
  }

  logout(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(EXPIRY_KEY);
    this._state.set({ user: null, token: null, isAuthenticated: false });
    this.router.navigate(['/auth/login']);
  }

  private _persist(r: AuthTokenDto): void {
    sessionStorage.setItem(TOKEN_KEY, r.token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(r.user));
    sessionStorage.setItem(EXPIRY_KEY, r.expiresAt);
    this._state.set({ user: r.user, token: r.token, isAuthenticated: true });
  }

  private _loadState(): AuthState {
    const empty: AuthState = { user: null, token: null, isAuthenticated: false };
    const token  = sessionStorage.getItem(TOKEN_KEY);
    const raw    = sessionStorage.getItem(USER_KEY);
    const expiry = sessionStorage.getItem(EXPIRY_KEY);
    if (!token || !raw) return empty;
    if (expiry && new Date(expiry) <= new Date()) { sessionStorage.clear(); return empty; }
    try {
      return { user: JSON.parse(raw), token, isAuthenticated: true };
    } catch { return empty; }
  }
}
