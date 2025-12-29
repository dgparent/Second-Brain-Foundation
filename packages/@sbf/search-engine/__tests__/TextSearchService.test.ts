/**
 * TextSearchService tests.
 */

import { TextSearchService, TextSearchConfig, SearchableTable } from '../src/services/TextSearchService';
import { SearchQueryBuilder } from '../src/models/SearchQuery';
import { DatabaseClient, SearchRow } from '../src/types';

// Mock database client
const createMockDb = (rows: SearchRow[] = []): DatabaseClient => ({
  query: jest.fn().mockResolvedValue({ rows }),
});

describe('TextSearchService', () => {
  const defaultTables: SearchableTable[] = [
    {
      name: 'sources',
      entityType: 'source',
      idColumn: 'id',
      titleColumn: 'title',
      contentColumn: 'content',
      vectorColumn: 'search_vector',
      selectColumns: ['notebook_id', 'created_at'],
    },
  ];

  describe('search', () => {
    it('should search with basic query', async () => {
      const mockRows: SearchRow[] = [
        {
          id: '1',
          title: 'Test Source',
          score: 0.5,
          headline: 'This is a <mark>test</mark> document',
          notebook_id: 'nb-1',
          created_at: '2025-01-01T00:00:00Z',
        },
      ];
      
      const db = createMockDb(mockRows);
      const service = new TextSearchService(db, {}, defaultTables);
      
      const query = SearchQueryBuilder.create('test').build();
      const result = await service.search(query, 'tenant-1');
      
      expect(result.results).toHaveLength(1);
      expect(result.results[0].id).toBe('1');
      expect(result.results[0].entityType).toBe('source');
      expect(result.results[0].searchSource).toBe('text');
      expect(db.query).toHaveBeenCalled();
    });

    it('should apply entity type filter', async () => {
      const db = createMockDb([]);
      const tables: SearchableTable[] = [
        { name: 'sources', entityType: 'source', vectorColumn: 'search_vector' },
        { name: 'notes', entityType: 'note', vectorColumn: 'search_vector' },
      ];
      
      const service = new TextSearchService(db, {}, tables);
      
      const query = SearchQueryBuilder.create('test')
        .entityTypes('source')
        .build();
      
      await service.search(query, 'tenant-1');
      
      // Should only query sources table
      expect(db.query).toHaveBeenCalledTimes(1);
      const sql = (db.query as jest.Mock).mock.calls[0][0];
      expect(sql).toContain('sources');
      expect(sql).not.toContain('notes');
    });

    it('should apply notebook filter', async () => {
      const db = createMockDb([]);
      const service = new TextSearchService(db, {}, defaultTables);
      
      const query = SearchQueryBuilder.create('test')
        .inNotebook('nb-123')
        .build();
      
      await service.search(query, 'tenant-1');
      
      const sql = (db.query as jest.Mock).mock.calls[0][0];
      const params = (db.query as jest.Mock).mock.calls[0][1];
      
      expect(sql).toContain('notebook_id = $');
      expect(params).toContain('nb-123');
    });

    it('should apply minimum score filter', async () => {
      const mockRows: SearchRow[] = [
        { id: '1', title: 'High', score: 0.8, headline: 'High score' },
        { id: '2', title: 'Low', score: 0.2, headline: 'Low score' },
      ];
      
      const db = createMockDb(mockRows);
      const service = new TextSearchService(db, {}, defaultTables);
      
      const query = SearchQueryBuilder.create('test')
        .minScore(0.3)
        .build();
      
      const result = await service.search(query, 'tenant-1');
      
      // Only high score should pass after normalization
      expect(result.results.every(r => r.score >= 0.3)).toBe(true);
    });

    it('should normalize scores', async () => {
      const mockRows: SearchRow[] = [
        { id: '1', title: 'Test', score: 2.5, headline: 'Result' },
      ];
      
      const db = createMockDb(mockRows);
      const service = new TextSearchService(db, {}, defaultTables);
      
      const query = SearchQueryBuilder.create('test').build();
      const result = await service.search(query, 'tenant-1');
      
      // Score should be normalized to 0-1
      expect(result.results[0].score).toBeGreaterThan(0);
      expect(result.results[0].score).toBeLessThanOrEqual(1);
      expect(result.results[0].rawScore).toBe(2.5);
    });
  });

  describe('healthCheck', () => {
    it('should return true when database is healthy', async () => {
      const db = createMockDb([{ '?column?': 1 }]);
      const service = new TextSearchService(db, {}, defaultTables);
      
      const healthy = await service.healthCheck();
      expect(healthy).toBe(true);
    });

    it('should return false when database fails', async () => {
      const db: DatabaseClient = {
        query: jest.fn().mockRejectedValue(new Error('Connection failed')),
      };
      const service = new TextSearchService(db, {}, defaultTables);
      
      const healthy = await service.healthCheck();
      expect(healthy).toBe(false);
    });
  });
});
