import { TransactionEntity } from '../entities/TransactionEntity';

/**
 * Parse CSV transaction data
 * Supports common bank CSV formats
 */
export interface CSVTransaction {
  date: string;
  description: string;
  amount: number;
  balance?: number;
}

export function parseTransactionCSV(csvLine: string, format: 'standard' | 'scotiabank' = 'standard'): CSVTransaction | null {
  const parts = csvLine.split(',').map(p => p.trim().replace(/"/g, ''));

  try {
    if (format === 'standard') {
      // Standard format: Date, Description, Amount, Balance
      return {
        date: parts[0],
        description: parts[1],
        amount: parseFloat(parts[2]),
        balance: parts[3] ? parseFloat(parts[3]) : undefined,
      };
    } else if (format === 'scotiabank') {
      // Scotiabank format may vary - this is an example
      return {
        date: parts[0],
        description: parts[1],
        amount: parseFloat(parts[2]),
      };
    }
  } catch (error) {
    console.error('Failed to parse CSV line:', csvLine, error);
    return null;
  }

  return null;
}

/**
 * Auto-categorize transaction based on merchant/description
 */
export function autoCategorize(merchant: string, description: string): string {
  const text = `${merchant} ${description}`.toLowerCase();

  // Groceries
  if (text.match(/loblaws|sobeys|metro|walmart|costco|safeway|kroger|whole foods|trader joe/)) {
    return 'groceries';
  }

  // Dining
  if (text.match(/restaurant|pizza|coffee|starbucks|tim hortons|mcdonald|subway|burger/)) {
    return 'dining';
  }

  // Transportation
  if (text.match(/uber|lyft|taxi|gas|petro|shell|esso|transit|parking/)) {
    return 'transportation';
  }

  // Utilities
  if (text.match(/hydro|electric|gas bill|water|internet|rogers|bell|telus|phone/)) {
    return 'utilities';
  }

  // Entertainment
  if (text.match(/netflix|spotify|amazon prime|disney|hbo|movie|theatre|concert/)) {
    return 'entertainment';
  }

  // Healthcare
  if (text.match(/pharmacy|medical|doctor|dentist|hospital|clinic/)) {
    return 'healthcare';
  }

  // Shopping
  if (text.match(/amazon|ebay|target|best buy|apple store/)) {
    return 'shopping';
  }

  return 'uncategorized';
}

/**
 * Detect if transaction is likely a duplicate
 */
export function isDuplicate(
  transaction: TransactionEntity,
  existing: TransactionEntity[]
): boolean {
  return existing.some(txn => {
    const sameDateRange = Math.abs(
      new Date(txn.metadata.date).getTime() - new Date(transaction.metadata.date).getTime()
    ) < 86400000; // Within 24 hours

    const sameAmount = Math.abs(txn.metadata.amount - transaction.metadata.amount) < 0.01;
    const sameMerchant = txn.metadata.merchant === transaction.metadata.merchant;

    return sameDateRange && sameAmount && sameMerchant;
  });
}

/**
 * Generate budget UID
 */
export function generateBudgetUID(type: 'txn' | 'cat' | 'bill', date?: string): string {
  const timestamp = date || new Date().toISOString().split('T')[0];
  const random = Math.random().toString(36).substring(2, 8);
  return `${type}-${timestamp}-${random}`;
}

/**
 * Calculate savings rate
 */
export function calculateSavingsRate(income: number, expenses: number): number {
  if (income === 0) return 0;
  return ((income - expenses) / income) * 100;
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}
