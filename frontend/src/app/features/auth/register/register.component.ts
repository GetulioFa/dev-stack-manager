import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { FieldErrorComponent } from '../../../shared/components/field-error.component';
import { ProblemResponse, ValidationProblemResponse } from '../../../core/models/models';
import { getPasswordErrors, passwordComplexityValidator } from '../../../core/models/validators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, FieldErrorComponent],
  template: `
    <div class="space-y-8">
      <div>
        <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Criar conta</h2>
        <p class="mt-1 text-sm text-slate-500">Preencha os dados abaixo para se cadastrar.</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()" novalidate class="space-y-5">

        <!-- Nome -->
        <div class="space-y-1">
          <label for="r-name" class="block text-sm font-medium text-slate-700">Nome completo</label>
          <input id="r-name" type="text" formControlName="name" autocomplete="name"
                 placeholder="Seu nome"
                 class="w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-all
                        focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                 [class]="fc('name')" [attr.aria-invalid]="inv('name')" />
          <app-field-error [message]="nameErr()" />
        </div>

        <!-- E-mail -->
        <div class="space-y-1">
          <label for="r-email" class="block text-sm font-medium text-slate-700">E-mail</label>
          <input id="r-email" type="email" formControlName="email" autocomplete="email"
                 placeholder="voce@email.com"
                 class="w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-all
                        focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                 [class]="fc('email')" [attr.aria-invalid]="inv('email')" />
          <app-field-error [message]="emailErr()" />
        </div>

        <!-- Senha -->
        <div class="space-y-1">
          <label for="r-pass" class="block text-sm font-medium text-slate-700">Senha</label>
          <div class="relative">
            <input id="r-pass" [type]="showPwd() ? 'text' : 'password'"
                   formControlName="password" autocomplete="new-password"
                   placeholder="••••••••"
                   class="w-full rounded-lg border px-3.5 py-2.5 pr-10 text-sm outline-none transition-all
                          focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                   [class]="fc('password')" [attr.aria-invalid]="inv('password')" />
            <button type="button" (click)="showPwd.set(!showPwd())"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    [attr.aria-label]="showPwd() ? 'Ocultar' : 'Mostrar'">
              {{ showPwd() ? '🙈' : '👁' }}
            </button>
          </div>

          <!-- Strength bars -->
          @if (form.controls.password.value) {
            <div class="mt-2 space-y-1">
              <div class="flex gap-1" aria-hidden="true">
                @for (bar of strengthBars(); track $index) {
                  <div class="h-1 flex-1 rounded-full transition-colors duration-300" [class]="bar"></div>
                }
              </div>
              <p class="text-xs" [class]="strengthCls()">{{ strengthLabel() }}</p>
            </div>
          }

          @if (inv('password') && pwdHints().length > 0) {
            <ul role="alert" class="mt-1 space-y-0.5">
              @for (h of pwdHints(); track h) {
                <li class="text-xs text-red-600 flex items-center gap-1">
                  <span aria-hidden="true">✕</span> {{ h }}
                </li>
              }
            </ul>
          } @else if (inv('password')) {
            <app-field-error message="Senha obrigatória." />
          }
        </div>

        @if (apiErr()) {
          <div role="alert" class="rounded-lg bg-red-50 border border-red-200 px-4 py-3
                                    text-sm text-red-700 flex items-start gap-2">
            <span class="mt-0.5 shrink-0" aria-hidden="true">⚠</span><span>{{ apiErr() }}</span>
          </div>
        }

        <button type="submit" [disabled]="loading()"
                class="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white
                       hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all">
          @if (loading()) {
            <span class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>Criando conta…
            </span>
          } @else { Criar conta }
        </button>
      </form>

      <p class="text-center text-sm text-slate-500">
        Já tem conta?
        <a routerLink="/auth/login" class="font-semibold text-indigo-600 hover:text-indigo-500">Entrar</a>
      </p>
    </div>
  `,
})
export class RegisterComponent implements OnInit {
  private readonly fb     = inject(FormBuilder);
  private readonly auth   = inject(AuthService);
  private readonly toast  = inject(ToastService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly apiErr  = signal<string | null>(null);
  readonly showPwd = signal(false);

  form = this.fb.nonNullable.group({
    name:     ['', [Validators.required, Validators.maxLength(150)]],
    email:    ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    password: ['', [Validators.required, passwordComplexityValidator()]],
  });

  readonly nameErr = computed(() => {
    const c = this.form.controls.name;
    if (!c.invalid || !c.touched) return null;
    return c.hasError('required') ? 'Nome obrigatório.' : 'Máximo 150 caracteres.';
  });

  readonly emailErr = computed(() => {
    const c = this.form.controls.email;
    if (!c.invalid || !c.touched) return null;
    if (c.hasError('required')) return 'E-mail obrigatório.';
    if (c.hasError('email'))    return 'E-mail inválido.';
    return 'E-mail muito longo.';
  });

  readonly pwdHints = computed(() => {
    const c = this.form.controls.password;
    return c.touched ? getPasswordErrors(c) : [];
  });

  readonly strengthScore = computed(() => {
    const v: string = this.form.controls.password.value ?? '';
    let s = 0;
    if (v.length >= 8)           s++;
    if (/[A-Z]/.test(v))         s++;
    if (/[a-z]/.test(v))         s++;
    if (/[0-9]/.test(v))         s++;
    if (/[^A-Za-z0-9]/.test(v))  s++;
    return s;
  });

  readonly strengthBars = computed(() => {
    const s = this.strengthScore();
    return [
      s >= 1 ? 'bg-red-400'     : 'bg-slate-200',
      s >= 2 ? 'bg-orange-400'  : 'bg-slate-200',
      s >= 3 ? 'bg-yellow-400'  : 'bg-slate-200',
      s >= 4 ? 'bg-emerald-400' : 'bg-slate-200',
    ];
  });

  readonly strengthLabel = computed(() =>
    ['', 'Muito fraca', 'Fraca', 'Razoável', 'Forte', 'Muito forte'][this.strengthScore()] ?? ''
  );

  readonly strengthCls = computed(() => {
    const s = this.strengthScore();
    if (s <= 1) return 'text-red-500 text-xs';
    if (s === 2) return 'text-orange-500 text-xs';
    if (s === 3) return 'text-yellow-600 text-xs';
    return 'text-emerald-600 text-xs';
  });

  ngOnInit() { if (this.auth.isAuthenticated()) this.router.navigate(['/developers']); }

  inv(f: 'name' | 'email' | 'password') { const c = this.form.controls[f]; return c.invalid && c.touched; }
  fc(f: 'name' | 'email' | 'password') {
    return this.inv(f) ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white hover:border-slate-400';
  }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true); this.apiErr.set(null);
    const { name, email, password } = this.form.getRawValue();
    this.auth.register({ name, email, password }).subscribe({
      next: () => {
        this.toast.success('Conta criada! Faça login para continuar.');
        this.router.navigate(['/auth/login']);
      },
      error: (e: HttpErrorResponse) => {
        this.loading.set(false);
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

  // FIX: extrai corretamente o formato de erro do backend (ProblemResponse ou ValidationProblemResponse)
  private extractError(err: HttpErrorResponse): string {
    if (err.status === 0) {
      return 'Não foi possível conectar ao servidor. Verifique sua conexão.';
    }
    if (err.status === 409) {
      const body = err.error as ProblemResponse | null;
      return body?.detail ?? 'Este e-mail já está cadastrado. Tente fazer login.';
    }
    if (err.status === 400) {
      // Erros de validação do FluentValidation
      const body = err.error as ValidationProblemResponse | null;
      if (body?.errors?.length) {
        return body.errors.map((e) => e.message).join(' ');
      }
      const prob = err.error as ProblemResponse | null;
      if (prob?.detail) return prob.detail;
    }
    return 'Ocorreu um erro inesperado. Tente novamente.';
  }
}
