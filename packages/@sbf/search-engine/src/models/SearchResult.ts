/**
 * Search result model.
 * 
 * Represents a single search result with metadata and relevance scores.
 */

/**
 * Source of the search result.
 */
export type SearchResultSource = 'text' | 'vector' | 'hybrid';

/**
 * A single search result.
 */
export interface SearchResult {
  /** Unique identifier of the matched entity */
  id: string;
  
  /** Type of entity (source, note, insight, etc.) */
  entityType: string;
  
  /** Title of the entity */
  title: string | null;
  
  /** Content snippet with highlights */
  snippet: string;
  
  /** Full content (optional, if requested) */
  content?: string;
  
  /** Relevance score (normalized 0-1) */
  score: number;
  
  /** Raw score before normalization */
  rawScore?: number;
  
  /** Source of this result (text search, vector search, or combined) */
  searchSource: SearchResultSource;
  
  /** Notebook ID if applicable */
  notebookId?: string;
  
  /** When the entity was created */
  createdAt?: string;
  
  /** When the entity was last updated */
  updatedAt?: string;
  
  /** Additional metadata */
  metadata?: Record<string, unknown>;
  
  /** Highlighted text matches */
  highlights?: SearchHighlight[];
}

/**
 * A highlighted text match.
 */
export interface SearchHighlight {
  /** Field that was matched */
  field: string;
  
  /** Matched text with highlight markers */
  text: string;
  
  /** Start position in original text */
  start?: number;
  
  /** End position in original text */
  end?: number;
}

/**
 * Paginated search results.
 */
export interface SearchResultPage {
  /** Search results for this page */
  results: SearchResult[];
  
  /** Total number of matching results */
  total: number;
  
  /** Current page offset */
  offset: number;
  
  /** Results per page */
  limit: number;
  
  /** Whether there are more results */
  hasMore: boolean;
  
  /** Query execution time in milliseconds */
  executionTimeMs?: number;
  
  /** Sources used for search */
  sources: SearchResultSource[];
}

/**
 * Helper to create a search result.
 */
export function createSearchResult(
  data: Partial<SearchResult> & { id: string; entityType: string }
): SearchResult {
  return {
    id: data.id,
    entityType: data.entityType,
    title: data.title ?? null,
    snippet: data.snippet ?? '',
    score: data.score ?? 0,
    searchSource: data.searchSource ?? 'text',
    ...data,
  };
}

/**
 * Sort results by score descending.
 */
export function sortByScore(results: SearchResult[]): SearchResult[] {
  return [...results].sort((a, b) => b.score - a.score);
}

/**
 * Filter results by minimum score.
 */
export function filterByMinScore(
  results: SearchResult[],
  minScore: number
): SearchResult[] {
  return results.filter(r => r.score >= minScore);
}

/**
 * Group results by entity type.
 */
export function groupByEntityType(
  results: SearchResult[]
): Map<string, SearchResult[]> {
  const groups = new Map<string, SearchResult[]>();
  
  for (const result of results) {
    const existing = groups.get(result.entityType) ?? [];
    existing.push(result);
    groups.set(result.entityType, existing);
  }
  
  return groups;
}
