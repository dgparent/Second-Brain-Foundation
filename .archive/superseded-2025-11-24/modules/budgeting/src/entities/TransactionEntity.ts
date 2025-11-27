/**
 * Base Entity interface
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
 * Base Financial Event Entity
 */
interface FinancialEventEntity extends Entity {
  type: string;
  metadata: {
    date: string;
    amount: number;
    currency: string;
    category?: string;
    account_uid?: string;
    merchant?: string;
    description?: string;
    tags?: string[];
  } & Record<string, any>;
}

/**
 * Transaction-specific metadata
 */
export interface TransactionMetadata {
  date: string;
  amount: number;
  currency: string;
  merchant?: string;
  category?: string;
  account_uid?: string;
  description?: string;
  tags?: string[];
  receipt_url?: string;
  reconciled?: boolean;
  notes?: string;
}

/**
 * Transaction entity for budgeting
 */
export interface TransactionEntity extends FinancialEventEntity {
  type: 'finance.transaction';
  metadata: TransactionMetadata;
}

/**
 * Helper function to create a transaction
 */
export function createTransaction(data: {
  uid: string;
  title: string;
  date: string;
  amount: number;
  currency: string;
  merchant?: string;
  category?: string;
  account_uid?: string;
}): TransactionEntity {
  return {
    uid: data.uid,
    type: 'finance.transaction',
    title: data.title,
    lifecycle: { state: 'permanent' },
    sensitivity: {
      level: 'confidential',
      privacy: {
        cloud_ai_allowed: false,
        local_ai_allowed: true,
        export_allowed: true,
      },
    },
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    metadata: {
      date: data.date,
      amount: data.amount,
      currency: data.currency,
      merchant: data.merchant,
      category: data.category,
      account_uid: data.account_uid,
      reconciled: false,
    },
  };
}
