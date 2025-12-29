/**
 * HybridSearchService tests.
 */

import { HybridSearchService } from '../src/services/HybridSearchService';
import { TextSearchService } from '../src/services/TextSearchService';
import { VectorSearchService } from '../src/services/VectorSearchService';
import { SearchQueryBuilder } from '../src/models/SearchQuery';
import { SearchResultPage } from '../src/models/SearchResult';

// Create mock services
const createMockTextSearch = (results: Partial<SearchResultPage> = {}): TextSearchService => {
  const mock = {
    name: 'text-search',
    search: jest.fn().mockResolvedValue({
      results: results.results ?? [],
      total: results.total ?? 0,
      offset: 0,
      limit: 100,
      hasMore: false,
      sources: ['text'],
      ...results,
    }),
    healthCheck: jest.fn().mockResolvedValue(true),
  } as unknown as TextSearchService;
  return mock;
};

const createMockVectorSearch = (results: Partial<SearchResultPage> = {}): VectorSearchService => {
  const mock = {
    name: 'vector-search',
    search: jest.fn().mockResolvedValue({
      results: results.results ?? [],
      total: results.total ?? 0,
      offset: 0,
      limit: 100,
      hasMore: false,
      sources: ['vector'],
      ...results,
    }),
    healthCheck: jest.fn().mockResolvedValue(true),
  } as unknown as VectorSearchService;
  return mock;
};

describe('HybridSearchService', () => {
  describe('search', () => {
    it('should combine text and vector results', async () => {
      const textSearch = createMockTextSearch({
        results: [
          {
            id: '1',
            entityType: 'source',
            title: 'Text Result',
            snippet: 'Found via text search',
            score: 0.8,
            searchSource: 'text',
          },
        ],
        total: 1,
      });
      
      const vectorSearch = createMockVectorSearch({
        results: [
          {
            id: '2',
            entityType: 'note',
            title: 'Vector Result',
            snippet: 'Found via vector search',
            score: 0.9,
            searchSource: 'vector',
          },
        ],
        total: 1,
      });
      
      const service = new HybridSearchService(textSearch, vectorSearch);
      const query = SearchQueryBuilder.create('test query').build();
      
      const result = await service.search(query, 'tenant-1');
      
      expect(result.results.length).toBeGreaterThanOrEqual(2);
      expect(result.sources).toContain('text');
      expect(result.sources).toContain('vector');
    });

    it('should deduplicate results with same ID', async () => {
      const textSearch = createMockTextSearch({
        results: [
          {
            id: 'shared-1',
            entityType: 'source',
            title: 'Shared Result',
            snippet: 'From text',
            score: 0.7,
            searchSource: 'text',
          },
        ],
      });
      
      const vectorSearch = createMockVectorSearch({
        results: [
          {
            id: 'shared-1', // Same ID
            entityType: 'source',
            title: 'Shared Result',
            snippet: 'From vector',
            score: 0.8,
            searchSource: 'vector',
          },
        ],
      });
      
      const service = new HybridSearchService(textSearch, vectorSearch);
      const query = SearchQueryBuilder.create('test').build();
      
      const result = await service.search(query, 'tenant-1');
      
      // Should have deduplicated to single result
      const sharedResults = result.results.filter(r => r.id === 'shared-1');
      expect(sharedResults).toHaveLength(1);
    });

    it('should use text-only when specified', async () => {
      const textSearch = createMockTextSearch({
        results: [{ id: '1', entityType: 'source', title: 'Text', snippet: '', score: 0.5, searchSource: 'text' }],
      });
      const vectorSearch = createMockVectorSearch();
      
      const service = new HybridSearchService(textSearch, vectorSearch);
      const query = SearchQueryBuilder.create('test').textOnly().build();
      
      await service.search(query, 'tenant-1');
      
      expect(textSearch.search).toHaveBeenCalled();
      expect(vectorSearch.search).not.toHaveBeenCalled();
    });

    it('should use vector-only when specified', async () => {
      const textSearch = createMockTextSearch();
      const vectorSearch = createMockVectorSearch({
        results: [{ id: '1', entityType: 'source', title: 'Vector', snippet: '', score: 0.5, searchSource: 'vector' }],
      });
      
      const service = new HybridSearchService(textSearch, vectorSearch);
      const query = SearchQueryBuilder.create('test').vectorOnly().build();
      
      await service.search(query, 'tenant-1');
      
      expect(textSearch.search).not.toHaveBeenCalled();
      expect(vectorSearch.search).toHaveBeenCalled();
    });
  });

  describe('healthCheck', () => {
    it('should return true if at least one service is healthy', async () => {
      const textSearch = createMockTextSearch();
      const vectorSearch = createMockVectorSearch();
      (textSearch.healthCheck as jest.Mock).mockResolvedValue(true);
      (vectorSearch.healthCheck as jest.Mock).mockResolvedValue(false);
      
      const service = new HybridSearchService(textSearch, vectorSearch);
      
      const healthy = await service.healthCheck();
      expect(healthy).toBe(true);
    });

    it('should return false if both services are unhealthy', async () => {
      const textSearch = createMockTextSearch();
      const vectorSearch = createMockVectorSearch();
      (textSearch.healthCheck as jest.Mock).mockResolvedValue(false);
      (vectorSearch.healthCheck as jest.Mock).mockResolvedValue(false);
      
      const service = new HybridSearchService(textSearch, vectorSearch);
      
      const healthy = await service.healthCheck();
      expect(healthy).toBe(false);
    });
  });

  describe('getters', () => {
    it('should expose underlying services', () => {
      const textSearch = createMockTextSearch();
      const vectorSearch = createMockVectorSearch();
      
      const service = new HybridSearchService(textSearch, vectorSearch);
      
      expect(service.getTextSearchService()).toBe(textSearch);
      expect(service.getVectorSearchService()).toBe(vectorSearch);
    });
  });
});
