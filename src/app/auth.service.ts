import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

export const API_URL = 'http://localhost:5080';

export interface UserInfo { id: string; email: string; fullName: string; role: string; }
export interface AuthResponse { accessToken: string; refreshToken: string; expiresAt: string; user: UserInfo; }

const STORE_KEY = 'il.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private session = signal<AuthResponse | null>(this.load());

  readonly user = computed(() => this.session()?.user ?? null);
  readonly isLoggedIn = computed(() => this.session() !== null);

  get accessToken(): string | null { return this.session()?.accessToken ?? null; }

  async login(email: string, password: string) {
    this.save(await firstValueFrom(this.http.post<AuthResponse>(`${API_URL}/api/auth/login`, { email, password })));
  }

  async register(email: string, password: string, fullName: string) {
    this.save(await firstValueFrom(this.http.post<AuthResponse>(`${API_URL}/api/auth/register`, { email, password, fullName })));
  }

  /** One-time token handed over by another front end (e.g. the Flutter app). */
  async exchangeHandoff(token: string) {
    this.save(await firstValueFrom(this.http.post<AuthResponse>(`${API_URL}/api/auth/handoff/exchange`, { token })));
  }

  async refresh(): Promise<boolean> {
    const rt = this.session()?.refreshToken;
    if (!rt) return false;
    try {
      this.save(await firstValueFrom(this.http.post<AuthResponse>(`${API_URL}/api/auth/refresh`, { refreshToken: rt })));
      return true;
    } catch {
      this.logout();
      return false;
    }
  }

  logout() {
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
