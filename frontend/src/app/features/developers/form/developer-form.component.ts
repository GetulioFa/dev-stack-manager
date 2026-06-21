import {
  Component, OnInit, computed, effect, inject, signal,
} from '@angular/core';
import {
  FormBuilder, ReactiveFormsModule, Validators, FormArray, AbstractControl,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { DeveloperService } from '../../../core/services/developer.service';
import { StateService } from '../../../core/services/state.service';
import { CityService } from '../../../core/services/city.service';
import { LanguageService } from '../../../core/services/language.service';
import { ToastService } from '../../../core/services/toast.service';
import { FieldErrorComponent } from '../../../shared/components/field-error.component';
import { LanguageBadgeComponent } from '../../../shared/components/language-badge.component';
import {
  DeveloperDto, LanguageDto, ProblemResponse,
  Seniority, ValidationProblemResponse,
} from '../../../core/models/models';
import { minOneSelectedValidator } from '../../../core/models/validators';

@Component({
  selector: 'app-developer-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, FieldErrorComponent, LanguageBadgeComponent],
  template: `
    <div class="p-6 lg:p-8 max-w-2xl mx-auto space-y-6">

      <!-- Page header -->
      <div class="flex items-center gap-4">
        <a routerLink="/developers"
           class="rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition-colors"
           aria-label="Voltar">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </a>
        <div>
          <h1 class="text-xl font-bold text-slate-900">
            {{ isEdit() ? 'Editar desenvolvedor' : 'Novo desenvolvedor' }}
          </h1>
          <p class="text-sm text-slate-500 mt-0.5">
            {{ isEdit() ? 'Atualize os dados abaixo.' : 'Preencha os dados para cadastrar.' }}
          </p>
        </div>
      </div>

      @if (initLoading()) {
        <div class="flex items-center justify-center py-20">
          <svg class="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        </div>
      } @else {

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate
              class="bg-white border border-slate-200 rounded-xl p-6 space-y-5">

          <!-- Nome -->
          <div class="space-y-1">
            <label for="d-name" class="block text-sm font-medium text-slate-700">Nome completo</label>
            <input id="d-name" type="text" formControlName="name" placeholder="Nome do desenvolvedor"
                   class="w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-all
                          focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                   [class]="fc('name')" />
            <app-field-error [message]="err('name')" />
          </div>

          <!-- E-mail -->
          <div class="space-y-1">
            <label for="d-email" class="block text-sm font-medium text-slate-700">E-mail</label>
            <input id="d-email" type="email" formControlName="email" placeholder="dev@email.com"
                   class="w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-all
                          focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                   [class]="fc('email')" />
            <app-field-error [message]="err('email')" />
          </div>

          <!-- Senioridade -->
          <div class="space-y-1">
            <label for="d-seniority" class="block text-sm font-medium text-slate-700">Senioridade</label>
            <select id="d-seniority" formControlName="seniority"
                    class="w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-all
                           focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                    [class]="fc('seniority')">
              <option value="">Selecione…</option>
              <option [value]="Seniority.Junior">Júnior</option>
              <option [value]="Seniority.Pleno">Pleno</option>
              <option [value]="Seniority.Senior">Sênior</option>
            </select>
            <app-field-error [message]="err('seniority')" />
          </div>

          <!-- Estado / Cidade em cascata -->
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label for="d-state" class="block text-sm font-medium text-slate-700">Estado</label>
              <select id="d-state" formControlName="stateId"
                      class="w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-all
                             focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                      [class]="fc('stateId')">
                <option value="">Selecione…</option>
                @for (s of stateSvc.states(); track s.id) {
                  <option [value]="s.id">{{ s.uf }} — {{ s.name }}</option>
                }
              </select>
              <app-field-error [message]="err('stateId')" />
            </div>

            <div class="space-y-1">
              <label for="d-city" class="block text-sm font-medium text-slate-700">Cidade</label>
              <select id="d-city" formControlName="cityId"
                      [disabled]="!form.controls.stateId.value || loadingCities()"
                      class="w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-all
                             focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white
                             disabled:opacity-50 disabled:cursor-not-allowed"
                      [class]="fc('cityId')">
                <option value="">
                  {{ loadingCities() ? 'Carregando…' : 'Selecione…' }}
                </option>
                @for (c of citiesForSelectedState(); track c.id) {
                  <option [value]="c.id">{{ c.name }}</option>
                }
              </select>
              <app-field-error [message]="err('cityId')" />
            </div>
          </div>

          <!-- Linguagens (multi-select via checkboxes) -->
          <div class="space-y-2">
            <p class="block text-sm font-medium text-slate-700">
              Linguagens de Programação
              <span class="text-slate-400 font-normal">(selecione ao menos uma)</span>
            </p>

            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto
                        border border-slate-200 rounded-lg p-3">
              @for (lang of langSvc.languages(); track lang.id) {
                <label class="flex items-center gap-2 cursor-pointer rounded-lg p-2
                              hover:bg-slate-50 transition-colors select-none"
                       [class.bg-indigo-50]="isLangSelected(lang.id)">
                  <input type="checkbox"
                         [checked]="isLangSelected(lang.id)"
                         (change)="toggleLanguage(lang.id)"
                         class="h-4 w-4 rounded border-slate-300 text-indigo-600
                                focus:ring-indigo-500 cursor-pointer" />
                  <span class="text-sm text-slate-700 truncate">{{ lang.name }}</span>
                  <app-language-badge [type]="lang.type" />
                </label>
              } @empty {
                <p class="col-span-full text-sm text-slate-400 py-2 text-center">
                  Nenhuma linguagem cadastrada.
                </p>
              }
            </div>

            @if (form.controls.languageIds.invalid && form.controls.languageIds.touched) {
              <app-field-error message="Selecione ao menos uma linguagem." />
            }

            <!-- Selection summary chips -->
            @if (selectedLanguages().length > 0) {
              <div class="flex flex-wrap gap-1.5 pt-1">
                @for (lang of selectedLanguages(); track lang.id) {
                  <span class="inline-flex items-center gap-1 rounded-full bg-indigo-100
                               text-indigo-700 px-2.5 py-0.5 text-xs font-medium">
                    {{ lang.name }}
                    <button type="button" (click)="toggleLanguage(lang.id)"
                            class="hover:text-indigo-900 transition-colors" aria-label="Remover">×</button>
                  </span>
                }
              </div>
            }
          </div>

          <!-- API error -->
          @if (apiErr()) {
            <div role="alert" class="rounded-lg bg-red-50 border border-red-200 px-4 py-3
                                      text-sm text-red-700 flex items-start gap-2">
              <span class="mt-0.5 shrink-0" aria-hidden="true">⚠</span><span>{{ apiErr() }}</span>
            </div>
          }

          <!-- Actions -->
          <div class="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <a routerLink="/developers"
               class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium
                      text-slate-700 hover:bg-slate-50 transition-colors">
              Cancelar
            </a>
            <button type="submit" [disabled]="submitting()"
                    class="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white
                           hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
              @if (submitting()) {
                <span class="flex items-center gap-2">
                  <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>Salvando…
                </span>
              } @else {
                {{ isEdit() ? 'Salvar alterações' : 'Cadastrar desenvolvedor' }}
              }
            </button>
          </div>
        </form>
      }
    </div>
  `,
})
export class DeveloperFormComponent implements OnInit {
  private readonly fb      = inject(FormBuilder);
  private readonly route   = inject(ActivatedRoute);
  private readonly router  = inject(Router);
  private readonly devSvc  = inject(DeveloperService);
  readonly stateSvc        = inject(StateService);
  private readonly citySvc = inject(CityService);
  readonly langSvc         = inject(LanguageService);
  private readonly toast   = inject(ToastService);

  readonly Seniority = Seniority;

  readonly isEdit      = signal(false);
  readonly editId      = signal<string | null>(null);
  readonly initLoading = signal(true);
  readonly submitting  = signal(false);
  readonly apiErr      = signal<string | null>(null);
  readonly loadingCities = signal(false);

  // Cities for the selected state (cascade)
  private readonly _citiesForState = signal<{ id: string; name: string }[]>([]);
  readonly citiesForSelectedState = computed(() => this._citiesForState());

  form = this.fb.nonNullable.group({
    name:        ['', [Validators.required, Validators.maxLength(150)]],
    email:       ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    seniority:   ['' as unknown as Seniority, [Validators.required]],
    stateId:     ['', [Validators.required]],
    cityId:      ['', [Validators.required]],
    languageIds: [[] as string[], [minOneSelectedValidator]],
  });

  readonly selectedLanguages = computed(() => {
    const ids = this.form.controls.languageIds.value as string[];
    return this.langSvc.languages().filter(l => ids.includes(l.id));
  });

  constructor() {
    
    // Effect: mudou stateId, recarrega as cidades e limpa o cityId
    effect(() => {
      const stateId = this.form.controls.stateId.value;
      if (!stateId) {
        this._citiesForState.set([]);
        this.form.controls.cityId.setValue('');
        return;
      }
      this.loadingCities.set(true);
      this.citySvc.loadByState(stateId).subscribe({
        next: r => {
          this._citiesForState.set(r.items);
          this.loadingCities.set(false);
        },
        error: () => this.loadingCities.set(false),
      });
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    // Pre-load reference data
    const refDone = { states: false, langs: false };
    const checkDone = () => {
      if (refDone.states && refDone.langs) {
        if (id) this.loadForEdit(id);
        else    this.initLoading.set(false);
      }
    };

    this.stateSvc.loadAll().subscribe({ next: () => { refDone.states = true; checkDone(); } });
    this.langSvc.loadAll().subscribe({ next: () => { refDone.langs  = true; checkDone(); } });
  }

  private loadForEdit(id: string): void {
    this.isEdit.set(true);
    this.editId.set(id);
    this.devSvc.getById(id).subscribe({
      next: (dev: DeveloperDto) => {
        // Patch stateId first so cities cascade loads
        this.form.patchValue({
          name:        dev.name,
          email:       dev.email,
          seniority:   dev.seniority,
          cityId:      dev.cityId,
          languageIds: dev.languages.map(l => l.id),
        });
        
        const state = this.stateSvc.states().find(s => s.uf === dev.stateUF);
        if (state) {
          this.form.controls.stateId.setValue(state.id);
          
          const waitForCities = setInterval(() => {
            if (!this.loadingCities()) {
              clearInterval(waitForCities);
              this.form.controls.cityId.setValue(dev.cityId);
              this.initLoading.set(false);
            }
          }, 50);
        } else {
          this.initLoading.set(false);
        }
      },
      error: () => { this.toast.error('Desenvolvedor não encontrado.'); this.router.navigate(['/developers']); },
    });
  }

  isLangSelected(id: string): boolean {
    return (this.form.controls.languageIds.value as string[]).includes(id);
  }

  toggleLanguage(id: string): void {
    const current = [...(this.form.controls.languageIds.value as string[])];
    const idx = current.indexOf(id);
    if (idx === -1) current.push(id);
    else current.splice(idx, 1);
    this.form.controls.languageIds.setValue(current);
    this.form.controls.languageIds.markAsTouched();
  }

  err(field: keyof typeof this.form.controls): string | null {
    const c = this.form.controls[field];
    if (!c.invalid || !c.touched) return null;
    if (c.hasError('required'))      return 'Campo obrigatório.';
    if (c.hasError('email'))         return 'E-mail inválido.';
    if (c.hasError('maxlength'))     return 'Valor muito longo.';
    if (c.hasError('minOneSelected')) return 'Selecione ao menos uma linguagem.';
    return 'Valor inválido.';
  }

  fc(field: keyof typeof this.form.controls): string {
    const c = this.form.controls[field];
    return c.invalid && c.touched
      ? 'border-red-400 bg-red-50'
      : 'border-slate-300 bg-white hover:border-slate-400';
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.submitting.set(true);
    this.apiErr.set(null);

    const { name, email, seniority, cityId, languageIds } = this.form.getRawValue();
    
    const payload = {
      name,
      email,
      seniority: Number(seniority) as Seniority, 
      cityId,
      languageIds,
    };
    const id = this.editId();

    const req$ = id
      ? this.devSvc.update(id, payload)
      : this.devSvc.create(payload);

    req$.subscribe({
      next: () => {
        this.toast.success(id ? 'Desenvolvedor atualizado!' : 'Desenvolvedor cadastrado!');
        this.router.navigate(['/developers']);
      },
      error: (e: HttpErrorResponse) => {
        this.submitting.set(false);
        if (e.status === 0)   { this.apiErr.set('Servidor indisponível.'); return; }
        if (e.status === 409) { this.apiErr.set('Este e-mail já está cadastrado.'); return; }
        if (e.status === 400) {
          const v = e.error as ValidationProblemResponse;
          if (v?.errors?.length) { this.apiErr.set(v.errors.map(x => x.message).join(' ')); return; }
        }
        this.apiErr.set((e.error as ProblemResponse)?.detail ?? 'Erro inesperado.');
      },
    });
  }
}
