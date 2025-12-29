/**
 * Base search service interface.
 * 
 * Defines the contract for all search service implementations.
 */

import { SearchQuery } from '../models/SearchQuery';
import { SearchResult, SearchResultPage } from '../models/SearchResult';

/**
 * Base interface for search services.
 */
export interface SearchService {
  /**
   * The name of this search service.
   */
  readonly name: string;
  
  /**
   * Search for matching content.
   */
  search(query: SearchQuery, tenantId: string): Promise<SearchResultPage>;
  
  /**
   * Check if the service is healthy.
   */
  healthCheck(): Promise<boolean>;
}

/**
 * Configuration for search services.
 */
export interface BaseSearchConfig {
  /** Default result limit */
  defaultLimit?: number;
  
  /** Maximum result limit */
  maxLimit?: number;
  
  /** Default minimum score */
  defaultMinScore?: number;
  
  /** Enable query caching */
  enableCache?: boolean;
  
  /** Cache TTL in seconds */
  cacheTtlSeconds?: number;
}

/**
 * Abstract base class for search services.
 */
export abstract class BaseSearchService implements SearchService {
  abstract readonly name: string;
  
  protected readonly config: Required<BaseSearchConfig>;
  
  constructor(config: BaseSearchConfig = {}) {
    this.config = {
      defaultLimit: config.defaultLimit ?? 100,
      maxLimit: config.maxLimit ?? 1000,
      defaultMinScore: config.defaultMinScore ?? 0,
      enableCache: config.enableCache ?? false,
      cacheTtlSeconds: config.cacheTtlSeconds ?? 300,
    };
  }
  
  abstract search(query: SearchQuery, tenantId: string): Promise<SearchResultPage>;
  
  abstract healthCheck(): Promise<boolean>;
  
  /**
   * Normalize the query limit.
   */
  protected normalizeLimit(query: SearchQuery): number {
    const limit = query.limit ?? this.config.defaultLimit;
    return Math.min(limit, this.config.maxLimit);
  }
  
  /**
   * Get the minimum score threshold.
   */
  protected getMinScore(query: SearchQuery): number {
    return query.filters?.minimumScore ?? this.config.defaultMinScore;
  }
  
  /**
   * Filter results by minimum score.
   */
  protected applyMinScoreFilter(
    results: SearchResult[],
    minScore: number
  ): SearchResult[] {
    if (minScore <= 0) return results;
    return results.filter(r => r.score >= minScore);
  }
  
  /**
   * Apply pagination to results.
   */
  protected paginate(
    results: SearchResult[],
    query: SearchQuery
  ): { results: SearchResult[]; total: number; hasMore: boolean } {
    const offset = query.offset ?? 0;
    const limit = this.normalizeLimit(query);
    const total = results.length;
    
    const paginatedResults = results.slice(offset, offset + limit);
    const hasMore = offset + limit < total;
    
    return { results: paginatedResults, total, hasMore };
  }
  
  /**
   * Build a result page from results.
   */
  protected buildResultPage(
    results: SearchResult[],
    query: SearchQuery,
    source: 'text' | 'vector' | 'hybrid',
    executionTimeMs?: number
  ): SearchResultPage {
    const { results: paginated, total, hasMore } = this.paginate(results, query);
    
    return {
      results: paginated,
      total,
      offset: query.offset ?? 0,
      limit: this.normalizeLimit(query),
      hasMore,
      executionTimeMs,
      sources: [source],
    };
  }
}
