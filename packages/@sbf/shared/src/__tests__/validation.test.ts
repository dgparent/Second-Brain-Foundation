/**
 * Tests for Validation Utilities
 */

import { validateEntity, isValidISO8601 } from '../utils/validation';
import { Entity } from '../types';
import { now } from '../utils/date';

describe('Validation Utilities', () => {
  describe('isValidISO8601', () => {
    it('should validate correct ISO8601 dates', () => {
      expect(isValidISO8601('2024-01-01T00:00:00.000Z')).toBe(true);
      expect(isValidISO8601(now())).toBe(true);
    });

    it('should reject invalid dates', () => {
      expect(isValidISO8601('2024-01-01')).toBe(false);
      expect(isValidISO8601('invalid')).toBe(false);
      expect(isValidISO8601('')).toBe(false);
    });
  });

  describe('validateEntity', () => {
    const validEntity: Entity = {
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
      importance: 3,
      provenance: {
        sources: ['manual-001'],
        confidence: 1.0,
      },
    };

    it('should validate correct entity', () => {
      const result = validateEntity(validEntity);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject missing UID', () => {
      const entity = { ...validEntity, uid: undefined };
      const result = validateEntity(entity);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('UID is required');
    });

    it('should reject missing type', () => {
      const entity = { ...validEntity, type: undefined };
      const result = validateEntity(entity);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Type is required');
    });

    it('should reject missing title', () => {
      const entity = { ...validEntity, title: undefined };
      const result = validateEntity(entity);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Title is required');
    });

    it('should reject title exceeding max length', () => {
      const entity = { ...validEntity, title: 'a'.repeat(300) };
      const result = validateEntity(entity);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Title exceeds'))).toBe(true);
    });

    it('should reject invalid created timestamp', () => {
      const entity = { ...validEntity, created: 'invalid' };
      const result = validateEntity(entity);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Created timestamp'))).toBe(true);
    });

    it('should reject invalid updated timestamp', () => {
      const entity = { ...validEntity, updated: 'invalid' };
      const result = validateEntity(entity);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Updated timestamp'))).toBe(true);
    });

    it('should reject invalid lifecycle state', () => {
      const entity = { 
        ...validEntity, 
        lifecycle: { state: 'invalid' as any }
      };
      const result = validateEntity(entity);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid lifecycle state');
    });

    it('should reject invalid sensitivity level', () => {
      const entity = { 
        ...validEntity, 
        sensitivity: { 
          level: 'invalid' as any,
          privacy: {
            cloud_ai_allowed: false,
            local_ai_allowed: true,
            export_allowed: true,
          },
        } 
      };
      const result = validateEntity(entity);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid sensitivity level');
    });

    it('should reject importance outside valid range', () => {
      const entity1 = { ...validEntity, importance: 0 };
      const result1 = validateEntity(entity1);
      expect(result1.valid).toBe(false);

      const entity2 = { ...validEntity, importance: 6 };
      const result2 = validateEntity(entity2);
      expect(result2.valid).toBe(false);
    });

    it('should reject provenance confidence outside valid range', () => {
      const entity1 = { ...validEntity, provenance: { sources: ['test-001'], confidence: -0.1 } };
      const result1 = validateEntity(entity1);
      expect(result1.valid).toBe(false);

      const entity2 = { ...validEntity, provenance: { sources: ['test-001'], confidence: 1.1 } };
      const result2 = validateEntity(entity2);
      expect(result2.valid).toBe(false);
    });

    it('should collect multiple errors', () => {
      const entity = {
        uid: undefined,
        type: undefined,
        title: undefined,
      };
      const result = validateEntity(entity);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });
});
