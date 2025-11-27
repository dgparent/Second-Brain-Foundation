import { Entity } from './FinancialEventEntity';

/**
 * Metadata for financial accounts (bank, brokerage, wallet, etc.)
 */
export interface FinancialAccountMetadata {
  account_type: 'checking' | 'savings' | 'credit_card' | 'brokerage' | 'crypto_wallet' | 'cash' | 'loan' | 'other';
  institution?: string;            // Bank or brokerage name
  account_number_last4?: string;   // Last 4 digits for identification
  currency: string;                // Primary currency
  current_balance?: number;        // Current balance
  status: 'active' | 'closed' | 'frozen';
  opened_date?: string;            // Account opening date
  closed_date?: string;            // Account closing date
  notes?: string;
}

/**
 * Financial account entity
 */
export interface FinancialAccountEntity extends Entity {
  type: 'finance.account';
  metadata: FinancialAccountMetadata;
}

/**
 * Helper function to create a financial account
 */
export function createFinancialAccount(data: {
  uid: string;
  title: string;
  account_type: FinancialAccountMetadata['account_type'];
  currency: string;
  institution?: string;
  current_balance?: number;
}): FinancialAccountEntity {
  return {
    uid: data.uid,
    type: 'finance.account',
    title: data.title,
    lifecycle: { state: 'permanent' as const },
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
      account_type: data.account_type,
      currency: data.currency,
      institution: data.institution,
      current_balance: data.current_balance,
      status: 'active',
    },
  };
}
