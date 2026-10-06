import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Quote } from './models';

/** Shows the quote passed through router state; sends the user back to the form when there is none (e.g. page reload). */
@Component({
  selector: 'app-quote-result',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  template: `
    <section class="module">
      <h2>{{ title() }}</h2>
      @if (quote; as q) {
        <div class="card">
          <p class="muted">Quote {{ q.quoteNumber }}</p>
          <p>Premium {{ q.basePremium | currency }} + tax {{ q.tax | currency }}</p>
          <p class="total">Total {{ q.totalPremium | currency }}</p>
          <p class="muted">Valid until {{ q.expiresAt | date: 'mediumDate' }}</p>
        </div>
        <a class="primary" [routerLink]="['/', module()]">New quote</a>
      }
    </section>
  `,
})
export class QuoteResult {
  readonly module = input.required<string>();
  readonly title = input.required<string>();
  private router = inject(Router);
  quote: Quote | undefined = history.state?.quote;

  ngOnInit() {
    if (!this.quote) this.router.navigate(['/', this.module()], { replaceUrl: true });
  }
}
