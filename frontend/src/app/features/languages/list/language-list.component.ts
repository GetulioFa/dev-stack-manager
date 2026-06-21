import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { LanguageService } from '../../../core/services/language.service';
import { ToastService } from '../../../core/services/toast.service';
import { LanguageBadgeComponent } from '../../../shared/components/language-badge.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal.component';
import { FieldErrorComponent } from '../../../shared/components/field-error.component';
import { LanguageType, ProblemResponse } from '../../../core/models/models';

@Component({
  selector: 'app-language-list',
  standalone: true,
  imports: [ReactiveFormsModule, LanguageBadgeComponent, ConfirmModalComponent, FieldErrorComponent],
  template: `
    <div class="p-6 lg:p-8 space-y-6">

      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-slate-900">Linguagens de Programação</h1>
          <p class="text-sm text-slate-500 mt-0.5">{{ svc.total() }} linguagem{{ svc.total() !== 1 ? 's' : '' }} cadastrada{{ svc.total() !== 1 ? 's' : '' }}</p>
        </div>
        <button (click)="showForm.set(!showForm())"
                class="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2
                       text-sm font-semibold text-white hover:bg-indigo-700 transition-colors">
          <span aria-hidden="true">{{ showForm() ? '−' : '+' }}</span>
          {{ showForm() ? 'Cancelar' : 'Nova linguagem' }}
        </button>
      </div>

      <!-- Inline create form -->
      @if (showForm()) {
        <div class="bg-white border border-slate-200 rounded-xl p-5">
          <h2 class="text-sm font-semibold text-slate-700 mb-4">Nova linguagem</h2>
          <form [formGroup]="form" (ngSubmit)="submit()" novalidate class="flex flex-wrap gap-4 items-end">

            <div class="flex-1 min-w-48 space-y-1">
              <label for="lang-name" class="block text-xs font-medium text-slate-600">Nome</label>
              <input id="lang-name" type="text" formControlName="name" placeholder="ex: Rust"
                     class="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all
                            focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                     [class]="form.controls.name.invalid && form.controls.name.touched
                              ? 'border-red-400 bg-red-50' : 'border-slate-300'" />
              <app-field-error [message]="nameErr()" />
            </div>

            <div class="flex-1 min-w-48 space-y-1">
              <label for="lang-type" class="block text-xs font-medium text-slate-600">Tipo</label>
              <select id="lang-type" formControlName="type"
                      class="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all
                             focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                      [class]="form.controls.type.invalid && form.controls.type.touched
                               ? 'border-red-400 bg-red-50' : 'border-slate-300'">
                <option value="">Selecione…</option>
                <option [value]="LanguageType.FrontEnd">Front-End</option>
                <option [value]="LanguageType.BackEnd">Back-End</option>
                <option [value]="LanguageType.Mobile">Mobile</option>
                <option [value]="LanguageType.Database">Database</option>
                <option [value]="LanguageType.DevOps">DevOps</option>
              </select>
              <app-field-error [message]="typeErr()" />
            </div>

            <button type="submit" [disabled]="submitting()"
                    class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white
                           hover:bg-indigo-700 disabled:opacity-60 transition-colors">
              {{ submitting() ? 'Salvando…' : 'Cadastrar' }}
            </button>
          </form>
        </div>
      }

      <!-- Cards grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        @for (lang of svc.languages(); track lang.id) {
          <div class="bg-white border border-slate-200 rounded-xl p-4 flex items-start justify-between gap-3 hover:shadow-sm transition-shadow">
            <div class="space-y-1.5 min-w-0">
              <p class="font-semibold text-slate-900 text-sm truncate">{{ lang.name }}</p>
              <app-language-badge [type]="lang.type" />
            </div>
            <button (click)="confirmDelete(lang.id, lang.name)"
                    class="shrink-0 rounded-lg p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors" 
                      [attr.aria-label]="'Excluir ' + lang.name">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        } @empty {
          @if (!svc.loading()) {
            <div class="col-span-full py-16 text-center text-slate-400">
              <p class="text-4xl mb-3" aria-hidden="true">🧩</p>
              <p class="font-medium text-slate-600">Nenhuma linguagem cadastrada</p>
              <p class="text-sm mt-1">Clique em "Nova linguagem" para começar.</p>
            </div>
          }
        }
      </div>

      @if (svc.loading()) {
        <div class="flex justify-center py-10">
          <svg class="animate-spin h-7 w-7 text-indigo-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        </div>
      }
    </div>

    <app-confirm-modal
      [open]="modalOpen()"
      [message]="'Deseja excluir a linguagem ' + (deleteTargetName() ?? '') + '?'"
      (confirm)="executeDelete()"
      (cancel)="modalOpen.set(false)"
    />
  `,
})
export class LanguageListComponent implements OnInit {
  readonly svc   = inject(LanguageService);
  private readonly fb    = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  readonly LanguageType = LanguageType;
  readonly showForm  = signal(false);
  readonly submitting = signal(false);
  readonly modalOpen        = signal(false);
  readonly deleteTargetId   = signal<string | null>(null);
  readonly deleteTargetName = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    type: ['' as unknown as LanguageType, [Validators.required]],
  });

  readonly nameErr = computed(() => {
    const c = this.form.controls.name;
    if (!c.invalid || !c.touched) return null;
    return c.hasError('required') ? 'Nome obrigatório.' : 'Máximo 100 caracteres.';
  });

  readonly typeErr = computed(() => {
    const c = this.form.controls.type;
    return c.invalid && c.touched ? 'Tipo obrigatório.' : null;
  });

  ngOnInit(): void { this.svc.loadAll().subscribe(); }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting.set(true);
    const { name, type } = this.form.getRawValue();
    this.svc.create({ name, type: Number(type) as LanguageType }).subscribe({
      next: () => {
        this.toast.success('Linguagem cadastrada!');
        this.form.reset();
        this.showForm.set(false);
        this.submitting.set(false);
      },
      error: (e: HttpErrorResponse) => {
        this.submitting.set(false);
        this.toast.error((e.error as ProblemResponse)?.detail ?? 'Erro ao cadastrar.');
      },
    });
  }

  confirmDelete(id: string, name: string): void {
    this.deleteTargetId.set(id); this.deleteTargetName.set(name); this.modalOpen.set(true);
  }

  executeDelete(): void {
    const id = this.deleteTargetId();
    if (!id) return;
    this.modalOpen.set(false);
    this.svc.delete(id).subscribe({
      next: () => { this.toast.success('Linguagem excluída.'); this.svc.loadAll().subscribe(); },
      error: (e: HttpErrorResponse) => this.toast.error(e.error?.detail ?? 'Erro ao excluir.'),
    });
  }
}
