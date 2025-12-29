/**
 * SearchEmptyState - Empty state for search results
 */
'use client';

import { Search, FileSearch, Filter } from 'lucide-react';

interface SearchEmptyStateProps {
  query: string;
  hasFilters?: boolean;
}

export function SearchEmptyState({ query, hasFilters }: SearchEmptyStateProps) {
  if (!query) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Search className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Search your knowledge base
        </h3>
        <p className="text-sm text-gray-500 max-w-sm">
          Find content across all your sources, notes, and insights.
          Try searching for topics, keywords, or questions.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <FileSearch className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No results found
      </h3>
      <p className="text-sm text-gray-500 max-w-sm mb-4">
        No matches found for "<span className="font-medium">{query}</span>"
        {hasFilters && ' with the current filters'}.
      </p>
      <div className="text-sm text-gray-500 space-y-1">
        <p>Try:</p>
        <ul className="list-disc list-inside text-left">
          <li>Using different keywords</li>
          <li>Checking your spelling</li>
          {hasFilters && <li>Removing some filters</li>}
          <li>Searching for broader terms</li>
        </ul>
      </div>
    </div>
  );
}

export default SearchEmptyState;
