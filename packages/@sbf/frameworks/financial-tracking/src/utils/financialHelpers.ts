import { FinancialEventEntity } from '../entities/FinancialEventEntity';
import { FinancialAccountEntity } from '../entities/FinancialAccountEntity';

/**
 * Generate a unique ID for financial entities
 */
export function generateFinancialUID(prefix: string, date?: string): string {
  const timestamp = date || new Date().toISOString().split('T')[0];
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Validate financial event data
 */
export function validateFinancialEvent(event: Partial<FinancialEventEntity>): string[] {
  const errors: string[] = [];

  if (!event.uid) errors.push('UID is required');
  if (!event.title) errors.push('Title is required');
  if (!event.metadata?.date) errors.push('Date is required');
  if (event.metadata?.amount === undefined) errors.push('Amount is required');
  if (!event.metadata?.currency) errors.push('Currency is required');

  // Validate date format
  if (event.metadata?.date && !/^\d{4}-\d{2}-\d{2}$/.test(event.metadata.date)) {
    errors.push('Date must be in YYYY-MM-DD format');
  }

  return errors;
}

/**
 * Validate financial account data
 */
export function validateFinancialAccount(account: Partial<FinancialAccountEntity>): string[] {
  const errors: string[] = [];

  if (!account.uid) errors.push('UID is required');
  if (!account.title) errors.push('Title is required');
  if (!account.metadata?.account_type) errors.push('Account type is required');
  if (!account.metadata?.currency) errors.push('Currency is required');

  return errors;
}

/**
 * Calculate total for a list of financial events
 */
export function calculateTotal(events: FinancialEventEntity[]): number {
  return events.reduce((sum, event) => sum + event.metadata.amount, 0);
}

/**
 * Filter events by date range
 */
export function filterByDateRange(
  events: FinancialEventEntity[],
  startDate: string,
  endDate: string
): FinancialEventEntity[] {
  return events.filter(event => {
    const date = event.metadata.date;
    return date >= startDate && date <= endDate;
  });
}

/**
 * Group events by category
 */
export function groupByCategory(
  events: FinancialEventEntity[]
): Record<string, FinancialEventEntity[]> {
  const grouped: Record<string, FinancialEventEntity[]> = {};

  for (const event of events) {
    const category = event.metadata.category || 'uncategorized';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(event);
  }

  return grouped;
}

/**
 * Sort events by date
 */
export function sortByDate(
  events: FinancialEventEntity[],
  order: 'asc' | 'desc' = 'desc'
): FinancialEventEntity[] {
  return [...events].sort((a, b) => {
    const comparison = a.metadata.date.localeCompare(b.metadata.date);
    return order === 'asc' ? comparison : -comparison;
  });
}
