import {
  generateFinancialUID,
  validateFinancialEvent,
  validateFinancialAccount,
  calculateTotal,
  filterByDateRange,
  groupByCategory,
  sortByDate,
} from '../utils/financialHelpers';
import { createFinancialEvent } from '../entities/FinancialEventEntity';
import { createFinancialAccount } from '../entities/FinancialAccountEntity';

describe('Financial Utilities', () => {
  describe('generateFinancialUID', () => {
    it('should generate UID with prefix and date', () => {
      const uid = generateFinancialUID('txn', '2025-11-21');
      expect(uid).toMatch(/^txn-2025-11-21-[a-z0-9]{6}$/);
    });

    it('should generate UID with current date if not provided', () => {
      const uid = generateFinancialUID('acct');
      expect(uid).toMatch(/^acct-\d{4}-\d{2}-\d{2}-[a-z0-9]{6}$/);
    });

    it('should generate unique UIDs', () => {
      const uid1 = generateFinancialUID('txn', '2025-11-21');
      const uid2 = generateFinancialUID('txn', '2025-11-21');
      expect(uid1).not.toBe(uid2);
    });
  });

  describe('validateFinancialEvent', () => {
    it('should validate a complete financial event', () => {
      const event = createFinancialEvent({
        uid: 'txn-001',
        type: 'finance.transaction',
        title: 'Test',
        date: '2025-11-21',
        amount: 100,
        currency: 'USD',
      });

      const errors = validateFinancialEvent(event);
      expect(errors).toHaveLength(0);
    });

    it('should require UID', () => {
      const event = createFinancialEvent({
        uid: '',
        type: 'finance.transaction',
        title: 'Test',
        date: '2025-11-21',
        amount: 100,
        currency: 'USD',
      });
      event.uid = '';

      const errors = validateFinancialEvent(event);
      expect(errors).toContain('UID is required');
    });

    it('should require title', () => {
      const event = createFinancialEvent({
        uid: 'txn-001',
        type: 'finance.transaction',
        title: '',
        date: '2025-11-21',
        amount: 100,
        currency: 'USD',
      });
      event.title = '';

      const errors = validateFinancialEvent(event);
      expect(errors).toContain('Title is required');
    });

    it('should require date', () => {
      const event: any = {
        uid: 'txn-001',
        title: 'Test',
        metadata: {
          amount: 100,
          currency: 'USD',
        },
      };

      const errors = validateFinancialEvent(event);
      expect(errors).toContain('Date is required');
    });

    it('should validate date format', () => {
      const event: any = {
        uid: 'txn-001',
        title: 'Test',
        metadata: {
          date: '11/21/2025',
          amount: 100,
          currency: 'USD',
        },
      };

      const errors = validateFinancialEvent(event);
      expect(errors).toContain('Date must be in YYYY-MM-DD format');
    });

    it('should require amount', () => {
      const event: any = {
        uid: 'txn-001',
        title: 'Test',
        metadata: {
          date: '2025-11-21',
          currency: 'USD',
        },
      };

      const errors = validateFinancialEvent(event);
      expect(errors).toContain('Amount is required');
    });

    it('should require currency', () => {
      const event: any = {
        uid: 'txn-001',
        title: 'Test',
        metadata: {
          date: '2025-11-21',
          amount: 100,
        },
      };

      const errors = validateFinancialEvent(event);
      expect(errors).toContain('Currency is required');
    });
  });

  describe('validateFinancialAccount', () => {
    it('should validate a complete account', () => {
      const account = createFinancialAccount({
        uid: 'acct-001',
        title: 'Checking',
        account_type: 'checking',
        currency: 'USD',
      });

      const errors = validateFinancialAccount(account);
      expect(errors).toHaveLength(0);
    });

    it('should require account type', () => {
      const account: any = {
        uid: 'acct-001',
        title: 'Test',
        metadata: {
          currency: 'USD',
        },
      };

      const errors = validateFinancialAccount(account);
      expect(errors).toContain('Account type is required');
    });
  });

  describe('calculateTotal', () => {
    it('should calculate total of multiple events', () => {
      const events = [
        createFinancialEvent({
          uid: 'txn-001',
          type: 'finance.transaction',
          title: 'Income',
          date: '2025-11-21',
          amount: 1000,
          currency: 'USD',
        }),
        createFinancialEvent({
          uid: 'txn-002',
          type: 'finance.transaction',
          title: 'Expense',
          date: '2025-11-21',
          amount: -200,
          currency: 'USD',
        }),
        createFinancialEvent({
          uid: 'txn-003',
          type: 'finance.transaction',
          title: 'Expense',
          date: '2025-11-21',
          amount: -50,
          currency: 'USD',
        }),
      ];

      const total = calculateTotal(events);
      expect(total).toBe(750);
    });

    it('should return 0 for empty array', () => {
      const total = calculateTotal([]);
      expect(total).toBe(0);
    });
  });

  describe('filterByDateRange', () => {
    const events = [
      createFinancialEvent({
        uid: 'txn-001',
        type: 'finance.transaction',
        title: 'Event 1',
        date: '2025-11-01',
        amount: 100,
        currency: 'USD',
      }),
      createFinancialEvent({
        uid: 'txn-002',
        type: 'finance.transaction',
        title: 'Event 2',
        date: '2025-11-15',
        amount: 200,
        currency: 'USD',
      }),
      createFinancialEvent({
        uid: 'txn-003',
        type: 'finance.transaction',
        title: 'Event 3',
        date: '2025-11-30',
        amount: 300,
        currency: 'USD',
      }),
      createFinancialEvent({
        uid: 'txn-004',
        type: 'finance.transaction',
        title: 'Event 4',
        date: '2025-12-01',
        amount: 400,
        currency: 'USD',
      }),
    ];

    it('should filter events within date range', () => {
      const filtered = filterByDateRange(events, '2025-11-10', '2025-11-30');
      expect(filtered).toHaveLength(2);
      expect(filtered[0].uid).toBe('txn-002');
      expect(filtered[1].uid).toBe('txn-003');
    });

    it('should include boundary dates', () => {
      const filtered = filterByDateRange(events, '2025-11-01', '2025-11-30');
      expect(filtered).toHaveLength(3);
    });

    it('should return empty array if no events in range', () => {
      const filtered = filterByDateRange(events, '2025-10-01', '2025-10-31');
      expect(filtered).toHaveLength(0);
    });
  });

  describe('groupByCategory', () => {
    const events = [
      createFinancialEvent({
        uid: 'txn-001',
        type: 'finance.transaction',
        title: 'Groceries',
        date: '2025-11-21',
        amount: -100,
        currency: 'USD',
        category: 'Food',
      }),
      createFinancialEvent({
        uid: 'txn-002',
        type: 'finance.transaction',
        title: 'Restaurant',
        date: '2025-11-21',
        amount: -50,
        currency: 'USD',
        category: 'Food',
      }),
      createFinancialEvent({
        uid: 'txn-003',
        type: 'finance.transaction',
        title: 'Gas',
        date: '2025-11-21',
        amount: -40,
        currency: 'USD',
        category: 'Transportation',
      }),
    ];

    it('should group events by category', () => {
      const grouped = groupByCategory(events);
      expect(grouped['Food']).toHaveLength(2);
      expect(grouped['Transportation']).toHaveLength(1);
    });

    it('should handle uncategorized events', () => {
      const uncategorizedEvent = createFinancialEvent({
        uid: 'txn-004',
        type: 'finance.transaction',
        title: 'Other',
        date: '2025-11-21',
        amount: -20,
        currency: 'USD',
      });

      const grouped = groupByCategory([...events, uncategorizedEvent]);
      expect(grouped['uncategorized']).toHaveLength(1);
    });
  });

  describe('sortByDate', () => {
    const events = [
      createFinancialEvent({
        uid: 'txn-001',
        type: 'finance.transaction',
        title: 'Event 1',
        date: '2025-11-15',
        amount: 100,
        currency: 'USD',
      }),
      createFinancialEvent({
        uid: 'txn-002',
        type: 'finance.transaction',
        title: 'Event 2',
        date: '2025-11-01',
        amount: 200,
        currency: 'USD',
      }),
      createFinancialEvent({
        uid: 'txn-003',
        type: 'finance.transaction',
        title: 'Event 3',
        date: '2025-11-30',
        amount: 300,
        currency: 'USD',
      }),
    ];

    it('should sort events descending by default', () => {
      const sorted = sortByDate(events);
      expect(sorted[0].metadata.date).toBe('2025-11-30');
      expect(sorted[1].metadata.date).toBe('2025-11-15');
      expect(sorted[2].metadata.date).toBe('2025-11-01');
    });

    it('should sort events ascending', () => {
      const sorted = sortByDate(events, 'asc');
      expect(sorted[0].metadata.date).toBe('2025-11-01');
      expect(sorted[1].metadata.date).toBe('2025-11-15');
      expect(sorted[2].metadata.date).toBe('2025-11-30');
    });

    it('should not mutate original array', () => {
      const originalOrder = events.map(e => e.uid);
      sortByDate(events);
      const currentOrder = events.map(e => e.uid);
      expect(currentOrder).toEqual(originalOrder);
    });
  });
});
