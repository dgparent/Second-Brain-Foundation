/**
 * PermissionChecker Tests
 *
 * Tests for the permission checking service.
 */

import {
  PermissionChecker,
  SensitivityLevel,
} from '../src';

describe('PermissionChecker', () => {
  let checker: PermissionChecker;

  beforeEach(() => {
    checker = new PermissionChecker();
  });

  describe('Cloud AI Access', () => {
    it('should allow cloud AI for public content', () => {
      const result = checker.canAccessCloudAI(SensitivityLevel.PUBLIC);
      expect(result.allowed).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should block cloud AI for personal content', () => {
      const result = checker.canAccessCloudAI(SensitivityLevel.PERSONAL);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Personal');
    });

    it('should block cloud AI for confidential content', () => {
      const result = checker.canAccessCloudAI(SensitivityLevel.CONFIDENTIAL);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Confidential');
    });

    it('should block cloud AI for secret content', () => {
      const result = checker.canAccessCloudAI(SensitivityLevel.SECRET);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('SECRET');
    });
  });

  describe('Local AI Access', () => {
    it('should allow local AI for public content', () => {
      const result = checker.canAccessLocalAI(SensitivityLevel.PUBLIC);
      expect(result.allowed).toBe(true);
    });

    it('should allow local AI for personal content', () => {
      const result = checker.canAccessLocalAI(SensitivityLevel.PERSONAL);
      expect(result.allowed).toBe(true);
    });

    it('should allow local AI for confidential content', () => {
      const result = checker.canAccessLocalAI(SensitivityLevel.CONFIDENTIAL);
      expect(result.allowed).toBe(true);
    });

    it('should block local AI for secret content (FR19)', () => {
      const result = checker.canAccessLocalAI(SensitivityLevel.SECRET);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('SECRET');
    });
  });

  describe('Export Permissions', () => {
    it('should allow export for public content', () => {
      const result = checker.canExport(SensitivityLevel.PUBLIC);
      expect(result.allowed).toBe(true);
    });

    it('should allow export for personal content', () => {
      const result = checker.canExport(SensitivityLevel.PERSONAL);
      expect(result.allowed).toBe(true);
    });

    it('should block export for confidential content', () => {
      const result = checker.canExport(SensitivityLevel.CONFIDENTIAL);
      expect(result.allowed).toBe(false);
    });

    it('should block export for secret content', () => {
      const result = checker.canExport(SensitivityLevel.SECRET);
      expect(result.allowed).toBe(false);
    });
  });

  describe('Share Permissions', () => {
    it('should allow sharing for public content', () => {
      const result = checker.canShare(SensitivityLevel.PUBLIC);
      expect(result.allowed).toBe(true);
    });

    it('should block sharing for personal content', () => {
      const result = checker.canShare(SensitivityLevel.PERSONAL);
      expect(result.allowed).toBe(false);
    });

    it('should block sharing for confidential content', () => {
      const result = checker.canShare(SensitivityLevel.CONFIDENTIAL);
      expect(result.allowed).toBe(false);
    });

    it('should block sharing for secret content', () => {
      const result = checker.canShare(SensitivityLevel.SECRET);
      expect(result.allowed).toBe(false);
    });
  });

  describe('Index Permissions', () => {
    it('should allow indexing for public through confidential', () => {
      expect(checker.canIndex(SensitivityLevel.PUBLIC).allowed).toBe(true);
      expect(checker.canIndex(SensitivityLevel.PERSONAL).allowed).toBe(true);
      expect(checker.canIndex(SensitivityLevel.CONFIDENTIAL).allowed).toBe(true);
    });

    it('should block indexing for secret content', () => {
      const result = checker.canIndex(SensitivityLevel.SECRET);
      expect(result.allowed).toBe(false);
    });
  });

  describe('isDowngrade', () => {
    it('should detect downgrade from secret to confidential', () => {
      expect(checker.isDowngrade(SensitivityLevel.SECRET, SensitivityLevel.CONFIDENTIAL)).toBe(true);
    });

    it('should detect downgrade from confidential to personal', () => {
      expect(checker.isDowngrade(SensitivityLevel.CONFIDENTIAL, SensitivityLevel.PERSONAL)).toBe(true);
    });

    it('should detect downgrade from personal to public', () => {
      expect(checker.isDowngrade(SensitivityLevel.PERSONAL, SensitivityLevel.PUBLIC)).toBe(true);
    });

    it('should not detect upgrade as downgrade', () => {
      expect(checker.isDowngrade(SensitivityLevel.PUBLIC, SensitivityLevel.PERSONAL)).toBe(false);
      expect(checker.isDowngrade(SensitivityLevel.PERSONAL, SensitivityLevel.SECRET)).toBe(false);
    });

    it('should not detect same level as downgrade', () => {
      expect(checker.isDowngrade(SensitivityLevel.PERSONAL, SensitivityLevel.PERSONAL)).toBe(false);
    });
  });

  describe('getPermissionSummary', () => {
    it('should return all permissions for public', () => {
      const summary = checker.getPermissionSummary(SensitivityLevel.PUBLIC);
      expect(summary).toContain('Cloud AI processing');
      expect(summary).toContain('Local AI processing');
      expect(summary).toContain('Export to files');
      expect(summary).toContain('Sharing with others');
    });

    it('should return limited permissions for personal', () => {
      const summary = checker.getPermissionSummary(SensitivityLevel.PERSONAL);
      expect(summary).not.toContain('Cloud AI processing');
      expect(summary).toContain('Local AI processing');
      expect(summary).toContain('Export to files');
      expect(summary).not.toContain('Sharing with others');
    });

    it('should return no permissions for secret', () => {
      const summary = checker.getPermissionSummary(SensitivityLevel.SECRET);
      expect(summary).toHaveLength(0);
    });
  });

  describe('getRestrictionSummary', () => {
    it('should return no restrictions for public', () => {
      const restrictions = checker.getRestrictionSummary(SensitivityLevel.PUBLIC);
      expect(restrictions).toHaveLength(0);
    });

    it('should return all restrictions for secret', () => {
      const restrictions = checker.getRestrictionSummary(SensitivityLevel.SECRET);
      expect(restrictions).toContain('No cloud AI');
      expect(restrictions).toContain('No local AI');
      expect(restrictions).toContain('No export');
      expect(restrictions).toContain('No sharing');
      expect(restrictions).toContain('Not searchable');
    });
  });
});
