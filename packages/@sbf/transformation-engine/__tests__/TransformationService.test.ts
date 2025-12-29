/**
 * Tests for TransformationService.
 */

import { 
  TransformationService, 
  createTransformationService 
} from '../src/services/TransformationService';
import { 
  InMemoryTransformationRepository, 
  createTransformation 
} from '../src/models/Transformation';
import { InMemoryTransformationResultRepository } from '../src/models/TransformationResult';
import { TransformationContext } from '../src/types';

// Mock model client
const createMockModelClient = () => ({
  chat: jest.fn().mockResolvedValue({
    choices: [{ message: { content: 'Generated content' } }],
    usage: { promptTokens: 100, completionTokens: 50 },
  }),
});

describe('TransformationService', () => {
  let service: TransformationService;
  let transformationRepo: InMemoryTransformationRepository;
  let resultRepo: InMemoryTransformationResultRepository;
  let mockModelClient: ReturnType<typeof createMockModelClient>;
  
  beforeEach(() => {
    mockModelClient = createMockModelClient();
    transformationRepo = new InMemoryTransformationRepository();
    resultRepo = new InMemoryTransformationResultRepository();
    
    service = createTransformationService({
      modelClient: mockModelClient as any,
      transformationRepo,
      resultRepo,
      defaultModel: 'gpt-4o-mini',
    });
  });
  
  describe('execute', () => {
    it('should execute transformation successfully', async () => {
      // Setup
      const transformation = createTransformation({
        tenantId: null,
        name: 'test-transform',
        promptTemplate: 'Summarize: {{ source.content }}',
        outputFormat: 'markdown',
      });
      await transformationRepo.create(transformation);
      
      const context: TransformationContext = {
        source: {
          id: 'source-1',
          content: 'Test content to summarize',
          title: 'Test',
        },
        tenantId: 'tenant-1',
      };
      
      // Execute
      const result = await service.execute(transformation.id!, context);
      
      // Verify
      expect(result.success).toBe(true);
      expect(result.result.output).toBe('Generated content');
      expect(result.result.sourceId).toBe('source-1');
      expect(mockModelClient.chat).toHaveBeenCalledTimes(1);
    });
    
    it('should handle JSON output', async () => {
      mockModelClient.chat.mockResolvedValue({
        choices: [{ message: { content: '{"summary": "Brief summary"}' } }],
        usage: { promptTokens: 100, completionTokens: 50 },
      });
      
      const transformation = createTransformation({
        tenantId: null,
        name: 'json-transform',
        promptTemplate: 'Generate JSON: {{ source.content }}',
        outputFormat: 'json',
      });
      await transformationRepo.create(transformation);
      
      const context: TransformationContext = {
        source: { id: 'source-1', content: 'Content' },
        tenantId: 'tenant-1',
      };
      
      const result = await service.execute(transformation.id!, context);
      
      expect(result.success).toBe(true);
      expect(result.parsed).toEqual({ summary: 'Brief summary' });
    });
    
    it('should handle execution errors', async () => {
      mockModelClient.chat.mockRejectedValue(new Error('API Error'));
      
      const transformation = createTransformation({
        tenantId: null,
        name: 'error-transform',
        promptTemplate: 'Test: {{ source.content }}',
        outputFormat: 'markdown',
      });
      await transformationRepo.create(transformation);
      
      const context: TransformationContext = {
        source: { id: 'source-1', content: 'Content' },
        tenantId: 'tenant-1',
      };
      
      const result = await service.execute(transformation.id!, context);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('API Error');
      expect(result.result.error).toBe('API Error');
    });
    
    it('should throw for non-existent transformation', async () => {
      const context: TransformationContext = {
        source: { id: 'source-1', content: 'Content' },
        tenantId: 'tenant-1',
      };
      
      await expect(service.execute('non-existent', context))
        .rejects.toThrow('Transformation not found');
    });
    
    it('should track token usage and cost', async () => {
      const transformation = createTransformation({
        tenantId: null,
        name: 'usage-transform',
        promptTemplate: 'Test: {{ source.content }}',
        outputFormat: 'markdown',
      });
      await transformationRepo.create(transformation);
      
      const context: TransformationContext = {
        source: { id: 'source-1', content: 'Content' },
        tenantId: 'tenant-1',
      };
      
      const result = await service.execute(transformation.id!, context);
      
      expect(result.result.inputTokens).toBe(100);
      expect(result.result.outputTokens).toBe(50);
      expect(result.result.cost).toBeGreaterThan(0);
    });
    
    it('should use model override', async () => {
      const transformation = createTransformation({
        tenantId: null,
        name: 'model-transform',
        promptTemplate: 'Test: {{ source.content }}',
        outputFormat: 'markdown',
        modelId: 'gpt-4o-mini',
      });
      await transformationRepo.create(transformation);
      
      const context: TransformationContext = {
        source: { id: 'source-1', content: 'Content' },
        tenantId: 'tenant-1',
      };
      
      await service.execute(transformation.id!, context, { modelOverride: 'gpt-4o' });
      
      expect(mockModelClient.chat).toHaveBeenCalledWith(
        expect.objectContaining({ model: 'gpt-4o' })
      );
    });
  });
  
  describe('getAvailableTransformations', () => {
    it('should return system defaults and tenant-specific', async () => {
      // System default
      await transformationRepo.create(createTransformation({
        tenantId: null,
        name: 'system:summary',
        promptTemplate: 'System summary',
        outputFormat: 'markdown',
      }));
      
      // Tenant specific
      await transformationRepo.create(createTransformation({
        tenantId: 'tenant-1',
        name: 'custom:my-transform',
        promptTemplate: 'Custom transform',
        outputFormat: 'markdown',
      }));
      
      const available = await service.getAvailableTransformations('tenant-1');
      
      expect(available.length).toBe(2);
      expect(available.map(t => t.name)).toContain('system:summary');
      expect(available.map(t => t.name)).toContain('custom:my-transform');
    });
    
    it('should prefer tenant-specific over system default with same name', async () => {
      // System default
      await transformationRepo.create(createTransformation({
        tenantId: null,
        name: 'summary',
        promptTemplate: 'System summary',
        outputFormat: 'markdown',
      }));
      
      // Tenant override
      await transformationRepo.create(createTransformation({
        tenantId: 'tenant-1',
        name: 'summary',
        promptTemplate: 'Custom summary',
        outputFormat: 'markdown',
      }));
      
      const available = await service.getAvailableTransformations('tenant-1');
      
      expect(available.length).toBe(1);
      expect(available[0].promptTemplate).toBe('Custom summary');
    });
    
    it('should filter disabled transformations', async () => {
      await transformationRepo.create(createTransformation({
        tenantId: 'tenant-1',
        name: 'enabled',
        promptTemplate: 'Enabled',
        outputFormat: 'markdown',
        isEnabled: true,
      }));
      
      await transformationRepo.create(createTransformation({
        tenantId: 'tenant-1',
        name: 'disabled',
        promptTemplate: 'Disabled',
        outputFormat: 'markdown',
        isEnabled: false,
      }));
      
      const available = await service.getAvailableTransformations('tenant-1');
      
      expect(available.length).toBe(1);
      expect(available[0].name).toBe('enabled');
    });
    
    it('should filter by ingestion type', async () => {
      await transformationRepo.create(createTransformation({
        tenantId: 'tenant-1',
        name: 'for-docs',
        promptTemplate: 'For docs',
        outputFormat: 'markdown',
        applicableIngestionTypes: ['document', 'article'],
      }));
      
      await transformationRepo.create(createTransformation({
        tenantId: 'tenant-1',
        name: 'for-all',
        promptTemplate: 'For all',
        outputFormat: 'markdown',
        applicableIngestionTypes: [],
      }));
      
      const docTransforms = await service.getAvailableTransformations('tenant-1', 'document');
      
      expect(docTransforms.length).toBe(2); // Both match
      
      const imageTransforms = await service.getAvailableTransformations('tenant-1', 'image');
      
      expect(imageTransforms.length).toBe(1);
      expect(imageTransforms[0].name).toBe('for-all');
    });
  });
  
  describe('executeMultiple', () => {
    it('should execute multiple transformations', async () => {
      const t1 = createTransformation({
        tenantId: null,
        name: 'transform-1',
        promptTemplate: 'T1: {{ source.content }}',
        outputFormat: 'markdown',
      });
      await transformationRepo.create(t1);
      
      const t2 = createTransformation({
        tenantId: null,
        name: 'transform-2',
        promptTemplate: 'T2: {{ source.content }}',
        outputFormat: 'markdown',
      });
      await transformationRepo.create(t2);
      
      const context: TransformationContext = {
        source: { id: 'source-1', content: 'Content' },
        tenantId: 'tenant-1',
      };
      
      const results = await service.executeMultiple([t1.id!, t2.id!], context);
      
      expect(results.length).toBe(2);
      expect(results.every(r => r.success)).toBe(true);
    });
    
    it('should execute sequentially when parallel=false', async () => {
      const t1 = createTransformation({
        tenantId: null,
        name: 'transform-1',
        promptTemplate: 'T1',
        outputFormat: 'markdown',
      });
      await transformationRepo.create(t1);
      
      const t2 = createTransformation({
        tenantId: null,
        name: 'transform-2',
        promptTemplate: 'T2',
        outputFormat: 'markdown',
      });
      await transformationRepo.create(t2);
      
      const context: TransformationContext = {
        source: { id: 'source-1', content: 'Content' },
        tenantId: 'tenant-1',
      };
      
      const results = await service.executeMultiple(
        [t1.id!, t2.id!], 
        context, 
        { parallel: false }
      );
      
      expect(results.length).toBe(2);
    });
  });
  
  describe('preview', () => {
    it('should preview rendered prompt', async () => {
      const transformation = createTransformation({
        tenantId: null,
        name: 'preview-transform',
        promptTemplate: 'Title: {{ source.title }}\nContent: {{ source.content }}',
        outputFormat: 'markdown',
      });
      await transformationRepo.create(transformation);
      
      const context: TransformationContext = {
        source: { 
          id: 'source-1', 
          content: 'My content', 
          title: 'My Title' 
        },
        tenantId: 'tenant-1',
      };
      
      const preview = await service.preview(transformation.id!, context);
      
      expect(preview.prompt).toBe('Title: My Title\nContent: My content');
      expect(preview.estimatedTokens).toBeGreaterThan(0);
    });
  });
  
  describe('validateTemplate', () => {
    it('should validate correct template', () => {
      const result = service.validateTemplate('Hello {{ name }}');
      
      expect(result.valid).toBe(true);
      expect(result.variables).toContain('name');
    });
    
    it('should detect invalid template', () => {
      // Use unknown block tag which Nunjucks will reject
      const result = service.validateTemplate('{% unknown_tag %}');
      
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
  
  describe('getResultsForSource', () => {
    it('should retrieve results by source', async () => {
      const transformation = createTransformation({
        tenantId: null,
        name: 'test',
        promptTemplate: 'Test',
        outputFormat: 'markdown',
      });
      await transformationRepo.create(transformation);
      
      const context: TransformationContext = {
        source: { id: 'source-1', content: 'Content' },
        tenantId: 'tenant-1',
      };
      
      await service.execute(transformation.id!, context);
      await service.execute(transformation.id!, context);
      
      const results = await service.getResultsForSource('source-1', 'tenant-1');
      
      expect(results.length).toBe(2);
    });
  });
});
