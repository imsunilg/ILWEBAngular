import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../auth.service';

interface Field { key: string; label: string; type: 'text' | 'number' | 'date' | 'select'; options?: [string, string][]; value?: string | number; }
interface Quote { quoteNumber: string; basePremium: number; tax: number; totalPremium: number; expiresAt: string; }

const thisYear = new Date().getFullYear();
const DEFS: Record<string, { title: string; fields: Field[] }> = {
  motor: { title: 'Motor quote', fields: [
    { key: 'make', label: 'Make', type: 'text' }, { key: 'model', label: 'Model', type: 'text' },
    { key: 'year', label: 'Year', type: 'number', value: thisYear - 3 },
    { key: 'vehicleValue', label: 'Vehicle value', type: 'number' },
    { key: 'driverAge', label: 'Driver age', type: 'number' },
    { key: 'claimsLast5Years', label: 'Claims in last 5 years', type: 'number', value: 0 },
    { key: 'coverageCode', label: 'Coverage', type: 'select', value: 'COMPREHENSIVE',
      options: [['COMPREHENSIVE', 'Comprehensive'], ['THIRD_PARTY', 'Third party only']] },
  ] },
  home: { title: 'Home quote', fields: [
    { key: 'propertyType', label: 'Property type', type: 'select', value: 'House',
      options: [['House', 'House'], ['Flat', 'Flat'], ['Bungalow', 'Bungalow']] },
    { key: 'postcode', label: 'Postcode', type: 'text' },
    { key: 'yearBuilt', label: 'Year built', type: 'number' },
    { key: 'rebuildValue', label: 'Rebuild value', type: 'number' },
    { key: 'contentsValue', label: 'Contents value', type: 'number', value: 0 },
  ] },
  travel: { title: 'Travel quote', fields: [
    { key: 'destinationCode', label: 'Destination', type: 'select', value: 'FR',
      options: [['GB', 'United Kingdom'], ['US', 'United States'], ['FR', 'France'], ['DE', 'Germany'], ['ES', 'Spain'], ['AU', 'Australia'], ['IN', 'India'], ['JP', 'Japan']] },
    { key: 'startDate', label: 'Start date', type: 'date' }, { key: 'endDate', label: 'End date', type: 'date' },
    { key: 'travellers', label: 'Travellers', type: 'number', value: 1 },
    { key: 'tripCost', label: 'Trip cost', type: 'number' },
  ] },
  liability: { title: 'Public liability quote', fields: [
    { key: 'businessType', label: 'Business type', type: 'text' },
    { key: 'annualTurnover', label: 'Annual turnover', type: 'number' },
    { key: 'employees', label: 'Employees', type: 'number', value: 0 },
    { key: 'limitAmount', label: 'Limit of cover', type: 'number', value: 1000000 },
  ] },
};

@Component({
  selector: 'app-quote-form',
  imports: [FormsModule, RouterLink, CurrencyPipe],
  template: `
    @if (def; as d) {
      <div class="card" style="max-width: 520px">
        <h2>{{ d.title }}</h2>
        <form (ngSubmit)="submit()">
          @for (f of d.fields; track f.key) {
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
          <p><button type="submit" [disabled]="busy()">Get quote</button> <a routerLink="/">Cancel</a></p>
        </form>
      </div>
      @if (result(); as q) {
        <div class="card" style="max-width: 520px; margin-top: 16px">
          <h3>Quote {{ q.quoteNumber }}</h3>
          <p>Premium: {{ q.basePremium | currency }} + tax {{ q.tax | currency }}</p>
          <p><strong>Total: {{ q.totalPremium | currency }}</strong></p>
          <a routerLink="/">Back to dashboard</a>
        </div>
      }
    } @else { <p>Unknown product. <a routerLink="/">Back</a></p> }
  `,
})
export class QuoteForm {
  private http = inject(HttpClient);
  private product = inject(ActivatedRoute).snapshot.paramMap.get('product') ?? '';
  def = DEFS[this.product];
  model: Record<string, string | number | undefined> = Object.fromEntries((this.def?.fields ?? []).map(f => [f.key, f.value]));
  busy = signal(false);
  error = signal('');
  result = signal<Quote | null>(null);

  async submit() {
    this.busy.set(true); this.error.set(''); this.result.set(null);
    try {
      this.result.set(await firstValueFrom(this.http.post<Quote>(`${API_URL}/api/quotes/${this.product}`, this.model)));
    } catch (e) {
      const err = e as HttpErrorResponse;
      this.error.set(err.error?.error ?? 'Could not calculate the quote. Check your details.');
    } finally {
      this.busy.set(false);
    }
  }
}
