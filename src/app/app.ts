import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';

/** Content-only host: no header, navigation, login or dashboard (the Flutter shell provides those). */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected auth = inject(AuthService);

  constructor() {
    this.auth.connect();
  }
}
