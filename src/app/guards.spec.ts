import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, UrlTree, convertToParamMap, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { authGuard, permissionGuard, roleGuard } from './auth.interceptor';
import { AuthService } from './auth.service';

function route(data: Record<string, unknown> = {}, params: Record<string, string> = {}) {
  return { data, paramMap: convertToParamMap(params) } as unknown as ActivatedRouteSnapshot;
}

function setup(role: string | null, permissions: string[] = []) {
  localStorage.clear();
  if (role) {
    localStorage.setItem('il.session', JSON.stringify({
      accessToken: 'a', refreshToken: 'r', expiresIn: 900,
      user: { userId: '1', username: role.toLowerCase(), displayName: role, role, permissions },
    }));
  }
  TestBed.configureTestingModule({ providers: [provideRouter([]), provideHttpClient()] });
  return TestBed.inject(AuthService);
}

const run = (guard: typeof authGuard, r: ActivatedRouteSnapshot) =>
  TestBed.runInInjectionContext(() => guard(r, {} as never));

describe('guards', () => {
  it('authGuard redirects anonymous users to /login', () => {
    setup(null);
    const res = run(authGuard, route()) as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(res)).toBe('/login');
  });

  it('authGuard allows signed-in users', () => {
    setup('AGENT');
    expect(run(authGuard, route())).toBe(true);
  });

  it('roleGuard allows listed roles only', () => {
    setup('MANAGER');
    expect(run(roleGuard, route({ roles: ['AGENT', 'MANAGER'] }))).toBe(true);
    TestBed.resetTestingModule();
    setup('CUSTOMER');
    expect(run(roleGuard, route({ roles: ['AGENT', 'MANAGER'] }))).not.toBe(true);
  });

  it('permissionGuard uses route data permission', () => {
    setup('AGENT', ['travel.quote']);
    expect(run(permissionGuard, route({ permission: 'travel.quote' }))).toBe(true);
    expect(run(permissionGuard, route({ permission: 'users.manage' }))).not.toBe(true);
  });

  it('permissionGuard derives <product>.quote from the :product param', () => {
    setup('AGENT', ['motor.quote']);
    expect(run(permissionGuard, route({}, { product: 'motor' }))).toBe(true);
    expect(run(permissionGuard, route({}, { product: 'home' }))).not.toBe(true);
  });
});
