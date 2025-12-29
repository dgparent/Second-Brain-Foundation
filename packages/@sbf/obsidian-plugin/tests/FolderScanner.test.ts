/**
 * FolderScanner Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Obsidian App
const mockFiles = [
  { path: 'notes/note1.md', extension: 'md', stat: { mtime: Date.now() } },
  { path: 'notes/note2.md', extension: 'md', stat: { mtime: Date.now() } },
  { path: 'projects/project1.md', extension: 'md', stat: { mtime: Date.now() } },
  { path: 'people/person1.md', extension: 'md', stat: { mtime: Date.now() } },
  { path: 'resources/resource1.md', extension: 'md', stat: { mtime: Date.now() } },
  { path: 'templates/template1.md', extension: 'md', stat: { mtime: Date.now() } },
  { path: '.obsidian/config.json', extension: 'json', stat: { mtime: Date.now() } },
  { path: 'image.png', extension: 'png', stat: { mtime: Date.now() } },
];

const mockVault = {
  getMarkdownFiles: () => mockFiles.filter((f) => f.extension === 'md'),
  getAbstractFileByPath: (path: string) => mockFiles.find((f) => f.path === path),
  read: vi.fn().mockResolvedValue('---\nuid: test\n---\nContent'),
  modify: vi.fn().mockResolvedValue(undefined),
  create: vi.fn().mockResolvedValue(undefined),
  createFolder: vi.fn().mockResolvedValue(undefined),
};

const mockApp = {
  vault: mockVault,
};

describe('FolderScanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('scan', () => {
    it('should scan vault and categorize files', async () => {
      // Import dynamically to allow mocking
      const { FolderScanner } = await import('../src/sync/FolderScanner');
      const scanner = new FolderScanner(mockApp as any);

      const result = await scanner.scan();

      expect(result.notes).toHaveLength(2);
      expect(result.projects).toHaveLength(1);
      expect(result.people).toHaveLength(1);
      expect(result.resources).toHaveLength(1);
      expect(result.templates).toHaveLength(1);
    });

    it('should exclude hidden folders', async () => {
      const { FolderScanner } = await import('../src/sync/FolderScanner');
      const scanner = new FolderScanner(mockApp as any);

      const result = await scanner.scan();

      const allFiles = [
        ...result.notes,
        ...result.projects,
        ...result.people,
        ...result.resources,
        ...result.templates,
        ...result.other,
      ];

      expect(allFiles.every((f) => !f.path.startsWith('.obsidian'))).toBe(true);
    });
  });

  describe('getAllFiles', () => {
    it('should return all markdown files', async () => {
      const { FolderScanner } = await import('../src/sync/FolderScanner');
      const scanner = new FolderScanner(mockApp as any);

      const files = await scanner.getAllFiles();

      expect(files).toHaveLength(6); // 6 .md files
      expect(files.every((f) => f.endsWith('.md'))).toBe(true);
    });
  });

  describe('inferTypeFromPath', () => {
    it('should infer type from folder path', async () => {
      const { FolderScanner } = await import('../src/sync/FolderScanner');
      const scanner = new FolderScanner(mockApp as any);

      expect(scanner.inferTypeFromPath('notes/my-note.md')).toBe('note');
      expect(scanner.inferTypeFromPath('projects/my-project.md')).toBe('project');
      expect(scanner.inferTypeFromPath('people/john-doe.md')).toBe('person');
      expect(scanner.inferTypeFromPath('resources/book.md')).toBe('resource');
      expect(scanner.inferTypeFromPath('templates/daily.md')).toBe('template');
      expect(scanner.inferTypeFromPath('random/file.md')).toBe('note');
    });

    it('should handle nested paths', async () => {
      const { FolderScanner } = await import('../src/sync/FolderScanner');
      const scanner = new FolderScanner(mockApp as any);

      expect(scanner.inferTypeFromPath('projects/work/project1.md')).toBe('project');
      expect(scanner.inferTypeFromPath('people/team/person.md')).toBe('person');
    });
  });

  describe('getModifiedSince', () => {
    it('should return files modified after timestamp', async () => {
      const now = Date.now();
      const oldTime = now - 100000;

      const filesWithTimes = [
        { path: 'notes/old.md', extension: 'md', stat: { mtime: oldTime } },
        { path: 'notes/new.md', extension: 'md', stat: { mtime: now } },
      ];

      const testVault = {
        ...mockVault,
        getMarkdownFiles: () => filesWithTimes,
      };

      const { FolderScanner } = await import('../src/sync/FolderScanner');
      const scanner = new FolderScanner({ vault: testVault } as any);

      const cutoff = new Date(now - 50000);
      const modified = await scanner.getModifiedSince(cutoff);

      expect(modified).toHaveLength(1);
      expect(modified[0]).toBe('notes/new.md');
    });
  });

  describe('ensureStructure', () => {
    it('should create missing folders', async () => {
      const { FolderScanner } = await import('../src/sync/FolderScanner');
      const scanner = new FolderScanner(mockApp as any);

      await scanner.ensureStructure();

      // Should attempt to create standard folders
      expect(mockVault.createFolder).toHaveBeenCalled();
    });
  });
});
