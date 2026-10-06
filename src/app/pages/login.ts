import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  template: `
    <div class="card" style="max-width: 380px; margin: 40px auto">
      <h2>{{ registering() ? 'Create account' : 'Sign in' }}</h2>
      <form (ngSubmit)="submit()">
        @if (registering()) {
          <label for="n">Full name</label>
          <input id="n" name="fullName" [(ngModel)]="fullName" required />
        }
        <label for="e">{{ registering() ? 'Email' : 'Username or email' }}</label>
        <input id="e" name="email" [type]="registering() ? 'email' : 'text'" [(ngModel)]="email" required />
        <label for="p">Password</label>
        <input id="p" name="password" type="password" [(ngModel)]="password" required minlength="8" />
        @if (error()) { <p class="error">{{ error() }}</p> }
        <p><button type="submit" [disabled]="busy()">{{ registering() ? 'Register' : 'Sign in' }}</button></p>
      </form>
      <button type="button" (click)="registering.set(!registering())" style="background:none;color:#0b3d91;padding:0">
        {{ registering() ? 'Have an account? Sign in' : 'New here? Create an account' }}
      </button>
    </div>
  `,
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);
  email = ''; password = ''; fullName = '';
  registering = signal(false);
  busy = signal(false);
  error = signal('');

  async submit() {
    this.busy.set(true); this.error.set('');
    try {
      if (this.registering()) await this.auth.register(this.email, this.password, this.fullName);
      else await this.auth.login(this.email, this.password);
      await this.router.navigateByUrl('/');
    } catch (e) {
      this.error.set((e as HttpErrorResponse).error?.message ?? (e as HttpErrorResponse).error?.error ?? 'Something went wrong. Please try again.');
    } finally {
      this.busy.set(false);
    }
  }
}

