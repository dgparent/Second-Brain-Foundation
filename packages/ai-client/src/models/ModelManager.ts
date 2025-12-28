/**
 * @sbf/ai-client - Model Manager
 * 
 * Service for managing AI models with caching, tenant defaults,
 * and sensitivity-based model selection.
 */

import { EntityId, TenantId } from '@sbf/domain-base';
import { Model, ModelType, ProviderType, ModelData } from './Model';

/**
 * Database adapter interface for ModelManager
 */
export interface ModelManagerDatabase {
  query<T>(sql: string, params?: unknown[]): Promise<T[]>;
  queryOne<T>(sql: string, params?: unknown[]): Promise<T | null>;
  execute(sql: string, params?: unknown[]): Promise<void>;
}

/**
 * Default model selections for a tenant
 */
export interface DefaultModelSelections {
  tenantId: TenantId;
  defaultChatModel?: EntityId;
  defaultTransformationModel?: EntityId;
  defaultEmbeddingModel?: EntityId;
  defaultTtsModel?: EntityId;
  defaultSttModel?: EntityId;
  largeContextModel?: EntityId;
  allowCloudForPersonal?: boolean;
}

/**
 * Model filter options
 */
export interface ModelFilter {
  provider?: ProviderType;
  type?: ModelType;
  isLocal?: boolean;
  isActive?: boolean;
  search?: string;
}

/**
 * Sensitivity levels - determines which models can be used
 */
export type SensitivityLevel = 'public' | 'personal' | 'confidential' | 'secret';

/**
 * Model selection context
 */
export interface ModelSelectionContext {
  sensitivity: SensitivityLevel;
  allowCloudForPersonal?: boolean;
  preferLocal?: boolean;
  requireStreaming?: boolean;
  requireJson?: boolean;
  minContextLength?: number;
}

/**
 * Cached model data with TTL
 */
interface CachedData<T> {
  data: T;
  expiresAt: number;
}

/**
 * ModelManager - Central service for AI model management
 * 
 * Handles:
 * - Model registry CRUD operations
 * - Per-tenant default model configuration
 * - Model selection based on sensitivity
 * - Model caching for performance
 * 
 * @example
 * ```typescript
 * const manager = new ModelManager(db, tenantId);
 * 
 * // Get model by ID
 * const model = await manager.getModel(modelId);
 * 
 * // Get default chat model for tenant
 * const chatModel = await manager.getDefaultModel('language');
 * 
 * // Get privacy-safe model for sensitive content
 * const safeModel = await manager.selectModel('language', { 
 *   sensitivity: 'confidential' 
 * });
 * ```
 */
export class ModelManager {
  private db: ModelManagerDatabase;
  private tenantId: TenantId;
  private cache: Map<string, CachedData<unknown>> = new Map();
  private cacheTtlMs: number = 5 * 60 * 1000; // 5 minutes

  constructor(db: ModelManagerDatabase, tenantId: TenantId, options?: { cacheTtlMs?: number }) {
    this.db = db;
    this.tenantId = tenantId;
    if (options?.cacheTtlMs) {
      this.cacheTtlMs = options.cacheTtlMs;
    }
  }

  // ============================================
  // Model CRUD Operations
  // ============================================

  /**
   * Get a model by ID
   */
  async getModel(id: EntityId): Promise<Model | null> {
    const cacheKey = `model:${id}`;
    const cached = this.getFromCache<Model>(cacheKey);
    if (cached) return cached;

    const row = await this.db.queryOne<Record<string, unknown>>(
      'SELECT * FROM models WHERE id = $1',
      [id]
    );

    if (!row) return null;
    const model = Model.fromRow(row);
    this.setCache(cacheKey, model);
    return model;
  }

  /**
   * Get a model by provider and model ID
   */
  async getModelByProviderId(provider: ProviderType, modelId: string): Promise<Model | null> {
    const cacheKey = `model:${provider}:${modelId}`;
    const cached = this.getFromCache<Model>(cacheKey);
    if (cached) return cached;

    const row = await this.db.queryOne<Record<string, unknown>>(
      'SELECT * FROM models WHERE provider = $1 AND model_id = $2',
      [provider, modelId]
    );

    if (!row) return null;
    const model = Model.fromRow(row);
    this.setCache(cacheKey, model);
    return model;
  }

  /**
   * List all models with optional filters
   */
  async listModels(filter?: ModelFilter): Promise<Model[]> {
    let sql = 'SELECT * FROM models WHERE 1=1';
    const params: unknown[] = [];
    let paramIndex = 1;

    if (filter?.provider) {
      sql += ` AND provider = $${paramIndex++}`;
      params.push(filter.provider);
    }
    if (filter?.type) {
      sql += ` AND type = $${paramIndex++}`;
      params.push(filter.type);
    }
    if (filter?.isLocal !== undefined) {
      sql += ` AND is_local = $${paramIndex++}`;
      params.push(filter.isLocal);
    }
    if (filter?.isActive !== undefined) {
      sql += ` AND is_active = $${paramIndex++}`;
      params.push(filter.isActive);
    }
    if (filter?.search) {
      sql += ` AND (name ILIKE $${paramIndex} OR model_id ILIKE $${paramIndex++})`;
      params.push(`%${filter.search}%`);
    }

    sql += ' ORDER BY provider, name';

    const rows = await this.db.query<Record<string, unknown>>(sql, params);
    return rows.map(row => Model.fromRow(row));
  }

  /**
   * Create a new model
   */
  async createModel(data: ModelData): Promise<Model> {
    const model = new Model(data);
    const row = model.toRow();
    
    await this.db.execute(
      `INSERT INTO models (id, name, provider, type, model_id, capabilities, config, 
        cost_per_million_input, cost_per_million_output, is_local, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        row.id, row.name, row.provider, row.type, row.model_id,
        JSON.stringify(row.capabilities), JSON.stringify(row.config),
        row.cost_per_million_input, row.cost_per_million_output,
        row.is_local, row.is_active, row.created_at, row.updated_at
      ]
    );

    this.setCache(`model:${model.id}`, model);
    this.setCache(`model:${model.provider}:${model.modelId}`, model);
    return model;
  }

  /**
   * Update a model
   */
  async updateModel(id: EntityId, updates: Partial<ModelData>): Promise<Model | null> {
    const existing = await this.getModel(id);
    if (!existing) return null;

    const updated = existing.with(updates);
    const row = updated.toRow();

    await this.db.execute(
      `UPDATE models SET 
        name = $2, capabilities = $3, config = $4,
        cost_per_million_input = $5, cost_per_million_output = $6,
        is_active = $7, updated_at = $8
       WHERE id = $1`,
      [
        row.id, row.name,
        JSON.stringify(row.capabilities), JSON.stringify(row.config),
        row.cost_per_million_input, row.cost_per_million_output,
        row.is_active, row.updated_at
      ]
    );

    this.invalidateModelCache(existing);
    this.setCache(`model:${updated.id}`, updated);
    this.setCache(`model:${updated.provider}:${updated.modelId}`, updated);
    return updated;
  }

  /**
   * Deactivate a model (soft delete)
   */
  async deactivateModel(id: EntityId): Promise<boolean> {
    const existing = await this.getModel(id);
    if (!existing) return false;

    await this.db.execute(
      'UPDATE models SET is_active = false, updated_at = $2 WHERE id = $1',
      [id, new Date().toISOString()]
    );

    this.invalidateModelCache(existing);
    return true;
  }

  // ============================================
  // Default Model Management
  // ============================================

  /**
   * Get tenant's default model selections
   */
  async getDefaultSelections(): Promise<DefaultModelSelections | null> {
    const cacheKey = `defaults:${this.tenantId}`;
    const cached = this.getFromCache<DefaultModelSelections>(cacheKey);
    if (cached) return cached;

    const row = await this.db.queryOne<Record<string, unknown>>(
      'SELECT * FROM default_models WHERE tenant_id = $1',
      [this.tenantId]
    );

    if (!row) return null;

    const selections: DefaultModelSelections = {
      tenantId: row.tenant_id as string,
      defaultChatModel: row.default_chat_model as string | undefined,
      defaultTransformationModel: row.default_transformation_model as string | undefined,
      defaultEmbeddingModel: row.default_embedding_model as string | undefined,
      defaultTtsModel: row.default_tts_model as string | undefined,
      defaultSttModel: row.default_stt_model as string | undefined,
      largeContextModel: row.large_context_model as string | undefined,
      allowCloudForPersonal: row.allow_cloud_for_personal as boolean,
    };

    this.setCache(cacheKey, selections);
    return selections;
  }

  /**
   * Set tenant's default model selections
   */
  async setDefaultSelections(selections: Partial<DefaultModelSelections>): Promise<void> {
    const existing = await this.getDefaultSelections();
    
    if (existing) {
      await this.db.execute(
        `UPDATE default_models SET
          default_chat_model = COALESCE($2, default_chat_model),
          default_transformation_model = COALESCE($3, default_transformation_model),
          default_embedding_model = COALESCE($4, default_embedding_model),
          default_tts_model = COALESCE($5, default_tts_model),
          default_stt_model = COALESCE($6, default_stt_model),
          large_context_model = COALESCE($7, large_context_model),
          allow_cloud_for_personal = COALESCE($8, allow_cloud_for_personal),
          updated_at = NOW()
         WHERE tenant_id = $1`,
        [
          this.tenantId,
          selections.defaultChatModel,
          selections.defaultTransformationModel,
          selections.defaultEmbeddingModel,
          selections.defaultTtsModel,
          selections.defaultSttModel,
          selections.largeContextModel,
          selections.allowCloudForPersonal,
        ]
      );
    } else {
      await this.db.execute(
        `INSERT INTO default_models (tenant_id, default_chat_model, default_transformation_model,
          default_embedding_model, default_tts_model, default_stt_model, large_context_model,
          allow_cloud_for_personal)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          this.tenantId,
          selections.defaultChatModel,
          selections.defaultTransformationModel,
          selections.defaultEmbeddingModel,
          selections.defaultTtsModel,
          selections.defaultSttModel,
          selections.largeContextModel,
          selections.allowCloudForPersonal ?? false,
        ]
      );
    }

    this.cache.delete(`defaults:${this.tenantId}`);
  }

  /**
   * Get the default model for a given type
   */
  async getDefaultModel(type: ModelType): Promise<Model | null> {
    const defaults = await this.getDefaultSelections();
    if (!defaults) return null;

    let modelId: EntityId | undefined;
    switch (type) {
      case 'language':
        modelId = defaults.defaultChatModel;
        break;
      case 'embedding':
        modelId = defaults.defaultEmbeddingModel;
        break;
      case 'tts':
        modelId = defaults.defaultTtsModel;
        break;
      case 'stt':
        modelId = defaults.defaultSttModel;
        break;
    }

    return modelId ? this.getModel(modelId) : null;
  }

  // ============================================
  // Intelligent Model Selection
  // ============================================

  /**
   * Select the best model based on type and context
   * 
   * This implements the sensitivity-based model selection from PRD:
   * - confidential/secret: Only local models (Ollama)
   * - personal: Depends on allowCloudForPersonal setting
   * - public: Any model allowed
   */
  async selectModel(type: ModelType, context?: ModelSelectionContext): Promise<Model | null> {
    const sensitivity = context?.sensitivity ?? 'public';
    
    // Get allowed models based on sensitivity
    const filter: ModelFilter = {
      type,
      isActive: true,
    };

    // Apply sensitivity rules
    if (sensitivity === 'confidential' || sensitivity === 'secret') {
      // Only local models for sensitive content
      filter.isLocal = true;
    } else if (sensitivity === 'personal') {
      // Check tenant preference
      const defaults = await this.getDefaultSelections();
      const allowCloud = context?.allowCloudForPersonal ?? defaults?.allowCloudForPersonal ?? false;
      if (!allowCloud || context?.preferLocal) {
        filter.isLocal = true;
      }
    }

    // Get all matching models
    let models = await this.listModels(filter);

    // Apply additional filters
    if (context?.requireStreaming) {
      models = models.filter(m => m.supportsStreaming());
    }
    if (context?.requireJson) {
      models = models.filter(m => m.supportsJson());
    }
    if (context?.minContextLength) {
      models = models.filter(m => m.getMaxTokens() >= context.minContextLength);
    }

    if (models.length === 0) return null;

    // Try to get the default model if it matches filters
    const defaultModel = await this.getDefaultModel(type);
    if (defaultModel && models.some(m => m.id === defaultModel.id)) {
      return defaultModel;
    }

    // Return first available model (could be enhanced with scoring)
    return models[0];
  }

  /**
   * Get all local models (for privacy-sensitive content)
   */
  async getLocalModels(type?: ModelType): Promise<Model[]> {
    return this.listModels({
      type,
      isLocal: true,
      isActive: true,
    });
  }

  /**
   * Get models for a specific provider
   */
  async getProviderModels(provider: ProviderType, type?: ModelType): Promise<Model[]> {
    return this.listModels({
      provider,
      type,
      isActive: true,
    });
  }

  // ============================================
  // Cache Management
  // ============================================

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key) as CachedData<T> | undefined;
    if (!cached) return null;
    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return cached.data;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + this.cacheTtlMs,
    });
  }

  private invalidateModelCache(model: Model): void {
    this.cache.delete(`model:${model.id}`);
    this.cache.delete(`model:${model.provider}:${model.modelId}`);
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Change the tenant context
   */
  setTenantId(tenantId: TenantId): void {
    this.tenantId = tenantId;
    // Clear tenant-specific cache entries
    this.cache.delete(`defaults:${this.tenantId}`);
  }
}
