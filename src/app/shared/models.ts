export interface Field {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: [string, string][];
  value?: string | number;
}

export interface QuoteDefinition {
  /** Route segment and API segment, e.g. "travel" → /travel and /api/quotes/travel */
  module: string;
  title: string;
  fields: Field[];
}

export interface Quote {
  quoteNumber: string;
  productName: string;
  basePremium: number;
  tax: number;
  totalPremium: number;
  expiresAt: string;
}
