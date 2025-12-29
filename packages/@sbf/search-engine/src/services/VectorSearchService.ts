/**
 * Vector search service using Pinecone.
 * 
 * Provides semantic search capabilities using vector embeddings.
 */

import { Pinecone, Index, RecordMetadata, QueryResponse } from '@pinecone-database/pinecone';
import { BaseSearchService, BaseSearchConfig } from './SearchService';
import { SearchQuery } from '../models/SearchQuery';
import { SearchResult, SearchResultPage } from '../models/SearchResult';
import { SearchFilters } from '../models/SearchFilters';
import { EmbeddingProvider, VectorMatch } from '../types';

/**
 * Pinecone configuration.
 */
export interface VectorSearchConfig extends BaseSearchConfig {
  /** Pinecone API key */
  apiKey: string;
  
  /** Pinecone index name */
  indexName: string;
  
  /** Index host (optional, auto-discovered if not provided) */
  indexHost?: string;
  
  /** Namespace for multi-tenancy */
  namespace?: string;
  
  /** Include metadata in results */
  includeMetadata?: boolean;
  
  /** Include vector values in results (usually not needed) */
  includeValues?: boolean;
}

/**
 * Metadata stored with vectors.
 */
interface VectorMetadata extends RecordMetadata {
  entity_type: string;
  title?: string;
  content?: string;
  snippet?: string;
  notebook_id?: string;
  tenant_id: string;
  created_at?: string;
  updated_at?: string;
  sensitivity?: string;
  tags?: string[];
}

/**
 * Vector search service implementation.
 */
export class VectorSearchService extends BaseSearchService {
  readonly name = 'vector-search';
  
  private readonly pinecone: Pinecone;
  private readonly indexName: string;
  private readonly embeddingProvider: EmbeddingProvider;
  private readonly vectorConfig: Required<VectorSearchConfig>;
  
  private index?: Index<VectorMetadata>;
  
  constructor(
    embeddingProvider: EmbeddingProvider,
    config: VectorSearchConfig
  ) {
    super(config);
    
    this.embeddingProvider = embeddingProvider;
    this.indexName = config.indexName;
    
    this.pinecone = new Pinecone({
      apiKey: config.apiKey,
    });
    
    this.vectorConfig = {
      ...this.config,
      apiKey: config.apiKey,
      indexName: config.indexName,
      indexHost: config.indexHost ?? '',
      namespace: config.namespace ?? '',
      includeMetadata: config.includeMetadata ?? true,
      includeValues: config.includeValues ?? false,
    };
  }
  
  /**
   * Get or create the Pinecone index reference.
   */
  private async getIndex(): Promise<Index<VectorMetadata>> {
    if (!this.index) {
      this.index = this.pinecone.index<VectorMetadata>(this.indexName);
    }
    return this.index;
  }
  
  /**
   * Search for similar vectors.
   */
  async search(query: SearchQuery, tenantId: string): Promise<SearchResultPage> {
    const startTime = Date.now();
    
    // Generate embedding for query
    const queryEmbedding = await this.embeddingProvider.embed(query.text);
    
    // Build filter
    const filter = this.buildFilter(query.filters, tenantId);
    
    // Get index
    const index = await this.getIndex();
    
    // Query Pinecone
    const limit = this.normalizeLimit(query) * 2; // Get extra for filtering
    
    const response: QueryResponse<VectorMetadata> = await index.query({
      vector: queryEmbedding,
      topK: limit,
      filter,
      includeMetadata: this.vectorConfig.includeMetadata,
      includeValues: this.vectorConfig.includeValues,
    });
    
    // Convert to search results
    let results = this.convertMatches(response.matches ?? []);
    
    // Apply minimum score filter
    const minScore = this.getMinScore(query);
    results = this.applyMinScoreFilter(results, minScore);
    
    const executionTimeMs = Date.now() - startTime;
    
    return this.buildResultPage(results, query, 'vector', executionTimeMs);
  }
  
  /**
   * Check Pinecone connection health.
   */
  async healthCheck(): Promise<boolean> {
    try {
      const index = await this.getIndex();
      const stats = await index.describeIndexStats();
      return stats.totalRecordCount !== undefined;
    } catch {
      return false;
    }
  }
  
  /**
   * Build Pinecone filter from search filters.
   */
  private buildFilter(
    filters: SearchFilters | undefined,
    tenantId: string
  ): Record<string, unknown> {
    const pineconeFilter: Record<string, unknown> = {
      tenant_id: { $eq: tenantId },
    };
    
    if (!filters) return pineconeFilter;
    
    // Entity type filter
    if (filters.entityTypes?.length) {
      if (filters.entityTypes.length === 1) {
        pineconeFilter['entity_type'] = { $eq: filters.entityTypes[0] };
      } else {
        pineconeFilter['entity_type'] = { $in: filters.entityTypes };
      }
    }
    
    // Notebook filter
    if (filters.notebookId) {
      pineconeFilter['notebook_id'] = { $eq: filters.notebookId };
    }
    
    // Multiple notebooks filter
    if (filters.notebookIds?.length) {
      pineconeFilter['notebook_id'] = { $in: filters.notebookIds };
    }
    
    // Sensitivity filter
    if (filters.sensitivityLevels?.length) {
      pineconeFilter['sensitivity'] = { $in: filters.sensitivityLevels };
    }
    
    // Tags filter
    if (filters.tags?.length) {
      // Pinecone supports $all for array containment
      pineconeFilter['tags'] = { $all: filters.tags };
    }
    
    return pineconeFilter;
  }
  
  /**
   * Convert Pinecone matches to search results.
   */
  private convertMatches(matches: VectorMatch[]): SearchResult[] {
    return matches.map(match => {
      const metadata = match.metadata as VectorMetadata | undefined;
      
      return {
        id: match.id,
        entityType: metadata?.entity_type ?? 'unknown',
        title: metadata?.title ?? null,
        snippet: metadata?.snippet ?? metadata?.content?.substring(0, 200) ?? '',
        content: metadata?.content,
        rawScore: match.score ?? 0,
        score: match.score ?? 0, // Pinecone scores are already normalized
        searchSource: 'vector' as const,
        notebookId: metadata?.notebook_id,
        createdAt: metadata?.created_at,
        updatedAt: metadata?.updated_at,
        metadata: {
          sensitivity: metadata?.sensitivity,
          tags: metadata?.tags,
        },
      };
    });
  }
  
  /**
   * Upsert vectors into Pinecone.
   * 
   * This is a utility method for indexing new content.
   */
  async upsert(
    vectors: Array<{
      id: string;
      values: number[];
      metadata: Omit<VectorMetadata, 'tenant_id'>;
    }>,
    tenantId: string
  ): Promise<void> {
    const index = await this.getIndex();
    
    const records = vectors.map(v => ({
      id: v.id,
      values: v.values,
      metadata: {
        ...v.metadata,
        tenant_id: tenantId,
      },
    }));
    
    // Upsert in batches of 100
    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      await index.upsert(batch);
    }
  }
  
  /**
   * Delete vectors from Pinecone.
   */
  async delete(ids: string[]): Promise<void> {
    const index = await this.getIndex();
    await index.deleteMany(ids);
  }
  
  /**
   * Delete all vectors for a tenant.
   */
  async deleteByTenant(tenantId: string): Promise<void> {
    const index = await this.getIndex();
    await index.deleteMany({
      filter: { tenant_id: { $eq: tenantId } },
    });
  }
}
