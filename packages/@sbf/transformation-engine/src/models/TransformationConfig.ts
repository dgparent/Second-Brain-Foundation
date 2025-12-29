/**
 * Transformation configuration model.
 * 
 * Tenant-level configuration for transformation behavior.
 */

/**
 * Transformation config entity.
 */
export interface TransformationConfig {
  /** Unique identifier */
  id?: string;
  
  /** Tenant ID */
  tenantId: string;
  
  /** Default model for transformations */
  defaultModelId?: string;
  
  /** Auto-generate insights on ingestion */
  autoGenerateInsights: boolean;
  
  /** Default language for outputs */
  defaultLanguage?: string;
  
  /** Maximum concurrent transformations */
  maxConcurrent?: number;
  
  /** Daily transformation limit */
  dailyLimit?: number;
  
  /** Transformations used today */
  dailyUsed?: number;
  
  /** Created timestamp */
  createdAt?: string;
  
  /** Updated timestamp */
  updatedAt?: string;
}

/**
 * Default configuration values.
 */
export const DEFAULT_TRANSFORMATION_CONFIG: Omit<TransformationConfig, 'tenantId'> = {
  autoGenerateInsights: true,
  maxConcurrent: 5,
  dailyLimit: 1000,
  dailyUsed: 0,
};

/**
 * Create a transformation config.
 */
export function createTransformationConfig(
  tenantId: string,
  overrides?: Partial<TransformationConfig>
): TransformationConfig {
  return {
    ...DEFAULT_TRANSFORMATION_CONFIG,
    ...overrides,
    tenantId,
  };
}

/**
 * Check if daily limit is exceeded.
 */
export function isDailyLimitExceeded(config: TransformationConfig): boolean {
  if (!config.dailyLimit) return false;
  return (config.dailyUsed ?? 0) >= config.dailyLimit;
}

/**
 * Transformation config repository interface.
 */
export interface TransformationConfigRepository {
  /**
   * Get config for tenant.
   */
  get(tenantId: string): Promise<TransformationConfig | null>;
  
  /**
   * Save config.
   */
  save(config: TransformationConfig): Promise<TransformationConfig>;
  
  /**
   * Increment daily usage.
   */
  incrementDailyUsage(tenantId: string): Promise<void>;
  
  /**
   * Reset daily usage (for scheduled job).
   */
  resetDailyUsage(tenantId: string): Promise<void>;
}

/**
 * In-memory config repository for testing.
 */
export class InMemoryTransformationConfigRepository implements TransformationConfigRepository {
  private configs: Map<string, TransformationConfig> = new Map();
  
  async get(tenantId: string): Promise<TransformationConfig | null> {
    return this.configs.get(tenantId) ?? null;
  }
  
  async save(config: TransformationConfig): Promise<TransformationConfig> {
    const now = new Date().toISOString();
    const saved: TransformationConfig = {
      ...config,
      createdAt: config.createdAt ?? now,
      updatedAt: now,
    };
    this.configs.set(config.tenantId, saved);
    return saved;
  }
  
  /**
   * Create a new config (alias for save).
   */
  async create(config: TransformationConfig): Promise<TransformationConfig> {
    return this.save(config);
  }
  
  async incrementDailyUsage(tenantId: string): Promise<void> {
    const config = this.configs.get(tenantId);
    if (config) {
      config.dailyUsed = (config.dailyUsed ?? 0) + 1;
      config.updatedAt = new Date().toISOString();
    }
  }
  
  async resetDailyUsage(tenantId: string): Promise<void> {
    const config = this.configs.get(tenantId);
    if (config) {
      config.dailyUsed = 0;
      config.updatedAt = new Date().toISOString();
    }
  }
  
  /**
   * Clear all configs (for testing).
   */
  clear(): void {
    this.configs.clear();
  }
}
