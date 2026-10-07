import { Routes } from '@angular/router';
import { authGuard, permissionGuard, roleGuard } from './core/auth.interceptor';
import { STAFF_ROLES } from './core/config';

// Product modules only. Login, dashboard, header, profile and logout belong to the Flutter portal shell.
export const routes: Routes = [
  {
    path: 'travel',
    canActivate: [authGuard, roleGuard, permissionGuard],
    data: { roles: STAFF_ROLES, permission: 'travel.quote' },
    children: [
      {
        path: '',
        loadComponent: () => import('./travel/pages/travel-quote/travel-quote').then(m => m.TravelQuotePage),
      },
      {
        path: 'result',
        loadComponent: () => import('./travel/pages/travel-result/travel-result').then(m => m.TravelResultPage),
      },
    ],
  },
  {
    path: 'liability',
    canActivate: [authGuard, roleGuard, permissionGuard],
    data: { roles: STAFF_ROLES, permission: 'liability.quote' },
    children: [
      {
        path: '',
        loadComponent: () => import('./liability/pages/liability-quote/liability-quote').then(m => m.LiabilityQuotePage),
      },
      {
        path: 'result',
        loadComponent: () => import('./liability/pages/liability-result/liability-result').then(m => m.LiabilityResultPage),
      },
    ],
  },
  { path: 'forbidden', loadComponent: () => import('./shared/forbidden/forbidden').then(m => m.Forbidden) },
  { path: '**', redirectTo: 'forbidden' },
];
