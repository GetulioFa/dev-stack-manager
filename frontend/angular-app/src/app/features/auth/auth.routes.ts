import { Routes } from '@angular/router';
import { AuthLayoutComponent } from '../../shared/layouts/auth-layout.component';
import { guestGuard } from '../../core/guards/auth.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./login/login.component').then(m => m.LoginComponent),
        title: 'Entrar — DevStackManager',
      },
      {
        path: 'register',
        loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent),
        title: 'Criar conta — DevStackManager',
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
];
