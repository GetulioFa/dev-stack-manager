import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateStateRequest, PagedResult, StateDto } from '../models/models';

@Injectable({ providedIn: 'root' })
export class StateService {
  private readonly http = inject(HttpClient);
  private readonly _base = `${environment.apiUrl}/states`;

  private readonly _states  = signal<StateDto[]>([]);
  private readonly _loading = signal(false);
  private readonly _total   = signal(0);

  readonly states  = computed(() => this._states());
  readonly loading = computed(() => this._loading());
  readonly total   = computed(() => this._total());

  loadAll(page = 1, pageSize = 100): Observable<PagedResult<StateDto>> {
    this._loading.set(true);
    return this.http
      .get<PagedResult<StateDto>>(`${this._base}?page=${page}&pageSize=${pageSize}`)
      .pipe(
        tap(r => {
          this._states.set(r.items);
          this._total.set(r.totalCount);
          this._loading.set(false);
        })
      );
  }

  create(payload: CreateStateRequest): Observable<StateDto> {
    return this.http.post<StateDto>(this._base, payload).pipe(
      tap(s => this._states.update(list => [...list, s]))
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this._base}/${id}`);
  }
}
