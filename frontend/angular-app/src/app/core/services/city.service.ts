import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CityDto, CreateCityRequest, PagedResult } from '../models/models';

@Injectable({ providedIn: 'root' })
export class CityService {
  private readonly http  = inject(HttpClient);
  private readonly _base = `${environment.apiUrl}/cities`;

  private readonly _cities  = signal<CityDto[]>([]);
  private readonly _loading = signal(false);
  private readonly _total   = signal(0);

  readonly cities  = computed(() => this._cities());
  readonly loading = computed(() => this._loading());
  readonly total   = computed(() => this._total());

  loadAll(page = 1, pageSize = 200, stateId?: string): Observable<PagedResult<CityDto>> {
    this._loading.set(true);
    let url = `${this._base}?page=${page}&pageSize=${pageSize}`;
    if (stateId) url += `&stateId=${stateId}`;
    return this.http.get<PagedResult<CityDto>>(url).pipe(
      tap(r => {
        this._cities.set(r.items);
        this._total.set(r.totalCount);
        this._loading.set(false);
      })
    );
  }

  /** Load cities filtered by a specific state — used for cascading dropdowns */
  loadByState(stateId: string): Observable<PagedResult<CityDto>> {
    return this.loadAll(1, 200, stateId);
  }

  create(payload: CreateCityRequest): Observable<CityDto> {
    return this.http.post<CityDto>(this._base, payload).pipe(
      tap(c => this._cities.update(list => [...list, c]))
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this._base}/${id}`);
  }
}
