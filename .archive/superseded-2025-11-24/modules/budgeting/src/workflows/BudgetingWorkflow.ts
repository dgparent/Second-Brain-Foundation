import { TransactionEntity } from '../entities/TransactionEntity';
import { BudgetCategoryEntity } from '../entities/BudgetCategoryEntity';
import { BillEntity } from '../entities/BillEntity';

/**
 * Currency converter interface (will use from financial framework at runtime)
 */
interface CurrencyConverter {
  convert(amount: number, from: string, to: string, date?: string): number;
}

/**
 * Format currency helper
 */
function formatCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    CAD: 'C$',
    EUR: '€',
    GBP: '£',
  };
  const symbol = symbols[currency] || currency;
  return `${symbol}${amount.toFixed(2)}`;
}

/**
 * Aggregation workflow interface (from financial framework)
 */
interface FinancialAggregationWorkflow {
  aggregateByPeriod(start: string, end: string, period: string, types?: string[]): Promise<any[]>;
}

/**
 * Simple Memory Engine interface
 */
interface SimpleMemoryEngine {
  queryEntities(query: any): Promise<any[]>;
  getEntity(uid: string): Promise<any>;
  createEntity(entity: any): Promise<any>;
}

/**
 * Budget status for a category
 */
export interface BudgetStatus {
  category: string;
  category_uid: string;
  limit: number;
  spent: number;
  remaining: number;
  percentage_used: number;
  status: 'under' | 'near' | 'over';  // under: <75%, near: 75-100%, over: >100%
  currency: string;
}

/**
 * Monthly budget summary
 */
export interface MonthlySummary {
  month: string;              // YYYY-MM
  total_income: number;
  total_expenses: number;
  net: number;
  budgets: BudgetStatus[];
  upcoming_bills: BillEntity[];
  currency: string;
}

/**
 * Budgeting workflow - uses Financial Framework's aggregation
 */
export class BudgetingWorkflow {
  private aggregation: any; // FinancialAggregationWorkflow - created at runtime

  constructor(
    private memoryEngine: SimpleMemoryEngine,
    private currencyConverter: CurrencyConverter,
    private baseCurrency: string = 'USD'
  ) {
    // Note: aggregation workflow will be injected or created at runtime
    // For now, we'll implement the methods directly
  }

  /**
   * Get monthly budget summary
   */
  async getMonthlySummary(month: string): Promise<MonthlySummary> {
    // Parse month (YYYY-MM)
    const [year, monthNum] = month.split('-').map(Number);
    const startDate = `${month}-01`;
    const endDate = new Date(year, monthNum, 0).toISOString().split('T')[0];

    // Get transactions for the month
    const transactions = await this.memoryEngine.queryEntities({
      type: 'finance.transaction',
      dateRange: { start: startDate, end: endDate },
    }) as TransactionEntity[];

    // Calculate aggregates manually
    const total_income = transactions
      .filter(t => t.metadata.amount > 0)
      .reduce((sum, t) => sum + t.metadata.amount, 0);
    
    const total_expenses = Math.abs(transactions
      .filter(t => t.metadata.amount < 0)
      .reduce((sum, t) => sum + t.metadata.amount, 0));

    const net = total_income - total_expenses;

    // Get budget categories
    const categories = await this.memoryEngine.queryEntities({
      type: 'finance.budget_category',
    }) as BudgetCategoryEntity[];

    // Calculate budget status for each category
    const budgets = await this.calculateBudgetStatus(categories, transactions);

    // Get upcoming bills
    const upcomingBills = await this.getUpcomingBills(month);

    return {
      month,
      total_income,
      total_expenses,
      net,
      budgets,
      upcoming_bills: upcomingBills,
      currency: this.baseCurrency,
    };
  }

  /**
   * Calculate budget status for each category
   */
  private async calculateBudgetStatus(
    categories: BudgetCategoryEntity[],
    transactions: TransactionEntity[]
  ): Promise<BudgetStatus[]> {
    const statuses: BudgetStatus[] = [];

    for (const category of categories) {
      // Filter transactions for this category
      const categoryTxns = transactions.filter(
        txn => txn.metadata.category === category.uid || txn.metadata.category === category.metadata.name
      );

      // Calculate spent (sum of negative amounts)
      const spent = Math.abs(
        categoryTxns
          .filter(txn => txn.metadata.amount < 0)
          .reduce((sum, txn) => sum + txn.metadata.amount, 0)
      );

      const limit = category.metadata.monthly_limit;
      const remaining = limit - spent;
      const percentage = (spent / limit) * 100;

      let status: BudgetStatus['status'];
      if (percentage < 75) status = 'under';
      else if (percentage <= 100) status = 'near';
      else status = 'over';

      statuses.push({
        category: category.metadata.name,
        category_uid: category.uid,
        limit,
        spent,
        remaining,
        percentage_used: percentage,
        status,
        currency: category.metadata.currency,
      });
    }

    return statuses.sort((a, b) => b.percentage_used - a.percentage_used);
  }

  /**
   * Get upcoming bills for the month
   */
  private async getUpcomingBills(month: string): Promise<BillEntity[]> {
    const bills = await this.memoryEngine.queryEntities({
      type: 'finance.bill',
    }) as BillEntity[];

    // Filter bills due in this month
    return bills.filter(bill => {
      const dueDate = bill.metadata.next_due_date;
      return dueDate && dueDate.startsWith(month);
    }).sort((a, b) => {
      return (a.metadata.next_due_date || '').localeCompare(b.metadata.next_due_date || '');
    });
  }

  /**
   * Check for budget alerts (categories over or near limit)
   */
  async getBudgetAlerts(month: string): Promise<BudgetStatus[]> {
    const summary = await this.getMonthlySummary(month);
    return summary.budgets.filter(b => b.status === 'over' || b.status === 'near');
  }

  /**
   * Get spending by merchant
   */
  async getTopMerchants(startDate: string, endDate: string, limit: number = 10): Promise<Array<{
    merchant: string;
    total: number;
    count: number;
  }>> {
    const transactions = await this.memoryEngine.queryEntities({
      type: 'finance.transaction',
      dateRange: { start: startDate, end: endDate },
    }) as TransactionEntity[];

    // Group by merchant
    const byMerchant = new Map<string, { total: number; count: number }>();

    for (const txn of transactions) {
      if (txn.metadata.amount >= 0) continue; // Skip income

      const merchant = txn.metadata.merchant || 'Unknown';
      const existing = byMerchant.get(merchant) || { total: 0, count: 0 };
      
      byMerchant.set(merchant, {
        total: existing.total + Math.abs(txn.metadata.amount),
        count: existing.count + 1,
      });
    }

    // Convert to array and sort
    return Array.from(byMerchant.entries())
      .map(([merchant, data]) => ({ merchant, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, limit);
  }

  /**
   * Format budget summary for display
   */
  formatSummary(summary: MonthlySummary): string {
    let output = `\n📊 Budget Summary for ${summary.month}\n`;
    output += '='.repeat(50) + '\n\n';

    output += `💰 Income:  ${formatCurrency(summary.total_income, summary.currency)}\n`;
    output += `💸 Expenses: ${formatCurrency(summary.total_expenses, summary.currency)}\n`;
    output += `📈 Net:     ${formatCurrency(summary.net, summary.currency)}\n\n`;

    output += '📋 Budget Status by Category:\n';
    for (const budget of summary.budgets) {
      const icon = budget.status === 'over' ? '🚨' : budget.status === 'near' ? '⚠️' : '✅';
      output += `${icon} ${budget.category}: `;
      output += `${formatCurrency(budget.spent, budget.currency)} / `;
      output += `${formatCurrency(budget.limit, budget.currency)} `;
      output += `(${budget.percentage_used.toFixed(1)}%)\n`;
    }

    if (summary.upcoming_bills.length > 0) {
      output += `\n📅 Upcoming Bills (${summary.upcoming_bills.length}):\n`;
      for (const bill of summary.upcoming_bills) {
        output += `   ${bill.metadata.next_due_date}: ${bill.metadata.name} - `;
        output += `${formatCurrency(bill.metadata.amount, bill.metadata.currency)}\n`;
      }
    }

    return output;
  }
}
