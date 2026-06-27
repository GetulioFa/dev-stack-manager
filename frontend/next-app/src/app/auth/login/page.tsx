'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import { loginSchema, LoginFormValues } from '@/lib/schemas';
import { handleError } from '@/lib/hooks/use-crud';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';

export default function LoginPage() {
  const { login }          = useAuth();
  const [loading, setL]    = useState(false);
  const [showPwd, setShow] = useState(false);

  const {
    register, handleSubmit, formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginFormValues) => {
    setL(true);
    try {
      await login(values.email, values.password);
    } catch (err) {
      handleError(err, 'E-mail ou senha inválidos.');
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
            Gerencie seu time de<br />
            <span className="text-indigo-400">desenvolvedores</span><br />
            com precisão.
          </h1>
          <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
            Centralize senioridades, linguagens e localizações numa
            plataforma feita para equipes de engenharia.
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
            <CardTitle className="text-2xl text-foreground">Bem-vindo de volta</CardTitle>
            <CardDescription className="text-muted-foreground">
              Acesse sua conta para continuar.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

              <div className="space-y-1.5">
                <Label htmlFor="login-email" className="text-foreground">E-mail</Label>
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="voce@email.com"
                  className={errors.email
                    ? 'border-destructive focus-visible:ring-destructive'
                    : ''}
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
                <Label htmlFor="login-password" className="text-foreground">Senha</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPwd ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className={`pr-10 ${errors.password
                      ? 'border-destructive focus-visible:ring-destructive'
                      : ''}`}
                    {...register('password')}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShow(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2
                               text-muted-foreground hover:text-foreground
                               transition-colors"
                    aria-label={showPwd ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPwd
                      ? <EyeOff className="h-4 w-4" />
                      : <Eye    className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" className="text-xs text-destructive" role="alert">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading
                  ? <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full
                                       border-2 border-current border-t-transparent" />
                      Entrando…
                    </span>
                  : 'Entrar'}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-muted-foreground">
              Não tem conta?{' '}
              <Link
                href="/auth/register"
                className="font-semibold text-primary hover:text-primary/80
                           underline-offset-4 hover:underline transition-colors"
              >
                Criar conta
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
