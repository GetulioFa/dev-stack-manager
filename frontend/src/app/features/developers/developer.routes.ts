import { Routes } from '@angular/router';

export const DEVELOPER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./list/developer-list.component').then(m => m.DeveloperListComponent),
    title: 'Desenvolvedores — DevStackManager',
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./form/developer-form.component').then(m => m.DeveloperFormComponent),
    title: 'Novo Desenvolvedor — DevStackManager',
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./form/developer-form.component').then(m => m.DeveloperFormComponent),
    title: 'Editar Desenvolvedor — DevStackManager',
  },
];
