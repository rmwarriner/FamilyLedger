export const formatCurrency = (value: number, currency: string, locale: string): string =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);

export const formatDate = (value: Date, locale: string): string =>
  new Intl.DateTimeFormat(locale).format(value);

export const formatNumber = (value: number, locale: string): string =>
  new Intl.NumberFormat(locale).format(value);
