import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { DeveloperService, DeveloperFilters } from '../../../core/services/developer.service';
import { LanguageService } from '../../../core/services/language.service';
import { StateService } from '../../../core/services/state.service';
import { CityService } from '../../../core/services/city.service';
import { ToastService } from '../../../core/services/toast.service';
import { Seniority } from '../../../core/models/models';
import { SeniorityBadgeComponent } from '../../../shared/components/seniority-badge.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal.component';

@Component({
  selector: 'app-developer-list',
  standalone: true,
  imports: [RouterLink, FormsModule, SeniorityBadgeComponent, ConfirmModalComponent],
  template: `
    <div class="p-6 lg:p-8 space-y-6">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-slate-900">Desenvolvedores</h1>
          <p class="text-sm text-slate-500 mt-0.5">
            {{ svc.total() }} desenvolvedor{{ svc.total() !== 1 ? 'es' : '' }} encontrado{{ svc.total() !== 1 ? 's' : '' }}
          </p>
        </div>
        <a routerLink="/developers/new"
           class="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm
                  font-semibold text-white hover:bg-indigo-700 transition-colors">
          <span aria-hidden="true">+</span> Novo desenvolvedor
        </a>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-3 bg-white border border-slate-200 rounded-xl p-4">

        <select [(ngModel)]="filterSeniority" (change)="applyFilters()"
                class="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700
                       focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
          <option value="">Todas as senioridades</option>
          <option [value]="Seniority.Junior">Júnior</option>
          <option [value]="Seniority.Pleno">Pleno</option>
          <option [value]="Seniority.Senior">Sênior</option>
        </select>

        <select [(ngModel)]="filterState" (change)="onFilterStateChange()"
                class="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700
                       focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
          <option value="">Todos os estados</option>
          @for (s of stateSvc.states(); track s.id) {
            <option [value]="s.id">{{ s.uf }} — {{ s.name }}</option>
          }
        </select>

        <select [(ngModel)]="filterCity" (change)="applyFilters()"
                [disabled]="!filterState"
                class="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700
                       focus:ring-2 focus:ring-indigo-500 outline-none bg-white
                       disabled:opacity-50 disabled:cursor-not-allowed">
          <option value="">Todas as cidades</option>
          @for (c of filteredCities(); track c.id) {
            <option [value]="c.id">{{ c.name }}</option>
          }
        </select>

        <select [(ngModel)]="filterLanguage" (change)="applyFilters()"
                class="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700
                       focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
          <option value="">Todas as linguagens</option>
          @for (l of langSvc.languages(); track l.id) {
            <option [value]="l.id">{{ l.name }}</option>
          }
        </select>

        @if (hasFilters()) {
          <button (click)="clearFilters()"
                  class="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600
                         hover:bg-slate-50 transition-colors">
            Limpar filtros ✕
          </button>
        }
      </div>

      <!-- Table -->
      <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
        @if (svc.loading()) {
          <div class="flex items-center justify-center py-20">
            <svg class="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          </div>
        } @else {
          <table class="w-full text-sm">
            <thead class="bg-slate-50 border-b border-slate-200">
              <tr>
                <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nome</th>
                <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Senioridade</th>
                <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Localização</th>
                <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Linguagens</th>
                <th class="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (dev of svc.developers(); track dev.id) {
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="px-5 py-4">
                    <p class="font-medium text-slate-900">{{ dev.name }}</p>
                    <p class="text-xs text-slate-500">{{ dev.email }}</p>
                  </td>
                  <td class="px-5 py-4">
                    <app-seniority-badge [value]="dev.seniority" />
                  </td>
                  <td class="px-5 py-4 hidden md:table-cell text-slate-600">
                    {{ dev.cityName }}, {{ dev.stateUF }}
                  </td>
                  <td class="px-5 py-4 hidden lg:table-cell">
                    <div class="flex flex-wrap gap-1">
                      @for (lang of dev.languages.slice(0, 3); track lang.id) {
                        <span class="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5
                                     text-xs font-medium text-slate-700">{{ lang.name }}</span>
                      }
                      @if (dev.languages.length > 3) {
                        <span class="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5
                                     text-xs font-medium text-slate-500">
                          +{{ dev.languages.length - 3 }}
                        </span>
                      }
                    </div>
                  </td>
                  <td class="px-5 py-4">
                    <div class="flex items-center justify-end gap-2">
                      <a [routerLink]="['/developers', dev.id, 'edit']"
                         class="rounded-lg px-3 py-1.5 text-xs font-medium text-indigo-600
                                hover:bg-indigo-50 transition-colors">
                        Editar
                      </a>
                      <button (click)="confirmDelete(dev.id, dev.name)"
                              class="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600
                                     hover:bg-red-50 transition-colors">
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="px-5 py-16 text-center text-slate-400">
                    <p class="text-4xl mb-3" aria-hidden="true">👨‍💻</p>
                    <p class="font-medium text-slate-600">Nenhum desenvolvedor encontrado</p>
                    <p class="text-sm mt-1">Tente ajustar os filtros ou <a routerLink="/developers/new"
                       class="text-indigo-600 hover:underline">cadastre um novo</a>.</p>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>

      <!-- Pagination -->
      @if (svc.totalPages() > 1) {
        <div class="flex items-center justify-between">
          <p class="text-sm text-slate-500">
            Página {{ currentPage() }} de {{ svc.totalPages() }}
          </p>
          <div class="flex gap-2">
            <button (click)="goToPage(currentPage() - 1)" [disabled]="currentPage() === 1"
                    class="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700
                           hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              ← Anterior
            </button>
            <button (click)="goToPage(currentPage() + 1)" [disabled]="currentPage() === svc.totalPages()"
                    class="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700
                           hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              Próxima →
            </button>
          </div>
        </div>
      }
    </div>

    <!-- Confirm delete modal -->
    <app-confirm-modal
      [open]="modalOpen()"
      [message]="'Tem certeza que deseja excluir ' + (deleteTargetName() ?? 'este desenvolvedor') + '? Esta ação não pode ser desfeita.'"
      (confirm)="executeDelete()"
      (cancel)="modalOpen.set(false)"
    />
  `,
})
export class DeveloperListComponent implements OnInit {
  readonly svc       = inject(DeveloperService);
  readonly stateSvc  = inject(StateService);
  readonly citySvc   = inject(CityService);
  readonly langSvc   = inject(LanguageService);
  private readonly toast  = inject(ToastService);

  readonly Seniority = Seniority;

  // Filter state
  filterSeniority = '';
  filterState     = '';
  filterCity      = '';
  filterLanguage  = '';

  // Pagination
  readonly currentPage = signal(1);
  readonly pageSize    = 10;

  // Delete modal
  readonly modalOpen        = signal(false);
  readonly deleteTargetId   = signal<string | null>(null);
  readonly deleteTargetName = signal<string | null>(null);

  readonly hasFilters = computed(() =>
    !!(this.filterSeniority || this.filterState || this.filterCity || this.filterLanguage)
  );

  readonly filteredCities = computed(() =>
    this.filterState
      ? this.citySvc.cities().filter(c => c.stateId === this.filterState)
      : []
  );

  ngOnInit(): void {
    this.load();
    this.stateSvc.loadAll().subscribe();
    this.citySvc.loadAll().subscribe();
    this.langSvc.loadAll().subscribe();
  }

  private load(): void {
    const filters: DeveloperFilters = {
      page:     this.currentPage(),
      pageSize: this.pageSize,
    };
    if (this.filterSeniority) filters.seniority = Number(this.filterSeniority) as Seniority;
    if (this.filterCity)      filters.cityId    = this.filterCity;
    if (this.filterLanguage)  filters.languageId = this.filterLanguage;
    this.svc.load(filters).subscribe();
  }

  applyFilters(): void { this.currentPage.set(1); this.load(); }

  onFilterStateChange(): void {
    this.filterCity = '';
    this.applyFilters();
  }

  clearFilters(): void {
    this.filterSeniority = '';
    this.filterState     = '';
    this.filterCity      = '';
    this.filterLanguage  = '';
    this.applyFilters();
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.load();
  }

  confirmDelete(id: string, name: string): void {
    this.deleteTargetId.set(id);
    this.deleteTargetName.set(name);
    this.modalOpen.set(true);
  }

  executeDelete(): void {
    const id = this.deleteTargetId();
    if (!id) return;
    this.modalOpen.set(false);
    this.svc.delete(id).subscribe({
      next: () => { this.toast.success('Desenvolvedor excluído com sucesso.'); this.load(); },
      error: (e: HttpErrorResponse) => this.toast.error(e.error?.detail ?? 'Erro ao excluir.'),
    });
  }
}
