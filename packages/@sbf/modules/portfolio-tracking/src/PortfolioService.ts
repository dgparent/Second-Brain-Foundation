import { EntityManager } from '@sbf/core-entity-manager';
import { BaseAIProvider } from '@sbf/aei';
import { 
  AssetEntity, 
  createAsset, 
  AssetMetadata,
  FinancialAccountEntity
} from '@sbf/frameworks-financial-tracking';

export class PortfolioService {
  constructor(
    private entityManager: EntityManager,
    private aiProvider: BaseAIProvider
  ) {}

  /**
   * Add an asset to the portfolio
   */
  async addAsset(
    name: string,
    assetType: AssetMetadata['asset_type'],
    quantity: number,
    symbol?: string,
    currentPrice?: number,
    currency: string = 'USD',
    accountUid?: string
  ): Promise<AssetEntity> {
    const uid = `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const asset = createAsset({
      uid,
      name,
      asset_type: assetType,
      quantity,
      symbol,
      current_price: currentPrice,
      currency,
      account_uid: accountUid
    });

    await this.entityManager.create(asset);
    return asset;
  }

  /**
   * Update asset holdings (e.g. after buying/selling)
   */
  async updateAssetQuantity(assetUid: string, newQuantity: number): Promise<AssetEntity | null> {
    const asset = await this.entityManager.get(assetUid) as AssetEntity;
    if (!asset || asset.type !== 'finance.asset') return null;

    await this.entityManager.update(assetUid, {
      metadata: {
        ...asset.metadata,
        quantity: newQuantity
      }
    });

    return {
      ...asset,
      metadata: {
        ...asset.metadata,
        quantity: newQuantity
      }
    };
  }

  /**
   * Update asset price
   */
  async updateAssetPrice(assetUid: string, newPrice: number): Promise<AssetEntity | null> {
    const asset = await this.entityManager.get(assetUid) as AssetEntity;
    if (!asset || asset.type !== 'finance.asset') return null;

    await this.entityManager.update(assetUid, {
      metadata: {
        ...asset.metadata,
        current_price: newPrice
      }
    });

    return {
      ...asset,
      metadata: {
        ...asset.metadata,
        current_price: newPrice
      }
    };
  }

  /**
   * Get all assets
   */
  async getAssets(accountUid?: string): Promise<AssetEntity[]> {
    const entities = await this.entityManager.getAll();
    const assets = entities.filter(e => e.type === 'finance.asset') as AssetEntity[];
    
    if (accountUid) {
      return assets.filter(a => a.metadata.account_uid === accountUid);
    }
    
    return assets;
  }

  /**
   * Calculate total portfolio value
   */
  async getPortfolioValue(currency: string = 'USD'): Promise<number> {
    const assets = await this.getAssets();
    
    // Simple sum for now - assumes all assets are in the requested currency
    // TODO: Implement currency conversion
    return assets.reduce((total, asset) => {
      const price = asset.metadata.current_price || 0;
      const quantity = asset.metadata.quantity || 0;
      return total + (price * quantity);
    }, 0);
  }

  /**
   * Get asset allocation by type
   */
  async getAllocation(): Promise<Record<string, number>> {
    const assets = await this.getAssets();
    const allocation: Record<string, number> = {};
    let totalValue = 0;

    for (const asset of assets) {
      const value = (asset.metadata.current_price || 0) * (asset.metadata.quantity || 0);
      const type = asset.metadata.asset_type;
      
      allocation[type] = (allocation[type] || 0) + value;
      totalValue += value;
    }

    // Convert to percentages
    if (totalValue > 0) {
      for (const type in allocation) {
        allocation[type] = allocation[type] / totalValue;
      }
    }

    return allocation;
  }
}
