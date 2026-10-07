import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../../core/config';
import { Quote, QuoteDefinition } from '../models';

/** Generic quote form: renders the fields of a product definition and posts to /api/quotes/{module}. */
@Component({
  selector: 'app-quote-form',
  imports: [FormsModule],
  templateUrl: './quote-form.html',
  styleUrl: './quote-form.css',
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
    this.busy.set(true);
    this.error.set('');
    try {
      const quote = await firstValueFrom(this.http.post<Quote>(`${API_URL}/api/quotes/${this.def().module}`, this.model));
      await this.router.navigate(['/', this.def().module, 'result'], { state: { quote } });
    } catch (e) {
      const err = e as HttpErrorResponse;
      this.error.set(
        err.status === 403
          ? 'You do not have permission to create this quote.'
          : (err.error?.error ?? 'Could not calculate the quote. Check your details.'),
      );
    } finally {
      this.busy.set(false);
    }
  }
}
