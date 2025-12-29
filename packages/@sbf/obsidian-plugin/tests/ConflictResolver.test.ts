/**
 * ConflictResolver Unit Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ConflictResolver } from '../src/sync/ConflictResolver';

describe('ConflictResolver', () => {
  let resolver: ConflictResolver;

  beforeEach(() => {
    resolver = new ConflictResolver();
  });

  describe('detectConflict', () => {
    it('should detect conflict when both modified', () => {
      const local = {
        uid: 'test-uid',
        content: 'Local content',
        checksum: 'local-hash',
        modified: new Date('2024-01-02'),
      };
      const remote = {
        uid: 'test-uid',
        content: 'Remote content',
        checksum: 'remote-hash',
        updatedAt: '2024-01-03T00:00:00Z',
      };
      const base = {
        checksum: 'base-hash',
        syncedAt: new Date('2024-01-01'),
      };

      const conflict = resolver.detectConflict(local, remote, base);

      expect(conflict).not.toBeNull();
      expect(conflict?.uid).toBe('test-uid');
      expect(conflict?.localVersion.content).toBe('Local content');
      expect(conflict?.remoteVersion.content).toBe('Remote content');
    });

    it('should not detect conflict when only local modified', () => {
      const local = {
        uid: 'test-uid',
        content: 'New local content',
        checksum: 'local-hash',
        modified: new Date('2024-01-02'),
      };
      const remote = {
        uid: 'test-uid',
        content: 'Base content',
        checksum: 'base-hash',
        updatedAt: '2024-01-01T00:00:00Z',
      };
      const base = {
        checksum: 'base-hash',
        syncedAt: new Date('2024-01-01'),
      };

      const conflict = resolver.detectConflict(local, remote, base);

      expect(conflict).toBeNull();
    });

    it('should not detect conflict when only remote modified', () => {
      const local = {
        uid: 'test-uid',
        content: 'Base content',
        checksum: 'base-hash',
        modified: new Date('2024-01-01'),
      };
      const remote = {
        uid: 'test-uid',
        content: 'New remote content',
        checksum: 'remote-hash',
        updatedAt: '2024-01-02T00:00:00Z',
      };
      const base = {
        checksum: 'base-hash',
        syncedAt: new Date('2024-01-01'),
      };

      const conflict = resolver.detectConflict(local, remote, base);

      expect(conflict).toBeNull();
    });

    it('should not detect conflict when unchanged', () => {
      const local = {
        uid: 'test-uid',
        content: 'Same content',
        checksum: 'same-hash',
        modified: new Date('2024-01-01'),
      };
      const remote = {
        uid: 'test-uid',
        content: 'Same content',
        checksum: 'same-hash',
        updatedAt: '2024-01-01T00:00:00Z',
      };
      const base = {
        checksum: 'same-hash',
        syncedAt: new Date('2024-01-01'),
      };

      const conflict = resolver.detectConflict(local, remote, base);

      expect(conflict).toBeNull();
    });
  });

  describe('detectDeletionConflict', () => {
    it('should detect local deletion with remote modification', () => {
      const remote = {
        uid: 'test-uid',
        content: 'Modified remote',
        checksum: 'new-hash',
        updatedAt: '2024-01-02T00:00:00Z',
      };
      const base = {
        checksum: 'old-hash',
        syncedAt: new Date('2024-01-01'),
      };

      const conflict = resolver.detectDeletionConflict('test-uid', remote, base);

      expect(conflict).not.toBeNull();
      expect(conflict?.localVersion).toBeUndefined();
      expect(conflict?.remoteVersion.content).toBe('Modified remote');
    });

    it('should not detect conflict for unchanged remote', () => {
      const remote = {
        uid: 'test-uid',
        content: 'Base content',
        checksum: 'base-hash',
        updatedAt: '2024-01-01T00:00:00Z',
      };
      const base = {
        checksum: 'base-hash',
        syncedAt: new Date('2024-01-01'),
      };

      const conflict = resolver.detectDeletionConflict('test-uid', remote, base);

      expect(conflict).toBeNull();
    });
  });

  describe('resolveLocal', () => {
    it('should return local version', () => {
      const conflict = {
        uid: 'test-uid',
        path: 'notes/test.md',
        localVersion: { content: 'Local', modified: new Date() },
        remoteVersion: { content: 'Remote', modified: new Date() },
        detectedAt: new Date(),
      };

      const result = resolver.resolveLocal(conflict);

      expect(result.content).toBe('Local');
      expect(result.action).toBe('upload');
    });
  });

  describe('resolveRemote', () => {
    it('should return remote version', () => {
      const conflict = {
        uid: 'test-uid',
        path: 'notes/test.md',
        localVersion: { content: 'Local', modified: new Date() },
        remoteVersion: { content: 'Remote', modified: new Date() },
        detectedAt: new Date(),
      };

      const result = resolver.resolveRemote(conflict);

      expect(result.content).toBe('Remote');
      expect(result.action).toBe('download');
    });
  });

  describe('autoResolveNewest', () => {
    it('should choose local when newer', () => {
      const conflict = {
        uid: 'test-uid',
        path: 'notes/test.md',
        localVersion: { content: 'Local', modified: new Date('2024-01-02') },
        remoteVersion: { content: 'Remote', modified: new Date('2024-01-01') },
        detectedAt: new Date(),
      };

      const result = resolver.autoResolveNewest(conflict);

      expect(result.content).toBe('Local');
      expect(result.action).toBe('upload');
    });

    it('should choose remote when newer', () => {
      const conflict = {
        uid: 'test-uid',
        path: 'notes/test.md',
        localVersion: { content: 'Local', modified: new Date('2024-01-01') },
        remoteVersion: { content: 'Remote', modified: new Date('2024-01-02') },
        detectedAt: new Date(),
      };

      const result = resolver.autoResolveNewest(conflict);

      expect(result.content).toBe('Remote');
      expect(result.action).toBe('download');
    });
  });

  describe('generateMerge', () => {
    it('should generate merge markers', () => {
      const conflict = {
        uid: 'test-uid',
        path: 'notes/test.md',
        localVersion: { content: 'Local content', modified: new Date() },
        remoteVersion: { content: 'Remote content', modified: new Date() },
        detectedAt: new Date(),
      };

      const result = resolver.generateMerge(conflict);

      expect(result).toContain('<<<<<<< LOCAL');
      expect(result).toContain('Local content');
      expect(result).toContain('=======');
      expect(result).toContain('Remote content');
      expect(result).toContain('>>>>>>> REMOTE');
    });
  });
});
