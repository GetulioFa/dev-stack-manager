import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { FieldErrorComponent } from '../../../shared/components/field-error.component';
import { ProblemResponse } from '../../../core/models/models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, FieldErrorComponent],
  template: `
    <div class="space-y-8">
      <div>
        <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Bem-vindo de volta</h2>
        <p class="mt-1 text-sm text-slate-500">Acesse sua conta para continuar.</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()" novalidate class="space-y-5">

        <div class="space-y-1">
          <label for="l-email" class="block text-sm font-medium text-slate-700">E-mail</label>
          <input id="l-email" type="email" formControlName="email" autocomplete="email"
                 placeholder="voce@email.com"
                 class="w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-all
                        focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                 [class]="fc('email')" [attr.aria-invalid]="inv('email')" />
          <app-field-error [message]="emailErr()" />
        </div>

        <div class="space-y-1">
          <label for="l-pass" class="block text-sm font-medium text-slate-700">Senha</label>
          <div class="relative">
            <input id="l-pass" [type]="showPwd() ? 'text' : 'password'"
                   formControlName="password" autocomplete="current-password"
                   placeholder="••••••••"
                   class="w-full rounded-lg border px-3.5 py-2.5 pr-10 text-sm outline-none transition-all
                          focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                   [class]="fc('password')" [attr.aria-invalid]="inv('password')" />
            <button type="button" (click)="showPwd.set(!showPwd())"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    [attr.aria-label]="showPwd() ? 'Ocultar senha' : 'Mostrar senha'">
              {{ showPwd() ? '🙈' : '👁' }}
            </button>
          </div>
          <app-field-error [message]="passErr()" />
        </div>

        @if (apiErr()) {
          <div role="alert" class="rounded-lg bg-red-50 border border-red-200 px-4 py-3
                                    text-sm text-red-700 flex items-start gap-2">
            <span aria-hidden="true" class="mt-0.5">⚠</span><span>{{ apiErr() }}</span>
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
              </svg>Entrando…
            </span>
          } @else { Entrar }
        </button>
      </form>

      <p class="text-center text-sm text-slate-500">
        Não tem conta?
        <a routerLink="/auth/register" class="font-semibold text-indigo-600 hover:text-indigo-500">Criar conta</a>
      </p>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  private readonly fb    = inject(FormBuilder);
  private readonly auth  = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly apiErr  = signal<string | null>(null);
  readonly showPwd = signal(false);

  form = this.fb.nonNullable.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  readonly emailErr = computed(() => {
    const c = this.form.controls.email;
    if (!c.invalid || !c.touched) return null;
    return c.hasError('required') ? 'E-mail obrigatório.' : 'E-mail inválido.';
  });

  readonly passErr = computed(() => {
    const c = this.form.controls.password;
    return c.invalid && c.touched ? 'Senha obrigatória.' : null;
  });

  ngOnInit() { if (this.auth.isAuthenticated()) this.router.navigate(['/developers']); }

  inv(f: 'email' | 'password') { const c = this.form.controls[f]; return c.invalid && c.touched; }
  fc(f: 'email' | 'password')  {
    return this.inv(f) ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white hover:border-slate-400';
  }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true); this.apiErr.set(null);
    const { email, password } = this.form.getRawValue();
    this.auth.login({ email, password }).subscribe({
      next: () => { this.toast.success('Login realizado!'); this.router.navigate(['/developers']); },
      error: (e: HttpErrorResponse) => {
        this.loading.set(false);
        if (e.status === 0) { this.apiErr.set('Servidor indisponível.'); return; }
        this.apiErr.set((e.error as ProblemResponse)?.detail ?? 'E-mail ou senha inválidos.');
      },
    });
  }
}
