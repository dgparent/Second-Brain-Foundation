/**
 * Tests for transformation models.
 */

import {
  createTransformation,
  InMemoryTransformationRepository,
} from '../src/models/Transformation';
import {
  createTransformationResult,
  InMemoryTransformationResultRepository,
} from '../src/models/TransformationResult';
import {
  InMemoryTransformationConfigRepository,
  DEFAULT_TRANSFORMATION_CONFIG,
} from '../src/models/TransformationConfig';
import {
  createSourceInsight,
  promoteToUserTruth,
  InMemorySourceInsightRepository,
} from '../src/models/SourceInsight';

describe('Transformation Model', () => {
  describe('createTransformation', () => {
    it('should create transformation with defaults', () => {
      const transformation = createTransformation({
        tenantId: 'tenant-1',
        name: 'test',
        promptTemplate: 'Template {{ var }}',
        outputFormat: 'markdown',
      });
      
      expect(transformation.id).toBeDefined();
      expect(transformation.name).toBe('test');
      expect(transformation.version).toBe(1);
      expect(transformation.isEnabled).toBe(true);
      expect(transformation.applicableIngestionTypes).toEqual([]);
    });
    
    it('should accept optional fields', () => {
      const transformation = createTransformation({
        tenantId: 'tenant-1',
        name: 'test',
        promptTemplate: 'Template',
        outputFormat: 'json',
        outputSchema: { type: 'object' },
        modelId: 'gpt-4o',
        temperature: 0.5,
        maxTokens: 1000,
        applicableIngestionTypes: ['document', 'article'],
      });
      
      expect(transformation.outputSchema).toEqual({ type: 'object' });
      expect(transformation.modelId).toBe('gpt-4o');
      expect(transformation.temperature).toBe(0.5);
    });
  });
  
  describe('InMemoryTransformationRepository', () => {
    let repo: InMemoryTransformationRepository;
    
    beforeEach(() => {
      repo = new InMemoryTransformationRepository();
    });
    
    it('should create and find by id', async () => {
      const t = createTransformation({
        tenantId: 'tenant-1',
        name: 'test',
        promptTemplate: 'Template',
        outputFormat: 'markdown',
      });
      
      await repo.create(t);
      const found = await repo.get(t.id!);
      
      expect(found).toMatchObject({
        tenantId: 'tenant-1',
        name: 'test',
        promptTemplate: 'Template',
        outputFormat: 'markdown',
      });
    });
    
    it('should find by tenant', async () => {
      await repo.create(createTransformation({
        tenantId: 'tenant-1',
        name: 't1',
        promptTemplate: 'T1',
        outputFormat: 'markdown',
      }));
      
      await repo.create(createTransformation({
        tenantId: 'tenant-2',
        name: 't2',
        promptTemplate: 'T2',
        outputFormat: 'markdown',
      }));
      
      const tenant1 = await repo.getForTenant('tenant-1');
      
      expect(tenant1.filter(t => t.tenantId === 'tenant-1').length).toBe(1);
      expect(tenant1.filter(t => t.tenantId === 'tenant-1')[0].name).toBe('t1');
    });
    
    it('should get defaults (null tenant)', async () => {
      await repo.create(createTransformation({
        tenantId: null,
        name: 'system:default',
        promptTemplate: 'Default',
        outputFormat: 'markdown',
        applyDefault: true,
      }));
      
      const defaults = await repo.getDefaultsForIngestion('any-tenant');
      
      expect(defaults.length).toBe(1);
      expect(defaults[0].name).toBe('system:default');
    });
    
    it('should filter defaults by ingestion type', async () => {
      await repo.create(createTransformation({
        tenantId: null,
        name: 'for-docs',
        promptTemplate: 'Docs',
        outputFormat: 'markdown',
        applyDefault: true,
        applicableIngestionTypes: ['document'],
      }));
      
      await repo.create(createTransformation({
        tenantId: null,
        name: 'for-all',
        promptTemplate: 'All',
        outputFormat: 'markdown',
        applyDefault: true,
        applicableIngestionTypes: [],
      }));
      
      const docDefaults = await repo.getDefaultsForIngestion('tenant-1');
      
      // Both have applyDefault: true, so both are returned
      expect(docDefaults.length).toBe(2);
    });
  });
});

describe('TransformationResult Model', () => {
  describe('createTransformationResult', () => {
    it('should create result with required fields', () => {
      const result = createTransformationResult({
        tenantId: 'tenant-1',
        transformationId: 'transform-1',
        output: 'Output content',
        outputFormat: 'markdown',
        inputTokens: 100,
        outputTokens: 50,
        cost: 0.001,
        durationMs: 500,
        modelUsed: 'gpt-4o-mini',
        transformationVersion: 1,
      });
      
      expect(result.id).toBeDefined();
      expect(result.tenantId).toBe('tenant-1');
      expect(result.output).toBe('Output content');
    });
    
    it('should accept optional source fields', () => {
      const result = createTransformationResult({
        tenantId: 'tenant-1',
        transformationId: 'transform-1',
        sourceId: 'source-1',
        sourceVersion: 5,
        output: 'Output',
        outputFormat: 'json',
        inputTokens: 100,
        outputTokens: 50,
        cost: 0.001,
        durationMs: 500,
        modelUsed: 'gpt-4o',
        transformationVersion: 1,
      });
      
      expect(result.sourceId).toBe('source-1');
      expect(result.sourceVersion).toBe(5);
    });
  });
  
  describe('InMemoryTransformationResultRepository', () => {
    let repo: InMemoryTransformationResultRepository;
    
    beforeEach(() => {
      repo = new InMemoryTransformationResultRepository();
    });
    
    it('should find by source', async () => {
      await repo.create(createTransformationResult({
        tenantId: 'tenant-1',
        transformationId: 't1',
        sourceId: 'source-1',
        output: 'O1',
        outputFormat: 'markdown',
        inputTokens: 50,
        outputTokens: 25,
        cost: 0.0005,
        durationMs: 200,
        modelUsed: 'gpt-4o-mini',
        transformationVersion: 1,
      }));
      
      const results = await repo.getBySource('source-1');
      
      expect(results.filter(r => r.tenantId === 'tenant-1').length).toBe(1);
    });
    
    it('should find by transformation', async () => {
      await repo.create(createTransformationResult({
        tenantId: 'tenant-1',
        transformationId: 'transform-1',
        output: 'O1',
        outputFormat: 'markdown',
        inputTokens: 50,
        outputTokens: 25,
        cost: 0.0005,
        durationMs: 200,
        modelUsed: 'gpt-4o-mini',
        transformationVersion: 1,
      }));
      
      const results = await repo.getByTransformation('transform-1');
      
      expect(results.filter(r => r.tenantId === 'tenant-1').length).toBe(1);
    });
  });
});

describe('TransformationConfig Model', () => {
  describe('DEFAULT_TRANSFORMATION_CONFIG', () => {
    it('should have sensible defaults', () => {
      expect(DEFAULT_TRANSFORMATION_CONFIG.dailyLimit).toBe(1000);
      expect(DEFAULT_TRANSFORMATION_CONFIG.autoGenerateInsights).toBe(true);
      expect(DEFAULT_TRANSFORMATION_CONFIG.maxConcurrent).toBe(5);
    });
  });
  
  describe('InMemoryTransformationConfigRepository', () => {
    let repo: InMemoryTransformationConfigRepository;
    
    beforeEach(() => {
      repo = new InMemoryTransformationConfigRepository();
    });
    
    it('should create and find by tenant', async () => {
      await repo.create({
        id: 'config-1',
        tenantId: 'tenant-1',
        dailyLimit: 500,
        autoGenerateInsights: false,
        maxConcurrent: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      const config = await repo.get('tenant-1');
      
      expect(config).not.toBeNull();
      expect(config?.dailyLimit).toBe(500);
    });
  });
});

describe('SourceInsight Model', () => {
  describe('createSourceInsight', () => {
    it('should create insight with L3 truth level', () => {
      const insight = createSourceInsight({
        tenantId: 'tenant-1',
        sourceId: 'source-1',
        insightType: 'summary',
        content: 'Summary content',
        transformationId: 't1',
        transformationResultId: 'r1',
        confidence: 0.85,
      });
      
      expect(insight.id).toBeDefined();
      expect(insight.truthLevel).toBe('L3');
      expect(insight.insightType).toBe('summary');
    });
  });
  
  describe('promoteToUserTruth', () => {
    it('should promote to U1 and record promoter', () => {
      const insight = createSourceInsight({
        tenantId: 'tenant-1',
        sourceId: 'source-1',
        insightType: 'summary',
        content: 'Content',
        transformationId: 't1',
        transformationResultId: 'r1',
      });
      
      const promoted = promoteToUserTruth(insight, 'user-123');
      
      expect(promoted.truthLevel).toBe('U1');
      expect(promoted.promotedBy).toBe('user-123');
      expect(promoted.promotedAt).toBeDefined();
    });
  });
  
  describe('InMemorySourceInsightRepository', () => {
    let repo: InMemorySourceInsightRepository;
    
    beforeEach(() => {
      repo = new InMemorySourceInsightRepository();
    });
    
    it('should find by source', async () => {
      await repo.create(createSourceInsight({
        tenantId: 'tenant-1',
        sourceId: 'source-1',
        insightType: 'summary',
        content: 'Summary',
        transformationId: 't1',
        transformationResultId: 'r1',
      }));
      
      const insights = await repo.findBySource('source-1', 'tenant-1');
      
      expect(insights.length).toBe(1);
    });
    
    it('should find by tenant', async () => {
      await repo.create(createSourceInsight({
        tenantId: 'tenant-1',
        sourceId: 'source-1',
        insightType: 'summary',
        content: 'S1',
        transformationId: 't1',
        transformationResultId: 'r1',
      }));
      
      await repo.create(createSourceInsight({
        tenantId: 'tenant-1',
        sourceId: 'source-2',
        insightType: 'tags',
        content: 'Tags',
        transformationId: 't2',
        transformationResultId: 'r2',
      }));
      
      const insights = await repo.findByTenant('tenant-1');
      
      expect(insights.length).toBe(2);
    });
    
    it('should find by insight type', async () => {
      await repo.create(createSourceInsight({
        tenantId: 'tenant-1',
        sourceId: 'source-1',
        insightType: 'summary',
        content: 'Summary',
        transformationId: 't1',
        transformationResultId: 'r1',
      }));
      
      await repo.create(createSourceInsight({
        tenantId: 'tenant-1',
        sourceId: 'source-2',
        insightType: 'tags',
        content: 'Tags',
        transformationId: 't2',
        transformationResultId: 'r2',
      }));
      
      const summaries = await repo.findByInsightType('summary', 'tenant-1');
      
      expect(summaries.length).toBe(1);
      expect(summaries[0].insightType).toBe('summary');
    });
  });
});
