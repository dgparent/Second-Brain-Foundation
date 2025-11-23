import {
  FinancialAggregationWorkflow,
  TimePeriod,
} from '../workflows/FinancialAggregationWorkflow';
import { createFinancialEvent, FinancialEventEntity } from '../entities/FinancialEventEntity';
import { CurrencyConverter } from '../utils/currencyConverter';

// Mock Memory Engine
class MockMemoryEngine {
  private events: FinancialEventEntity[] = [];

  setEvents(events: FinancialEventEntity[]) {
    this.events = events;
  }

  async queryEntities(query: any): Promise<FinancialEventEntity[]> {
    let filtered = [...this.events];

    // Filter by type
    if (query.type) {
      const types = Array.isArray(query.type) ? query.type : [query.type];
      filtered = filtered.filter(e => types.includes(e.type));
    }

    // Filter by date range
    if (query.dateRange) {
      const { start, end } = query.dateRange;
      filtered = filtered.filter(e => {
        const date = e.metadata.date;
        return date >= start && date <= end;
      });
    }

    return filtered;
  }
}

// Mock Currency Converter
class MockCurrencyConverter extends CurrencyConverter {
  constructor() {
    super();
  }

  convert(amount: number, from: string, to: string, date?: string): number {
    // Simple mock: just return amount if same currency
    if (from === to) return amount;
    
    // Mock conversion rates
    const rates: Record<string, number> = {
      'CAD-USD': 0.75,
      'EUR-USD': 1.10,
      'GBP-USD': 1.30,
    };

    const key = `${from}-${to}`;
    const rate = rates[key] || 1;
    return amount * rate;
  }
}

describe('Financial Workflows', () => {
  let memoryEngine: MockMemoryEngine;
  let currencyConverter: MockCurrencyConverter;
  let workflow: FinancialAggregationWorkflow;

  beforeEach(() => {
    memoryEngine = new MockMemoryEngine();
    currencyConverter = new MockCurrencyConverter();
    workflow = new FinancialAggregationWorkflow(
      memoryEngine as any,
      currencyConverter,
      'USD'
    );
  });

  describe('aggregateByPeriod', () => {
    it('should aggregate monthly transactions', async () => {
      const events = [
        createFinancialEvent({
          uid: 'txn-001',
          type: 'finance.transaction',
          title: 'Salary Nov',
          date: '2025-11-01',
          amount: 5000,
          currency: 'USD',
          category: 'Income',
        }),
        createFinancialEvent({
          uid: 'txn-002',
          type: 'finance.transaction',
          title: 'Rent Nov',
          date: '2025-11-05',
          amount: -1500,
          currency: 'USD',
          category: 'Housing',
        }),
        createFinancialEvent({
          uid: 'txn-003',
          type: 'finance.transaction',
          title: 'Groceries Nov',
          date: '2025-11-10',
          amount: -300,
          currency: 'USD',
          category: 'Food',
        }),
      ];

      memoryEngine.setEvents(events);

      const results = await workflow.aggregateByPeriod(
        '2025-11-01',
        '2025-11-30',
        'monthly'
      );

      expect(results.length).toBeGreaterThanOrEqual(1);
      
      // Find November results
      const nov = results.find(r => r.period === '2025-11');
      expect(nov).toBeDefined();
      expect(nov!.total_income).toBe(5000);
      expect(nov!.total_expenses).toBe(1800);
      expect(nov!.net).toBe(3200);
      expect(nov!.transaction_count).toBe(3);
    });

    it('should aggregate daily transactions', async () => {
      const events = [
        createFinancialEvent({
          uid: 'txn-001',
          type: 'finance.transaction',
          title: 'Coffee',
          date: '2025-11-21',
          amount: -5,
          currency: 'USD',
        }),
        createFinancialEvent({
          uid: 'txn-002',
          type: 'finance.transaction',
          title: 'Lunch',
          date: '2025-11-21',
          amount: -15,
          currency: 'USD',
        }),
        createFinancialEvent({
          uid: 'txn-003',
          type: 'finance.transaction',
          title: 'Dinner',
          date: '2025-11-22',
          amount: -25,
          currency: 'USD',
        }),
      ];

      memoryEngine.setEvents(events);

      const results = await workflow.aggregateByPeriod(
        '2025-11-21',
        '2025-11-22',
        'daily'
      );

      expect(results).toHaveLength(2);
      expect(results[0].period).toBe('2025-11-21');
      expect(results[0].total_expenses).toBe(20);
      expect(results[1].period).toBe('2025-11-22');
      expect(results[1].total_expenses).toBe(25);
    });

    it('should aggregate weekly transactions', async () => {
      const events = [
        createFinancialEvent({
          uid: 'txn-001',
          type: 'finance.transaction',
          title: 'Week 1',
          date: '2025-11-03',
          amount: -100,
          currency: 'USD',
        }),
        createFinancialEvent({
          uid: 'txn-002',
          type: 'finance.transaction',
          title: 'Week 2',
          date: '2025-11-10',
          amount: -200,
          currency: 'USD',
        }),
      ];

      memoryEngine.setEvents(events);

      const results = await workflow.aggregateByPeriod(
        '2025-11-01',
        '2025-11-30',
        'weekly'
      );

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].period).toMatch(/2025-W\d{2}/);
    });

    it('should aggregate yearly transactions', async () => {
      const events = [
        createFinancialEvent({
          uid: 'txn-001',
          type: 'finance.transaction',
          title: '2025 Income',
          date: '2025-06-01',
          amount: 50000,
          currency: 'USD',
        }),
        createFinancialEvent({
          uid: 'txn-002',
          type: 'finance.transaction',
          title: '2024 Income',
          date: '2024-06-01',
          amount: 45000,
          currency: 'USD',
        }),
      ];

      memoryEngine.setEvents(events);

      const results = await workflow.aggregateByPeriod(
        '2024-01-01',
        '2025-12-31',
        'yearly'
      );

      expect(results).toHaveLength(2);
      expect(results[0].period).toBe('2024');
      expect(results[1].period).toBe('2025');
    });

    it('should include category breakdown', async () => {
      const events = [
        createFinancialEvent({
          uid: 'txn-001',
          type: 'finance.transaction',
          title: 'Income',
          date: '2025-11-01',
          amount: 5000,
          currency: 'USD',
          category: 'Income',  // Changed from Salary
        }),
        createFinancialEvent({
          uid: 'txn-002',
          type: 'finance.transaction',
          title: 'Rent',
          date: '2025-11-05',
          amount: -1500,
          currency: 'USD',
          category: 'Housing',
        }),
        createFinancialEvent({
          uid: 'txn-003',
          type: 'finance.transaction',
          title: 'Groceries',
          date: '2025-11-10',
          amount: -300,
          currency: 'USD',
          category: 'Food',
        }),
      ];

      memoryEngine.setEvents(events);

      const results = await workflow.aggregateByPeriod(
        '2025-11-01',
        '2025-11-30',
        'monthly'
      );

      const nov = results.find(r => r.period === '2025-11');
      expect(nov).toBeDefined();
      expect(nov!.by_category).toBeDefined();
      expect(nov!.by_category!['Income']).toBe(5000);
      expect(nov!.by_category!['Housing']).toBe(-1500);
      expect(nov!.by_category!['Food']).toBe(-300);
    });

    it('should handle same currency transactions', async () => {
      const events = [
        createFinancialEvent({
          uid: 'txn-001',
          type: 'finance.transaction',
          title: 'USD Income',
          date: '2025-11-01',
          amount: 1000,
          currency: 'USD',
        }),
        createFinancialEvent({
          uid: 'txn-002',
          type: 'finance.transaction',
          title: 'USD Expense',
          date: '2025-11-05',
          amount: -100,
          currency: 'USD',
        }),
      ];

      memoryEngine.setEvents(events);

      const results = await workflow.aggregateByPeriod(
        '2025-11-01',
        '2025-11-30',
        'monthly'
      );

      const nov = results.find(r => r.period === '2025-11');
      expect(nov).toBeDefined();
      expect(nov!.currency).toBe('USD');
      expect(nov!.total_income).toBe(1000);
      expect(nov!.total_expenses).toBe(100);
    });
  });

  describe('getCategoryBreakdown', () => {
    it('should return category breakdown', async () => {
      const events = [
        createFinancialEvent({
          uid: 'txn-001',
          type: 'finance.transaction',
          title: 'Food 1',
          date: '2025-11-01',
          amount: -100,
          currency: 'USD',
          category: 'Food',
        }),
        createFinancialEvent({
          uid: 'txn-002',
          type: 'finance.transaction',
          title: 'Food 2',
          date: '2025-11-05',
          amount: -50,
          currency: 'USD',
          category: 'Food',
        }),
        createFinancialEvent({
          uid: 'txn-003',
          type: 'finance.transaction',
          title: 'Transport',
          date: '2025-11-10',
          amount: -40,
          currency: 'USD',
          category: 'Transportation',
        }),
      ];

      memoryEngine.setEvents(events);

      const breakdown = await workflow.getCategoryBreakdown(
        '2025-11-01',
        '2025-11-30'
      );

      expect(breakdown['Food']).toBe(-150);
      expect(breakdown['Transportation']).toBe(-40);
    });
  });

  describe('calculateBurnRate', () => {
    it('should calculate average monthly burn rate', async () => {
      const events = [
        // January
        createFinancialEvent({
          uid: 'txn-001',
          type: 'finance.transaction',
          title: 'Jan Expenses',
          date: '2025-01-15',
          amount: -3000,
          currency: 'USD',
        }),
        // February
        createFinancialEvent({
          uid: 'txn-002',
          type: 'finance.transaction',
          title: 'Feb Expenses',
          date: '2025-02-15',
          amount: -3500,
          currency: 'USD',
        }),
        // March
        createFinancialEvent({
          uid: 'txn-003',
          type: 'finance.transaction',
          title: 'Mar Expenses',
          date: '2025-03-15',
          amount: -2500,
          currency: 'USD',
        }),
      ];

      memoryEngine.setEvents(events);

      const burnRate = await workflow.calculateBurnRate(
        '2025-01-01',
        '2025-03-31'
      );

      // Average: (3000 + 3500 + 2500) / 3 = 3000
      expect(burnRate).toBe(3000);
    });

    it('should return 0 if no transactions', async () => {
      memoryEngine.setEvents([]);

      const burnRate = await workflow.calculateBurnRate(
        '2025-01-01',
        '2025-03-31'
      );

      expect(burnRate).toBe(0);
    });
  });

  describe('calculateSavingsRate', () => {
    it('should calculate savings rate percentage', async () => {
      const events = [
        createFinancialEvent({
          uid: 'txn-001',
          type: 'finance.transaction',
          title: 'Income',
          date: '2025-11-01',
          amount: 5000,
          currency: 'USD',
        }),
        createFinancialEvent({
          uid: 'txn-002',
          type: 'finance.transaction',
          title: 'Expenses',
          date: '2025-11-05',
          amount: -3000,
          currency: 'USD',
        }),
      ];

      memoryEngine.setEvents(events);

      const savingsRate = await workflow.calculateSavingsRate(
        '2025-11-01',
        '2025-11-30'
      );

      // (5000 - 3000) / 5000 * 100 = 40%
      expect(savingsRate).toBe(40);
    });

    it('should return 0 if no income', async () => {
      const events = [
        createFinancialEvent({
          uid: 'txn-001',
          type: 'finance.transaction',
          title: 'Expenses',
          date: '2025-11-05',
          amount: -1000,
          currency: 'USD',
        }),
      ];

      memoryEngine.setEvents(events);

      const savingsRate = await workflow.calculateSavingsRate(
        '2025-11-01',
        '2025-11-30'
      );

      expect(savingsRate).toBe(0);
    });

    it('should handle negative savings rate', async () => {
      const events = [
        createFinancialEvent({
          uid: 'txn-001',
          type: 'finance.transaction',
          title: 'Income',
          date: '2025-11-01',
          amount: 3000,
          currency: 'USD',
        }),
        createFinancialEvent({
          uid: 'txn-002',
          type: 'finance.transaction',
          title: 'Expenses',
          date: '2025-11-05',
          amount: -5000,
          currency: 'USD',
        }),
      ];

      memoryEngine.setEvents(events);

      const savingsRate = await workflow.calculateSavingsRate(
        '2025-11-01',
        '2025-11-30'
      );

      // (3000 - 5000) / 3000 * 100 = -66.67%
      expect(savingsRate).toBeCloseTo(-66.67, 1);
    });
  });
});
