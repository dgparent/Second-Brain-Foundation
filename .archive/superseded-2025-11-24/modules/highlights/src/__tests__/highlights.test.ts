import { describe, test, expect } from '@jest/globals';
import { createHighlight, addPersonalNote, linkHighlights } from '../HighlightEntity.js';
import { createInsight, linkToHighlights, makeActionable } from '../InsightEntity.js';

describe('Highlights Module', () => {
  describe('HighlightEntity', () => {
    test('should create a highlight', () => {
      const highlight = createHighlight(
        'This is an important quote',
        'The Great Book',
        'book'
      );

      expect(highlight.type).toBe('knowledge.node');
      expect(highlight.metadata.content_type).toBe('highlight');
      expect(highlight.metadata.highlight_text).toBe('This is an important quote');
      expect(highlight.metadata.source_title).toBe('The Great Book');
      expect(highlight.metadata.location.source_type).toBe('book');
    });

    test('should add personal note to highlight', () => {
      const highlight = createHighlight('Test quote', 'Test Book', 'book');
      const annotated = addPersonalNote(highlight, 'This resonates with me');

      expect(annotated.metadata.personal_note).toBe('This resonates with me');
    });

    test('should link highlights together', () => {
      const highlight = createHighlight('Test quote', 'Test Book', 'book');
      const linked = linkHighlights(highlight, ['uid1', 'uid2']);

      expect(linked.metadata.connections).toContain('uid1');
      expect(linked.metadata.connections).toContain('uid2');
      expect(linked.metadata.related_node_uids).toContain('uid1');
    });
  });

  describe('InsightEntity', () => {
    test('should create an insight', () => {
      const insight = createInsight(
        'Key Realization',
        'I realized that X leads to Y',
        'realization'
      );

      expect(insight.type).toBe('knowledge.node');
      expect(insight.metadata.content_type).toBe('insight');
      expect(insight.metadata.insight_type).toBe('realization');
      expect(insight.title).toBe('Key Realization');
      expect(insight.metadata.body).toBe('I realized that X leads to Y');
    });

    test('should link insight to source highlights', () => {
      const insight = createInsight('Test Insight', 'Body text', 'connection');
      const linked = linkToHighlights(insight, ['hl1', 'hl2']);

      expect(linked.metadata.source_highlights).toContain('hl1');
      expect(linked.metadata.source_highlights).toContain('hl2');
    });

    test('should make insight actionable', () => {
      const insight = createInsight('Test Insight', 'Body text', 'idea');
      const actionable = makeActionable(insight, ['Do task 1', 'Do task 2']);

      expect(actionable.metadata.actionable).toBe(true);
      expect(actionable.metadata.action_items).toHaveLength(2);
      expect(actionable.metadata.importance).toBe(5);
    });
  });
});
