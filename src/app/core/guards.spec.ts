import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, UrlTree, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { authGuard, permissionGuard, roleGuard } from './auth.interceptor';
import { AuthService } from './auth.service';

const route = (data: Record<string, unknown> = {}) => ({ data } as unknown as ActivatedRouteSnapshot);

function setup(role: string | null, permissions: string[] = []) {
  TestBed.configureTestingModule({ providers: [provideRouter([]), provideHttpClient()] });
  const auth = TestBed.inject(AuthService);
  if (role) {
    auth.establish({
      accessToken: 'a', refreshToken: 'r', expiresIn: 900,
      user: { userId: '1', username: role.toLowerCase(), displayName: role, role, permissions },
    });
  } else {
    auth.status.set('failed'); // handoff finished without a session
  }
  return auth;
}

const run = (guard: typeof authGuard, r: ActivatedRouteSnapshot) =>
  TestBed.runInInjectionContext(() => guard(r, {} as never)) as Promise<boolean | UrlTree>;

describe('module guards', () => {
  it('authGuard blocks when no session was handed over', async () => {
    setup(null);
    expect(await run(authGuard, route())).toBe(false);
  });

  it('authGuard allows a handed-over session', async () => {
    setup('AGENT');
    expect(await run(authGuard, route())).toBe(true);
  });

  it('authGuard waits for the handoff to finish', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideHttpClient()] });
    const auth = TestBed.inject(AuthService);
    const pending = run(authGuard, route());
    auth.establish({ accessToken: 'a', refreshToken: 'r', expiresIn: 900,
      user: { userId: '1', username: 'a', displayName: 'A', role: 'AGENT', permissions: [] } });
    expect(await pending).toBe(true);
  });

  it('roleGuard allows listed roles and redirects others to /forbidden', async () => {
    setup('MANAGER');
    expect(await run(roleGuard, route({ roles: ['AGENT', 'MANAGER'] }))).toBe(true);
    TestBed.resetTestingModule();
    setup('CUSTOMER');
    const res = (await run(roleGuard, route({ roles: ['AGENT', 'MANAGER'] }))) as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(res)).toBe('/forbidden');
  });

  it('permissionGuard checks route data permission', async () => {
    setup('AGENT', ['travel.quote']);
    expect(await run(permissionGuard, route({ permission: 'travel.quote' }))).toBe(true);
    expect(await run(permissionGuard, route({ permission: 'liability.quote' }))).not.toBe(true);
  });
});
