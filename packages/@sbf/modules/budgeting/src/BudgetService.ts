import { EntityManager } from '@sbf/core-entity-manager';
import { BaseAIProvider } from '@sbf/aei';
import { 
  FinancialEventEntity, 
  createFinancialEvent, 
  FinancialAccountEntity, 
  createFinancialAccount,
  FinancialAccountMetadata
} from '@sbf/frameworks-financial-tracking';

export class BudgetService {
  constructor(
    private entityManager: EntityManager,
    private aiProvider: BaseAIProvider
  ) {}

  /**
   * Create a new financial account
   */
  async createAccount(
    title: string,
    type: FinancialAccountMetadata['account_type'],
    currency: string,
    institution?: string,
    initialBalance: number = 0
  ): Promise<FinancialAccountEntity> {
    const uid = `acct-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const account = createFinancialAccount({
      uid,
      title,
      account_type: type,
      currency,
      institution,
      current_balance: initialBalance
    });

    await this.entityManager.create(account);
    return account;
  }

  /**
   * Log a transaction
   */
  async logTransaction(
    title: string,
    amount: number,
    currency: string,
    accountUid: string,
    date: string = new Date().toISOString().split('T')[0],
    category?: string,
    merchant?: string
  ): Promise<FinancialEventEntity> {
    const uid = `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // If category is missing, try to auto-categorize using AI
    let finalCategory = category;
    if (!finalCategory && merchant) {
      // TODO: Implement AI categorization
      // finalCategory = await this.categorizeTransaction(merchant, amount);
    }

    const transaction = createFinancialEvent({
      uid,
      type: 'finance.transaction',
      title,
      date,
      amount,
      currency,
      category: finalCategory,
      merchant
    });
    
    // Link to account
    transaction.metadata.account_uid = accountUid;

    await this.entityManager.create(transaction);
    
    // Update account balance
    await this.updateAccountBalance(accountUid, amount);

    return transaction;
  }

  /**
   * Update account balance
   */
  private async updateAccountBalance(accountUid: string, amount: number): Promise<void> {
    const account = await this.entityManager.get(accountUid) as FinancialAccountEntity;
    if (account && account.type === 'finance.account') {
      const currentBalance = account.metadata.current_balance || 0;
      const newBalance = currentBalance + amount;
      
      await this.entityManager.update(accountUid, {
        metadata: {
          ...account.metadata,
          current_balance: newBalance
        }
      });
    }
  }

  /**
   * Get all accounts
   */
  async getAccounts(): Promise<FinancialAccountEntity[]> {
    const entities = await this.entityManager.getAll();
    return entities.filter(e => e.type === 'finance.account') as FinancialAccountEntity[];
  }

  /**
   * Get transactions for an account
   */
  async getTransactions(accountUid?: string): Promise<FinancialEventEntity[]> {
    const entities = await this.entityManager.getAll();
    const transactions = entities.filter(e => e.type === 'finance.transaction') as FinancialEventEntity[];
    
    if (accountUid) {
      return transactions.filter(t => t.metadata.account_uid === accountUid);
    }
    
    return transactions;
  }

  /**
   * Get total balance across all accounts (converted to base currency if needed)
   * For now, assumes single currency or just sums up
   */
  async getNetWorth(): Promise<number> {
    const accounts = await this.getAccounts();
    return accounts.reduce((sum, acc) => sum + (acc.metadata.current_balance || 0), 0);
  }
}
