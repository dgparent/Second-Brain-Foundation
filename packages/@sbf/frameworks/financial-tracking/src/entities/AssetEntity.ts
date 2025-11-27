import { Entity } from './FinancialEventEntity';

/**
 * Metadata for financial assets (stocks, crypto, real estate, etc.)
 */
export interface AssetMetadata {
  asset_type: 'stock' | 'crypto' | 'etf' | 'mutual_fund' | 'real_estate' | 'commodity' | 'collectible' | 'other';
  symbol?: string;                 // Ticker symbol (e.g., AAPL, BTC)
  name: string;                    // Full name
  quantity: number;                // Amount held
  cost_basis?: number;             // Total cost basis
  current_price?: number;          // Last known price per unit
  currency: string;                // Currency for price
  account_uid?: string;            // Which account holds this asset
  purchase_date?: string;
  notes?: string;
}

/**
 * Financial asset entity
 */
export interface AssetEntity extends Entity {
  type: 'finance.asset';
  metadata: AssetMetadata;
}

/**
 * Helper function to create a financial asset
 */
export function createAsset(data: {
  uid: string;
  name: string;
  asset_type: AssetMetadata['asset_type'];
  quantity: number;
  symbol?: string;
  current_price?: number;
  currency?: string;
  account_uid?: string;
}): AssetEntity {
  return {
    uid: data.uid,
    type: 'finance.asset',
    title: data.symbol ? `${data.symbol} (${data.name})` : data.name,
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
      asset_type: data.asset_type,
      name: data.name,
      symbol: data.symbol,
      quantity: data.quantity,
      current_price: data.current_price,
      currency: data.currency || 'USD',
      account_uid: data.account_uid,
    },
  };
}
