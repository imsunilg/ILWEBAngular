import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_URL, PORTAL_ORIGINS } from './config';

export interface UserInfo { userId: string; username: string; displayName: string; role: string; permissions: string[]; }
export interface AuthResponse { accessToken: string; refreshToken: string; expiresIn: number; user: UserInfo; }
interface Envelope<T> { success: boolean; message: string; data: T; }

export type ConnectionStatus = 'connecting' | 'ready' | 'standalone' | 'failed';

/**
 * Session for the embedded product modules. There is no login here: the Flutter portal shell owns login
 * and hands over a short-lived, single-use token with window.postMessage (never in a URL). The token is
 * exchanged with the API for this module's own session, which is kept in memory only.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private session = signal<AuthResponse | null>(null);
  private waiters: (() => void)[] = [];

  readonly status = signal<ConnectionStatus>('connecting');
  readonly user = computed(() => this.session()?.user ?? null);
  readonly isLoggedIn = computed(() => this.session() !== null);
  readonly role = computed(() => this.session()?.user.role ?? '');

  get accessToken(): string | null { return this.session()?.accessToken ?? null; }
  get embedded(): boolean { return window.parent !== window; }

  has(permission: string): boolean { return this.session()?.user.permissions.includes(permission) ?? false; }
  hasRole(...roles: string[]): boolean { return roles.includes(this.role()); }

  /** Resolves once the connection attempt has finished (successfully or not). */
  whenReady(): Promise<void> {
    return this.status() !== 'connecting' ? Promise.resolve() : new Promise(resolve => this.waiters.push(resolve));
  }

  /** Called once at start-up by the root component. */
  async connect(): Promise<void> {
    this.status.set('connecting');
    if (!this.embedded) {
      this.finish('standalone');
      return;
    }
    try {
      await this.exchange(await this.requestHandoff());
      this.finish('ready');
    } catch {
      this.finish('failed');
    }
  }

  establish(s: AuthResponse) {
    this.session.set(s);
    this.finish('ready');
  }

  /** Refreshes the access token; if that fails, asks the portal shell for a new handoff token. */
  async refresh(): Promise<boolean> {
    const rt = this.session()?.refreshToken;
    try {
      if (rt) {
        const res = await firstValueFrom(this.http.post<Envelope<AuthResponse>>(`${API_URL}/api/v1/auth/refresh`, { refreshToken: rt }));
        this.session.set(res.data);
        return true;
      }
    } catch { /* fall through to a new handoff */ }
    try {
      await this.exchange(await this.requestHandoff());
      return true;
    } catch {
      this.session.set(null);
      this.finish('failed');
      return false;
    }
  }

  private async exchange(token: string) {
    const res = await firstValueFrom(this.http.post<Envelope<AuthResponse>>(`${API_URL}/api/v1/auth/handoff/exchange`, { token }));
    this.session.set(res.data);
  }

  /** Asks the parent (Flutter shell) for a one-time token and waits for the reply from an allowed origin. */
  private requestHandoff(): Promise<string> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { window.removeEventListener('message', onMessage); reject(new Error('timeout')); }, 8000);
      const onMessage = (e: MessageEvent) => {
        if (e.source !== window.parent || !PORTAL_ORIGINS.includes(e.origin)) return;
        if (e.data?.type !== 'il-handoff' || typeof e.data.token !== 'string') return;
        clearTimeout(timer);
        window.removeEventListener('message', onMessage);
        resolve(e.data.token);
      };
      window.addEventListener('message', onMessage);
      // the request itself carries no secret
      window.parent.postMessage({ type: 'il-ready' }, '*');
    });
  }

  private finish(status: ConnectionStatus) {
    this.status.set(status);
    this.waiters.splice(0).forEach(w => w());
  }
}
