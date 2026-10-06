import { Routes } from '@angular/router';
import { authGuard } from './auth.interceptor';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login').then(m => m.Login) },
  { path: 'handoff', loadComponent: () => import('./pages/handoff').then(m => m.Handoff) },
  { path: '', pathMatch: 'full', canActivate: [authGuard], loadComponent: () => import('./pages/dashboard').then(m => m.Dashboard) },
  { path: 'quote/:product', canActivate: [authGuard], loadComponent: () => import('./pages/quote-form').then(m => m.QuoteForm) },
  { path: '**', redirectTo: '' },
];
