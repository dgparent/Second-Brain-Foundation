/**
 * VectorSearchService tests.
 */

import { VectorSearchService, VectorSearchConfig } from '../src/services/VectorSearchService';
import { SearchQueryBuilder } from '../src/models/SearchQuery';
import { EmbeddingProvider } from '../src/types';

// Mock Pinecone - we need to mock the module
jest.mock('@pinecone-database/pinecone', () => ({
  Pinecone: jest.fn().mockImplementation(() => ({
    index: jest.fn().mockReturnValue({
      query: jest.fn().mockResolvedValue({
        matches: [
          {
            id: 'vec-1',
            score: 0.95,
            metadata: {
              entity_type: 'source',
              title: 'Vector Match',
              snippet: 'This is a semantic match',
              notebook_id: 'nb-1',
              tenant_id: 'tenant-1',
            },
          },
        ],
      }),
      describeIndexStats: jest.fn().mockResolvedValue({
        totalRecordCount: 1000,
      }),
      upsert: jest.fn().mockResolvedValue({}),
      deleteMany: jest.fn().mockResolvedValue({}),
    }),
  })),
}));

// Mock embedding provider
const createMockEmbeddingProvider = (): EmbeddingProvider => ({
  embed: jest.fn().mockResolvedValue(new Array(1536).fill(0.1)),
  embedBatch: jest.fn().mockResolvedValue([new Array(1536).fill(0.1)]),
});

describe('VectorSearchService', () => {
  const defaultConfig: VectorSearchConfig = {
    apiKey: 'test-api-key',
    indexName: 'test-index',
  };

  describe('search', () => {
    it('should search with basic query', async () => {
      const embedding = createMockEmbeddingProvider();
      const service = new VectorSearchService(embedding, defaultConfig);
      
      const query = SearchQueryBuilder.create('semantic search test').build();
      const result = await service.search(query, 'tenant-1');
      
      expect(result.results).toHaveLength(1);
      expect(result.results[0].id).toBe('vec-1');
      expect(result.results[0].entityType).toBe('source');
      expect(result.results[0].searchSource).toBe('vector');
      expect(result.results[0].score).toBe(0.95);
      expect(embedding.embed).toHaveBeenCalledWith('semantic search test');
    });

    it('should include execution time', async () => {
      const embedding = createMockEmbeddingProvider();
      const service = new VectorSearchService(embedding, defaultConfig);
      
      const query = SearchQueryBuilder.create('test').build();
      const result = await service.search(query, 'tenant-1');
      
      expect(result.executionTimeMs).toBeDefined();
      expect(result.executionTimeMs).toBeGreaterThanOrEqual(0);
    });
  });

  describe('healthCheck', () => {
    it('should return true when Pinecone is healthy', async () => {
      const embedding = createMockEmbeddingProvider();
      const service = new VectorSearchService(embedding, defaultConfig);
      
      const healthy = await service.healthCheck();
      expect(healthy).toBe(true);
    });
  });
});
