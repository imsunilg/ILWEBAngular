import { Routes } from '@angular/router';
import { authGuard, permissionGuard, roleGuard } from './auth.interceptor';

const quote = () => import('./pages/quote-form').then(m => m.QuoteForm);
// Travel and Liability are limited to staff roles and require the matching permission.
const staff = ['AGENT', 'UNDERWRITER', 'MANAGER', 'ADMIN'];

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login').then(m => m.Login) },
  { path: 'handoff', loadComponent: () => import('./pages/handoff').then(m => m.Handoff) },
  { path: '', pathMatch: 'full', canActivate: [authGuard], loadComponent: () => import('./pages/dashboard').then(m => m.Dashboard) },
  { path: 'quote/travel', canActivate: [authGuard, roleGuard, permissionGuard], data: { roles: staff, permission: 'travel.quote', product: 'travel' }, loadComponent: quote },
  { path: 'quote/liability', canActivate: [authGuard, roleGuard, permissionGuard], data: { roles: staff, permission: 'liability.quote', product: 'liability' }, loadComponent: quote },
  { path: 'quote/:product', canActivate: [authGuard, permissionGuard], loadComponent: quote },
  { path: '**', redirectTo: '' },
];
