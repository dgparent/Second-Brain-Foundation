/**
 * @sbf/domain-base - Type Definitions
 * 
 * Core type definitions for base entity patterns.
 */

/**
 * Entity ID type - UUIDs for database entities
 */
export type EntityId = string;

/**
 * Tenant ID type - UUIDs for multi-tenant isolation
 */
export type TenantId = string;

/**
 * ISO8601 timestamp string
 */
export type ISO8601 = string;

/**
 * Entity lifecycle states as defined in PRD
 */
export type LifecycleState = 'capture' | 'transitional' | 'permanent' | 'archived';

/**
 * Sensitivity levels as defined in PRD
 */
export type SensitivityLevel = 'public' | 'personal' | 'confidential' | 'secret';

/**
 * Privacy settings for an entity
 */
export interface PrivacySettings {
  cloudAiAllowed: boolean;
  localAiAllowed: boolean;
  exportAllowed: boolean;
}

/**
 * Lifecycle metadata
 */
export interface LifecycleMetadata {
  state: LifecycleState;
  reviewAt?: ISO8601;
  dissolveAt?: ISO8601;
}

/**
 * Sensitivity metadata
 */
export interface SensitivityMetadata {
  level: SensitivityLevel;
  privacy: PrivacySettings;
}

/**
 * Provenance tracking for AI-generated content
 */
export interface Provenance {
  sources: string[];
  confidence: number;
  retrievedDate?: ISO8601;
  sourceUrl?: string;
}

/**
 * Human override settings
 */
export interface Override {
  humanLast: ISO8601;
  preventDissolve?: boolean;
  notes?: string;
}

/**
 * Base fields present on all entities
 */
export interface BaseEntityFields {
  id: EntityId;
  tenantId: TenantId;
  createdAt: ISO8601;
  updatedAt: ISO8601;
}

/**
 * CRUD operation result
 */
export interface CRUDResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * List operation options
 */
export interface ListOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

/**
 * List operation result with pagination
 */
export interface ListResult<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * Database adapter interface
 * Implementations can use PostgreSQL, SQLite, etc.
 */
export interface DatabaseAdapter {
  /**
   * Execute a query and return rows
   */
  query<T>(sql: string, params?: unknown[]): Promise<T[]>;
  
  /**
   * Execute a query and return a single row
   */
  queryOne<T>(sql: string, params?: unknown[]): Promise<T | null>;
  
  /**
   * Execute an insert and return the inserted ID
   */
  insert(table: string, data: Record<string, unknown>): Promise<EntityId>;
  
  /**
   * Execute an update and return affected rows count
   */
  update(table: string, id: EntityId, data: Record<string, unknown>): Promise<number>;
  
  /**
   * Execute a delete and return affected rows count
   */
  delete(table: string, id: EntityId): Promise<number>;
  
  /**
   * Set the current tenant context for RLS
   */
  setTenantContext(tenantId: TenantId): Promise<void>;
  
  /**
   * Begin a transaction
   */
  beginTransaction(): Promise<void>;
  
  /**
   * Commit the current transaction
   */
  commitTransaction(): Promise<void>;
  
  /**
   * Rollback the current transaction
   */
  rollbackTransaction(): Promise<void>;
}

/**
 * Embedding provider interface
 */
export interface EmbeddingProvider {
  /**
   * Generate an embedding vector for the given text
   */
  embed(text: string): Promise<number[]>;
  
  /**
   * Generate embeddings for multiple texts
   */
  embedBatch(texts: string[]): Promise<number[][]>;
  
  /**
   * Get the embedding dimension
   */
  getDimension(): number;
}

/**
 * Entity save options
 */
export interface SaveOptions {
  /**
   * Skip auto-embedding generation
   */
  skipEmbedding?: boolean;
  
  /**
   * Custom tenant ID override (for internal operations)
   */
  tenantId?: TenantId;
  
  /**
   * Force update even if no changes detected
   */
  forceUpdate?: boolean;
}

/**
 * Entity get options
 */
export interface GetOptions {
  /**
   * Include soft-deleted entities
   */
  includeDeleted?: boolean;
  
  /**
   * Specific tenant ID (for internal operations)
   */
  tenantId?: TenantId;
}

/**
 * Entity delete options
 */
export interface DeleteOptions {
  /**
   * Hard delete instead of soft delete
   */
  hard?: boolean;
  
  /**
   * Skip cascade delete checks
   */
  skipCascadeCheck?: boolean;
}
