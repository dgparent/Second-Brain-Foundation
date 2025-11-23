/**
 * Currency conversion utilities for financial framework
 */

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  date: string;
}

export class CurrencyConverter {
  private rates: Map<string, ExchangeRate[]> = new Map();

  /**
   * Add an exchange rate
   */
  addRate(rate: ExchangeRate): void {
    const key = `${rate.from}_${rate.to}`;
    const existing = this.rates.get(key) || [];
    existing.push(rate);
    this.rates.set(key, existing);
  }

  /**
   * Convert amount from one currency to another
   * @param amount Amount to convert
   * @param from Source currency
   * @param to Target currency
   * @param date Date for historical rate (optional, uses latest if not provided)
   */
  convert(amount: number, from: string, to: string, date?: string): number {
    if (from === to) return amount;

    const key = `${from}_${to}`;
    const rates = this.rates.get(key);

    if (!rates || rates.length === 0) {
      throw new Error(`No exchange rate found for ${from} -> ${to}`);
    }

    // Find rate for specific date or use latest
    let rate: ExchangeRate;
    if (date) {
      rate = rates.find(r => r.date === date) || rates[rates.length - 1];
    } else {
      rate = rates[rates.length - 1];
    }

    return amount * rate.rate;
  }

  /**
   * Get latest exchange rate between two currencies
   */
  getRate(from: string, to: string): number | null {
    if (from === to) return 1;

    const key = `${from}_${to}`;
    const rates = this.rates.get(key);

    if (!rates || rates.length === 0) {
      return null;
    }

    return rates[rates.length - 1].rate;
  }
}

/**
 * Format amount with currency symbol
 */
export function formatCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    CAD: 'C$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    AUD: 'A$',
    BTC: '₿',
    ETH: 'Ξ',
  };

  const symbol = symbols[currency] || currency;
  const formatted = amount.toFixed(2);

  return `${symbol}${formatted}`;
}

/**
 * Parse amount from formatted string
 */
export function parseCurrencyAmount(formatted: string): { amount: number; currency?: string } {
  // Remove common currency symbols and extract number
  const cleaned = formatted.replace(/[$€£¥₿Ξ,\s]/g, '');
  const amount = parseFloat(cleaned);

  return { amount };
}
