import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { StateService } from '../../core/services/state.service';
import { CityService } from '../../core/services/city.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal.component';
import { FieldErrorComponent } from '../../shared/components/field-error.component';
import { ProblemResponse } from '../../core/models/models';

type Tab = 'states' | 'cities';

@Component({
  selector: 'app-locations',
  standalone: true,
  imports: [ReactiveFormsModule, ConfirmModalComponent, FieldErrorComponent],
  template: `
    <div class="p-6 lg:p-8 space-y-6">

      <div>
        <h1 class="text-xl font-bold text-slate-900">Localizações</h1>
        <p class="text-sm text-slate-500 mt-0.5">Gerencie estados e cidades do sistema.</p>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-slate-200 gap-0">
        @for (tab of tabs; track tab.key) {
          <button (click)="activeTab.set(tab.key)"
                  class="px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px"
                  [class]="activeTab() === tab.key
                           ? 'border-indigo-600 text-indigo-600'
                           : 'border-transparent text-slate-500 hover:text-slate-700'">
            {{ tab.label }}
          </button>
        }
      </div>

      <!-- ── STATES TAB ──────────────────────────────────────────────────── -->
      @if (activeTab() === 'states') {
        <div class="space-y-5">
          <!-- Add state form -->
          <div class="bg-white border border-slate-200 rounded-xl p-5">
            <h2 class="text-sm font-semibold text-slate-700 mb-4">Cadastrar estado</h2>
            <form [formGroup]="stateForm" (ngSubmit)="submitState()" novalidate
                  class="flex flex-wrap gap-4 items-end">
              <div class="flex-1 min-w-48 space-y-1">
                <label for="s-name" class="block text-xs font-medium text-slate-600">Nome</label>
                <input id="s-name" type="text" formControlName="name" placeholder="ex: Pará"
                       class="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all
                              focus:ring-2 focus:ring-indigo-500"
                       [class]="sfc('name')" />
                <app-field-error [message]="sErr('name')" />
              </div>
              <div class="w-28 space-y-1">
                <label for="s-uf" class="block text-xs font-medium text-slate-600">UF</label>
                <input id="s-uf" type="text" formControlName="uf" placeholder="PA"
                       maxlength="2"
                       class="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all
                              focus:ring-2 focus:ring-indigo-500 uppercase"
                       [class]="sfc('uf')" />
                <app-field-error [message]="sErr('uf')" />
              </div>
              <button type="submit" [disabled]="stateSubmitting()"
                      class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white
                             hover:bg-indigo-700 disabled:opacity-60 transition-colors">
                {{ stateSubmitting() ? 'Salvando…' : 'Cadastrar' }}
              </button>
            </form>
          </div>

          <!-- States list -->
          <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table class="w-full text-sm">
              <thead class="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">UF</th>
                  <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Nome</th>
                  <th class="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (s of stateSvc.states(); track s.id) {
                  <tr class="hover:bg-slate-50 transition-colors">
                    <td class="px-5 py-3">
                      <span class="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5
                                   text-xs font-bold text-slate-700">{{ s.uf }}</span>
                    </td>
                    <td class="px-5 py-3 text-slate-700">{{ s.name }}</td>
                    <td class="px-5 py-3 text-right">
                      <button (click)="confirmDeleteState(s.id, s.name)"
                              class="text-xs text-red-500 hover:text-red-700 transition-colors">
                        Excluir
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="3" class="px-5 py-12 text-center text-slate-400 text-sm">
                      Nenhum estado cadastrado.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- ── CITIES TAB ──────────────────────────────────────────────────── -->
      @if (activeTab() === 'cities') {
        <div class="space-y-5">
          <!-- Add city form -->
          <div class="bg-white border border-slate-200 rounded-xl p-5">
            <h2 class="text-sm font-semibold text-slate-700 mb-4">Cadastrar cidade</h2>
            <form [formGroup]="cityForm" (ngSubmit)="submitCity()" novalidate
                  class="flex flex-wrap gap-4 items-end">
              <div class="flex-1 min-w-48 space-y-1">
                <label for="c-name" class="block text-xs font-medium text-slate-600">Nome</label>
                <input id="c-name" type="text" formControlName="name" placeholder="ex: Belém"
                       class="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all
                              focus:ring-2 focus:ring-indigo-500"
                       [class]="cfc('name')" />
                <app-field-error [message]="cErr('name')" />
              </div>
              <div class="flex-1 min-w-48 space-y-1">
                <label for="c-state" class="block text-xs font-medium text-slate-600">Estado</label>
                <select id="c-state" formControlName="stateId"
                        class="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all
                               focus:ring-2 focus:ring-indigo-500 bg-white"
                        [class]="cfc('stateId')">
                  <option value="">Selecione…</option>
                  @for (s of stateSvc.states(); track s.id) {
                    <option [value]="s.id">{{ s.uf }} — {{ s.name }}</option>
                  }
                </select>
                <app-field-error [message]="cErr('stateId')" />
              </div>
              <button type="submit" [disabled]="citySubmitting()"
                      class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white
                             hover:bg-indigo-700 disabled:opacity-60 transition-colors">
                {{ citySubmitting() ? 'Salvando…' : 'Cadastrar' }}
              </button>
            </form>
          </div>

          <!-- Cities list -->
          <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table class="w-full text-sm">
              <thead class="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Cidade</th>
                  <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Estado</th>
                  <th class="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (c of citySvc.cities(); track c.id) {
                  <tr class="hover:bg-slate-50 transition-colors">
                    <td class="px-5 py-3 text-slate-700">{{ c.name }}</td>
                    <td class="px-5 py-3">
                      <span class="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5
                                   text-xs font-bold text-slate-700">{{ c.stateUF }}</span>
                    </td>
                    <td class="px-5 py-3 text-right">
                      <button (click)="confirmDeleteCity(c.id, c.name)"
                              class="text-xs text-red-500 hover:text-red-700 transition-colors">
                        Excluir
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="3" class="px-5 py-12 text-center text-slate-400 text-sm">
                      Nenhuma cidade cadastrada.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>

    <!-- Confirm modals -->
    <app-confirm-modal
      [open]="stateModal()"
      title="Excluir estado"
      [message]="'Deseja excluir o estado ' + (deleteStateName() ?? '') + '? Cidades vinculadas podem ser afetadas.'"
      (confirm)="executeDeleteState()"
      (cancel)="stateModal.set(false)"
    />

    <app-confirm-modal
      [open]="cityModal()"
      title="Excluir cidade"
      [message]="'Deseja excluir a cidade ' + (deleteCityName() ?? '') + '?'"
      (confirm)="executeDeleteCity()"
      (cancel)="cityModal.set(false)"
    />
  `,
})
export class LocationsComponent implements OnInit {
  readonly stateSvc = inject(StateService);
  readonly citySvc  = inject(CityService);
  private readonly fb    = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  readonly activeTab = signal<Tab>('states');
  readonly tabs: Array<{ key: Tab; label: string }> = [
    { key: 'states', label: 'Estados' },
    { key: 'cities', label: 'Cidades' },
  ];

  // State form
  readonly stateSubmitting = signal(false);
  stateForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    uf:   ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2), Validators.pattern(/^[A-Za-z]+$/)]],
  });

  // City form
  readonly citySubmitting = signal(false);
  cityForm = this.fb.nonNullable.group({
    name:    ['', [Validators.required, Validators.maxLength(150)]],
    stateId: ['', [Validators.required]],
  });

  // Delete modals
  readonly stateModal    = signal(false);
  readonly deleteStateId = signal<string | null>(null);
  readonly deleteStateName = signal<string | null>(null);

  readonly cityModal    = signal(false);
  readonly deleteCityId = signal<string | null>(null);
  readonly deleteCityName = signal<string | null>(null);

  ngOnInit(): void {
    this.stateSvc.loadAll().subscribe();
    this.citySvc.loadAll().subscribe();
  }

  // ─── State helpers ────────────────────────────────────────────────────────

  sfc(f: 'name' | 'uf') {
    const c = this.stateForm.controls[f];
    return c.invalid && c.touched ? 'border-red-400 bg-red-50' : 'border-slate-300';
  }

  sErr(f: 'name' | 'uf'): string | null {
    const c = this.stateForm.controls[f];
    if (!c.invalid || !c.touched) return null;
    if (c.hasError('required'))  return 'Campo obrigatório.';
    if (c.hasError('minlength') || c.hasError('maxlength')) return 'A UF deve ter exatamente 2 letras.';
    if (c.hasError('pattern'))   return 'Use apenas letras.';
    return null;
  }

  submitState(): void {
    if (this.stateForm.invalid) { this.stateForm.markAllAsTouched(); return; }
    this.stateSubmitting.set(true);
    const { name, uf } = this.stateForm.getRawValue();
    this.stateSvc.create({ name, uf }).subscribe({
      next: () => { this.toast.success('Estado cadastrado!'); this.stateForm.reset(); this.stateSubmitting.set(false); },
      error: (e: HttpErrorResponse) => {
        this.stateSubmitting.set(false);
        this.toast.error((e.error as ProblemResponse)?.detail ?? 'Erro ao cadastrar estado.');
      },
    });
  }

  confirmDeleteState(id: string, name: string): void {
    this.deleteStateId.set(id); this.deleteStateName.set(name); this.stateModal.set(true);
  }

  executeDeleteState(): void {
    const id = this.deleteStateId();
    if (!id) return;
    this.stateModal.set(false);
    this.stateSvc.delete(id).subscribe({
      next: () => { this.toast.success('Estado excluído.'); this.stateSvc.loadAll().subscribe(); },
      error: (e: HttpErrorResponse) => this.toast.error(e.error?.detail ?? 'Erro ao excluir.'),
    });
  }

  // ─── City helpers ─────────────────────────────────────────────────────────

  cfc(f: 'name' | 'stateId') {
    const c = this.cityForm.controls[f];
    return c.invalid && c.touched ? 'border-red-400 bg-red-50' : 'border-slate-300';
  }

  cErr(f: 'name' | 'stateId'): string | null {
    const c = this.cityForm.controls[f];
    if (!c.invalid || !c.touched) return null;
    return 'Campo obrigatório.';
  }

  submitCity(): void {
    if (this.cityForm.invalid) { this.cityForm.markAllAsTouched(); return; }
    this.citySubmitting.set(true);
    const { name, stateId } = this.cityForm.getRawValue();
    this.citySvc.create({ name, stateId }).subscribe({
      next: () => {
        this.toast.success('Cidade cadastrada!');
        this.cityForm.reset();
        this.citySubmitting.set(false);
        this.citySvc.loadAll().subscribe();
      },
      error: (e: HttpErrorResponse) => {
        this.citySubmitting.set(false);
        this.toast.error((e.error as ProblemResponse)?.detail ?? 'Erro ao cadastrar cidade.');
      },
    });
  }

  confirmDeleteCity(id: string, name: string): void {
    this.deleteCityId.set(id); this.deleteCityName.set(name); this.cityModal.set(true);
  }

  executeDeleteCity(): void {
    const id = this.deleteCityId();
    if (!id) return;
    this.cityModal.set(false);
    this.citySvc.delete(id).subscribe({
      next: () => { this.toast.success('Cidade excluída.'); this.citySvc.loadAll().subscribe(); },
      error: (e: HttpErrorResponse) => this.toast.error(e.error?.detail ?? 'Erro ao excluir.'),
    });
  }
}
