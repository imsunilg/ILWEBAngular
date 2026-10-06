import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../core/config';
import { Quote, QuoteDefinition } from './models';

/** Generic quote form: renders the fields of a product definition and posts to /api/quotes/{module}. */
@Component({
  selector: 'app-quote-form',
  imports: [FormsModule],
  template: `
    <section class="module">
      <h2>{{ def().title }}</h2>
      <form (ngSubmit)="submit()">
        @for (f of def().fields; track f.key) {
          <label [for]="f.key">{{ f.label }}</label>
          @if (f.type === 'select') {
            <select [id]="f.key" [name]="f.key" [(ngModel)]="model[f.key]">
              @for (o of f.options; track o[0]) { <option [value]="o[0]">{{ o[1] }}</option> }
            </select>
          } @else {
            <input [id]="f.key" [name]="f.key" [type]="f.type" [(ngModel)]="model[f.key]" required />
          }
        }
        @if (error()) { <p class="error">{{ error() }}</p> }
        <button type="submit" class="primary" [disabled]="busy()">Get quote</button>
      </form>
    </section>
  `,
})
export class QuoteForm {
  readonly def = input.required<QuoteDefinition>();
  private http = inject(HttpClient);
  private router = inject(Router);

  model: Record<string, string | number | undefined> = {};
  busy = signal(false);
  error = signal('');

  ngOnInit() {
    this.model = Object.fromEntries(this.def().fields.map(f => [f.key, f.value]));
  }

  async submit() {
    this.busy.set(true); this.error.set('');
    try {
      const quote = await firstValueFrom(this.http.post<Quote>(`${API_URL}/api/quotes/${this.def().module}`, this.model));
      await this.router.navigate(['/', this.def().module, 'result'], { state: { quote } });
    } catch (e) {
      const err = e as HttpErrorResponse;
      this.error.set(err.status === 403
        ? 'You do not have permission to create this quote.'
        : (err.error?.error ?? 'Could not calculate the quote. Check your details.'));
    } finally {
      this.busy.set(false);
    }
  }
}
