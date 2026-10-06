import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';

/** Landing route for the one-time token handoff: /handoff?token=... */
@Component({
  selector: 'app-handoff',
  imports: [RouterLink],
  template: `
    <div class="card" style="max-width: 380px; margin: 40px auto">
      @if (failed()) {
        <p class="error">This sign-in link is invalid or has expired.</p>
        <a routerLink="/login">Go to sign in</a>
      } @else { <p>Signing you in…</p> }
    </div>
  `,
})
export class Handoff {
  failed = signal(false);

  constructor() {
    const auth = inject(AuthService);
    const router = inject(Router);
    const token = inject(ActivatedRoute).snapshot.queryParamMap.get('token');
    if (!token) { this.failed.set(true); return; }
    // Remove the token from the address bar/history before exchanging it.
    history.replaceState(null, '', '/handoff');
    auth.exchangeHandoff(token).then(() => router.navigateByUrl('/', { replaceUrl: true }), () => this.failed.set(true));
  }
}
