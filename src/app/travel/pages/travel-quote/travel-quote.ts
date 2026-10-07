import { Component } from '@angular/core';
import { QuoteForm } from '../../../shared/quote-form/quote-form';
import { TRAVEL } from '../../models/travel.definition';

@Component({
  selector: 'app-travel-quote',
  imports: [QuoteForm],
  templateUrl: './travel-quote.html',
  styleUrl: './travel-quote.css',
})
export class TravelQuotePage {
  readonly def = TRAVEL;
}
