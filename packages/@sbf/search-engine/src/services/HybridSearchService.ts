/**
 * Hybrid search service.
 * 
 * Combines text and vector search with intelligent result merging.
 */

import { BaseSearchService, BaseSearchConfig, SearchService } from './SearchService';
import { TextSearchService, TextSearchConfig } from './TextSearchService';
import { VectorSearchService, VectorSearchConfig } from './VectorSearchService';
import { SearchQuery } from '../models/SearchQuery';
import { SearchResult, SearchResultPage, SearchResultSource } from '../models/SearchResult';
import { DatabaseClient, EmbeddingProvider } from '../types';
import { ResultRanker, RankingStrategy } from '../ranking/ResultRanker';
import { ScoreNormalizer } from '../ranking/ScoreNormalizer';
import { deduplicateResults } from '../utils/deduplicator';

/**
 * Hybrid search configuration.
 */
export interface HybridSearchConfig extends BaseSearchConfig {
  /** Weight for text search results (0-1) */
  textWeight?: number;
  
  /** Weight for vector search results (0-1) */
  vectorWeight?: number;
  
  /** Minimum overlap score for deduplication */
  deduplicationThreshold?: number;
  
  /** Ranking strategy */
  rankingStrategy?: RankingStrategy;
  
  /** Fall back to single source if one fails */
  enableFallback?: boolean;
  
  /** Timeout for individual searches (ms) */
  searchTimeoutMs?: number;
}

/**
 * Full configuration for creating hybrid search.
 */
export interface HybridSearchFullConfig {
  /** Text search configuration */
  text: TextSearchConfig;
  
  /** Vector search configuration */
  vector: VectorSearchConfig;
  
  /** Hybrid search configuration */
  hybrid?: HybridSearchConfig;
}

/**
 * Hybrid search service implementation.
 */
export class HybridSearchService extends BaseSearchService {
  readonly name = 'hybrid-search';
  
  private readonly textSearch: TextSearchService;
  private readonly vectorSearch: VectorSearchService;
  private readonly hybridConfig: Required<HybridSearchConfig>;
  private readonly ranker: ResultRanker;
  private readonly normalizer: ScoreNormalizer;
  
  constructor(
    textSearch: TextSearchService,
    vectorSearch: VectorSearchService,
    config: HybridSearchConfig = {}
  ) {
    super(config);
    
    this.textSearch = textSearch;
    this.vectorSearch = vectorSearch;
    
    this.hybridConfig = {
      ...this.config,
      textWeight: config.textWeight ?? 0.4,
      vectorWeight: config.vectorWeight ?? 0.6,
      deduplicationThreshold: config.deduplicationThreshold ?? 0.85,
      rankingStrategy: config.rankingStrategy ?? 'reciprocal-rank-fusion',
      enableFallback: config.enableFallback ?? true,
      searchTimeoutMs: config.searchTimeoutMs ?? 10000,
    };
    
    this.ranker = new ResultRanker(this.hybridConfig.rankingStrategy);
    this.normalizer = new ScoreNormalizer();
  }
  
  /**
   * Create a hybrid search service with full configuration.
   */
  static create(
    db: DatabaseClient,
    embeddingProvider: EmbeddingProvider,
    config: HybridSearchFullConfig
  ): HybridSearchService {
    const textSearch = new TextSearchService(db, config.text);
    const vectorSearch = new VectorSearchService(embeddingProvider, config.vector);
    return new HybridSearchService(textSearch, vectorSearch, config.hybrid);
  }
  
  /**
   * Search using both text and vector search.
   */
  async search(query: SearchQuery, tenantId: string): Promise<SearchResultPage> {
    const startTime = Date.now();
    
    // Determine which searches to run
    const searchType = query.type ?? 'hybrid';
    
    if (searchType === 'text') {
      return this.textSearch.search(query, tenantId);
    }
    
    if (searchType === 'vector') {
      return this.vectorSearch.search(query, tenantId);
    }
    
    // Run both searches in parallel with timeout
    const [textResults, vectorResults] = await this.runParallelSearches(
      query,
      tenantId
    );
    
    // Merge and rank results
    const mergedResults = this.mergeResults(
      textResults?.results ?? [],
      vectorResults?.results ?? []
    );
    
    // Apply minimum score filter
    const minScore = this.getMinScore(query);
    const filteredResults = this.applyMinScoreFilter(mergedResults, minScore);
    
    const executionTimeMs = Date.now() - startTime;
    
    // Determine sources used
    const sources: SearchResultSource[] = [];
    if (textResults) sources.push('text');
    if (vectorResults) sources.push('vector');
    if (sources.length === 2) sources.push('hybrid');
    
    return {
      ...this.buildResultPage(filteredResults, query, 'hybrid', executionTimeMs),
      sources,
    };
  }
  
  /**
   * Check health of both underlying services.
   */
  async healthCheck(): Promise<boolean> {
    const [textHealthy, vectorHealthy] = await Promise.all([
      this.textSearch.healthCheck().catch(() => false),
      this.vectorSearch.healthCheck().catch(() => false),
    ]);
    
    // Healthy if at least one service is available
    return textHealthy || vectorHealthy;
  }
  
  /**
   * Run text and vector searches in parallel.
   */
  private async runParallelSearches(
    query: SearchQuery,
    tenantId: string
  ): Promise<[SearchResultPage | null, SearchResultPage | null]> {
    const timeout = this.hybridConfig.searchTimeoutMs;
    
    const withTimeout = async <T>(
      promise: Promise<T>,
      fallbackValue: T | null
    ): Promise<T | null> => {
      return Promise.race([
        promise,
        new Promise<T | null>(resolve =>
          setTimeout(() => resolve(fallbackValue), timeout)
        ),
      ]).catch(() => (this.hybridConfig.enableFallback ? fallbackValue : null));
    };
    
    const [textResults, vectorResults] = await Promise.all([
      withTimeout(this.textSearch.search(query, tenantId), null),
      withTimeout(this.vectorSearch.search(query, tenantId), null),
    ]);
    
    // If both failed and fallback is disabled, throw
    if (!textResults && !vectorResults && !this.hybridConfig.enableFallback) {
      throw new Error('Both text and vector search failed');
    }
    
    return [textResults, vectorResults];
  }
  
  /**
   * Merge results from text and vector search.
   */
  private mergeResults(
    textResults: SearchResult[],
    vectorResults: SearchResult[]
  ): SearchResult[] {
    // Normalize scores
    const normalizedText = this.normalizer.normalize(textResults, 'text');
    const normalizedVector = this.normalizer.normalize(vectorResults, 'vector');
    
    // Apply weights
    const weightedText = normalizedText.map(r => ({
      ...r,
      score: r.score * this.hybridConfig.textWeight,
    }));
    
    const weightedVector = normalizedVector.map(r => ({
      ...r,
      score: r.score * this.hybridConfig.vectorWeight,
    }));
    
    // Deduplicate (same ID appearing in both)
    const deduped = deduplicateResults(
      [...weightedText, ...weightedVector],
      this.hybridConfig.deduplicationThreshold
    );
    
    // Rank using the configured strategy
    return this.ranker.rank(deduped);
  }
  
  /**
   * Get the text search service.
   */
  getTextSearchService(): TextSearchService {
    return this.textSearch;
  }
  
  /**
   * Get the vector search service.
   */
  getVectorSearchService(): VectorSearchService {
    return this.vectorSearch;
  }
}
