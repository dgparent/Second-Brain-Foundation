/**
 * @sbf/ai-entities - Model Entity
 * 
 * Entity representing an AI model in the registry.
 * Models are catalog items (not tenant-specific), so we use SingletonEntity.
 */

import { EntityId, ISO8601 } from '@sbf/domain-base';

/**
 * Model types supported by the system
 */
export type ModelType = 'language' | 'embedding' | 'tts' | 'stt' | 'image';

/**
 * AI Provider identifiers
 */
export type ProviderType = 
  | 'openai' 
  | 'anthropic' 
  | 'google' 
  | 'ollama' 
  | 'together' 
  | 'groq' 
  | 'mistral'
  | 'azure';

/**
 * Model capabilities configuration
 */
export interface ModelCapabilities {
  maxTokens?: number;
  supportsStreaming?: boolean;
  supportsJson?: boolean;
  supportsFunctionCalling?: boolean;
  dimensions?: number;  // For embedding models
  languages?: string[];
  inputFormats?: string[];
  outputFormats?: string[];
}

/**
 * Model configuration options
 */
export interface ModelConfig {
  baseUrl?: string;
  apiVersion?: string;
  defaultTemperature?: number;
  defaultMaxTokens?: number;
  headers?: Record<string, string>;
}

/**
 * Model cost information
 */
export interface ModelCost {
  perMillionInput: number;
  perMillionOutput: number;
  currency?: string;
}

/**
 * Model data transfer object
 */
export interface ModelData {
  id?: EntityId;
  name: string;
  provider: ProviderType;
  type: ModelType;
  modelId: string;
  capabilities?: ModelCapabilities;
  config?: ModelConfig;
  cost?: ModelCost;
  isLocal: boolean;
  isActive: boolean;
  createdAt?: ISO8601;
  updatedAt?: ISO8601;
}

/**
 * Model entity - represents an AI model in the registry
 * 
 * Note: Models are global catalog items, not per-tenant entities.
 * Default model selections are stored in DefaultModels per tenant.
 */
export class Model {
  readonly id: EntityId;
  readonly name: string;
  readonly provider: ProviderType;
  readonly type: ModelType;
  readonly modelId: string;
  readonly capabilities: ModelCapabilities;
  readonly config: ModelConfig;
  readonly cost: ModelCost;
  readonly isLocal: boolean;
  readonly isActive: boolean;
  readonly createdAt: ISO8601;
  readonly updatedAt: ISO8601;

  constructor(data: ModelData) {
    this.id = data.id || crypto.randomUUID?.() || generateUUID();
    this.name = data.name;
    this.provider = data.provider;
    this.type = data.type;
    this.modelId = data.modelId;
    this.capabilities = data.capabilities || {};
    this.config = data.config || {};
    this.cost = data.cost || { perMillionInput: 0, perMillionOutput: 0 };
    this.isLocal = data.isLocal ?? false;
    this.isActive = data.isActive ?? true;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  /**
   * Create from database row
   */
  static fromRow(row: Record<string, unknown>): Model {
    return new Model({
      id: row.id as string,
      name: row.name as string,
      provider: row.provider as ProviderType,
      type: row.type as ModelType,
      modelId: row.model_id as string,
      capabilities: (row.capabilities as ModelCapabilities) || {},
      config: (row.config as ModelConfig) || {},
      cost: {
        perMillionInput: Number(row.cost_per_million_input) || 0,
        perMillionOutput: Number(row.cost_per_million_output) || 0,
      },
      isLocal: row.is_local as boolean,
      isActive: row.is_active as boolean,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    });
  }

  /**
   * Convert to database row format
   */
  toRow(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      provider: this.provider,
      type: this.type,
      model_id: this.modelId,
      capabilities: this.capabilities,
      config: this.config,
      cost_per_million_input: this.cost.perMillionInput,
      cost_per_million_output: this.cost.perMillionOutput,
      is_local: this.isLocal,
      is_active: this.isActive,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }

  /**
   * Check if model supports streaming
   */
  supportsStreaming(): boolean {
    return this.capabilities.supportsStreaming ?? false;
  }

  /**
   * Check if model supports JSON mode
   */
  supportsJson(): boolean {
    return this.capabilities.supportsJson ?? false;
  }

  /**
   * Check if model supports function calling
   */
  supportsFunctionCalling(): boolean {
    return this.capabilities.supportsFunctionCalling ?? false;
  }

  /**
   * Get max tokens for this model
   */
  getMaxTokens(): number {
    return this.capabilities.maxTokens ?? 4096;
  }

  /**
   * Get embedding dimensions (for embedding models)
   */
  getDimensions(): number | undefined {
    return this.capabilities.dimensions;
  }

  /**
   * Check if model can be used for privacy-sensitive content
   */
  isPrivacySafe(): boolean {
    return this.isLocal;
  }

  /**
   * Calculate cost for given token usage
   */
  calculateCost(inputTokens: number, outputTokens: number): number {
    const inputCost = (inputTokens / 1_000_000) * this.cost.perMillionInput;
    const outputCost = (outputTokens / 1_000_000) * this.cost.perMillionOutput;
    return inputCost + outputCost;
  }

  /**
   * Create a copy with updated fields
   */
  with(updates: Partial<ModelData>): Model {
    return new Model({
      id: this.id,
      name: updates.name ?? this.name,
      provider: updates.provider ?? this.provider,
      type: updates.type ?? this.type,
      modelId: updates.modelId ?? this.modelId,
      capabilities: updates.capabilities ?? this.capabilities,
      config: updates.config ?? this.config,
      cost: updates.cost ?? this.cost,
      isLocal: updates.isLocal ?? this.isLocal,
      isActive: updates.isActive ?? this.isActive,
      createdAt: this.createdAt,
      updatedAt: new Date().toISOString(),
    });
  }
}

// Simple UUID generator fallback
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
