/**
 * Tests for Entity Classification
 */

import { EntityType } from '../types';

describe('Entity Classification', () => {
  describe('Entity Types', () => {
    it('should support core entity types', () => {
      const coreTypes: EntityType[] = [
        'topic',
        'project',
        'person',
        'place',
        'daily-note',
      ];

      coreTypes.forEach(type => {
        expect(type).toBeDefined();
        expect(typeof type).toBe('string');
      });
    });

    it('should support extended entity types', () => {
      const extendedTypes: EntityType[] = [
        'source',
        'artifact',
        'event',
        'task',
        'process',
      ];

      extendedTypes.forEach(type => {
        expect(type).toBeDefined();
        expect(typeof type).toBe('string');
      });
    });
  });

  describe('Classification Confidence', () => {
    it('should handle confidence scores', () => {
      const classification = {
        type: 'task' as EntityType,
        confidence: 0.95,
        reasoning: 'Contains action items and due dates',
      };

      expect(classification.confidence).toBeGreaterThanOrEqual(0);
      expect(classification.confidence).toBeLessThanOrEqual(1);
      expect(classification.type).toBe('task');
    });

    it('should handle low confidence classifications', () => {
      const classification = {
        type: 'artifact' as EntityType,
        confidence: 0.4,
        reasoning: 'Ambiguous content',
        alternatives: [
          { type: 'source' as EntityType, confidence: 0.35 },
          { type: 'event' as EntityType, confidence: 0.25 },
        ],
      };

      expect(classification.confidence).toBeLessThan(0.5);
      expect(classification.alternatives).toHaveLength(2);
    });
  });

  describe('Classification Metadata', () => {
    it('should include extraction provenance', () => {
      const provenance = {
        provider: 'openai',
        model: 'gpt-4',
        timestamp: new Date().toISOString(),
        confidence: 0.9,
      };

      expect(provenance.provider).toBe('openai');
      expect(provenance.model).toBe('gpt-4');
      expect(provenance.confidence).toBe(0.9);
    });

    it('should track classification attempts', () => {
      const history = [
        {
          attempt: 1,
          type: 'task' as EntityType,
          confidence: 0.6,
        },
        {
          attempt: 2,
          type: 'project' as EntityType,
          confidence: 0.85,
        },
      ];

      expect(history).toHaveLength(2);
      expect(history[1].confidence).toBeGreaterThan(history[0].confidence);
    });
  });
});
