/**
 * Tests for Type Guards and Type Utilities
 */

import { Entity, EntityType } from '../types/entity';
import { now } from '../utils/date';

describe('Type Guards', () => {
  describe('Entity Type', () => {
    it('should accept valid entity types', () => {
      const types: EntityType[] = [
        'topic',
        'project',
        'person',
        'place',
        'daily-note',
        'source',
        'artifact',
        'event',
        'task',
        'process',
      ];

      types.forEach(type => {
        expect(typeof type).toBe('string');
      });
    });

    it('should create valid entity objects', () => {
      const entity: Entity = {
        uid: 'task-test-001',
        type: 'task',
        title: 'Test Task',
        content: 'Test content',
        created: now(),
        updated: now(),
        lifecycle: {
          state: 'capture',
        },
        sensitivity: {
          level: 'personal',
          privacy: {
            cloud_ai_allowed: false,
            local_ai_allowed: true,
            export_allowed: true,
          },
        },
      };

      expect(entity.uid).toBeDefined();
      expect(entity.type).toBe('task');
      expect(entity.title).toBe('Test Task');
    });
  });

  describe('Lifecycle States', () => {
    it('should accept valid lifecycle states', () => {
      const states: Array<'capture' | 'transitional' | 'permanent' | 'archived'> = [
        'capture',
        'transitional',
        'permanent',
        'archived',
      ];

      states.forEach(state => {
        const entity: Partial<Entity> = {
          lifecycle: {
            state,
          },
        };
        expect(entity.lifecycle?.state).toBe(state);
      });
    });
  });

  describe('Sensitivity Levels', () => {
    it('should accept valid sensitivity levels', () => {
      const levels: Array<'public' | 'personal' | 'confidential' | 'secret'> = [
        'public',
        'personal',
        'confidential',
        'secret',
      ];

      levels.forEach(level => {
        const entity: Partial<Entity> = {
          sensitivity: {
            level,
            privacy: {
              cloud_ai_allowed: false,
              local_ai_allowed: true,
              export_allowed: true,
            },
          },
        };
        expect(entity.sensitivity?.level).toBe(level);
      });
    });
  });

  describe('Entity Properties', () => {
    it('should support optional properties', () => {
      const minimal: Entity = {
        uid: 'task-test-001',
        type: 'task',
        title: 'Test',
        created: now(),
        updated: now(),
        lifecycle: { state: 'capture' },
        sensitivity: { 
          level: 'personal',
          privacy: {
            cloud_ai_allowed: false,
            local_ai_allowed: true,
            export_allowed: true,
          },
        },
      };

      expect(minimal.content).toBeUndefined();
      expect(minimal.aliases).toBeUndefined();
      expect(minimal.importance).toBeUndefined();
    });

    it('should support all optional properties', () => {
      const full: Entity = {
        uid: 'task-test-001',
        type: 'task',
        title: 'Test',
        content: 'Content',
        aliases: ['test-alias'],
        created: now(),
        updated: now(),
        lifecycle: { state: 'permanent' },
        sensitivity: { 
          level: 'personal',
          privacy: {
            cloud_ai_allowed: false,
            local_ai_allowed: true,
            export_allowed: true,
          },
        },
        importance: 5,
        provenance: {
          sources: ['manual-001'],
          confidence: 1.0,
        },
        metadata: {
          custom: 'value',
        },
        bmom: {
          because: 'Test reason',
          meaning: 'Test meaning',
          outcome: 'Test outcome',
          measure: 'Test measure',
        },
      };

      expect(full.content).toBe('Content');
      expect(full.aliases).toHaveLength(1);
      expect(full.importance).toBe(5);
      expect(full.provenance?.confidence).toBe(1.0);
      expect(full.metadata?.custom).toBe('value');
      expect(full.bmom?.because).toBe('Test reason');
    });
  });

  describe('Provenance', () => {
    it('should validate confidence range', () => {
      const entity: Partial<Entity> = {
        provenance: {
          sources: ['source-001'],
          confidence: 0.8,
        },
      };

      expect(entity.provenance?.confidence).toBeGreaterThanOrEqual(0);
      expect(entity.provenance?.confidence).toBeLessThanOrEqual(1);
    });

    it('should support optional provenance fields', () => {
      const entity: Partial<Entity> = {
        provenance: {
          sources: ['web-001'],
          confidence: 0.9,
          retrieved_date: now(),
          source_url: 'https://example.com',
        },
      };

      expect(entity.provenance?.source_url).toBe('https://example.com');
      expect(entity.provenance?.retrieved_date).toBeDefined();
    });
  });
});
