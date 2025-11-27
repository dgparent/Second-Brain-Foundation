import { describe, test, expect } from '@jest/globals';
import { addHolding, recordValuation, calculatePortfolioValue } from '../index.js';

describe('Portfolio Tracking Module', () => {
  test('should add an asset holding', () => {
    const holding = addHolding({
      uid: 'hold-1',
      asset_type: 'stock',
      ticker_symbol: 'AAPL',
      asset_name: 'Apple Inc.',
      quantity: 10,
      purchase_price: 150.00,
      purchase_date: '2025-01-01',
      currency: 'USD'
    });

    expect(holding.type).toBe('portfolio.holding');
    expect(holding.metadata.ticker_symbol).toBe('AAPL');
    expect(holding.metadata.quantity).toBe(10);
    expect(holding.metadata.purchase_price).toBe(150.00);
  });

  test('should record portfolio valuation', () => {
    const valuation = recordValuation({
      uid: 'val-1',
      account_uid: 'acc-1',
      date: '2025-01-15',
      total_value: 25000,
      currency: 'USD'
    });

    expect(valuation.type).toBe('portfolio.valuation');
    expect(valuation.metadata.total_value).toBe(25000);
    expect(valuation.metadata.currency).toBe('USD');
  });

  test('should calculate portfolio value', () => {
    const holdings = [
      { metadata: { quantity: 10, current_price: 155.50 } },
      { metadata: { quantity: 5, current_price: 280.00 } },
    ];

    const value = calculatePortfolioValue(holdings as any[]);
    expect(value).toBe(2955.00); // (10 * 155.50) + (5 * 280)
  });
});
