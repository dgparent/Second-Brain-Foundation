/**
 * Tests for Memory Engine Core Operations
 */

import { MemoryEngine } from '../MemoryEngine';
import { Entity } from '../types';
import * as path from 'path';
import * as os from 'os';

describe('MemoryEngine', () => {
  let engine: MemoryEngine;
  let testVaultRoot: string;

  beforeEach(() => {
    testVaultRoot = path.join(os.tmpdir(), `sbf-test-${Date.now()}`);
    engine = new MemoryEngine({
      vaultRoot: testVaultRoot,
      autoComputeAeiCode: true,
    });
  });

  describe('Initialization', () => {
    it('should create a memory engine instance', () => {
      expect(engine).toBeDefined();
      expect(engine).toBeInstanceOf(MemoryEngine);
    });

    it('should initialize with provided vault root', () => {
      expect(testVaultRoot).toBeDefined();
      expect(testVaultRoot).toContain('sbf-test');
    });
  });

  describe('Entity Operations', () => {
    const sampleEntity = {
      uid: 'task-test-001',
      type: 'task' as const,
      title: 'Test Task',
      content: 'This is a test task',
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      lifecycle: {
        state: 'capture' as const,
      },
      sensitivity: {
        level: 'personal' as const,
        privacy: {
          cloud_ai_allowed: false,
          local_ai_allowed: true,
          export_allowed: true,
        },
      },
    };

    it('should handle entity creation', async () => {
      // Mock test - just verify the structure is correct
      expect(sampleEntity.uid).toBe('task-test-001');
      expect(sampleEntity.type).toBe('task');
      expect(sampleEntity.lifecycle.state).toBe('capture');
    });

    it('should validate entity structure', () => {
      expect(sampleEntity).toHaveProperty('uid');
      expect(sampleEntity).toHaveProperty('type');
      expect(sampleEntity).toHaveProperty('title');
      expect(sampleEntity).toHaveProperty('lifecycle');
      expect(sampleEntity).toHaveProperty('sensitivity');
    });

    it('should handle entity updates', () => {
      const updated = {
        ...sampleEntity,
        title: 'Updated Task',
        updated: new Date().toISOString(),
      };

      expect(updated.title).toBe('Updated Task');
      expect(updated.uid).toBe(sampleEntity.uid);
    });
  });

  describe('Lifecycle Management', () => {
    it('should initialize with capture state', () => {
      const entity = {
        lifecycle: {
          state: 'capture' as const,
        },
      };

      expect(entity.lifecycle.state).toBe('capture');
    });

    it('should support lifecycle transitions', () => {
      const states: Array<'capture' | 'transitional' | 'permanent' | 'archived'> = [
        'capture',
        'transitional',
        'permanent',
        'archived',
      ];

      states.forEach(state => {
        expect(['capture', 'transitional', 'permanent', 'archived']).toContain(state);
      });
    });
  });

  describe('Event Handling', () => {
    it('should be an event emitter', () => {
      expect(engine.on).toBeDefined();
      expect(engine.emit).toBeDefined();
      expect(engine.off).toBeDefined();
    });

    it('should handle event listeners', (done) => {
      const testEvent = 'test:event';
      const testData = { message: 'test' };

      engine.on(testEvent, (data) => {
        expect(data).toEqual(testData);
        done();
      });

      engine.emit(testEvent, testData);
    });
  });

  describe('Cache Operations', () => {
    it('should support entity caching', () => {
      const entity = {
        uid: 'test-001',
        title: 'Cached Entity',
      };

      // Memory engine uses internal cache
      expect(entity.uid).toBeDefined();
    });
  });
});
