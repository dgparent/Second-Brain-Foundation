/**
 * useSearch - Custom hook for search functionality with debouncing
 */
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { searchApi, SearchResult, SearchFilters, SearchType } from '@/lib/api/search';

export interface UseSearchOptions {
  debounceMs?: number;
  defaultType?: SearchType;
  defaultFilters?: SearchFilters;
  autoSearch?: boolean;
}

export interface UseSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
  searchType: SearchType;
  setSearchType: (type: SearchType) => void;
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  search: (query?: string) => Promise<void>;
  clearResults: () => void;
  totalResults: number;
  searchTime: number | null;
}

/**
 * Debounce helper function
 */
function debounce<T extends (...args: Parameters<T>) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => func(...args), wait);
  };
}

/**
 * Custom hook for managing search state with debouncing
 */
export function useSearch(options: UseSearchOptions = {}): UseSearchReturn {
  const {
    debounceMs = 300,
    defaultType = 'hybrid',
    defaultFilters = {},
    autoSearch = true,
  } = options;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<SearchType>(defaultType);
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [totalResults, setTotalResults] = useState(0);
  const [searchTime, setSearchTime] = useState<number | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Execute search
   */
  const executeSearch = useCallback(async (
    searchQuery: string,
    type: SearchType,
    searchFilters: SearchFilters
  ) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setTotalResults(0);
      setSearchTime(null);
      return;
    }

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    const startTime = performance.now();

    try {
      const searchResults = await searchApi.search({
        text: searchQuery,
        type,
        filters: searchFilters,
        limit: 50,
      });

      const endTime = performance.now();
      setSearchTime(Math.round(endTime - startTime));
      setResults(searchResults);
      setTotalResults(searchResults.length);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Ignore abort errors
      }
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Debounced search
   */
  const debouncedSearchRef = useRef(
    debounce((q: string, t: SearchType, f: SearchFilters) => {
      executeSearch(q, t, f);
    }, debounceMs)
  );

  // Update debounced function when debounceMs changes
  useEffect(() => {
    debouncedSearchRef.current = debounce(
      (q: string, t: SearchType, f: SearchFilters) => {
        executeSearch(q, t, f);
      },
      debounceMs
    );
  }, [debounceMs, executeSearch]);

  // Auto-search when query, type, or filters change
  useEffect(() => {
    if (autoSearch) {
      debouncedSearchRef.current(query, searchType, filters);
    }
  }, [query, searchType, filters, autoSearch]);

  /**
   * Manual search trigger
   */
  const search = useCallback(async (overrideQuery?: string) => {
    const searchQuery = overrideQuery ?? query;
    await executeSearch(searchQuery, searchType, filters);
  }, [query, searchType, filters, executeSearch]);

  /**
   * Clear results
   */
  const clearResults = useCallback(() => {
    setResults([]);
    setTotalResults(0);
    setSearchTime(null);
    setError(null);
    setQuery('');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    searchType,
    setSearchType,
    filters,
    setFilters,
    search,
    clearResults,
    totalResults,
    searchTime,
  };
}

export default useSearch;
