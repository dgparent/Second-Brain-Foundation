/**
 * Tests for LifecycleAutomationService
 */

import { LifecycleAutomationService } from '../LifecycleAutomationService';
import { EntityManager } from '@sbf/core-entity-manager';
import { BaseAIProvider } from '@sbf/aei';
import { createMockDailyNote } from './test-utils';

describe('LifecycleAutomationService', () => {
  let service: LifecycleAutomationService;
  let mockEntityManager: jest.Mocked<EntityManager>;
  let mockAIProvider: jest.Mocked<BaseAIProvider>;

  beforeEach(() => {
    mockEntityManager = {
      get: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      getAll: jest.fn().mockResolvedValue([]),
    } as any;

    mockAIProvider = {
      extractEntities: jest.fn(),
      classifyContent: jest.fn(),
      inferRelationships: jest.fn(),
      testConnection: jest.fn(),
    } as any;

    service = new LifecycleAutomationService({
      entityManager: mockEntityManager,
      aiProvider: mockAIProvider,
      checkIntervalMinutes: 1,
      enableAutoDissolution: true,
    });
  });

  afterEach(async () => {
    await service.stop();
  });

  describe('initialization', () => {
    it('should create service with config', () => {
      expect(service).toBeDefined();
    });

    it('should initialize scheduler and workflows', async () => {
      await service.initialize();
      // No errors means initialization succeeded
    });
  });

  describe('lifecycle automation', () => {
    it('should start and stop automation service', async () => {
      await service.initialize();
      await service.start();
      expect(service.isAutomationRunning()).toBe(true);

      await service.stop();
      expect(service.isAutomationRunning()).toBe(false);
    });
  });

  describe('human override controls', () => {
    it('should prevent dissolution of a daily note', async () => {
      const dailyNote = createMockDailyNote('daily-2025-11-21-001');
      mockEntityManager.get.mockResolvedValue(dailyNote);
      mockEntityManager.update.mockResolvedValue(dailyNote);

      await service.initialize();
      const result = await service.preventDissolution('daily-2025-11-21-001', 'Important');

      expect(result).toBe(true);
      expect(mockEntityManager.update).toHaveBeenCalledWith(
        'daily-2025-11-21-001',
        expect.objectContaining({
          metadata: expect.objectContaining({
            prevent_dissolve: true,
          }),
        })
      );
    });

    it('should postpone dissolution by specified hours', async () => {
      const dailyNote = createMockDailyNote('daily-2025-11-21-001');
      mockEntityManager.get.mockResolvedValue(dailyNote);
      mockEntityManager.update.mockResolvedValue(dailyNote);

      await service.initialize();
      const result = await service.postponeDissolution('daily-2025-11-21-001', 24);

      expect(result).toBe(true);
      expect(mockEntityManager.update).toHaveBeenCalledWith(
        'daily-2025-11-21-001',
        expect.objectContaining({
          metadata: expect.objectContaining({
            postpone_until: expect.any(String),
          }),
        })
      );
    });

    it('should allow dissolution by removing prevent flag', async () => {
      const dailyNote = createMockDailyNote('daily-2025-11-21-001');
      dailyNote.metadata = { prevent_dissolve: true };

      mockEntityManager.get.mockResolvedValue(dailyNote);
      mockEntityManager.update.mockResolvedValue(dailyNote);

      await service.initialize();
      const result = await service.allowDissolution('daily-2025-11-21-001');

      expect(result).toBe(true);
    });
  });

  describe('statistics', () => {
    it('should return automation statistics', async () => {
      await service.initialize();
      const stats = service.getStatistics();

      expect(stats).toHaveProperty('automationEnabled');
      expect(stats).toHaveProperty('totalDissolutions');
    });
  });
});
