/**
 * Base Entity interface for financial framework
 * (Simplified to avoid cross-package dependencies during initial build)
 */
export interface Entity {
  uid: string;
  type: string;
  title: string;
  lifecycle: {
    state: 'capture' | 'transitional' | 'permanent' | 'archived';
  };
  sensitivity: {
    level: 'public' | 'personal' | 'confidential' | 'secret';
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
 * Base metadata for all financial events (transactions, payouts, contributions, etc.)
 */
export interface FinancialEventMetadata {
  date: string;                    // ISO date (YYYY-MM-DD)
  amount: number;                  // Positive = income, Negative = expense
  currency: string;                // ISO currency code (USD, CAD, EUR, etc.)
  category?: string;               // Budget category or classification
  account_uid?: string;            // Related account
  merchant?: string;               // Merchant/payee name
  description?: string;            // Transaction description
  tags?: string[];                 // Custom tags
  metadata_extra?: Record<string, any>; // Domain-specific fields
}

/**
 * Base entity for all financial events
 * Extend this for specific event types (transactions, dividends, contributions)
 */
export interface FinancialEventEntity extends Entity {
  type: string;                    // Subclasses define specific type
  metadata: FinancialEventMetadata & Record<string, any>;
}

/**
 * Builder pattern for creating financial events
 */
export abstract class FinancialEventBuilder {
  protected entity: Partial<FinancialEventEntity>;

  constructor(type: string) {
    this.entity = {
      type,
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
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        currency: 'USD',
      },
    };
  }

  withUID(uid: string): this {
    this.entity.uid = uid;
    return this;
  }

  withTitle(title: string): this {
    this.entity.title = title;
    return this;
  }

  withDate(date: string): this {
    this.entity.metadata!.date = date;
    return this;
  }

  withAmount(amount: number): this {
    this.entity.metadata!.amount = amount;
    return this;
  }

  withCurrency(currency: string): this {
    this.entity.metadata!.currency = currency;
    return this;
  }

  withCategory(category: string): this {
    this.entity.metadata!.category = category;
    return this;
  }

  withAccount(accountUid: string): this {
    this.entity.metadata!.account_uid = accountUid;
    return this;
  }

  withMerchant(merchant: string): this {
    this.entity.metadata!.merchant = merchant;
    return this;
  }

  withDescription(description: string): this {
    this.entity.metadata!.description = description;
    return this;
  }

  withTags(tags: string[]): this {
    this.entity.metadata!.tags = tags;
    return this;
  }

  abstract build(): FinancialEventEntity;
}

/**
 * Helper function to create a generic financial event
 */
export function createFinancialEvent(data: {
  uid: string;
  type: string;
  title: string;
  date: string;
  amount: number;
  currency: string;
  category?: string;
  merchant?: string;
}): FinancialEventEntity {
  return {
    uid: data.uid,
    type: data.type,
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
      date: data.date,
      amount: data.amount,
      currency: data.currency,
      category: data.category,
      merchant: data.merchant,
    },
  };
}
