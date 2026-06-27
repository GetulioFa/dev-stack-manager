import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagedResult, UserDto } from '../models/models';

export interface UpdateUserRequest {
  name: string;
  email: string;
}

export interface DeleteUserRequest {
  email: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http  = inject(HttpClient);
  private readonly _base = `${environment.apiUrl}/users`;

  private readonly _users   = signal<UserDto[]>([]);
  private readonly _loading = signal(false);
  private readonly _total   = signal(0);

  readonly users   = computed(() => this._users());
  readonly loading = computed(() => this._loading());
  readonly total   = computed(() => this._total());

  load(page = 1, pageSize = 10): Observable<PagedResult<UserDto>> {
    this._loading.set(true);
    return this.http
      .get<PagedResult<UserDto>>(`${this._base}?page=${page}&pageSize=${pageSize}`)
      .pipe(tap(r => {
        this._users.set(r.items);
        this._total.set(r.totalCount);
        this._loading.set(false);
      }));
  }

  getById(id: string): Observable<UserDto> {
    return this.http.get<UserDto>(`${this._base}/${id}`);
  }

  getByEmail(email: string): Observable<UserDto> {
    return this.http.get<UserDto>(`${this._base}/by-email?email=${encodeURIComponent(email)}`);
  }

  /**
   * Updates name and email for the authenticated user.
   * Backend: PUT /api/users/{id}  →  { name, email }
   */
  update(id: string, payload: UpdateUserRequest): Observable<UserDto> {
    return this.http.put<UserDto>(`${this._base}/${id}`, payload).pipe(
      tap(updated => this._users.update(list =>
        list.map(u => u.id === id ? updated : u)
      ))
    );
  }

  /**
   * Soft-deletes a user identified by email.
   * Backend: DELETE /api/users  →  { email } in body
   */
  delete(email: string): Observable<void> {
    return this.http.delete<void>(this._base, { body: { email } as DeleteUserRequest }).pipe(
      tap(() => this._users.update(list => list.filter(u => u.email !== email)))
    );
  }
}
