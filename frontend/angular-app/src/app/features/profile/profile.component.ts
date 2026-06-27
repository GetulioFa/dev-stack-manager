import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.services';
import { ToastService } from '../../core/services/toast.service';
import { FieldErrorComponent } from '../../shared/components/field-error.component';
import { ProblemResponse, ValidationProblemResponse } from '../../core/models/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, FieldErrorComponent],
  template: `
    <div class="p-6 lg:p-8 max-w-lg mx-auto space-y-6">

      <!-- Header -->
      <div class="flex items-center gap-4">
        <a routerLink="/developers"
           class="rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition-colors"
           aria-label="Voltar">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </a>
        <div>
          <h1 class="text-xl font-bold text-slate-900">Meu perfil</h1>
          <p class="text-sm text-slate-500 mt-0.5">Atualize seu nome e e-mail.</p>
        </div>
      </div>

      <!-- Avatar info (read-only) -->
      <div class="flex items-center gap-4 bg-white border border-slate-200 rounded-xl p-5">
        <div class="w-14 h-14 rounded-full bg-indigo-500 flex items-center justify-center
                    text-white text-xl font-bold shrink-0">
          {{ initial() }}
        </div>
        <div class="min-w-0">
          <p class="font-semibold text-slate-900 truncate">{{ currentUser()?.name }}</p>
          <p class="text-sm text-slate-500 truncate">{{ currentUser()?.email }}</p>
          <p class="text-xs text-slate-400 mt-0.5">
            Membro desde {{ memberSince() }}
          </p>
        </div>
      </div>

      <!-- Edit form -->
      <form [formGroup]="form" (ngSubmit)="submit()" novalidate
            class="bg-white border border-slate-200 rounded-xl p-6 space-y-5">

        <h2 class="text-sm font-semibold text-slate-700">Editar dados</h2>

        <!-- Nome -->
        <div class="space-y-1">
          <label for="p-name" class="block text-sm font-medium text-slate-700">Nome completo</label>
          <input id="p-name" type="text" formControlName="name"
                 placeholder="Seu nome"
                 class="w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-all
                        focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                 [class]="fc('name')"
                 [attr.aria-invalid]="inv('name')" />
          <app-field-error [message]="nameErr()" />
        </div>

        <!-- E-mail -->
        <div class="space-y-1">
          <label for="p-email" class="block text-sm font-medium text-slate-700">E-mail</label>
          <input id="p-email" type="email" formControlName="email"
                 placeholder="voce@email.com"
                 class="w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-all
                        focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                 [class]="fc('email')"
                 [attr.aria-invalid]="inv('email')" />
          <app-field-error [message]="emailErr()" />
        </div>

        <!-- API error -->
        @if (apiErr()) {
          <div role="alert"
               class="rounded-lg bg-red-50 border border-red-200 px-4 py-3
                      text-sm text-red-700 flex items-start gap-2">
            <span class="mt-0.5 shrink-0" aria-hidden="true">⚠</span>
            <span>{{ apiErr() }}</span>
          </div>
        }

        <!-- Success indicator -->
        @if (saved()) {
          <div role="status"
               class="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3
                      text-sm text-emerald-700 flex items-center gap-2">
            <span aria-hidden="true">✓</span>
            <span>Perfil atualizado com sucesso!</span>
          </div>
        }

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <a routerLink="/developers"
             class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium
                    text-slate-700 hover:bg-slate-50 transition-colors">
            Cancelar
          </a>
          <button type="submit" [disabled]="submitting() || !isDirty()"
                  class="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white
                         hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed
                         transition-colors">
            @if (submitting()) {
              <span class="flex items-center gap-2">
                <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10"
                          stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Salvando…
              </span>
            } @else {
              Salvar alterações
            }
          </button>
        </div>
      </form>
    </div>
  `,
})
export class ProfileComponent implements OnInit {
  private readonly fb          = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly toast       = inject(ToastService);
  private readonly router      = inject(Router);

  readonly currentUser = computed(() => this.authService.currentUser());
  readonly initial     = computed(() =>
    (this.authService.currentUser()?.name?.[0] ?? '?').toUpperCase()
  );
  readonly memberSince = computed(() => {
    const u = this.authService.currentUser();
    if (!u) return '';
    // UserDto has no createdAt in the auth state — show formatted placeholder
    return new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  });

  readonly submitting = signal(false);
  readonly apiErr     = signal<string | null>(null);
  readonly saved      = signal(false);

  readonly isDirty = computed(() => this.form.dirty);

  form = this.fb.nonNullable.group({
    name:  ['', [Validators.required, Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
  });

  readonly nameErr = computed(() => {
    const c = this.form.controls.name;
    if (!c.invalid || !c.touched) return null;
    if (c.hasError('required'))  return 'Nome obrigatório.';
    if (c.hasError('maxlength')) return 'Máximo 150 caracteres.';
    return null;
  });

  readonly emailErr = computed(() => {
    const c = this.form.controls.email;
    if (!c.invalid || !c.touched) return null;
    if (c.hasError('required')) return 'E-mail obrigatório.';
    if (c.hasError('email'))    return 'E-mail inválido.';
    return 'E-mail muito longo.';
  });

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (!user) { this.router.navigate(['/auth/login']); return; }
    this.form.patchValue({ name: user.name, email: user.email });
  }

  inv(f: 'name' | 'email'): boolean {
    const c = this.form.controls[f];
    return c.invalid && c.touched;
  }

  fc(f: 'name' | 'email'): string {
    return this.inv(f)
      ? 'border-red-400 bg-red-50'
      : 'border-slate-300 bg-white hover:border-slate-400';
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (!this.form.dirty)  return;

    const userId = this.authService.currentUser()?.id;
    if (!userId) return;

    this.submitting.set(true);
    this.apiErr.set(null);
    this.saved.set(false);

    const { name, email } = this.form.getRawValue();

    this.userService.update(userId, { name, email }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.saved.set(true);
        this.form.markAsPristine();
        this.toast.success('Perfil atualizado com sucesso!');
        // Hide success banner after 3 s
        setTimeout(() => this.saved.set(false), 3000);
      },
      error: (e: HttpErrorResponse) => {
        this.submitting.set(false);
        if (e.status === 0)   { this.apiErr.set('Servidor indisponível.'); return; }
        if (e.status === 409) { this.apiErr.set('Este e-mail já está em uso por outro usuário.'); return; }
        if (e.status === 400) {
          const v = e.error as ValidationProblemResponse;
          if (v?.errors?.length) { this.apiErr.set(v.errors.map(x => x.message).join(' ')); return; }
        }
        this.apiErr.set((e.error as ProblemResponse)?.detail ?? 'Erro inesperado ao salvar.');
      },
    });
  }
}
