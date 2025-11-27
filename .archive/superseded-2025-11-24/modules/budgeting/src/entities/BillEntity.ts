/**
 * Base Entity interface (from Financial Framework)
 */
interface Entity {
  uid: string;
  type: string;
  title: string;
  lifecycle: { state: string };
  sensitivity: {
    level: string;
    privacy: {
      cloud_ai_allowed: boolean;
      local_ai_allowed: boolean;
      export_allowed: boolean;
    };
  };
  created: string;
  updated: string;
  metadata: Record<string, any>;
}

/**
 * Recurring bill metadata
 */
export interface BillMetadata {
  name: string;
  amount: number;
  currency: string;
  due_day: number;             // Day of month (1-31)
  frequency: 'monthly' | 'quarterly' | 'yearly' | 'weekly';
  account_uid?: string;        // Account to pay from
  category?: string;           // Budget category
  auto_pay: boolean;
  payee?: string;
  confirmation_number?: string;
  url?: string;                // Bill payment URL
  notes?: string;
  next_due_date?: string;      // Calculated next due date
}

/**
 * Bill entity for recurring payments
 */
export interface BillEntity extends Entity {
  type: 'finance.bill';
  metadata: BillMetadata;
}

/**
 * Helper function to create a bill
 */
export function createBill(data: {
  uid: string;
  name: string;
  amount: number;
  currency: string;
  due_day: number;
  frequency?: BillMetadata['frequency'];
  auto_pay?: boolean;
  category?: string;
  account_uid?: string;
}): BillEntity {
  const now = new Date();
  const nextDueDate = calculateNextDueDate(data.due_day, data.frequency || 'monthly');

  return {
    uid: data.uid,
    type: 'finance.bill',
    title: data.name,
    lifecycle: { state: 'permanent' },
    sensitivity: {
      level: 'confidential',
      privacy: {
        cloud_ai_allowed: false,
        local_ai_allowed: true,
        export_allowed: true,
      },
    },
    created: now.toISOString(),
    updated: now.toISOString(),
    metadata: {
      name: data.name,
      amount: data.amount,
      currency: data.currency,
      due_day: data.due_day,
      frequency: data.frequency || 'monthly',
      auto_pay: data.auto_pay || false,
      category: data.category,
      account_uid: data.account_uid,
      next_due_date: nextDueDate,
    },
  };
}

/**
 * Calculate next due date for a bill
 */
function calculateNextDueDate(day: number, frequency: BillMetadata['frequency']): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  let nextDate: Date;

  switch (frequency) {
    case 'monthly':
      nextDate = new Date(year, month, day);
      if (nextDate < now) {
        nextDate = new Date(year, month + 1, day);
      }
      break;

    case 'weekly':
      // For weekly, 'day' represents day of week (0-6)
      const daysUntilNext = (day - now.getDay() + 7) % 7;
      nextDate = new Date(now);
      nextDate.setDate(now.getDate() + (daysUntilNext || 7));
      break;

    case 'quarterly':
      nextDate = new Date(year, month, day);
      while (nextDate < now) {
        nextDate.setMonth(nextDate.getMonth() + 3);
      }
      break;

    case 'yearly':
      nextDate = new Date(year, month, day);
      if (nextDate < now) {
        nextDate.setFullYear(year + 1);
      }
      break;
  }

  return nextDate.toISOString().split('T')[0];
}
