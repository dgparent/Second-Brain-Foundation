import { FinancialEventEntity } from '../entities/FinancialEventEntity';
import { CurrencyConverter } from '../utils/currencyConverter';

/**
 * Simple Memory Engine interface for financial framework
 */
interface SimpleMemoryEngine {
  queryEntities(query: any): Promise<any[]>;
}

/**
 * Time period for aggregation
 */
export type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

/**
 * Aggregation result
 */
export interface AggregationResult {
  period: string;                  // Period identifier (e.g., "2025-11", "2025-W47")
  total_income: number;
  total_expenses: number;
  net: number;
  currency: string;
  transaction_count: number;
  by_category?: Record<string, number>;
}

/**
 * Financial aggregation and statistics workflow
 */
export class FinancialAggregationWorkflow {
  constructor(
    private memoryEngine: SimpleMemoryEngine,
    private currencyConverter: CurrencyConverter,
    private baseCurrency: string = 'USD'
  ) {}

  /**
   * Aggregate financial events for a time period
   */
  async aggregateByPeriod(
    startDate: string,
    endDate: string,
    period: TimePeriod = 'monthly',
    eventTypes?: string[]
  ): Promise<AggregationResult[]> {
    // Query events in date range
    const events = await this.memoryEngine.queryEntities({
      type: eventTypes || ['finance.transaction'],
      dateRange: { start: startDate, end: endDate },
    }) as FinancialEventEntity[];

    // Group by period
    const grouped = this.groupByPeriod(events, period);

    // Calculate aggregates for each period
    const results: AggregationResult[] = [];

    for (const [periodKey, periodEvents] of Object.entries(grouped)) {
      const aggregate = this.calculateAggregate(periodEvents);
      results.push({
        period: periodKey,
        ...aggregate,
      });
    }

    return results.sort((a, b) => a.period.localeCompare(b.period));
  }

  /**
   * Group events by time period
   */
  private groupByPeriod(
    events: FinancialEventEntity[],
    period: TimePeriod
  ): Record<string, FinancialEventEntity[]> {
    const grouped: Record<string, FinancialEventEntity[]> = {};

    for (const event of events) {
      const key = this.getPeriodKey(event.metadata.date, period);
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(event);
    }

    return grouped;
  }

  /**
   * Get period key for a date
   */
  private getPeriodKey(date: string, period: TimePeriod): string {
    // Parse date string components directly to avoid timezone issues
    const [year, month, day] = date.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    
    switch (period) {
      case 'daily':
        return date;
      
      case 'weekly':
        // ISO week number
        const week = this.getISOWeek(d);
        return `${d.getFullYear()}-W${week.toString().padStart(2, '0')}`;
      
      case 'monthly':
        return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      
      case 'yearly':
        return `${d.getFullYear()}`;
    }
  }

  /**
   * Get ISO week number
   */
  private getISOWeek(date: Date): number {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  /**
   * Calculate aggregate statistics for a group of events
   */
  private calculateAggregate(events: FinancialEventEntity[]): Omit<AggregationResult, 'period'> {
    let totalIncome = 0;
    let totalExpenses = 0;
    const byCategory: Record<string, number> = {};

    for (const event of events) {
      // Convert to base currency if needed
      let amount = event.metadata.amount;
      if (event.metadata.currency !== this.baseCurrency) {
        try {
          amount = this.currencyConverter.convert(
            amount,
            event.metadata.currency,
            this.baseCurrency,
            event.metadata.date
          );
        } catch (error) {
          // If conversion fails, use original amount (should log warning)
          console.warn(`Currency conversion failed for ${event.uid}:`, error);
        }
      }

      // Aggregate by income/expense
      if (amount > 0) {
        totalIncome += amount;
      } else {
        totalExpenses += Math.abs(amount);
      }

      // Aggregate by category
      const category = event.metadata.category || 'uncategorized';
      byCategory[category] = (byCategory[category] || 0) + amount;
    }

    return {
      total_income: totalIncome,
      total_expenses: totalExpenses,
      net: totalIncome - totalExpenses,
      currency: this.baseCurrency,
      transaction_count: events.length,
      by_category: byCategory,
    };
  }

  /**
   * Get spending by category for a date range
   */
  async getCategoryBreakdown(
    startDate: string,
    endDate: string,
    eventTypes?: string[]
  ): Promise<Record<string, number>> {
    const events = await this.memoryEngine.queryEntities({
      type: eventTypes || ['finance.transaction'],
      dateRange: { start: startDate, end: endDate },
    }) as FinancialEventEntity[];

    const aggregate = this.calculateAggregate(events);
    return aggregate.by_category || {};
  }

  /**
   * Calculate monthly burn rate (average monthly expenses)
   */
  async calculateBurnRate(
    startDate: string,
    endDate: string
  ): Promise<number> {
    const results = await this.aggregateByPeriod(startDate, endDate, 'monthly');
    
    if (results.length === 0) return 0;

    const totalExpenses = results.reduce((sum, r) => sum + r.total_expenses, 0);
    return totalExpenses / results.length;
  }

  /**
   * Calculate savings rate
   */
  async calculateSavingsRate(
    startDate: string,
    endDate: string
  ): Promise<number> {
    const results = await this.aggregateByPeriod(startDate, endDate, 'monthly');
    
    if (results.length === 0) return 0;

    const totalIncome = results.reduce((sum, r) => sum + r.total_income, 0);
    const totalExpenses = results.reduce((sum, r) => sum + r.total_expenses, 0);

    if (totalIncome === 0) return 0;

    return ((totalIncome - totalExpenses) / totalIncome) * 100;
  }
}
