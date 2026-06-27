'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '@/lib/api/services';
import { handleError } from '@/lib/hooks/use-crud';
import { registerSchema, RegisterFormValues } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';

// Password strength indicator

const RULES = [
  { label: 'Mínimo 8 caracteres',       test: (v: string) => v.length >= 8 },
  { label: 'Uma letra maiúscula',        test: (v: string) => /[A-Z]/.test(v) },
  { label: 'Uma letra minúscula',        test: (v: string) => /[a-z]/.test(v) },
  { label: 'Um número',                  test: (v: string) => /[0-9]/.test(v) },
];

function PasswordRules({ value }: { value: string }) {
  if (!value) return null;
  return (
    <ul className="mt-2 space-y-1" aria-label="Requisitos da senha">
      {RULES.map(r => {
        const ok = r.test(value);
        return (
          <li key={r.label}
              className={`flex items-center gap-1.5 text-xs transition-colors
                          ${ok ? 'text-emerald-600 dark:text-emerald-400'
                               : 'text-muted-foreground'}`}>
            {ok
              ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              : <XCircle      className="h-3.5 w-3.5 shrink-0 opacity-40" />}
            {r.label}
          </li>
        );
      })}
    </ul>
  );
}

// Page

export default function RegisterPage() {
  const router          = useRouter();
  const [loading, setL] = useState(false);
  const [showPwd, setS] = useState(false);

  const {
    register, handleSubmit, watch, formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const passwordValue = watch('password') ?? '';

  const onSubmit = async (values: RegisterFormValues) => {
    setL(true);
    try {
      await authApi.register(values.name, values.email, values.password);
      toast.success('Conta criada com sucesso! Faça login para continuar.');
      router.push('/auth/login');
    } catch (err) {
      handleError(err, 'Erro ao criar conta.');
    } finally {
      setL(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">

      <aside
        aria-hidden="true"
        className="hidden lg:flex lg:w-2/5 flex-col justify-between
                   bg-slate-900 px-12 py-14 text-white relative overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full
                        bg-indigo-600 opacity-20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <span className="w-9 h-9 rounded-lg bg-indigo-500 flex items-center
                           justify-center text-white font-bold text-sm shrink-0">
            DS
          </span>
          <span className="text-base font-semibold tracking-tight">DevStackManager</span>
        </div>

        <div className="relative z-10 space-y-4">
          <h1 className="text-4xl font-bold leading-tight">
            Comece a gerir<br />
            <span className="text-indigo-400">seu time</span><br />
            hoje mesmo.
          </h1>
          <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
            Crie sua conta gratuitamente e tenha acesso completo
            à plataforma em instantes.
          </p>
        </div>

        <p className="relative z-10 text-slate-600 text-xs">
          &copy; {new Date().getFullYear()} DevStackManager
        </p>
      </aside>

      <main className="flex-1 flex flex-col items-center justify-center
                       bg-background px-6 py-12 sm:px-10">

        <div className="lg:hidden mb-8 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-primary flex items-center
                           justify-center text-primary-foreground font-bold text-sm">
            DS
          </span>
          <span className="font-semibold text-foreground">DevStackManager</span>
        </div>

        <Card className="w-full max-w-md shadow-lg border-border">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-foreground">Criar conta</CardTitle>
            <CardDescription className="text-muted-foreground">
              Preencha os dados abaixo para se cadastrar.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

              <div className="space-y-1.5">
                <Label htmlFor="reg-name" className="text-foreground">Nome completo</Label>
                <Input
                  id="reg-name"
                  autoComplete="name"
                  placeholder="Seu nome"
                  className={errors.name
                    ? 'border-destructive focus-visible:ring-destructive' : ''}
                  {...register('name')}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                />
                {errors.name && (
                  <p id="name-error" className="text-xs text-destructive" role="alert">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reg-email" className="text-foreground">E-mail</Label>
                <Input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  placeholder="voce@email.com"
                  className={errors.email
                    ? 'border-destructive focus-visible:ring-destructive' : ''}
                  {...register('email')}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="text-xs text-destructive" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reg-password" className="text-foreground">Senha</Label>
                <div className="relative">
                  <Input
                    id="reg-password"
                    type={showPwd ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Mín. 8 caracteres"
                    className={`pr-10 ${errors.password
                      ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    {...register('password')}
                    aria-invalid={!!errors.password}
                    aria-describedby="password-rules"
                  />
                  <button
                    type="button"
                    onClick={() => setS(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2
                               text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPwd ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPwd
                      ? <EyeOff className="h-4 w-4" />
                      : <Eye    className="h-4 w-4" />}
                  </button>
                </div>

                <div id="password-rules">
                  <PasswordRules value={passwordValue} />
                </div>

                {errors.password && !passwordValue && (
                  <p className="text-xs text-destructive" role="alert">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full mt-2" disabled={loading}>
                {loading
                  ? <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full
                                       border-2 border-current border-t-transparent" />
                      Criando conta…
                    </span>
                  : 'Criar conta'}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-muted-foreground">
              Já tem conta?{' '}
              <Link
                href="/auth/login"
                className="font-semibold text-primary hover:text-primary/80
                           underline-offset-4 hover:underline transition-colors"
              >
                Entrar
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}