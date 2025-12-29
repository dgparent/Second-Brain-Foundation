/**
 * Security Tests
 *
 * Critical security tests for privacy engine per PRD FR19.
 * These tests MUST pass for production deployment.
 */

import {
  SensitivityLevel,
  PermissionChecker,
  DEFAULT_PERMISSIONS,
} from '../src';

describe('SECURITY: Secret Content Protection (FR19)', () => {
  let checker: PermissionChecker;

  beforeEach(() => {
    checker = new PermissionChecker();
  });

  /**
   * CRITICAL: Secret content MUST NEVER be processed by ANY AI
   */
  describe('Secret Content AI Blocking', () => {
    it('MUST block secret content from cloud AI', () => {
      const result = checker.canAccessCloudAI(SensitivityLevel.SECRET);
      expect(result.allowed).toBe(false);
    });

    it('MUST block secret content from local AI', () => {
      const result = checker.canAccessLocalAI(SensitivityLevel.SECRET);
      expect(result.allowed).toBe(false);
    });

    it('MUST block secret content from both AI types via canAccessAI', () => {
      expect(checker.canAccessAI(SensitivityLevel.SECRET, 'cloud').allowed).toBe(false);
      expect(checker.canAccessAI(SensitivityLevel.SECRET, 'local').allowed).toBe(false);
    });
  });

  /**
   * CRITICAL: Secret content MUST NOT be searchable
   */
  describe('Secret Content Search Blocking', () => {
    it('MUST block secret content from search index', () => {
      const result = checker.canIndex(SensitivityLevel.SECRET);
      expect(result.allowed).toBe(false);
    });
  });

  /**
   * CRITICAL: Secret content MUST NOT be exportable
   */
  describe('Secret Content Export Blocking', () => {
    it('MUST block secret content from export', () => {
      const result = checker.canExport(SensitivityLevel.SECRET);
      expect(result.allowed).toBe(false);
    });
  });

  /**
   * CRITICAL: Secret content MUST NOT be shareable
   */
  describe('Secret Content Share Blocking', () => {
    it('MUST block secret content from sharing', () => {
      const result = checker.canShare(SensitivityLevel.SECRET);
      expect(result.allowed).toBe(false);
    });
  });

  /**
   * CRITICAL: Secret content MUST NOT be synced to cloud
   */
  describe('Secret Content Sync Blocking', () => {
    it('MUST block secret content from cloud sync', () => {
      const result = checker.canSync(SensitivityLevel.SECRET);
      expect(result.allowed).toBe(false);
    });
  });

  /**
   * Verify DEFAULT_PERMISSIONS matrix is correctly configured
   */
  describe('DEFAULT_PERMISSIONS Matrix Verification', () => {
    it('MUST have all secret permissions set to false', () => {
      const secretPerms = DEFAULT_PERMISSIONS[SensitivityLevel.SECRET];
      
      expect(secretPerms.cloud_ai_allowed).toBe(false);
      expect(secretPerms.local_ai_allowed).toBe(false);
      expect(secretPerms.export_allowed).toBe(false);
      expect(secretPerms.sync_allowed).toBe(false);
      expect(secretPerms.share_allowed).toBe(false);
      expect(secretPerms.index_allowed).toBe(false);
    });

    it('MUST block cloud AI for non-public content', () => {
      expect(DEFAULT_PERMISSIONS[SensitivityLevel.PERSONAL].cloud_ai_allowed).toBe(false);
      expect(DEFAULT_PERMISSIONS[SensitivityLevel.CONFIDENTIAL].cloud_ai_allowed).toBe(false);
      expect(DEFAULT_PERMISSIONS[SensitivityLevel.SECRET].cloud_ai_allowed).toBe(false);
    });

    it('MUST allow cloud AI only for public content', () => {
      expect(DEFAULT_PERMISSIONS[SensitivityLevel.PUBLIC].cloud_ai_allowed).toBe(true);
    });
  });
});

describe('SECURITY: Permission Matrix Completeness', () => {
  it('MUST define permissions for all sensitivity levels', () => {
    const levels = Object.values(SensitivityLevel);
    
    for (const level of levels) {
      const perms = DEFAULT_PERMISSIONS[level];
      expect(perms).toBeDefined();
      expect(typeof perms.cloud_ai_allowed).toBe('boolean');
      expect(typeof perms.local_ai_allowed).toBe('boolean');
      expect(typeof perms.export_allowed).toBe('boolean');
      expect(typeof perms.sync_allowed).toBe('boolean');
      expect(typeof perms.share_allowed).toBe('boolean');
      expect(typeof perms.index_allowed).toBe('boolean');
    }
  });

  it('MUST have increasingly restrictive permissions', () => {
    // Public should have more permissions than personal
    expect(DEFAULT_PERMISSIONS[SensitivityLevel.PUBLIC].cloud_ai_allowed).toBe(true);
    expect(DEFAULT_PERMISSIONS[SensitivityLevel.PERSONAL].cloud_ai_allowed).toBe(false);

    // Personal should have more permissions than confidential
    expect(DEFAULT_PERMISSIONS[SensitivityLevel.PERSONAL].export_allowed).toBe(true);
    expect(DEFAULT_PERMISSIONS[SensitivityLevel.CONFIDENTIAL].export_allowed).toBe(false);

    // Confidential should have more permissions than secret
    expect(DEFAULT_PERMISSIONS[SensitivityLevel.CONFIDENTIAL].local_ai_allowed).toBe(true);
    expect(DEFAULT_PERMISSIONS[SensitivityLevel.SECRET].local_ai_allowed).toBe(false);
  });
});

describe('SECURITY: Default Sensitivity (FR16)', () => {
  it('MUST have personal as a valid sensitivity level', () => {
    expect(SensitivityLevel.PERSONAL).toBe('personal');
  });

  it('MUST have personal permissions that block cloud AI', () => {
    // Per FR16, default is personal
    // Per FR18, personal blocks cloud AI
    expect(DEFAULT_PERMISSIONS[SensitivityLevel.PERSONAL].cloud_ai_allowed).toBe(false);
  });
});
