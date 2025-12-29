/**
 * AIAccessControl Tests
 *
 * Tests for the AI access control middleware.
 */

import {
  SensitivityLevel,
  AIAccessControl,
  AIAccessRequest,
  SensitivityService,
  AuditLogger,
} from '../src';

// Mock database
const createMockDb = () => ({
  getEntity: jest.fn(),
  getParentRelationships: jest.fn().mockResolvedValue([]),
  getChildRelationships: jest.fn().mockResolvedValue([]),
  updateEntitySensitivity: jest.fn(),
  findEntitiesByTenant: jest.fn().mockResolvedValue([]),
});

// Mock audit log database
const createMockAuditDb = () => ({
  insert: jest.fn(),
  query: jest.fn().mockResolvedValue([]),
  countByEntity: jest.fn().mockResolvedValue(0),
  deleteOlderThan: jest.fn().mockResolvedValue(0),
});

describe('AIAccessControl', () => {
  let aiAccess: AIAccessControl;
  let mockDb: ReturnType<typeof createMockDb>;
  let mockAuditDb: ReturnType<typeof createMockAuditDb>;
  let sensitivityService: SensitivityService;
  let auditLogger: AuditLogger;

  beforeEach(() => {
    mockDb = createMockDb();
    mockAuditDb = createMockAuditDb();
    auditLogger = new AuditLogger(mockAuditDb);
    sensitivityService = new SensitivityService(mockDb, auditLogger);
    aiAccess = new AIAccessControl(sensitivityService, auditLogger);
  });

  const createRequest = (
    entityUids: string[],
    aiType: 'cloud' | 'local' = 'cloud'
  ): AIAccessRequest => ({
    tenantId: 'tenant-1',
    userId: 'user-1',
    entityUids,
    aiProvider: aiType === 'cloud' ? 'openai' : 'ollama',
    aiType,
    operation: 'chat',
  });

  describe('checkAccess', () => {
    it('should allow cloud AI for public entities', async () => {
      mockDb.getEntity.mockResolvedValue({
        uid: 'note-test-001',
        tenant_id: 'tenant-1',
        sensitivity: SensitivityLevel.PUBLIC,
        sensitivityConfig: { inherit_from_parent: false },
      });

      const result = await aiAccess.checkAccess(createRequest(['note-test-001'], 'cloud'));

      expect(result.allowed).toBe(true);
      expect(result.allowedEntities).toContain('note-test-001');
      expect(result.blockedEntities).toHaveLength(0);
    });

    it('should block cloud AI for personal entities', async () => {
      mockDb.getEntity.mockResolvedValue({
        uid: 'note-test-001',
        tenant_id: 'tenant-1',
        sensitivity: SensitivityLevel.PERSONAL,
        sensitivityConfig: { inherit_from_parent: false },
      });

      const result = await aiAccess.checkAccess(createRequest(['note-test-001'], 'cloud'));

      expect(result.allowed).toBe(false);
      expect(result.blockedEntities).toContain('note-test-001');
      expect(result.allowedEntities).toHaveLength(0);
    });

    it('should allow local AI for personal entities', async () => {
      mockDb.getEntity.mockResolvedValue({
        uid: 'note-test-001',
        tenant_id: 'tenant-1',
        sensitivity: SensitivityLevel.PERSONAL,
        sensitivityConfig: { inherit_from_parent: false },
      });

      const result = await aiAccess.checkAccess(createRequest(['note-test-001'], 'local'));

      expect(result.allowed).toBe(true);
      expect(result.allowedEntities).toContain('note-test-001');
    });

    it('should block ALL AI for secret entities (FR19)', async () => {
      mockDb.getEntity.mockResolvedValue({
        uid: 'note-secret-001',
        tenant_id: 'tenant-1',
        sensitivity: SensitivityLevel.SECRET,
        sensitivityConfig: { inherit_from_parent: false },
      });

      // Cloud AI
      const cloudResult = await aiAccess.checkAccess(createRequest(['note-secret-001'], 'cloud'));
      expect(cloudResult.allowed).toBe(false);
      expect(cloudResult.blockedEntities).toContain('note-secret-001');

      // Local AI
      const localResult = await aiAccess.checkAccess(createRequest(['note-secret-001'], 'local'));
      expect(localResult.allowed).toBe(false);
      expect(localResult.blockedEntities).toContain('note-secret-001');
    });

    it('should handle mixed sensitivity entities', async () => {
      mockDb.getEntity
        .mockResolvedValueOnce({
          uid: 'note-public-001',
          tenant_id: 'tenant-1',
          sensitivity: SensitivityLevel.PUBLIC,
          sensitivityConfig: { inherit_from_parent: false },
        })
        .mockResolvedValueOnce({
          uid: 'note-secret-001',
          tenant_id: 'tenant-1',
          sensitivity: SensitivityLevel.SECRET,
          sensitivityConfig: { inherit_from_parent: false },
        });

      const result = await aiAccess.checkAccess(
        createRequest(['note-public-001', 'note-secret-001'], 'cloud')
      );

      expect(result.allowed).toBe(true); // At least one allowed
      expect(result.allowedEntities).toContain('note-public-001');
      expect(result.blockedEntities).toContain('note-secret-001');
    });

    it('should log allowed access attempts', async () => {
      mockDb.getEntity.mockResolvedValue({
        uid: 'note-test-001',
        tenant_id: 'tenant-1',
        sensitivity: SensitivityLevel.PUBLIC,
        sensitivityConfig: { inherit_from_parent: false },
      });

      await aiAccess.checkAccess(createRequest(['note-test-001'], 'cloud'));

      expect(mockAuditDb.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'ai_access_allowed',
          entity_uid: 'note-test-001',
        })
      );
    });

    it('should log blocked access attempts', async () => {
      mockDb.getEntity.mockResolvedValue({
        uid: 'note-test-001',
        tenant_id: 'tenant-1',
        sensitivity: SensitivityLevel.SECRET,
        sensitivityConfig: { inherit_from_parent: false },
      });

      await aiAccess.checkAccess(createRequest(['note-test-001'], 'cloud'));

      expect(mockAuditDb.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'ai_access_blocked',
          entity_uid: 'note-test-001',
        })
      );
    });
  });

  describe('checkStrictAccess', () => {
    it('should throw if any entity is blocked', async () => {
      mockDb.getEntity.mockResolvedValue({
        uid: 'note-secret-001',
        tenant_id: 'tenant-1',
        sensitivity: SensitivityLevel.SECRET,
        sensitivityConfig: { inherit_from_parent: false },
      });

      await expect(
        aiAccess.checkStrictAccess(createRequest(['note-secret-001'], 'cloud'))
      ).rejects.toThrow('AI access blocked');
    });

    it('should not throw if all entities are allowed', async () => {
      mockDb.getEntity.mockResolvedValue({
        uid: 'note-public-001',
        tenant_id: 'tenant-1',
        sensitivity: SensitivityLevel.PUBLIC,
        sensitivityConfig: { inherit_from_parent: false },
      });

      await expect(
        aiAccess.checkStrictAccess(createRequest(['note-public-001'], 'cloud'))
      ).resolves.toBeUndefined();
    });
  });

  describe('filterAllowed', () => {
    it('should return only allowed entities', async () => {
      mockDb.getEntity
        .mockResolvedValueOnce({
          uid: 'note-public-001',
          tenant_id: 'tenant-1',
          sensitivity: SensitivityLevel.PUBLIC,
          sensitivityConfig: { inherit_from_parent: false },
        })
        .mockResolvedValueOnce({
          uid: 'note-secret-001',
          tenant_id: 'tenant-1',
          sensitivity: SensitivityLevel.SECRET,
          sensitivityConfig: { inherit_from_parent: false },
        });

      const allowed = await aiAccess.filterAllowed(
        createRequest(['note-public-001', 'note-secret-001'], 'cloud')
      );

      expect(allowed).toEqual(['note-public-001']);
    });
  });

  describe('getWarningMessage', () => {
    it('should return null when no entities are blocked', () => {
      const message = aiAccess.getWarningMessage({
        allowed: true,
        blockedEntities: [],
        allowedEntities: ['note-1', 'note-2'],
      });

      expect(message).toBeNull();
    });

    it('should return warning message when entities are blocked', () => {
      const message = aiAccess.getWarningMessage({
        allowed: true,
        blockedEntities: ['note-1'],
        allowedEntities: ['note-2'],
      });

      expect(message).toContain('1 source(s) were excluded');
      expect(message).toContain('1 source(s) will be processed');
    });
  });
});
