/**
 * Common types for the search engine.
 */

/**
 * Type of search to perform.
 */
export type SearchQueryType = 'text' | 'vector' | 'hybrid';

/**
 * Options for search operations.
 */
export interface SearchOptions {
  /** Maximum number of results to return */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
  /** Include highlighted snippets */
  includeSnippets?: boolean;
  /** Include raw scores */
  includeScores?: boolean;
  /** Boost factor for text search results */
  textBoost?: number;
  /** Boost factor for vector search results */
  vectorBoost?: number;
}

/**
 * Provider for generating embeddings.
 */
export interface EmbeddingProvider {
  /**
   * Generate embedding for text.
   * @param text - Text to embed
   * @returns Embedding vector
   */
  embed(text: string): Promise<number[]>;
  
  /**
   * Generate embeddings for multiple texts.
   * @param texts - Array of texts to embed
   * @returns Array of embedding vectors
   */
  embedBatch(texts: string[]): Promise<number[][]>;
  
  /**
   * Get the dimension of embeddings produced.
   */
  readonly dimension: number;
  
  /**
   * Get the model name.
   */
  readonly modelName: string;
}

/**
 * Database client interface for executing queries.
 */
export interface DatabaseClient {
  /**
   * Execute a query with parameters.
   * @param sql - SQL query string
   * @param params - Query parameters
   * @returns Query results
   */
  query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;
  
  /**
   * Execute a query within tenant context.
   * @param tenantId - Tenant ID for isolation
   * @returns Scoped client
   */
  withTenant(tenantId: string): TenantScopedClient;
}

/**
 * Tenant-scoped database client.
 */
export interface TenantScopedClient {
  /**
   * Execute a query with tenant isolation.
   */
  query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;
}

/**
 * Configuration for search services.
 */
export interface SearchServiceConfig {
  /** Database client for text search */
  db?: DatabaseClient;
  
  /** Pinecone API key */
  pineconeApiKey?: string;
  
  /** Pinecone index name */
  pineconeIndex?: string;
  
  /** Embedding provider for vector search */
  embeddingProvider?: EmbeddingProvider;
  
  /** Default search options */
  defaultOptions?: SearchOptions;
  
  /** Enable query logging */
  enableLogging?: boolean;
}

/**
 * Result from a database search query.
 */
export interface SearchRow {
  id: string;
  entity_type: string;
  title: string | null;
  content: string;
  rank?: number;
  snippet?: string;
  notebook_id?: string;
  created_at?: string;
  updated_at?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Vector search match from Pinecone.
 */
export interface VectorMatch {
  id: string;
  score: number;
  metadata?: Record<string, unknown>;
}
