/**
 * Search filters model.
 * 
 * Defines filters that can be applied to search results.
 */

/**
 * Date range for filtering.
 */
export interface DateRange {
  /** Start date (inclusive) */
  start: Date;
  
  /** End date (inclusive) */
  end: Date;
}

/**
 * Filters to apply to search results.
 */
export interface SearchFilters {
  /** Filter by entity types */
  entityTypes?: string[];
  
  /** Filter by notebook ID */
  notebookId?: string;
  
  /** Filter by multiple notebook IDs */
  notebookIds?: string[];
  
  /** Filter by date range */
  dateRange?: DateRange;
  
  /** Minimum relevance score (0-1) */
  minimumScore?: number;
  
  /** Filter by sensitivity levels */
  sensitivityLevels?: SensitivityLevel[];
  
  /** Filter by tags */
  tags?: string[];
  
  /** Exclude specific entity IDs */
  excludeIds?: string[];
  
  /** Include only specific entity IDs */
  includeOnlyIds?: string[];
  
  /** Custom metadata filters */
  metadata?: Record<string, unknown>;
}

/**
 * Sensitivity levels for content filtering.
 */
export type SensitivityLevel = 'public' | 'personal' | 'confidential' | 'secret';

/**
 * Builder for constructing search filters.
 */
export class SearchFiltersBuilder {
  private filters: SearchFilters = {};
  
  /**
   * Create a new filters builder.
   */
  static create(): SearchFiltersBuilder {
    return new SearchFiltersBuilder();
  }
  
  /**
   * Filter by entity types.
   */
  entityTypes(...types: string[]): this {
    this.filters.entityTypes = types;
    return this;
  }
  
  /**
   * Filter to sources only.
   */
  sourcesOnly(): this {
    this.filters.entityTypes = ['source'];
    return this;
  }
  
  /**
   * Filter to notes only.
   */
  notesOnly(): this {
    this.filters.entityTypes = ['note'];
    return this;
  }
  
  /**
   * Filter to insights only.
   */
  insightsOnly(): this {
    this.filters.entityTypes = ['insight'];
    return this;
  }
  
  /**
   * Filter by notebook.
   */
  inNotebook(notebookId: string): this {
    this.filters.notebookId = notebookId;
    return this;
  }
  
  /**
   * Filter by multiple notebooks.
   */
  inNotebooks(...notebookIds: string[]): this {
    this.filters.notebookIds = notebookIds;
    return this;
  }
  
  /**
   * Filter by date range.
   */
  dateRange(start: Date, end: Date): this {
    this.filters.dateRange = { start, end };
    return this;
  }
  
  /**
   * Filter by last N days.
   */
  lastDays(days: number): this {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    this.filters.dateRange = { start, end };
    return this;
  }
  
  /**
   * Filter by last N hours.
   */
  lastHours(hours: number): this {
    const end = new Date();
    const start = new Date();
    start.setHours(start.getHours() - hours);
    this.filters.dateRange = { start, end };
    return this;
  }
  
  /**
   * Set minimum score.
   */
  minScore(score: number): this {
    this.filters.minimumScore = score;
    return this;
  }
  
  /**
   * Filter by sensitivity levels.
   */
  sensitivity(...levels: SensitivityLevel[]): this {
    this.filters.sensitivityLevels = levels;
    return this;
  }
  
  /**
   * Filter to public content only.
   */
  publicOnly(): this {
    this.filters.sensitivityLevels = ['public'];
    return this;
  }
  
  /**
   * Filter by tags.
   */
  withTags(...tags: string[]): this {
    this.filters.tags = tags;
    return this;
  }
  
  /**
   * Exclude specific IDs.
   */
  exclude(...ids: string[]): this {
    this.filters.excludeIds = ids;
    return this;
  }
  
  /**
   * Include only specific IDs.
   */
  includeOnly(...ids: string[]): this {
    this.filters.includeOnlyIds = ids;
    return this;
  }
  
  /**
   * Add custom metadata filter.
   */
  withMetadata(key: string, value: unknown): this {
    this.filters.metadata = {
      ...this.filters.metadata,
      [key]: value,
    };
    return this;
  }
  
  /**
   * Build the filters.
   */
  build(): SearchFilters {
    return { ...this.filters };
  }
}

/**
 * Check if filters match a result.
 */
export function filtersMatch(
  filters: SearchFilters,
  result: {
    entityType?: string;
    notebookId?: string;
    createdAt?: string | Date;
    score?: number;
    id?: string;
    sensitivity?: SensitivityLevel;
    tags?: string[];
    metadata?: Record<string, unknown>;
  }
): boolean {
  // Entity type filter
  if (filters.entityTypes?.length && result.entityType) {
    if (!filters.entityTypes.includes(result.entityType)) {
      return false;
    }
  }
  
  // Notebook filter
  if (filters.notebookId && result.notebookId !== filters.notebookId) {
    return false;
  }
  
  // Multiple notebooks filter
  if (filters.notebookIds?.length && result.notebookId) {
    if (!filters.notebookIds.includes(result.notebookId)) {
      return false;
    }
  }
  
  // Date range filter
  if (filters.dateRange && result.createdAt) {
    const date = typeof result.createdAt === 'string' 
      ? new Date(result.createdAt) 
      : result.createdAt;
    if (date < filters.dateRange.start || date > filters.dateRange.end) {
      return false;
    }
  }
  
  // Minimum score filter
  if (filters.minimumScore !== undefined && result.score !== undefined) {
    if (result.score < filters.minimumScore) {
      return false;
    }
  }
  
  // Exclude IDs filter
  if (filters.excludeIds?.length && result.id) {
    if (filters.excludeIds.includes(result.id)) {
      return false;
    }
  }
  
  // Include only IDs filter
  if (filters.includeOnlyIds?.length && result.id) {
    if (!filters.includeOnlyIds.includes(result.id)) {
      return false;
    }
  }
  
  // Sensitivity filter
  if (filters.sensitivityLevels?.length && result.sensitivity) {
    if (!filters.sensitivityLevels.includes(result.sensitivity)) {
      return false;
    }
  }
  
  // Tags filter
  if (filters.tags?.length && result.tags) {
    const hasAllTags = filters.tags.every(tag => result.tags!.includes(tag));
    if (!hasAllTags) {
      return false;
    }
  }
  
  return true;
}
