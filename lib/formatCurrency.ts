export type CurrencyCode = 'NPR' | 'USD' | 'EUR' | 'INR';

const CURRENCY_MAP: Record<CurrencyCode, { symbol: string; locale: string }> = {
  NPR: { symbol: 'Rs',  locale: 'en-IN' },
  USD: { symbol: '$',   locale: 'en-US' },
  EUR: { symbol: '\u20AC',   locale: 'en-US' },
  INR: { symbol: '\u20B9',   locale: 'en-IN' },
};

/**
 * Formats a numeric amount with the given currency symbol.
 *
 * WARNING: This only changes the display symbol -- it does NOT convert
 * the actual monetary value. Real FX conversion is NOT implemented.
 */
export function formatCurrency(amount: number, currency: CurrencyCode): string {
  const info = CURRENCY_MAP[currency];
  if (!info) {
    // Fallback for unknown currency (defensive, should not happen)
    return `Rs ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  const { symbol, locale } = info;
  const formatted = amount.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${symbol} ${formatted}`;
}

export function getCurrencySymbol(currency: CurrencyCode): string {
  return CURRENCY_MAP[currency]?.symbol ?? 'Rs';
}
