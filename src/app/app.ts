import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  template: `
    <header>
      <a routerLink="/" class="brand">IL Insurance Portal</a>
      @if (auth.user(); as u) {
        <span>{{ u.fullName }} <button type="button" (click)="auth.logout()">Sign out</button></span>
      }
    </header>
    <main><router-outlet /></main>
  `,
  styleUrl: './app.css',
})
export class App {
  protected auth = inject(AuthService);
}
