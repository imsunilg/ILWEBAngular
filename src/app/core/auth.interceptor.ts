import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { API_URL } from './config';

const withToken = (req: HttpRequest<unknown>, token: string | null) =>
  token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  if (!req.url.startsWith(API_URL) || /\/api\/v1\/auth\/(refresh|handoff\/exchange)$/.test(req.url)) return next(req);
  return next(withToken(req, auth.accessToken)).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401) return throwError(() => err);
      // access token expired: refresh once (or re-handoff) and retry
      return from(auth.refresh()).pipe(
        switchMap(ok => (ok ? next(withToken(req, auth.accessToken)) : throwError(() => err))),
      );
    }),
  );
};

/** Waits for the portal handoff, then requires a session. */
export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  await auth.whenReady();
  return auth.isLoggedIn();
};

/** Requires one of route.data['roles']; otherwise shows the forbidden page. */
export const roleGuard: CanActivateFn = async (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router); // inject before awaiting: no injection context afterwards
  await auth.whenReady();
  const roles = (route.data['roles'] as string[] | undefined) ?? [];
  return auth.hasRole(...roles) ? true : router.parseUrl('/forbidden');
};

/** Requires route.data['permission']; otherwise shows the forbidden page. The API enforces it again. */
export const permissionGuard: CanActivateFn = async (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.whenReady();
  const permission = (route.data['permission'] as string | undefined) ?? '';
  return permission && auth.has(permission) ? true : router.parseUrl('/forbidden');
};

