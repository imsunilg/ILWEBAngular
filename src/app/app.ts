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
        <nav>
          <a routerLink="/">Dashboard</a>
          @if (auth.has('motor.quote')) { <a routerLink="/quote/motor">Motor</a> }
          @if (auth.has('home.quote')) { <a routerLink="/quote/home">Home</a> }
          @if (auth.has('travel.quote')) { <a routerLink="/quote/travel">Travel</a> }
          @if (auth.has('liability.quote')) { <a routerLink="/quote/liability">Liability</a> }
        </nav>
        <span>{{ u.displayName }} ({{ u.role }}) <button type="button" (click)="auth.logout()">Sign out</button></span>
      }
    </header>
    <main><router-outlet /></main>
  `,
  styleUrl: './app.css',
})
export class App {
  protected auth = inject(AuthService);
}
