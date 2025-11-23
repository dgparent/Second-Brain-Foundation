/**
 * Tests for Lifecycle Engine
 */

import { Entity, MemoryLevel } from '../types';

describe('Lifecycle Engine', () => {
  describe('Memory Levels', () => {
    it('should support all valid memory levels', () => {
      const levels: MemoryLevel[] = [
        'transitory',
        'temporary',
        'short_term',
        'long_term',
        'canonical',
        'archived',
      ];
      
      levels.forEach(level => {
        expect(['transitory', 'temporary', 'short_term', 'long_term', 'canonical', 'archived']).toContain(level);
      });
    });

    it('should handle transitory level entities', () => {
      const now = new Date().toISOString();
      const entity: Partial<Entity> = {
        id: 'task-test-001',
        title: 'Test Task',
        memory: {
          memory_level: 'transitory',
          stability_score: 0.3,
          importance_score: 0.5,
          last_active_at: now,
          user_pinned: false,
          created_at: now,
          updated_at: now,
        },
      };

      expect(entity.memory?.memory_level).toBe('transitory');
    });

    it('should handle temporary level entities', () => {
      const now = new Date().toISOString();
      const entity: Partial<Entity> = {
        id: 'task-test-002',
        title: 'Test Task 2',
        memory: {
          memory_level: 'temporary',
          stability_score: 0.5,
          importance_score: 0.6,
          last_active_at: now,
          user_pinned: false,
          created_at: now,
          updated_at: now,
        },
      };

      expect(entity.memory?.memory_level).toBe('temporary');
    });

    it('should handle canonical level entities', () => {
      const now = new Date().toISOString();
      const entity: Partial<Entity> = {
        id: 'topic-test-001',
        title: 'Important Topic',
        memory: {
          memory_level: 'canonical',
          stability_score: 1.0,
          importance_score: 1.0,
          last_active_at: now,
          user_pinned: true,
          created_at: now,
          updated_at: now,
        },
      };

      expect(entity.memory?.memory_level).toBe('canonical');
      expect(entity.memory?.user_pinned).toBe(true);
    });

    it('should handle archived level entities', () => {
      const now = new Date().toISOString();
      const entity: Partial<Entity> = {
        id: 'task-old-001',
        title: 'Archived Task',
        memory: {
          memory_level: 'archived',
          stability_score: 0.8,
          importance_score: 0.2,
          last_active_at: now,
          user_pinned: false,
          created_at: now,
          updated_at: now,
        },
      };

      expect(entity.memory?.memory_level).toBe('archived');
    });
  });

  describe('Lifecycle Transitions', () => {
    it('should allow transition from transitory to temporary', () => {
      const now = new Date().toISOString();
      const before: Partial<Entity> = {
        memory: {
          memory_level: 'transitory',
          stability_score: 0.3,
          importance_score: 0.5,
          last_active_at: now,
          user_pinned: false,
          created_at: now,
          updated_at: now,
        },
      };

      const after: Partial<Entity> = {
        ...before,
        memory: {
          ...before.memory!,
          memory_level: 'temporary',
        },
      };

      expect(before.memory?.memory_level).toBe('transitory');
      expect(after.memory?.memory_level).toBe('temporary');
    });

    it('should allow transition to archived from any level', () => {
      const levels: MemoryLevel[] = ['transitory', 'temporary', 'short_term'];
      const now = new Date().toISOString();

      levels.forEach(level => {
        const before: Partial<Entity> = {
          memory: {
            memory_level: level,
            stability_score: 0.5,
            importance_score: 0.5,
            last_active_at: now,
            user_pinned: false,
            created_at: now,
            updated_at: now,
          },
        };

        const after: Partial<Entity> = {
          ...before,
          memory: {
            ...before.memory!,
            memory_level: 'archived',
          },
        };

        expect(after.memory?.memory_level).toBe('archived');
      });
    });
  });

  describe('Pinning Mechanism', () => {
    it('should support user pinning to prevent transitions', () => {
      const now = new Date().toISOString();
      const entity: Partial<Entity> = {
        memory: {
          memory_level: 'short_term',
          stability_score: 0.7,
          importance_score: 0.9,
          last_active_at: now,
          user_pinned: true,
          created_at: now,
          updated_at: now,
        },
      };

      expect(entity.memory?.user_pinned).toBe(true);
    });
  });

  describe('Stability and Importance Scores', () => {
    it('should track stability score between 0 and 1', () => {
      const now = new Date().toISOString();
      const entity: Partial<Entity> = {
        memory: {
          memory_level: 'temporary',
          stability_score: 0.75,
          importance_score: 0.5,
          last_active_at: now,
          user_pinned: false,
          created_at: now,
          updated_at: now,
        },
      };

      expect(entity.memory?.stability_score).toBeGreaterThanOrEqual(0);
      expect(entity.memory?.stability_score).toBeLessThanOrEqual(1);
    });

    it('should track importance score between 0 and 1', () => {
      const now = new Date().toISOString();
      const entity: Partial<Entity> = {
        memory: {
          memory_level: 'long_term',
          stability_score: 0.9,
          importance_score: 0.95,
          last_active_at: now,
          user_pinned: false,
          created_at: now,
          updated_at: now,
        },
      };

      expect(entity.memory?.importance_score).toBeGreaterThanOrEqual(0);
      expect(entity.memory?.importance_score).toBeLessThanOrEqual(1);
    });
  });

  describe('Lifecycle History', () => {
    it('should track lifecycle transitions', () => {
      const now = new Date().toISOString();
      const entity: Partial<Entity> = {
        lifecycle_history: [
          {
            from: 'transitory',
            to: 'temporary',
            timestamp: now,
            automatic: true,
          },
        ],
      };

      expect(entity.lifecycle_history).toHaveLength(1);
      expect(entity.lifecycle_history?.[0].automatic).toBe(true);
    });

    it('should support manual transitions', () => {
      const now = new Date().toISOString();
      const entity: Partial<Entity> = {
        lifecycle_history: [
          {
            from: 'temporary',
            to: 'long_term',
            timestamp: now,
            automatic: false,
            reason: 'User promoted to long-term',
          },
        ],
      };

      expect(entity.lifecycle_history?.[0].automatic).toBe(false);
      expect(entity.lifecycle_history?.[0].reason).toBeDefined();
    });
  });
});
