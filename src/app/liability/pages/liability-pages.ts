import { Component } from '@angular/core';
import { QuoteForm } from '../../shared/quote-form';
import { QuoteResult } from '../../shared/quote-result';
import { LIABILITY } from '../models/liability.definition';

@Component({
  selector: 'app-liability-quote',
  imports: [QuoteForm],
  template: `<app-quote-form [def]="def" />`,
})
export class LiabilityQuotePage {
  readonly def = LIABILITY;
}

@Component({
  selector: 'app-liability-result',
  imports: [QuoteResult],
  template: `<app-quote-result module="liability" title="Liability quote result" />`,
})
export class LiabilityResultPage {}
