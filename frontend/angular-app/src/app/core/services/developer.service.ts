import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateDeveloperRequest,
  DeveloperDto,
  PagedResult,
  Seniority,
  UpdateDeveloperRequest,
} from '../models/models';

export interface DeveloperFilters {
  seniority?: Seniority;
  cityId?: string;
  languageId?: string;
  page?: number;
  pageSize?: number;
}

@Injectable({ providedIn: 'root' })
export class DeveloperService {
  private readonly http  = inject(HttpClient);
  private readonly _base = `${environment.apiUrl}/developers`;

  private readonly _developers = signal<DeveloperDto[]>([]);
  private readonly _loading    = signal(false);
  private readonly _total      = signal(0);
  private readonly _totalPages = signal(0);

  readonly developers  = computed(() => this._developers());
  readonly loading     = computed(() => this._loading());
  readonly total       = computed(() => this._total());
  readonly totalPages  = computed(() => this._totalPages());

  load(filters: DeveloperFilters = {}): Observable<PagedResult<DeveloperDto>> {
    this._loading.set(true);
    let params = new HttpParams()
      .set('page',     String(filters.page     ?? 1))
      .set('pageSize', String(filters.pageSize ?? 10));

    if (filters.seniority  != null) params = params.set('seniority',  String(filters.seniority));
    if (filters.cityId)              params = params.set('cityId',     filters.cityId);
    if (filters.languageId)          params = params.set('languageId', filters.languageId);

    return this.http.get<PagedResult<DeveloperDto>>(this._base, { params }).pipe(
      tap(r => {
        this._developers.set(r.items);
        this._total.set(r.totalCount);
        this._totalPages.set(r.totalPages);
        this._loading.set(false);
      })
    );
  }

  getById(id: string): Observable<DeveloperDto> {
    return this.http.get<DeveloperDto>(`${this._base}/${id}`);
  }

  getByEmail(email: string): Observable<DeveloperDto>{
    return this.http.get<DeveloperDto>(`${this._base}/${email}`);
  }

  create(payload: CreateDeveloperRequest): Observable<DeveloperDto> {
    return this.http.post<DeveloperDto>(this._base, payload).pipe(
      tap(d => this._developers.update(list => [d, ...list]))
    );
  }

  //alterado
  update(email: string, payload: UpdateDeveloperRequest): Observable<DeveloperDto> {
    return this.http.put<DeveloperDto>(`${this._base}/${email}`, payload).pipe(
      tap(updated => this._developers.update(list =>
        list.map(d => d.email === updated.email ? updated : d)
      ))
    );
  }

  delete(email: string): Observable<void> {
    return this.http.delete<void>(`${this._base}/${email}`).pipe(
      tap(() => this._developers.update(list => list.filter(d => d.email !== email)))
    );
  }

  export(filters: Omit<DeveloperFilters, 'page' | 'pageSize'> = {}): Observable<DeveloperDto[]> {
    let params = new HttpParams();
    if (filters.seniority  != null) params = params.set('seniority',  String(filters.seniority));
    if (filters.cityId)              params = params.set('cityId',     filters.cityId);
    if (filters.languageId)          params = params.set('languageId', filters.languageId);
    return this.http.get<DeveloperDto[]>(`${this._base}/export`, { params });
  }
}
