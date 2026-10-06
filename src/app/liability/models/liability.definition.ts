import { QuoteDefinition } from '../../shared/models';

export const LIABILITY: QuoteDefinition = {
  module: 'liability',
  title: 'Public liability quote',
  fields: [
    { key: 'businessType', label: 'Business type', type: 'text' },
    { key: 'annualTurnover', label: 'Annual turnover', type: 'number' },
    { key: 'employees', label: 'Employees', type: 'number', value: 0 },
    { key: 'limitAmount', label: 'Limit of cover', type: 'number', value: 1000000 },
  ],
};
