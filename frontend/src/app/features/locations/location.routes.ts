import { Routes } from '@angular/router';

export const LOCATION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./locations.component').then(m => m.LocationsComponent),
    title: 'Localizações — DevStackManager',
  },
];
