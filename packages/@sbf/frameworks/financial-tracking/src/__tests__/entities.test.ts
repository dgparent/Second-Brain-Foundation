import {
  createFinancialEvent,
  FinancialEventEntity,
  FinancialEventBuilder,
} from '../entities/FinancialEventEntity';
import {
  createFinancialAccount,
  FinancialAccountEntity,
} from '../entities/FinancialAccountEntity';

describe('Financial Entities', () => {
  describe('FinancialEventEntity', () => {
    it('should create a financial event with required fields', () => {
      const event = createFinancialEvent({
        uid: 'txn-001',
        type: 'finance.transaction',
        title: 'Grocery Shopping',
        date: '2025-11-21',
        amount: -85.50,
        currency: 'USD',
      });

      expect(event.uid).toBe('txn-001');
      expect(event.type).toBe('finance.transaction');
      expect(event.title).toBe('Grocery Shopping');
      expect(event.metadata.date).toBe('2025-11-21');
      expect(event.metadata.amount).toBe(-85.50);
      expect(event.metadata.currency).toBe('USD');
      expect(event.lifecycle.state).toBe('permanent');
      expect(event.sensitivity.level).toBe('confidential');
    });

    it('should create a financial event with optional fields', () => {
      const event = createFinancialEvent({
        uid: 'txn-002',
        type: 'finance.transaction',
        title: 'Salary',
        date: '2025-11-01',
        amount: 5000,
        currency: 'USD',
        category: 'Income',
        merchant: 'Employer Inc',
      });

      expect(event.metadata.category).toBe('Income');
      expect(event.metadata.merchant).toBe('Employer Inc');
    });

    it('should have correct privacy settings for financial data', () => {
      const event = createFinancialEvent({
        uid: 'txn-003',
        type: 'finance.transaction',
        title: 'Test Transaction',
        date: '2025-11-21',
        amount: 100,
        currency: 'USD',
      });

      expect(event.sensitivity.privacy.cloud_ai_allowed).toBe(false);
      expect(event.sensitivity.privacy.local_ai_allowed).toBe(true);
      expect(event.sensitivity.privacy.export_allowed).toBe(true);
    });

    it('should include timestamps', () => {
      const event = createFinancialEvent({
        uid: 'txn-004',
        type: 'finance.transaction',
        title: 'Test',
        date: '2025-11-21',
        amount: 50,
        currency: 'USD',
      });

      expect(event.created).toBeDefined();
      expect(event.updated).toBeDefined();
      expect(new Date(event.created).getTime()).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('FinancialAccountEntity', () => {
    it('should create a checking account', () => {
      const account = createFinancialAccount({
        uid: 'acct-001',
        title: 'Main Checking',
        account_type: 'checking',
        currency: 'USD',
        institution: 'Big Bank',
        current_balance: 1500.00,
      });

      expect(account.uid).toBe('acct-001');
      expect(account.type).toBe('finance.account');
      expect(account.title).toBe('Main Checking');
      expect(account.metadata.account_type).toBe('checking');
      expect(account.metadata.currency).toBe('USD');
      expect(account.metadata.institution).toBe('Big Bank');
      expect(account.metadata.current_balance).toBe(1500.00);
      expect(account.metadata.status).toBe('active');
    });

    it('should create a credit card account', () => {
      const account = createFinancialAccount({
        uid: 'acct-002',
        title: 'Rewards Card',
        account_type: 'credit_card',
        currency: 'USD',
        institution: 'Card Company',
      });

      expect(account.metadata.account_type).toBe('credit_card');
      expect(account.metadata.status).toBe('active');
    });

    it('should create a brokerage account', () => {
      const account = createFinancialAccount({
        uid: 'acct-003',
        title: 'Investment Account',
        account_type: 'brokerage',
        currency: 'USD',
        institution: 'Investment Co',
        current_balance: 50000,
      });

      expect(account.metadata.account_type).toBe('brokerage');
      expect(account.metadata.current_balance).toBe(50000);
    });

    it('should create a crypto wallet', () => {
      const account = createFinancialAccount({
        uid: 'acct-004',
        title: 'BTC Wallet',
        account_type: 'crypto_wallet',
        currency: 'BTC',
      });

      expect(account.metadata.account_type).toBe('crypto_wallet');
      expect(account.metadata.currency).toBe('BTC');
    });

    it('should have confidential sensitivity level', () => {
      const account = createFinancialAccount({
        uid: 'acct-005',
        title: 'Test Account',
        account_type: 'savings',
        currency: 'USD',
      });

      expect(account.sensitivity.level).toBe('confidential');
      expect(account.sensitivity.privacy.cloud_ai_allowed).toBe(false);
      expect(account.sensitivity.privacy.local_ai_allowed).toBe(true);
    });

    it('should be permanent lifecycle', () => {
      const account = createFinancialAccount({
        uid: 'acct-006',
        title: 'Test Account',
        account_type: 'cash',
        currency: 'USD',
      });

      expect(account.lifecycle.state).toBe('permanent');
    });
  });

  describe('FinancialEventBuilder Pattern', () => {
    class TransactionBuilder extends FinancialEventBuilder {
      constructor() {
        super('finance.transaction');
      }

      build(): FinancialEventEntity {
        if (!this.entity.uid || !this.entity.title) {
          throw new Error('UID and title are required');
        }
        return this.entity as FinancialEventEntity;
      }
    }

    it('should build a transaction using builder pattern', () => {
      const transaction = new TransactionBuilder()
        .withUID('txn-builder-001')
        .withTitle('Coffee')
        .withDate('2025-11-21')
        .withAmount(-4.50)
        .withCurrency('USD')
        .withCategory('Food & Dining')
        .withMerchant('Starbucks')
        .build();

      expect(transaction.uid).toBe('txn-builder-001');
      expect(transaction.title).toBe('Coffee');
      expect(transaction.metadata.amount).toBe(-4.50);
      expect(transaction.metadata.category).toBe('Food & Dining');
      expect(transaction.metadata.merchant).toBe('Starbucks');
    });

    it('should build with chained methods', () => {
      const transaction = new TransactionBuilder()
        .withUID('txn-builder-002')
        .withTitle('Paycheck')
        .withAmount(3000)
        .withCategory('Income')
        .withTags(['salary', 'monthly'])
        .build();

      expect(transaction.metadata.tags).toEqual(['salary', 'monthly']);
    });

    it('should throw error if required fields missing', () => {
      expect(() => {
        new TransactionBuilder().build();
      }).toThrow('UID and title are required');
    });
  });
});
