import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { ShellLayoutComponent } from './shared/layouts/shell-layout.component';

export const appRoutes: Routes = [
  // ── Public: Auth ──────────────────────────────────────────────────────────
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
  },

  // ── Protected: Shell + feature children ──────────────────────────────────
  {
    path: '',
    component: ShellLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'developers',
        loadChildren: () =>
          import('./features/developers/developer.routes').then(m => m.DEVELOPER_ROUTES),
      },
      {
        path: 'languages',
        loadChildren: () =>
          import('./features/languages/language.routes').then(m => m.LANGUAGE_ROUTES),
      },
      {
        path: 'locations',
        loadChildren: () =>
          import('./features/locations/location.routes').then(m => m.LOCATION_ROUTES),
      },
      // Default redirect inside the shell
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.component').then(m => m.ProfileComponent),
        title: 'Meu Perfil — DevStackManager',
      },
      { path: '', redirectTo: 'developers', pathMatch: 'full' },
    ],
  },

  // ── Fallback ─────────────────────────────────────────────────────────────
  { path: '**', redirectTo: 'auth/login' },
];
