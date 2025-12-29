/**
 * Search API client for hybrid search functionality
 */
import { api } from './client';
import type { SourceType } from './types';

export type SearchType = 'text' | 'vector' | 'hybrid';

export interface SearchFilters {
  notebookId?: string;
  entityTypes?: ('source' | 'note' | 'insight')[];
  sourceTypes?: SourceType[];
  dateFrom?: string;
  dateTo?: string;
  hasInsights?: boolean;
}

export interface SearchQuery {
  text: string;
  type?: SearchType;
  filters?: SearchFilters;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  id: string;
  entityId: string;
  entityType: 'source' | 'note' | 'insight';
  title: string;
  snippet?: string;
  highlight?: string;
  score: number;
  searchType: SearchType;
  notebookId?: string;
  notebookName?: string;
  sourceType?: SourceType;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
  searchType: SearchType;
  took: number; // ms
}

/**
 * Search API methods
 */
export const searchApi = {
  /**
   * Execute a search query
   */
  search: async (query: SearchQuery): Promise<SearchResult[]> => {
    const response = await api.post<SearchResponse>('/search', query);
    return response.results || [];
  },

  /**
   * Execute a search and return full response with metadata
   */
  searchWithMetadata: async (query: SearchQuery): Promise<SearchResponse> => {
    return api.post<SearchResponse>('/search', query);
  },

  /**
   * Get search suggestions based on partial query
   */
  getSuggestions: async (
    prefix: string,
    limit?: number
  ): Promise<string[]> => {
    return api.get<string[]>('/search/suggestions', {
      params: { q: prefix, limit: limit || 10 },
    });
  },

  /**
   * Get recent searches for the current user
   */
  getRecentSearches: async (limit?: number): Promise<string[]> => {
    return api.get<string[]>('/search/recent', {
      params: { limit: limit || 10 },
    });
  },

  /**
   * Clear recent searches
   */
  clearRecentSearches: async (): Promise<void> => {
    await api.delete('/search/recent');
  },

  /**
   * Perform semantic similarity search
   */
  semanticSearch: async (
    text: string,
    options?: {
      notebookId?: string;
      limit?: number;
      threshold?: number;
    }
  ): Promise<SearchResult[]> => {
    return api.post<SearchResult[]>('/search/semantic', {
      text,
      ...options,
    });
  },

  /**
   * Perform keyword search
   */
  keywordSearch: async (
    text: string,
    options?: {
      notebookId?: string;
      limit?: number;
    }
  ): Promise<SearchResult[]> => {
    return api.post<SearchResult[]>('/search/keyword', {
      text,
      ...options,
    });
  },
};

export default searchApi;
