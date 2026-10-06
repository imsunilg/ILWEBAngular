import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';

/** Content-only host: no header, navigation, login or dashboard (the Flutter shell provides those). */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    @switch (auth.status()) {
      @case ('ready') { <router-outlet /> }
      @case ('connecting') { <p class="module muted">Loading…</p> }
      @case ('standalone') {
        <section class="module"><h2>IL Insurance Portal</h2>
          <p class="muted">This module runs inside the portal. Please open it from the portal's Travel or Liability menu.</p></section>
      }
      @default {
        <section class="module"><h2>Session unavailable</h2>
          <p class="muted">The portal session could not be established. Return to the portal and open this module again.</p></section>
      }
    }
  `,
})
export class App {
  protected auth = inject(AuthService);

  constructor() {
    this.auth.connect();
  }
}
