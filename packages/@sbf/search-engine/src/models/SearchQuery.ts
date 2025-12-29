/**
 * Search query model.
 * 
 * Represents a search request with query text, type, and options.
 */

import { SearchFilters } from './SearchFilters';
import { SearchQueryType, SearchOptions } from '../types';

/**
 * Search query structure.
 */
export interface SearchQuery {
  /** The search query text */
  text: string;
  
  /** Type of search to perform */
  type: SearchQueryType;
  
  /** Maximum results to return */
  limit?: number;
  
  /** Offset for pagination */
  offset?: number;
  
  /** Filters to apply to results */
  filters?: SearchFilters;
  
  /** Additional search options */
  options?: SearchOptions;
}

/**
 * Builder for constructing search queries.
 */
export class SearchQueryBuilder {
  private query: SearchQuery;
  
  constructor(text: string) {
    this.query = {
      text,
      type: 'hybrid',
      limit: 100,
    };
  }
  
  /**
   * Create a new query builder.
   */
  static create(text: string): SearchQueryBuilder {
    return new SearchQueryBuilder(text);
  }
  
  /**
   * Set the search type.
   */
  type(type: SearchQueryType): this {
    this.query.type = type;
    return this;
  }
  
  /**
   * Set text-only search.
   */
  textOnly(): this {
    this.query.type = 'text';
    return this;
  }
  
  /**
   * Set vector-only search.
   */
  vectorOnly(): this {
    this.query.type = 'vector';
    return this;
  }
  
  /**
   * Set hybrid search (default).
   */
  hybrid(): this {
    this.query.type = 'hybrid';
    return this;
  }
  
  /**
   * Set maximum results.
   */
  limit(limit: number): this {
    this.query.limit = limit;
    return this;
  }
  
  /**
   * Set pagination offset.
   */
  offset(offset: number): this {
    this.query.offset = offset;
    return this;
  }
  
  /**
   * Add filters.
   */
  withFilters(filters: SearchFilters): this {
    this.query.filters = { ...this.query.filters, ...filters };
    return this;
  }
  
  /**
   * Filter by entity types.
   */
  entityTypes(...types: string[]): this {
    this.query.filters = {
      ...this.query.filters,
      entityTypes: types,
    };
    return this;
  }
  
  /**
   * Filter by notebook.
   */
  inNotebook(notebookId: string): this {
    this.query.filters = {
      ...this.query.filters,
      notebookId,
    };
    return this;
  }
  
  /**
   * Filter by date range.
   */
  dateRange(start: Date, end: Date): this {
    this.query.filters = {
      ...this.query.filters,
      dateRange: { start, end },
    };
    return this;
  }
  
  /**
   * Set minimum score threshold.
   */
  minScore(score: number): this {
    this.query.filters = {
      ...this.query.filters,
      minimumScore: score,
    };
    return this;
  }
  
  /**
   * Set additional options.
   */
  withOptions(options: SearchOptions): this {
    this.query.options = { ...this.query.options, ...options };
    return this;
  }
  
  /**
   * Include snippets in results.
   */
  includeSnippets(): this {
    this.query.options = {
      ...this.query.options,
      includeSnippets: true,
    };
    return this;
  }
  
  /**
   * Set boost factors.
   */
  boost(textBoost: number, vectorBoost: number): this {
    this.query.options = {
      ...this.query.options,
      textBoost,
      vectorBoost,
    };
    return this;
  }
  
  /**
   * Build the final query.
   */
  build(): SearchQuery {
    return { ...this.query };
  }
}
