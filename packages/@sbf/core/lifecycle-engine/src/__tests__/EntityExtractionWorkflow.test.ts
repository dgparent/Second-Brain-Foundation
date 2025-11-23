/**
 * Tests for EntityExtractionWorkflow
 */

import { EntityExtractionWorkflow } from '../extraction/EntityExtractionWorkflow';
import { BaseAIProvider } from '@sbf/aei/dist/providers/BaseProvider';
import { ExtractedEntity } from '@sbf/aei/dist/providers/BaseProvider';
import { EntityManager } from '@sbf/core-entity-manager';
import { Entity } from '@sbf/shared';
import { createMockDailyNote, createMockEntity } from './test-utils';

describe('EntityExtractionWorkflow', () => {
  let workflow: EntityExtractionWorkflow;
  let mockProvider: jest.Mocked<BaseAIProvider>;
  let mockEntityManager: jest.Mocked<EntityManager>;

  beforeEach(() => {
    mockProvider = {
      extractEntities: jest.fn(),
      classifyContent: jest.fn(),
      inferRelationships: jest.fn(),
      testConnection: jest.fn(),
    } as any;

    mockEntityManager = {
      get: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    } as any;

    workflow = new EntityExtractionWorkflow({
      provider: mockProvider,
      entityManager: mockEntityManager,
      confidenceThreshold: 0.75,
      batchSize: 10,
    });
  });

  describe('extractFromDailyNote', () => {
    it('should extract entities from a daily note', async () => {
      const dailyNote = createMockDailyNote('daily-2025-11-21-001', 0, 'Met with [[John Doe]] about [[Project Alpha]]');

      mockEntityManager.get.mockResolvedValue(dailyNote);
      mockProvider.extractEntities.mockResolvedValue([
        { type: 'person', name: 'John Doe', attributes: {}, confidence: 0.9 },
        { type: 'project', name: 'Project Alpha', attributes: {}, confidence: 0.85 },
      ] as ExtractedEntity[]);

      const result = await workflow.extractFromDailyNote('daily-2025-11-21-001');

      expect(result.extractedEntities).toHaveLength(2);
      expect(result.entityUid).toBe('daily-2025-11-21-001');
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.processingTime).toBeGreaterThanOrEqual(0);
    });

    it('should emit extraction:started event', async () => {
      const handler = jest.fn();
      workflow.on('extraction:started', handler);

      const dailyNote = createMockDailyNote('daily-2025-11-21-001');

      mockEntityManager.get.mockResolvedValue(dailyNote);
      mockProvider.extractEntities.mockResolvedValue([]);

      await workflow.extractFromDailyNote('daily-2025-11-21-001');

      expect(handler).toHaveBeenCalledWith('daily-2025-11-21-001');
    });

    it('should throw error if entity not found', async () => {
      mockEntityManager.get.mockResolvedValue(null);

      await expect(
        workflow.extractFromDailyNote('non-existent')
      ).rejects.toThrow('Entity non-existent not found');
    });

    it('should throw error if entity is not a daily note', async () => {
      const wrongEntity = createMockEntity({
        uid: 'person-001',
        type: 'person',
        title: 'John Doe',
      });

      mockEntityManager.get.mockResolvedValue(wrongEntity);

      await expect(
        workflow.extractFromDailyNote('person-001')
      ).rejects.toThrow('is not a daily note');
    });
  });

  describe('extractFromMultiple', () => {
    it('should extract from multiple daily notes', async () => {
      const dailyNote1 = createMockDailyNote('daily-1');
      const dailyNote2 = createMockDailyNote('daily-2');

      mockEntityManager.get.mockImplementation((uid: string) => {
        if (uid === 'daily-1') return Promise.resolve(dailyNote1);
        if (uid === 'daily-2') return Promise.resolve(dailyNote2);
        return Promise.resolve(null);
      });

      mockProvider.extractEntities.mockResolvedValue([]);

      const results = await workflow.extractFromMultiple(['daily-1', 'daily-2']);

      expect(results).toHaveLength(2);
      expect(results[0].entityUid).toBe('daily-1');
      expect(results[1].entityUid).toBe('daily-2');
    });
  });
});
