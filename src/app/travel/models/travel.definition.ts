import { QuoteDefinition } from '../../shared/models';

export const TRAVEL: QuoteDefinition = {
  module: 'travel',
  title: 'Travel quote',
  fields: [
    { key: 'destinationCode', label: 'Destination', type: 'select', value: 'FR',
      options: [['GB', 'United Kingdom'], ['US', 'United States'], ['FR', 'France'], ['DE', 'Germany'],
        ['ES', 'Spain'], ['AU', 'Australia'], ['IN', 'India'], ['JP', 'Japan']] },
    { key: 'startDate', label: 'Start date', type: 'date' },
    { key: 'endDate', label: 'End date', type: 'date' },
    { key: 'travellers', label: 'Travellers', type: 'number', value: 1 },
    { key: 'tripCost', label: 'Trip cost', type: 'number' },
  ],
};
