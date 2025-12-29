/**
 * @sbf/search-engine
 * 
 * Hybrid search engine combining vector similarity and full-text search.
 * Provides unified search across the Second Brain Foundation platform.
 */

// Types
export * from './types';

// Models
export * from './models/SearchQuery';
export * from './models/SearchResult';
export * from './models/SearchFilters';

// Services
export * from './services/SearchService';
export * from './services/TextSearchService';
export * from './services/VectorSearchService';
export * from './services/HybridSearchService';

// Ranking
export * from './ranking/ResultRanker';
export * from './ranking/ScoreNormalizer';

// Utilities
export * from './utils/highlighter';
export * from './utils/deduplicator';
export * from './utils/queryExpander';
