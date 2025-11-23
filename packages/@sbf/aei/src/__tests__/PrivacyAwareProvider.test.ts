/**
 * Tests for Privacy-Aware AEI Provider
 */

import { PrivacyAwareProvider, PrivacyAwareProviderFactory } from '../PrivacyAwareProvider';
import { BaseAIProvider, ExtractedEntity, Classification, InferredRelationship } from '../providers/BaseProvider';
import { PrivacyService, PrivacyLevel, AIProvider, InMemoryAuditStorage } from '@sbf/core-privacy';
import { Entity } from '@sbf/shared';

// Mock provider for testing
class MockProvider extends BaseAIProvider {
  constructor() {
    super('mock-key', 'mock-model');
  }

  async extractEntities(text: string): Promise<ExtractedEntity[]> {
    return [
      {
        type: 'person',
        name: 'John Doe',
        attributes: {},
        confidence: 0.9,
      },
    ];
  }

  async classifyContent(text: string): Promise<Classification> {
    return {
      category: 'personal',
      tags: ['test'],
      confidence: 0.8,
    };
  }

  async inferRelationships(entities: Entity[]): Promise<InferredRelationship[]> {
    return entities.length > 1
      ? [
          {
            from: entities[0].id,
            to: entities[1].id,
            type: 'related_to',
            confidence: 0.7,
          },
        ]
      : [];
  }

  async testConnection(): Promise<boolean> {
    return true;
  }
}

describe('PrivacyAwareProvider', () => {
  let mockProvider: MockProvider;
  let privacyService: PrivacyService;
  let auditStorage: InMemoryAuditStorage;
  let privacyProvider: PrivacyAwareProvider;
  const userId = 'test-user';

  beforeEach(() => {
    mockProvider = new MockProvider();
    auditStorage = new InMemoryAuditStorage();
    privacyService = new PrivacyService(auditStorage);
    privacyProvider = new PrivacyAwareProvider({
      provider: mockProvider,
      privacyService,
      userId,
      providerName: 'OpenAI',
    });
  });

  describe('extractEntities', () => {
    it('should allow extraction for public content', async () => {
      const result = await privacyProvider.extractEntities('Hello world', {
        entityId: 'entity-1',
        entityName: 'Test Entity',
      });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('John Doe');
    });

    it('should allow extraction for personal content with OpenAI (filtered)', async () => {
      const entityId = 'entity-2';
      await privacyService.setPrivacyLevel(entityId, PrivacyLevel.Personal, userId);

      const result = await privacyProvider.extractEntities('My email is test@example.com', {
        entityId,
        entityName: 'Personal Note',
      });

      expect(result).toHaveLength(1);
      // Verify audit trail
      const audit = await privacyService.getAuditTrail(entityId);
      expect(audit.length).toBeGreaterThan(0);
      expect(audit[0].action).toBe('filtered');
    });

    it('should deny extraction for private content with OpenAI', async () => {
      const entityId = 'entity-3';
      await privacyService.setPrivacyLevel(entityId, PrivacyLevel.Private, userId);

      await expect(
        privacyProvider.extractEntities('Private data', {
          entityId,
          entityName: 'Private Note',
        })
      ).rejects.toThrow('AI access denied');

      // Verify violation was logged
      const violations = await privacyService.getViolations();
      expect(violations.length).toBeGreaterThan(0);
    });

    it('should deny extraction for confidential content', async () => {
      const entityId = 'entity-4';
      await privacyService.setPrivacyLevel(entityId, PrivacyLevel.Confidential, userId);

      await expect(
        privacyProvider.extractEntities('Confidential data', {
          entityId,
          entityName: 'Confidential Note',
        })
      ).rejects.toThrow('AI access denied');
    });

    it('should allow extraction for private content with LocalLLM', async () => {
      const localProvider = new PrivacyAwareProvider({
        provider: mockProvider,
        privacyService,
        userId,
        providerName: 'Ollama',
      });

      const entityId = 'entity-5';
      await privacyService.setPrivacyLevel(entityId, PrivacyLevel.Private, userId);

      const result = await localProvider.extractEntities('Private data', {
        entityId,
        entityName: 'Private Note',
      });

      expect(result).toHaveLength(1);
    });
  });

  describe('classifyContent', () => {
    it('should allow classification for public content', async () => {
      const result = await privacyProvider.classifyContent('Test content', {
        entityId: 'class-1',
      });

      expect(result.category).toBe('personal');
      expect(result.confidence).toBe(0.8);
    });

    it('should deny classification for confidential content', async () => {
      const entityId = 'class-2';
      await privacyService.setPrivacyLevel(entityId, PrivacyLevel.Confidential, userId);

      await expect(
        privacyProvider.classifyContent('Confidential', {
          entityId,
        })
      ).rejects.toThrow('AI access denied');
    });

    it('should filter personal content before classification', async () => {
      const entityId = 'class-3';
      await privacyService.setPrivacyLevel(entityId, PrivacyLevel.Personal, userId);

      const result = await privacyProvider.classifyContent(
        'My SSN is 123-45-6789',
        {
          entityId,
        }
      );

      expect(result).toBeDefined();
      
      // Verify filtering was applied
      const audit = await privacyService.getAuditTrail(entityId);
      expect(audit[0].action).toBe('filtered');
    });
  });

  describe('inferRelationships', () => {
    it('should process allowed entities', async () => {
      const entities: Entity[] = [
        {
          id: 'rel-1',
          type: 'person',
          title: 'Alice',
          content: 'Alice is a developer',
          metadata: {
            privacy: { level: PrivacyLevel.Public },
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
          },
        },
        {
          id: 'rel-2',
          type: 'person',
          title: 'Bob',
          content: 'Bob works with Alice',
          metadata: {
            privacy: { level: PrivacyLevel.Public },
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
          },
        },
      ];

      const result = await privacyProvider.inferRelationships(entities);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('related_to');
    });

    it('should skip entities that violate privacy', async () => {
      const entities: Entity[] = [
        {
          id: 'rel-3',
          type: 'person',
          title: 'Alice',
          content: 'Public info',
          metadata: {
            privacy: { level: PrivacyLevel.Public },
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
          },
        },
        {
          id: 'rel-4',
          type: 'person',
          title: 'Bob',
          content: 'Confidential info',
          metadata: {
            privacy: { level: PrivacyLevel.Confidential },
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
          },
        },
      ];

      // Should throw because only 1 entity is allowed (need at least 2 for relationships)
      await expect(
        privacyProvider.inferRelationships(entities)
      ).rejects.toThrow();
    });

    it('should throw when no entities are allowed', async () => {
      const entities: Entity[] = [
        {
          id: 'rel-5',
          type: 'secret',
          title: 'Secret',
          content: 'Confidential',
          metadata: {
            privacy: { level: PrivacyLevel.Confidential },
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
          },
        },
      ];

      await expect(
        privacyProvider.inferRelationships(entities)
      ).rejects.toThrow('No entities allowed for AI processing');
    });
  });

  describe('testConnection', () => {
    it('should pass through to inner provider', async () => {
      const result = await privacyProvider.testConnection();
      expect(result).toBe(true);
    });
  });

  describe('privacy statistics', () => {
    it('should get privacy statistics', async () => {
      await privacyProvider.extractEntities('test', {
        entityId: 'stat-1',
      });

      const stats = await privacyProvider.getPrivacyStatistics();
      expect(stats.totalAccesses).toBeGreaterThan(0);
    });

    it('should get audit trail', async () => {
      const entityId = 'audit-1';
      await privacyProvider.extractEntities('test', {
        entityId,
      });

      const audit = await privacyProvider.getAuditTrail(entityId);
      expect(audit.length).toBeGreaterThan(0);
    });

    it('should get violations', async () => {
      const entityId = 'viol-1';
      await privacyService.setPrivacyLevel(entityId, PrivacyLevel.Confidential, userId);

      try {
        await privacyProvider.extractEntities('test', { entityId });
      } catch (e) {
        // Expected
      }

      const violations = await privacyProvider.getViolations();
      expect(violations.length).toBeGreaterThan(0);
    });
  });

  describe('PrivacyAwareProviderFactory', () => {
    it('should create privacy-aware provider', () => {
      const provider = PrivacyAwareProviderFactory.create(
        mockProvider,
        privacyService,
        userId,
        'OpenAI'
      );

      expect(provider).toBeInstanceOf(PrivacyAwareProvider);
    });

    it('should wrap provider with new privacy service', () => {
      const provider = PrivacyAwareProviderFactory.wrap(
        mockProvider,
        auditStorage,
        userId,
        'Anthropic'
      );

      expect(provider).toBeInstanceOf(PrivacyAwareProvider);
    });
  });
});
