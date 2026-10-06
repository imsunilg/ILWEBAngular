import { HttpClient } from '@angular/common/http';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { API_URL, AuthService } from '../auth.service';

interface Product { id: number; code: string; name: string; description: string | null; }
interface Quote { id: string; quoteNumber: string; status: string; productName: string; totalPremium: number; createdAt: string; expiresAt: string; }

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, CurrencyPipe, DatePipe],
  template: `
    <h2>{{ auth.user()?.role }} dashboard</h2>
    @if (allowedProducts().length > 0) { <h2>Get a quote</h2> }
    <div class="grid">
      @for (p of allowedProducts(); track p.id) {
        <div class="card">
          <h3>{{ p.name }}</h3>
          <p>{{ p.description }}</p>
          <a class="btn" [routerLink]="['/quote', p.code.toLowerCase()]">Start quote</a>
        </div>
      }
    </div>
    <h2>Your quotes</h2>
    <div class="card">
      @if ((quotes() ?? []).length === 0) { <p>No quotes yet.</p> } @else {
        <table>
          <tr><th>Number</th><th>Product</th><th>Total</th><th>Status</th><th>Created</th></tr>
          @for (q of quotes(); track q.id) {
            <tr>
              <td>{{ q.quoteNumber }}</td><td>{{ q.productName }}</td>
              <td>{{ q.totalPremium | currency }}</td><td>{{ q.status }}</td><td>{{ q.createdAt | date: 'mediumDate' }}</td>
            </tr>
          }
        </table>
      }
    </div>
  `,
})
export class Dashboard {
  protected auth = inject(AuthService);
  private http = inject(HttpClient);
  products = toSignal(this.http.get<Product[]>(`${API_URL}/api/products`));
  /** Only products the signed-in user has permission to quote. */
  allowedProducts = computed(() => (this.products() ?? []).filter(p => this.auth.has(`${p.code.toLowerCase()}.quote`)));
  quotes = toSignal(this.http.get<Quote[]>(`${API_URL}/api/quotes`));
}

