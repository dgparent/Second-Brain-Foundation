/**
 * Tests for InsightService.
 */

import { InsightService, createInsightService } from '../src/services/InsightService';
import { TransformationService } from '../src/services/TransformationService';
import { InMemorySourceInsightRepository } from '../src/models/SourceInsight';
import { 
  InMemoryTransformationRepository, 
  createTransformation 
} from '../src/models/Transformation';
import { InMemoryTransformationResultRepository } from '../src/models/TransformationResult';
import { InsightType } from '../src/types';

// Mock TransformationService
const createMockTransformationService = () => ({
  execute: jest.fn().mockResolvedValue({
    success: true,
    result: {
      id: 'result-1',
      output: 'Generated insight content',
      inputTokens: 100,
      outputTokens: 50,
      cost: 0.001,
    },
    parsed: undefined,
  }),
});

describe('InsightService', () => {
  let service: InsightService;
  let insightRepo: InMemorySourceInsightRepository;
  let transformationRepo: InMemoryTransformationRepository;
  let mockTransformationService: ReturnType<typeof createMockTransformationService>;
  
  beforeEach(async () => {
    mockTransformationService = createMockTransformationService();
    insightRepo = new InMemorySourceInsightRepository();
    transformationRepo = new InMemoryTransformationRepository();
    
    // Create system transformations
    await transformationRepo.create(createTransformation({
      tenantId: null,
      name: 'system:summary',
      promptTemplate: 'Generate summary',
      outputFormat: 'markdown',
    }));
    
    await transformationRepo.create(createTransformation({
      tenantId: null,
      name: 'system:key-insights',
      promptTemplate: 'Generate key points',
      outputFormat: 'json',
    }));
    
    await transformationRepo.create(createTransformation({
      tenantId: null,
      name: 'system:auto-tags',
      promptTemplate: 'Generate tags',
      outputFormat: 'json',
    }));
    
    service = createInsightService({
      transformationService: mockTransformationService as any,
      insightRepo,
      transformationRepo,
      autoGenerate: true,
      defaultInsightTypes: ['summary', 'key-points', 'tags'],
    });
  });
  
  describe('generateInsights', () => {
    it('should generate default insight types', async () => {
      const result = await service.generateInsights({
        sourceId: 'source-1',
        tenantId: 'tenant-1',
        content: 'Test content',
        title: 'Test Title',
      });
      
      expect(result.count).toBe(3);
      expect(result.insights.length).toBe(3);
      expect(result.errors.length).toBe(0);
      expect(mockTransformationService.execute).toHaveBeenCalledTimes(3);
    });
    
    it('should generate specific insight types', async () => {
      const result = await service.generateInsights({
        sourceId: 'source-1',
        tenantId: 'tenant-1',
        content: 'Test content',
        insightTypes: ['summary'],
      });
      
      expect(result.count).toBe(1);
      expect(result.insights[0].insightType).toBe('summary');
    });
    
    it('should track token usage and cost', async () => {
      const result = await service.generateInsights({
        sourceId: 'source-1',
        tenantId: 'tenant-1',
        content: 'Test content',
        insightTypes: ['summary'],
      });
      
      expect(result.totalTokens).toBe(150); // 100 + 50
      expect(result.totalCost).toBe(0.001);
    });
    
    it('should handle transformation failures', async () => {
      mockTransformationService.execute
        .mockResolvedValueOnce({
          success: true,
          result: { id: 'r1', output: 'Success', inputTokens: 50, outputTokens: 25, cost: 0.0005 },
        })
        .mockResolvedValueOnce({
          success: false,
          result: { id: 'r2', output: '', inputTokens: 0, outputTokens: 0, cost: 0 },
          error: 'Model error',
        })
        .mockResolvedValueOnce({
          success: true,
          result: { id: 'r3', output: 'Success', inputTokens: 50, outputTokens: 25, cost: 0.0005 },
        });
      
      const result = await service.generateInsights({
        sourceId: 'source-1',
        tenantId: 'tenant-1',
        content: 'Test content',
      });
      
      expect(result.count).toBe(2);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0].type).toBe('key-points');
    });
    
    it('should record errors for missing transformations', async () => {
      const customService = createInsightService({
        transformationService: mockTransformationService as any,
        insightRepo,
        transformationRepo,
        defaultInsightTypes: ['custom'] as InsightType[], // No system:custom transformation
      });
      
      const result = await customService.generateInsights({
        sourceId: 'source-1',
        tenantId: 'tenant-1',
        content: 'Test content',
        insightTypes: ['custom'],
      });
      
      expect(result.count).toBe(0);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0].error).toContain('No transformation found');
    });
    
    it('should set truth level to L3 for AI-generated insights', async () => {
      const result = await service.generateInsights({
        sourceId: 'source-1',
        tenantId: 'tenant-1',
        content: 'Test content',
        insightTypes: ['summary'],
      });
      
      expect(result.insights[0].truthLevel).toBe('L3');
    });
    
    it('should include structured data when parsed', async () => {
      mockTransformationService.execute.mockResolvedValue({
        success: true,
        result: { id: 'r1', output: '{"tags": ["a", "b"]}', inputTokens: 50, outputTokens: 25, cost: 0.0005 },
        parsed: { tags: ['a', 'b'] },
      });
      
      const result = await service.generateInsights({
        sourceId: 'source-1',
        tenantId: 'tenant-1',
        content: 'Test content',
        insightTypes: ['tags'],
      });
      
      expect(result.insights[0].parsedContent).toEqual({ tags: ['a', 'b'] });
    });
  });
  
  describe('getInsightsForSource', () => {
    it('should return all insights for source', async () => {
      await service.generateInsights({
        sourceId: 'source-1',
        tenantId: 'tenant-1',
        content: 'Test content',
      });
      
      const insights = await service.getInsightsForSource('source-1', 'tenant-1');
      
      expect(insights.length).toBe(3);
    });
    
    it('should filter by tenant', async () => {
      await service.generateInsights({
        sourceId: 'source-1',
        tenantId: 'tenant-1',
        content: 'Content 1',
        insightTypes: ['summary'],
      });
      
      await service.generateInsights({
        sourceId: 'source-1',
        tenantId: 'tenant-2',
        content: 'Content 2',
        insightTypes: ['summary'],
      });
      
      const tenant1Insights = await service.getInsightsForSource('source-1', 'tenant-1');
      const tenant2Insights = await service.getInsightsForSource('source-1', 'tenant-2');
      
      expect(tenant1Insights.length).toBe(1);
      expect(tenant2Insights.length).toBe(1);
    });
  });
  
  describe('getInsight', () => {
    it('should return specific insight type', async () => {
      await service.generateInsights({
        sourceId: 'source-1',
        tenantId: 'tenant-1',
        content: 'Test content',
      });
      
      const insight = await service.getInsight('source-1', 'tenant-1', 'summary');
      
      expect(insight).not.toBeNull();
      expect(insight?.insightType).toBe('summary');
    });
    
    it('should return null for missing insight type', async () => {
      await service.generateInsights({
        sourceId: 'source-1',
        tenantId: 'tenant-1',
        content: 'Test content',
        insightTypes: ['summary'],
      });
      
      const insight = await service.getInsight('source-1', 'tenant-1', 'sentiment');
      
      expect(insight).toBeNull();
    });
    
    it('should not return invalidated insights', async () => {
      await service.generateInsights({
        sourceId: 'source-1',
        tenantId: 'tenant-1',
        content: 'Test content',
        insightTypes: ['summary'],
      });
      
      await service.invalidateSourceInsights('source-1', 'tenant-1');
      
      const insight = await service.getInsight('source-1', 'tenant-1', 'summary');
      
      expect(insight).toBeNull();
    });
  });
  
  describe('promoteInsight', () => {
    it('should promote insight to user truth', async () => {
      const generated = await service.generateInsights({
        sourceId: 'source-1',
        tenantId: 'tenant-1',
        content: 'Test content',
        insightTypes: ['summary'],
      });
      
      const insightId = generated.insights[0].id;
      const promoted = await service.promoteInsight(insightId, 'tenant-1', 'user-1');
      
      expect(promoted.truthLevel).toBe('U1');
      expect(promoted.promotedBy).toBe('user-1');
      expect(promoted.promotedAt).toBeDefined();
    });
    
    it('should throw for non-existent insight', async () => {
      await expect(service.promoteInsight('non-existent', 'tenant-1', 'user-1'))
        .rejects.toThrow('Insight not found');
    });
    
    it('should throw for wrong tenant', async () => {
      const generated = await service.generateInsights({
        sourceId: 'source-1',
        tenantId: 'tenant-1',
        content: 'Test content',
        insightTypes: ['summary'],
      });
      
      await expect(service.promoteInsight(generated.insights[0].id, 'tenant-2', 'user-1'))
        .rejects.toThrow('does not belong to tenant');
    });
  });
  
  describe('invalidateInsight', () => {
    it('should invalidate single insight', async () => {
      const generated = await service.generateInsights({
        sourceId: 'source-1',
        tenantId: 'tenant-1',
        content: 'Test content',
        insightTypes: ['summary'],
      });
      
      await service.invalidateInsight(generated.insights[0].id, 'tenant-1');
      
      const insights = await service.getInsightsForSource('source-1', 'tenant-1');
      expect(insights[0].invalidatedAt).toBeDefined();
    });
  });
  
  describe('invalidateSourceInsights', () => {
    it('should invalidate all insights for source', async () => {
      await service.generateInsights({
        sourceId: 'source-1',
        tenantId: 'tenant-1',
        content: 'Test content',
      });
      
      const count = await service.invalidateSourceInsights('source-1', 'tenant-1');
      
      expect(count).toBe(3);
      
      const insights = await service.getInsightsForSource('source-1', 'tenant-1');
      expect(insights.every(i => i.invalidatedAt !== undefined)).toBe(true);
    });
  });
  
  describe('regenerateInsights', () => {
    it('should invalidate old and generate new', async () => {
      await service.generateInsights({
        sourceId: 'source-1',
        tenantId: 'tenant-1',
        content: 'Old content',
        insightTypes: ['summary'],
      });
      
      const result = await service.regenerateInsights(
        'source-1',
        'tenant-1',
        'New content',
        { insightTypes: ['summary'] }
      );
      
      expect(result.count).toBe(1);
      
      const allInsights = await service.getInsightsForSource('source-1', 'tenant-1');
      expect(allInsights.length).toBe(2);
      expect(allInsights.filter(i => i.invalidatedAt).length).toBe(1);
    });
  });
  
  describe('getInsightSummary', () => {
    it('should return summary statistics', async () => {
      await service.generateInsights({
        sourceId: 'source-1',
        tenantId: 'tenant-1',
        content: 'Test content',
      });
      
      const summary = await service.getInsightSummary('tenant-1');
      
      expect(summary.totalInsights).toBe(3);
      expect(summary.byType['summary']).toBe(1);
      expect(summary.byType['key-points']).toBe(1);
      expect(summary.byType['tags']).toBe(1);
      expect(summary.promotedCount).toBe(0);
      expect(summary.invalidatedCount).toBe(0);
    });
  });
  
  describe('configuration', () => {
    it('should report auto-generate setting', () => {
      expect(service.shouldAutoGenerate()).toBe(true);
    });
    
    it('should return default insight types', () => {
      const types = service.getDefaultInsightTypes();
      
      expect(types).toContain('summary');
      expect(types).toContain('key-points');
      expect(types).toContain('tags');
    });
  });
});
