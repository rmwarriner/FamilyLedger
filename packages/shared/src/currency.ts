export interface CurrencyDefinition {
  code: string;
  name: string;
  symbol: string;
  minorUnit: number;
}

export const ISO_4217_CURRENCIES: Record<string, CurrencyDefinition> = {
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', minorUnit: 2 },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', minorUnit: 2 },
  GBP: { code: 'GBP', name: 'Pound Sterling', symbol: '£', minorUnit: 2 },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', minorUnit: 2 },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', minorUnit: 2 }
};

export const isSupportedCurrency = (code: string): boolean =>
  Object.hasOwn(ISO_4217_CURRENCIES, code.toUpperCase());
