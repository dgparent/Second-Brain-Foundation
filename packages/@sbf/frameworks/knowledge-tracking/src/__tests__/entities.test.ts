import { KnowledgeNodeEntity } from '../entities/KnowledgeNodeEntity';
import { LearningResourceEntity } from '../entities/LearningResourceEntity';
import { LearningSessionEntity } from '../entities/LearningSessionEntity';

describe('Knowledge Entities', () => {
  describe('KnowledgeNodeEntity', () => {
    it('should have correct entity structure', () => {
      const node: KnowledgeNodeEntity = {
        uid: 'node-001',
        type: 'knowledge.node',
        title: 'JavaScript',
        lifecycle: { state: 'permanent' },
        sensitivity: {
          level: 'personal',
          privacy: {
            cloud_ai_allowed: true,
            local_ai_allowed: true,
            export_allowed: true,
          },
        },
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        metadata: {
          content_type: 'concept',
          tags: ['programming', 'javascript'],
          status: 'active',
          times_reviewed: 0,
          created_date: new Date().toISOString(),
          modified_date: new Date().toISOString(),
        },
      };

      expect(node.uid).toBe('node-001');
      expect(node.type).toBe('knowledge.node');
      expect(node.title).toBe('JavaScript');
    });
  });

  describe('LearningResourceEntity', () => {
    it.todo('Test learning resource creation');
  });

  describe('LearningSessionEntity', () => {
    it.todo('Test learning session creation');
  });
});
