/**
 * Tests for DissolutionWorkflow
 */

import { DissolutionWorkflow } from '../dissolution/DissolutionWorkflow';
import { EntityExtractionWorkflow } from '../extraction/EntityExtractionWorkflow';
import { EntityManager } from '@sbf/core-entity-manager';
import { createMockDailyNote, createMockExtractedEntity } from './test-utils';

describe('DissolutionWorkflow', () => {
  let workflow: DissolutionWorkflow;
  let mockEntityManager: jest.Mocked<EntityManager>;
  let mockExtractionWorkflow: jest.Mocked<EntityExtractionWorkflow>;

  beforeEach(() => {
    mockEntityManager = {
      get: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    } as any;

    mockExtractionWorkflow = {
      extractFromDailyNote: jest.fn(),
      extractFromMultiple: jest.fn(),
    } as any;

    workflow = new DissolutionWorkflow({
      entityManager: mockEntityManager,
      extractionWorkflow: mockExtractionWorkflow,
      archiveEnabled: true,
    });
  });

  describe('dissolve', () => {
    it('should dissolve a daily note successfully', async () => {
      const dailyNote = createMockDailyNote('daily-2025-11-21-001');
      const extractedEntity = createMockExtractedEntity('John Doe', 'person');

      mockEntityManager.get.mockResolvedValue(dailyNote);
      mockEntityManager.create.mockResolvedValue(extractedEntity);
      mockEntityManager.update.mockResolvedValue(dailyNote);

      mockExtractionWorkflow.extractFromDailyNote.mockResolvedValue({
        entityUid: dailyNote.uid,
        extractedEntities: [extractedEntity],
        confidence: 0.9,
        processingTime: 100,
      });

      const result = await workflow.dissolve('daily-2025-11-21-001');

      expect(result.dailyNoteUid).toBe('daily-2025-11-21-001');
      expect(result.extractedCount).toBe(1);
      expect(result.archived).toBe(true);
    });

    it('should prevent dissolution if prevent_dissolve flag is set', async () => {
      const dailyNote = createMockDailyNote('daily-2025-11-21-001');
      dailyNote.metadata = { prevent_dissolve: true };

      mockEntityManager.get.mockResolvedValue(dailyNote);

      await expect(
        workflow.dissolve('daily-2025-11-21-001')
      ).rejects.toThrow('User flagged to prevent dissolution');
    });

    it('should emit dissolution:started and dissolution:completed events', async () => {
      const startHandler = jest.fn();
      const completeHandler = jest.fn();
      
      workflow.on('dissolution:started', startHandler);
      workflow.on('dissolution:completed', completeHandler);

      const dailyNote = createMockDailyNote('daily-2025-11-21-001');
      mockEntityManager.get.mockResolvedValue(dailyNote);
      mockEntityManager.update.mockResolvedValue(dailyNote);

      mockExtractionWorkflow.extractFromDailyNote.mockResolvedValue({
        entityUid: dailyNote.uid,
        extractedEntities: [],
        confidence: 0,
        processingTime: 100,
      });

      await workflow.dissolve('daily-2025-11-21-001');

      expect(startHandler).toHaveBeenCalled();
      expect(completeHandler).toHaveBeenCalled();
    });

    it('should throw error if daily note not found', async () => {
      mockEntityManager.get.mockResolvedValue(null);

      await expect(
        workflow.dissolve('non-existent')
      ).rejects.toThrow('Daily note non-existent not found');
    });
  });

  describe('dissolveMultiple', () => {
    it('should dissolve multiple daily notes', async () => {
      const dailyNote1 = createMockDailyNote('daily-1');
      const dailyNote2 = createMockDailyNote('daily-2');

      mockEntityManager.get.mockImplementation((uid: string) => {
        if (uid === 'daily-1') return Promise.resolve(dailyNote1);
        if (uid === 'daily-2') return Promise.resolve(dailyNote2);
        return Promise.resolve(null);
      });

      mockEntityManager.update.mockResolvedValue(dailyNote1);

      mockExtractionWorkflow.extractFromDailyNote.mockResolvedValue({
        entityUid: 'daily-test',
        extractedEntities: [],
        confidence: 0,
        processingTime: 100,
      });

      const results = await workflow.dissolveMultiple(['daily-1', 'daily-2']);

      expect(results).toHaveLength(2);
    });
  });
});
