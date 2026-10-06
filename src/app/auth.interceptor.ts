import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { API_URL, AuthService } from './auth.service';

const withToken = (req: HttpRequest<unknown>, token: string | null) =>
  token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  if (!req.url.startsWith(API_URL) || /\/api\/v1\/auth\/(login|register|refresh|logout|handoff\/exchange)$/.test(req.url)) return next(req);
  return next(withToken(req, auth.accessToken)).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401) return throwError(() => err);
      // access token expired: refresh once and retry
      return from(auth.refresh()).pipe(
        switchMap(ok => (ok ? next(withToken(req, auth.accessToken)) : throwError(() => err))),
      );
    }),
  );
};

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isLoggedIn() ? true : inject(Router).parseUrl('/login');
};

/** Requires one of route.data['roles']. Redirects to the dashboard when the role is not allowed. */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const roles = (route.data['roles'] as string[] | undefined) ?? [];
  return auth.hasRole(...roles) ? true : inject(Router).parseUrl('/');
};

/** Requires route.data['permission'] (or "<product>.quote" derived from the :product param). */
export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const product = route.paramMap.get('product');
  const permission = (route.data['permission'] as string | undefined) ?? (product ? `${product}.quote` : '');
  return permission && auth.has(permission) ? true : inject(Router).parseUrl('/');
};
