/**
 * Tests for ContentPipelineIntegration.
 */

import {
  ContentPipelineIntegration,
  createContentPipelineIntegration,
  createInsightGenerationHandler,
  SourceIngestedEvent,
} from '../src/integration/ContentPipeline';
import { InsightService } from '../src/services/InsightService';

// Mock InsightService
const createMockInsightService = () => ({
  shouldAutoGenerate: jest.fn().mockReturnValue(true),
  generateInsights: jest.fn().mockResolvedValue({
    insights: [{ id: 'insight-1', insightType: 'summary' }],
    count: 1,
    totalTokens: 100,
    totalCost: 0.001,
    errors: [],
  }),
  invalidateSourceInsights: jest.fn().mockResolvedValue(1),
  regenerateInsights: jest.fn().mockResolvedValue({
    insights: [{ id: 'insight-2', insightType: 'summary' }],
    count: 1,
    totalTokens: 100,
    totalCost: 0.001,
    errors: [],
  }),
});

describe('ContentPipelineIntegration', () => {
  let mockInsightService: ReturnType<typeof createMockInsightService>;
  let pipeline: ContentPipelineIntegration;
  
  const baseEvent: SourceIngestedEvent = {
    sourceId: 'source-1',
    tenantId: 'tenant-1',
    content: 'Test content for processing',
    title: 'Test Document',
    sourceType: 'document',
  };
  
  beforeEach(() => {
    mockInsightService = createMockInsightService();
    pipeline = createContentPipelineIntegration({
      insightService: mockInsightService as any,
      autoGenerate: true,
    });
  });
  
  describe('onSourceIngested', () => {
    it('should generate insights for new source', async () => {
      await pipeline.onSourceIngested(baseEvent);
      
      expect(mockInsightService.generateInsights).toHaveBeenCalledWith({
        sourceId: 'source-1',
        tenantId: 'tenant-1',
        content: 'Test content for processing',
        title: 'Test Document',
        sourceType: 'document',
        metadata: undefined,
      });
    });
    
    it('should not generate if auto-generate is disabled', async () => {
      pipeline.setAutoGenerate(false);
      
      await pipeline.onSourceIngested(baseEvent);
      
      expect(mockInsightService.generateInsights).not.toHaveBeenCalled();
    });
    
    it('should not generate if service auto-generate is disabled', async () => {
      mockInsightService.shouldAutoGenerate.mockReturnValue(false);
      
      await pipeline.onSourceIngested(baseEvent);
      
      expect(mockInsightService.generateInsights).not.toHaveBeenCalled();
    });
    
    it('should invalidate old insights when updating', async () => {
      const updateEvent = { ...baseEvent, isUpdate: true };
      
      await pipeline.onSourceIngested(updateEvent);
      
      expect(mockInsightService.invalidateSourceInsights).toHaveBeenCalledWith(
        'source-1',
        'tenant-1'
      );
      expect(mockInsightService.generateInsights).toHaveBeenCalled();
    });
    
    it('should call onInsightsGenerated callback', async () => {
      const callback = jest.fn();
      const pipelineWithCallback = createContentPipelineIntegration({
        insightService: mockInsightService as any,
        onInsightsGenerated: callback,
      });
      
      await pipelineWithCallback.onSourceIngested(baseEvent);
      
      expect(callback).toHaveBeenCalledWith('source-1', expect.objectContaining({
        count: 1,
      }));
    });
    
    it('should call onError callback on failure', async () => {
      mockInsightService.generateInsights.mockRejectedValue(new Error('API Error'));
      const errorCallback = jest.fn();
      
      const pipelineWithError = createContentPipelineIntegration({
        insightService: mockInsightService as any,
        onError: errorCallback,
      });
      
      await pipelineWithError.onSourceIngested(baseEvent);
      
      expect(errorCallback).toHaveBeenCalledWith('source-1', expect.any(Error));
    });
    
    it('should include metadata in request', async () => {
      const eventWithMeta = {
        ...baseEvent,
        metadata: { author: 'John', tags: ['test'] },
      };
      
      await pipeline.onSourceIngested(eventWithMeta);
      
      expect(mockInsightService.generateInsights).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: { author: 'John', tags: ['test'] },
        })
      );
    });
  });
  
  describe('onSourceUpdated', () => {
    it('should call onSourceIngested with isUpdate flag', async () => {
      const spy = jest.spyOn(pipeline, 'onSourceIngested');
      
      await pipeline.onSourceUpdated(baseEvent);
      
      expect(spy).toHaveBeenCalledWith(expect.objectContaining({
        isUpdate: true,
      }));
    });
  });
  
  describe('regenerateInsights', () => {
    it('should call service regenerateInsights', async () => {
      await pipeline.regenerateInsights(
        'source-1',
        'tenant-1',
        'New content',
        { insightTypes: ['summary'] }
      );
      
      expect(mockInsightService.regenerateInsights).toHaveBeenCalledWith(
        'source-1',
        'tenant-1',
        'New content',
        { insightTypes: ['summary'], invalidateOld: true }
      );
    });
  });
  
  describe('isAutoGenerateEnabled', () => {
    it('should return true when both flags enabled', () => {
      expect(pipeline.isAutoGenerateEnabled()).toBe(true);
    });
    
    it('should return false when pipeline disabled', () => {
      pipeline.setAutoGenerate(false);
      expect(pipeline.isAutoGenerateEnabled()).toBe(false);
    });
    
    it('should return false when service disabled', () => {
      mockInsightService.shouldAutoGenerate.mockReturnValue(false);
      expect(pipeline.isAutoGenerateEnabled()).toBe(false);
    });
  });
});

describe('createInsightGenerationHandler', () => {
  it('should create handler function', () => {
    const mockService = createMockInsightService();
    const handler = createInsightGenerationHandler(mockService as any);
    
    expect(typeof handler).toBe('function');
  });
  
  it('should generate insights when called', async () => {
    const mockService = createMockInsightService();
    const handler = createInsightGenerationHandler(mockService as any);
    
    const result = await handler({
      sourceId: 'source-1',
      tenantId: 'tenant-1',
      content: 'Test content',
    });
    
    expect(mockService.generateInsights).toHaveBeenCalled();
    expect(result.count).toBe(1);
  });
  
  it('should invalidate on update', async () => {
    const mockService = createMockInsightService();
    const handler = createInsightGenerationHandler(mockService as any);
    
    await handler({
      sourceId: 'source-1',
      tenantId: 'tenant-1',
      content: 'Updated content',
      isUpdate: true,
    });
    
    expect(mockService.invalidateSourceInsights).toHaveBeenCalled();
  });
});
