import { Routes } from '@angular/router';

export const LANGUAGE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./list/language-list.component').then(m => m.LanguageListComponent),
    title: 'Linguagens — DevStackManager',
  },
];
