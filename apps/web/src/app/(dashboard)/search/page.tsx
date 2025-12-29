/**
 * Search Page - Hybrid search interface with filters and highlighting
 */
'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  SearchInput,
  SearchFilters,
  SearchResultCard,
  SearchEmptyState,
} from '@/components/search';
import { useSearch } from '@/lib/hooks/useSearch';
import type { SearchType } from '@/lib/api/search';

export default function SearchPage() {
  const {
    query,
    setQuery,
    results,
    isLoading,
    error,
    searchType,
    setSearchType,
    filters,
    setFilters,
    totalResults,
    searchTime,
  } = useSearch({ autoSearch: true });

  const hasFilters =
    (filters.entityTypes?.length || 0) > 0 ||
    (filters.sourceTypes?.length || 0) > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Search</h1>
      </div>

      {/* Search Input */}
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Search across all your content..."
        isLoading={isLoading}
        autoFocus
        className="max-w-2xl"
      />

      {/* Search Type Toggle and Filters */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Tabs
            value={searchType}
            onValueChange={(v) => setSearchType(v as SearchType)}
          >
            <TabsList>
              <TabsTrigger value="hybrid">Hybrid</TabsTrigger>
              <TabsTrigger value="vector">Semantic</TabsTrigger>
              <TabsTrigger value="text">Keyword</TabsTrigger>
            </TabsList>
          </Tabs>

          <SearchFilters filters={filters} onFiltersChange={setFilters} />
        </div>

        {/* Results count and time */}
        {query && !isLoading && results.length > 0 && (
          <div className="text-sm text-gray-500">
            {totalResults} result{totalResults !== 1 ? 's' : ''}
            {searchTime !== null && (
              <span className="ml-1">({searchTime}ms)</span>
            )}
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <strong>Search error:</strong> {error}
        </div>
      )}

      {/* Results */}
      <div className="space-y-4">
        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && (results.length === 0 || !query) && (
          <SearchEmptyState query={query} hasFilters={hasFilters} />
        )}

        {/* Results List */}
        {!isLoading &&
          !error &&
          results.map((result) => (
            <SearchResultCard
              key={`${result.entityType}-${result.id}`}
              result={result}
              query={query}
            />
          ))}
      </div>
    </div>
  );
}
