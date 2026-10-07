import { Component } from '@angular/core';
import { QuoteForm } from '../../../shared/quote-form/quote-form';
import { LIABILITY } from '../../models/liability.definition';

@Component({
  selector: 'app-liability-quote',
  imports: [QuoteForm],
  templateUrl: './liability-quote.html',
  styleUrl: './liability-quote.css',
})
export class LiabilityQuotePage {
  readonly def = LIABILITY;
}
