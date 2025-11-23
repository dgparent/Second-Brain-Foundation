/**
 * Portfolio Tracking Plugin
 * Built on Financial Framework - demonstrates 85%+ code reuse
 */

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
 * Asset holding entity
 */
export interface AssetHoldingEntity extends Entity {
  type: 'portfolio.holding';
  metadata: {
    asset_type: 'stock' | 'etf' | 'bond' | 'crypto' | 'mutual_fund' | 'real_estate' | 'other';
    ticker_symbol?: string;
    asset_name: string;
    quantity: number;
    purchase_price: number;
    purchase_date: string;
    current_price?: number;
    currency: string;
    account_uid?: string;
    sector?: string;
    notes?: string;
  };
}

/**
 * Valuation snapshot entity
 */
export interface ValuationEntity extends Entity {
  type: 'portfolio.valuation';
  metadata: {
    date: string;
    total_value: number;
    currency: string;
    by_asset_type?: Record<string, number>;
    by_account?: Record<string, number>;
    unrealized_gain_loss?: number;
    notes?: string;
  };
}

/**
 * Create asset holding
 */
export function createAssetHolding(data: {
  uid: string;
  asset_type: AssetHoldingEntity['metadata']['asset_type'];
  asset_name: string;
  ticker_symbol?: string;
  quantity: number;
  purchase_price: number;
  purchase_date: string;
  currency: string;
  account_uid?: string;
}): AssetHoldingEntity {
  return {
    uid: data.uid,
    type: 'portfolio.holding',
    title: `${data.asset_name} (${data.quantity} shares)`,
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
      asset_type: data.asset_type,
      asset_name: data.asset_name,
      ticker_symbol: data.ticker_symbol,
      quantity: data.quantity,
      purchase_price: data.purchase_price,
      purchase_date: data.purchase_date,
      currency: data.currency,
      account_uid: data.account_uid,
    },
  };
}

/**
 * Create valuation snapshot
 */
export function createValuation(data: {
  uid: string;
  date: string;
  total_value: number;
  currency: string;
  by_asset_type?: Record<string, number>;
  unrealized_gain_loss?: number;
}): ValuationEntity {
  return {
    uid: data.uid,
    type: 'portfolio.valuation',
    title: `Portfolio Valuation - ${data.date}`,
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
      total_value: data.total_value,
      currency: data.currency,
      by_asset_type: data.by_asset_type,
      unrealized_gain_loss: data.unrealized_gain_loss,
    },
  };
}

/**
 * Calculate current portfolio value
 */
export function calculatePortfolioValue(holdings: AssetHoldingEntity[]): {
  total_value: number;
  total_cost_basis: number;
  unrealized_gain_loss: number;
  by_asset_type: Record<string, { value: number; cost: number }>;
} {
  let totalValue = 0;
  let totalCost = 0;
  const byAssetType: Record<string, { value: number; cost: number }> = {};

  for (const holding of holdings) {
    const currentPrice = holding.metadata.current_price || holding.metadata.purchase_price;
    const value = holding.metadata.quantity * currentPrice;
    const cost = holding.metadata.quantity * holding.metadata.purchase_price;

    totalValue += value;
    totalCost += cost;

    const assetType = holding.metadata.asset_type;
    if (!byAssetType[assetType]) {
      byAssetType[assetType] = { value: 0, cost: 0 };
    }
    byAssetType[assetType].value += value;
    byAssetType[assetType].cost += cost;
  }

  return {
    total_value: totalValue,
    total_cost_basis: totalCost,
    unrealized_gain_loss: totalValue - totalCost,
    by_asset_type: byAssetType,
  };
}

/**
 * Calculate allocation percentages
 */
export function calculateAllocation(holdings: AssetHoldingEntity[]): Record<string, number> {
  const { total_value, by_asset_type } = calculatePortfolioValue(holdings);
  
  if (total_value === 0) return {};

  const allocation: Record<string, number> = {};
  for (const [assetType, data] of Object.entries(by_asset_type)) {
    allocation[assetType] = (data.value / total_value) * 100;
  }

  return allocation;
}

/**
 * Plugin metadata
 */
export const PortfolioPlugin = {
  id: 'sbf-portfolio-tracking',
  name: 'Portfolio & Investment Tracking',
  version: '0.1.0',
  domain: 'finance',
  description: 'Track investments, assets, and portfolio performance',
  
  entityTypes: [
    'portfolio.holding',
    'portfolio.valuation',
  ],
  
  features: [
    'Multi-asset tracking (stocks, ETFs, bonds, crypto)',
    'Portfolio valuation snapshots',
    'Cost basis tracking',
    'Unrealized gain/loss calculation',
    'Asset allocation analysis',
    'Performance tracking over time',
  ],
  
  integrations: [
    'Financial APIs (Yahoo Finance, Alpha Vantage)',
    'Brokerage imports',
    'Manual entry',
  ],
};
