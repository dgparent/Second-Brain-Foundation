import { PrivacyService } from '../PrivacyService';
import { InMemoryAuditStorage } from '../InMemoryAuditStorage';
import { PrivacyLevel, AIProvider } from '../types';

describe('PrivacyService', () => {
  let service: PrivacyService;
  let storage: InMemoryAuditStorage;

  beforeEach(() => {
    storage = new InMemoryAuditStorage();
    service = new PrivacyService(storage);
  });

  afterEach(async () => {
    await service.shutdown();
  });

  describe('setPrivacyLevel', () => {
    it('should set privacy level for entity', async () => {
      await service.setPrivacyLevel('entity-1', PrivacyLevel.Private, 'user-1');
      
      const entity = {
        id: 'entity-1',
        type: 'note',
        content: 'test',
      };

      const level = service.getPrivacyLevel(entity);
      expect(level).toBe(PrivacyLevel.Private);
    });
  });

  describe('canAIAccess', () => {
    it('should allow local AI to access private content', async () => {
      const entity = {
        id: 'entity-1',
        type: 'note',
        content: 'private note',
        metadata: { privacy: { level: PrivacyLevel.Private } },
      };

      const canAccess = service.canAIAccess(entity, AIProvider.LocalLLM, 'user-1');
      expect(canAccess).toBe(true);
    });

    it('should deny third-party AI access to private content', async () => {
      const entity = {
        id: 'entity-2',
        type: 'note',
        content: 'private note',
        metadata: { privacy: { level: PrivacyLevel.Private } },
      };

      const canAccess = service.canAIAccess(entity, AIProvider.OpenAI, 'user-1');
      expect(canAccess).toBe(false);
    });

    it('should deny all AI access to confidential content', async () => {
      const entity = {
        id: 'entity-3',
        type: 'note',
        content: 'confidential note',
        metadata: { privacy: { level: PrivacyLevel.Confidential } },
      };

      expect(service.canAIAccess(entity, AIProvider.LocalLLM)).toBe(false);
      expect(service.canAIAccess(entity, AIProvider.OpenAI)).toBe(false);
    });
  });

  describe('processForAI', () => {
    it('should deny access to confidential content', async () => {
      const entity = {
        id: 'entity-1',
        type: 'note',
        content: 'confidential',
        metadata: { privacy: { level: PrivacyLevel.Confidential } },
      };

      const result = await service.processForAI(entity, AIProvider.OpenAI, 'user-1');

      expect(result.allowed).toBe(false);
      expect(result.content).toBe('');
      expect(result.violations).toHaveLength(1);
    });

    it('should filter personal content for third-party AI', async () => {
      const entity = {
        id: 'entity-2',
        type: 'note',
        content: 'Contact: test@example.com',
        metadata: { privacy: { level: PrivacyLevel.Personal } },
      };

      const result = await service.processForAI(entity, AIProvider.OpenAI, 'user-1');

      expect(result.allowed).toBe(true);
      expect(result.filtered).toBe(true);
      expect(result.content).not.toContain('test@example.com');
    });

    it('should allow unfiltered access for public content', async () => {
      const entity = {
        id: 'entity-3',
        type: 'note',
        content: 'Public information',
        metadata: { privacy: { level: PrivacyLevel.Public } },
      };

      const result = await service.processForAI(entity, AIProvider.OpenAI, 'user-1');

      expect(result.allowed).toBe(true);
      expect(result.filtered).toBe(false);
      expect(result.content).toBe('Public information');
    });

    it('should log audit trail', async () => {
      const entity = {
        id: 'entity-4',
        type: 'note',
        content: 'test',
        metadata: { privacy: { level: PrivacyLevel.Public } },
      };

      await service.processForAI(entity, AIProvider.OpenAI, 'user-1');

      const audit = await service.getAuditTrail('entity-4');
      expect(audit.length).toBeGreaterThan(0);
      expect(audit[0].action).toBe('access');
    });

    it('should log violations for denied access', async () => {
      const entity = {
        id: 'entity-5',
        type: 'note',
        content: 'confidential',
        metadata: { privacy: { level: PrivacyLevel.Confidential } },
      };

      await service.processForAI(entity, AIProvider.OpenAI, 'user-1');

      const violations = await service.getViolations('entity-5');
      expect(violations.length).toBeGreaterThan(0);
      expect(violations[0].severity).toBe('high');
    });
  });

  describe('statistics', () => {
    it('should track access statistics', async () => {
      const entity1 = {
        id: 'e1',
        type: 'note',
        content: 'public',
        metadata: { privacy: { level: PrivacyLevel.Public } },
      };

      const entity2 = {
        id: 'e2',
        type: 'note',
        content: 'private',
        metadata: { privacy: { level: PrivacyLevel.Private } },
      };

      await service.processForAI(entity1, AIProvider.OpenAI);
      await service.processForAI(entity2, AIProvider.OpenAI);

      const stats = await service.getStatistics();
      expect(stats.totalAccesses).toBeGreaterThan(0);
      expect(stats.totalDenials).toBeGreaterThan(0);
    });
  });
});
