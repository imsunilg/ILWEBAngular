import { Component } from '@angular/core';
import { QuoteForm } from '../../shared/quote-form';
import { QuoteResult } from '../../shared/quote-result';
import { TRAVEL } from '../models/travel.definition';

@Component({
  selector: 'app-travel-quote',
  imports: [QuoteForm],
  template: `<app-quote-form [def]="def" />`,
})
export class TravelQuotePage {
  readonly def = TRAVEL;
}

@Component({
  selector: 'app-travel-result',
  imports: [QuoteResult],
  template: `<app-quote-result module="travel" title="Travel quote result" />`,
})
export class TravelResultPage {}
