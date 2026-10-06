import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

export const API_URL = 'http://localhost:5080';

export interface UserInfo { userId: string; username: string; displayName: string; role: string; permissions: string[]; }
export interface AuthResponse { accessToken: string; refreshToken: string; expiresIn: number; user: UserInfo; }
interface Envelope<T> { success: boolean; message: string; data: T; }

const STORE_KEY = 'il.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private session = signal<AuthResponse | null>(this.load());

  readonly user = computed(() => this.session()?.user ?? null);
  readonly isLoggedIn = computed(() => this.session() !== null);

  get accessToken(): string | null { return this.session()?.accessToken ?? null; }

  readonly role = computed(() => this.session()?.user.role ?? '');

  has(permission: string): boolean { return this.session()?.user.permissions.includes(permission) ?? false; }
  hasRole(...roles: string[]): boolean { return roles.includes(this.role()); }

  private async call(path: string, body: object) {
    const res = await firstValueFrom(this.http.post<Envelope<AuthResponse>>(`${API_URL}/api/v1/auth/${path}`, body));
    this.save(res.data);
  }

  login(username: string, password: string) { return this.call('login', { username, password }); }
  register(email: string, password: string, fullName: string) { return this.call('register', { email, password, fullName }); }

  /** One-time token handed over by another front end (e.g. the Flutter app). */
  exchangeHandoff(token: string) { return this.call('handoff/exchange', { token }); }

  async refresh(): Promise<boolean> {
    const rt = this.session()?.refreshToken;
    if (!rt) return false;
    try {
      await this.call('refresh', { refreshToken: rt });
      return true;
    } catch {
      this.logout();
      return false;
    }
  }

  logout() {
    const rt = this.session()?.refreshToken;
    if (rt) this.http.post(`${API_URL}/api/v1/auth/logout`, { refreshToken: rt }).subscribe({ error: () => {} });
    this.session.set(null);
    try { localStorage.removeItem(STORE_KEY); } catch { /* storage unavailable */ }
    this.router.navigateByUrl('/login');
  }

  private save(s: AuthResponse) {
    this.session.set(s);
    try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch { /* storage unavailable */ }
  }

  private load(): AuthResponse | null {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) ?? 'null'); } catch { return null; }
  }
}

