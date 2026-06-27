import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateLanguageRequest, LanguageDto, PagedResult } from '../models/models';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly http  = inject(HttpClient);
  private readonly _base = `${environment.apiUrl}/languages`;

  private readonly _languages = signal<LanguageDto[]>([]);
  private readonly _loading   = signal(false);
  private readonly _total     = signal(0);

  readonly languages = computed(() => this._languages());
  readonly loading   = computed(() => this._loading());
  readonly total     = computed(() => this._total());

  loadAll(page = 1, pageSize = 100): Observable<PagedResult<LanguageDto>> {
    this._loading.set(true);
    return this.http
      .get<PagedResult<LanguageDto>>(`${this._base}?page=${page}&pageSize=${pageSize}`)
      .pipe(
        tap(r => {
          this._languages.set(r.items);
          this._total.set(r.totalCount);
          this._loading.set(false);
        })
      );
  }

  create(payload: CreateLanguageRequest): Observable<LanguageDto> {
    return this.http.post<LanguageDto>(this._base, payload).pipe(
      tap(l => this._languages.update(list => [...list, l]))
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this._base}/${id}`);
  }
}
