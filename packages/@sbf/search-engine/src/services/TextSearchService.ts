/**
 * Text search service using PostgreSQL Full-Text Search.
 * 
 * Provides text search capabilities using tsvector/tsquery.
 */

import { BaseSearchService, BaseSearchConfig } from './SearchService';
import { SearchQuery } from '../models/SearchQuery';
import { SearchResult, SearchResultPage, SearchHighlight } from '../models/SearchResult';
import { SearchFilters, filtersMatch } from '../models/SearchFilters';
import { DatabaseClient, SearchRow } from '../types';

/**
 * PostgreSQL FTS configuration.
 */
export interface TextSearchConfig extends BaseSearchConfig {
  /** PostgreSQL text search configuration (e.g., 'english') */
  textSearchConfig?: string;
  
  /** Column name for the search vector */
  vectorColumn?: string;
  
  /** Enable headline generation */
  enableHeadlines?: boolean;
  
  /** Headline options */
  headlineOptions?: {
    startSel?: string;
    stopSel?: string;
    maxWords?: number;
    minWords?: number;
    maxFragments?: number;
  };
}

/**
 * Table configuration for text search.
 */
export interface SearchableTable {
  /** Table name */
  name: string;
  
  /** Entity type for results from this table */
  entityType: string;
  
  /** ID column name */
  idColumn?: string;
  
  /** Title column name */
  titleColumn?: string;
  
  /** Content column for headline */
  contentColumn?: string;
  
  /** Search vector column */
  vectorColumn?: string;
  
  /** Additional columns to select */
  selectColumns?: string[];
}

/**
 * Default searchable tables.
 */
const DEFAULT_TABLES: SearchableTable[] = [
  {
    name: 'sources',
    entityType: 'source',
    idColumn: 'id',
    titleColumn: 'title',
    contentColumn: 'content',
    vectorColumn: 'search_vector',
    selectColumns: ['notebook_id', 'created_at', 'updated_at', 'sensitivity'],
  },
  {
    name: 'notes',
    entityType: 'note',
    idColumn: 'id',
    titleColumn: 'title',
    contentColumn: 'content',
    vectorColumn: 'search_vector',
    selectColumns: ['notebook_id', 'created_at', 'updated_at'],
  },
  {
    name: 'insights',
    entityType: 'insight',
    idColumn: 'id',
    titleColumn: 'title',
    contentColumn: 'content',
    vectorColumn: 'search_vector',
    selectColumns: ['notebook_id', 'created_at', 'updated_at'],
  },
];

/**
 * Text search service implementation.
 */
export class TextSearchService extends BaseSearchService {
  readonly name = 'text-search';
  
  private readonly db: DatabaseClient;
  private readonly textConfig: Required<TextSearchConfig>;
  private readonly tables: SearchableTable[];
  
  constructor(
    db: DatabaseClient,
    config: TextSearchConfig = {},
    tables: SearchableTable[] = DEFAULT_TABLES
  ) {
    super(config);
    this.db = db;
    this.textConfig = {
      ...this.config,
      textSearchConfig: config.textSearchConfig ?? 'english',
      vectorColumn: config.vectorColumn ?? 'search_vector',
      enableHeadlines: config.enableHeadlines ?? true,
      headlineOptions: {
        startSel: config.headlineOptions?.startSel ?? '<mark>',
        stopSel: config.headlineOptions?.stopSel ?? '</mark>',
        maxWords: config.headlineOptions?.maxWords ?? 35,
        minWords: config.headlineOptions?.minWords ?? 15,
        maxFragments: config.headlineOptions?.maxFragments ?? 3,
      },
    };
    this.tables = tables;
  }
  
  /**
   * Search across all configured tables.
   */
  async search(query: SearchQuery, tenantId: string): Promise<SearchResultPage> {
    const startTime = Date.now();
    
    // Filter tables by entity type if specified
    const tablesToSearch = this.filterTables(query.filters);
    
    // Search each table in parallel
    const searchPromises = tablesToSearch.map(table =>
      this.searchTable(table, query, tenantId)
    );
    
    const tableResults = await Promise.all(searchPromises);
    
    // Flatten and sort results
    let allResults = tableResults.flat();
    allResults.sort((a, b) => b.score - a.score);
    
    // Apply minimum score filter
    const minScore = this.getMinScore(query);
    allResults = this.applyMinScoreFilter(allResults, minScore);
    
    const executionTimeMs = Date.now() - startTime;
    
    return this.buildResultPage(allResults, query, 'text', executionTimeMs);
  }
  
  /**
   * Check database connection health.
   */
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.db.query('SELECT 1');
      return result.rows.length > 0;
    } catch {
      return false;
    }
  }
  
  /**
   * Filter tables based on entity type filters.
   */
  private filterTables(filters?: SearchFilters): SearchableTable[] {
    if (!filters?.entityTypes?.length) {
      return this.tables;
    }
    
    return this.tables.filter(t =>
      filters.entityTypes!.includes(t.entityType)
    );
  }
  
  /**
   * Search a single table.
   */
  private async searchTable(
    table: SearchableTable,
    query: SearchQuery,
    tenantId: string
  ): Promise<SearchResult[]> {
    const tsConfig = this.textConfig.textSearchConfig;
    const vectorCol = table.vectorColumn ?? this.textConfig.vectorColumn;
    const contentCol = table.contentColumn ?? 'content';
    
    // Build the query
    const limit = this.normalizeLimit(query) * 2; // Get extra for filtering
    
    // Build headline options
    const headlineOpts = this.buildHeadlineOptions();
    
    // Build WHERE conditions
    const conditions: string[] = ['tenant_id = $1'];
    const params: unknown[] = [tenantId];
    let paramIndex = 2;
    
    // Add text search condition
    conditions.push(`${vectorCol} @@ plainto_tsquery('${tsConfig}', $${paramIndex})`);
    params.push(query.text);
    paramIndex++;
    
    // Add notebook filter
    if (query.filters?.notebookId) {
      conditions.push(`notebook_id = $${paramIndex}`);
      params.push(query.filters.notebookId);
      paramIndex++;
    }
    
    // Add notebook IDs filter
    if (query.filters?.notebookIds?.length) {
      conditions.push(`notebook_id = ANY($${paramIndex})`);
      params.push(query.filters.notebookIds);
      paramIndex++;
    }
    
    // Add date range filter
    if (query.filters?.dateRange) {
      conditions.push(`created_at >= $${paramIndex}`);
      params.push(query.filters.dateRange.start);
      paramIndex++;
      conditions.push(`created_at <= $${paramIndex}`);
      params.push(query.filters.dateRange.end);
      paramIndex++;
    }
    
    // Add exclude IDs filter
    if (query.filters?.excludeIds?.length) {
      conditions.push(`${table.idColumn ?? 'id'} != ALL($${paramIndex})`);
      params.push(query.filters.excludeIds);
      paramIndex++;
    }
    
    // Build SELECT columns
    const selectCols = [
      `${table.idColumn ?? 'id'} as id`,
      `${table.titleColumn ?? 'title'} as title`,
      `ts_rank(${vectorCol}, plainto_tsquery('${tsConfig}', $2)) as score`,
    ];
    
    if (this.textConfig.enableHeadlines) {
      selectCols.push(
        `ts_headline('${tsConfig}', ${contentCol}, plainto_tsquery('${tsConfig}', $2), '${headlineOpts}') as headline`
      );
    }
    
    // Add extra columns
    if (table.selectColumns?.length) {
      selectCols.push(...table.selectColumns);
    }
    
    const sql = `
      SELECT ${selectCols.join(', ')}
      FROM ${table.name}
      WHERE ${conditions.join(' AND ')}
      ORDER BY score DESC
      LIMIT ${limit}
    `;
    
    const result = await this.db.query<SearchRow>(sql, params);
    
    // Convert to SearchResult
    return result.rows.map(row => this.rowToResult(row, table));
  }
  
  /**
   * Build headline options string.
   */
  private buildHeadlineOptions(): string {
    const opts = this.textConfig.headlineOptions;
    return [
      `StartSel=${opts.startSel}`,
      `StopSel=${opts.stopSel}`,
      `MaxWords=${opts.maxWords}`,
      `MinWords=${opts.minWords}`,
      `MaxFragments=${opts.maxFragments}`,
    ].join(', ');
  }
  
  /**
   * Convert a database row to a search result.
   */
  private rowToResult(row: SearchRow, table: SearchableTable): SearchResult {
    const highlights: SearchHighlight[] = [];
    
    if (row.headline) {
      highlights.push({
        field: 'content',
        text: row.headline,
      });
    }
    
    return {
      id: row.id,
      entityType: table.entityType,
      title: row.title ?? null,
      snippet: row.headline ?? '',
      rawScore: row.score,
      score: this.normalizeScore(row.score),
      searchSource: 'text',
      notebookId: row.notebook_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      highlights,
      metadata: {
        sensitivity: row.sensitivity,
      },
    };
  }
  
  /**
   * Normalize PostgreSQL ts_rank score to 0-1 range.
   * 
   * ts_rank typically returns values between 0 and 1, but can exceed 1
   * for documents with high term frequency.
   */
  private normalizeScore(score: number): number {
    // Sigmoid-like normalization to map to 0-1
    // This keeps small differences meaningful while capping at 1
    return score / (1 + score);
  }
}
