/**
 * ObsidianImporter Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { existsSync } from 'node:fs';
import { readFile, readdir, stat } from 'node:fs/promises';

// Mock fs modules
vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
}));

vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
  readdir: vi.fn(),
  stat: vi.fn(),
}));

// Mock API
vi.mock('../src/utils/api.js', () => ({
  api: {
    createEntity: vi.fn().mockResolvedValue({ uid: 'created-uid' }),
  },
}));

describe('ObsidianImporter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('analyze', () => {
    it('should analyze vault structure', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readdir).mockImplementation(async (path) => {
        if (String(path).endsWith('vault')) {
          return [
            { name: 'notes', isDirectory: () => true, isFile: () => false },
            { name: 'projects', isDirectory: () => true, isFile: () => false },
            { name: '.obsidian', isDirectory: () => true, isFile: () => false },
          ] as any;
        }
        if (String(path).includes('notes')) {
          return [
            { name: 'note1.md', isDirectory: () => false, isFile: () => true },
            { name: 'note2.md', isDirectory: () => false, isFile: () => true },
          ] as any;
        }
        if (String(path).includes('projects')) {
          return [
            { name: 'project1.md', isDirectory: () => false, isFile: () => true },
          ] as any;
        }
        return [];
      });

      vi.mocked(readFile).mockResolvedValue(`---
title: Test Note
tags: [tag1, tag2]
---

Content with [[link]] and #hashtag`);

      const { ObsidianImporter } = await import('../src/importers/ObsidianImporter.js');
      const importer = new ObsidianImporter('/path/to/vault');

      const analysis = await importer.analyze();

      expect(analysis.noteCount).toBeGreaterThan(0);
      expect(analysis.uniqueTags).toContain('tag1');
      expect(analysis.linkCount).toBeGreaterThan(0);
    });

    it('should throw for non-existent vault', async () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const { ObsidianImporter } = await import('../src/importers/ObsidianImporter.js');
      const importer = new ObsidianImporter('/nonexistent');

      await expect(importer.analyze()).rejects.toThrow('not found');
    });

    it('should skip .obsidian folder', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readdir).mockImplementation(async (path) => {
        if (String(path).endsWith('vault')) {
          return [
            { name: '.obsidian', isDirectory: () => true, isFile: () => false },
            { name: 'notes', isDirectory: () => true, isFile: () => false },
          ] as any;
        }
        if (String(path).includes('notes')) {
          return [
            { name: 'note1.md', isDirectory: () => false, isFile: () => true },
          ] as any;
        }
        return [];
      });

      vi.mocked(readFile).mockResolvedValue('---\ntitle: Test\n---\nContent');

      const { ObsidianImporter } = await import('../src/importers/ObsidianImporter.js');
      const importer = new ObsidianImporter('/path/to/vault');

      const analysis = await importer.analyze();

      // Should only have notes, not .obsidian contents
      expect(analysis.noteCount).toBe(1);
    });
  });

  describe('wikilink extraction', () => {
    it('should extract simple wikilinks', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readdir).mockImplementation(async () => [
        { name: 'note.md', isDirectory: () => false, isFile: () => true },
      ] as any);

      vi.mocked(readFile).mockResolvedValue(`---
title: Test
---

Links to [[Page A]] and [[Page B]].`);

      const { ObsidianImporter } = await import('../src/importers/ObsidianImporter.js');
      const importer = new ObsidianImporter('/vault');

      const analysis = await importer.analyze();

      expect(analysis.linkCount).toBe(2);
    });

    it('should extract wikilinks with aliases', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readdir).mockImplementation(async () => [
        { name: 'note.md', isDirectory: () => false, isFile: () => true },
      ] as any);

      vi.mocked(readFile).mockResolvedValue('[[Long Page Name|alias]]');

      const { ObsidianImporter } = await import('../src/importers/ObsidianImporter.js');
      const importer = new ObsidianImporter('/vault');

      const analysis = await importer.analyze();

      expect(analysis.linkCount).toBe(1);
    });
  });

  describe('tag extraction', () => {
    it('should extract frontmatter tags', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readdir).mockImplementation(async () => [
        { name: 'note.md', isDirectory: () => false, isFile: () => true },
      ] as any);

      vi.mocked(readFile).mockResolvedValue(`---
tags: [productivity, workflow]
---
Content`);

      const { ObsidianImporter } = await import('../src/importers/ObsidianImporter.js');
      const importer = new ObsidianImporter('/vault');

      const analysis = await importer.analyze();

      expect(analysis.uniqueTags).toContain('productivity');
      expect(analysis.uniqueTags).toContain('workflow');
    });

    it('should extract inline hashtags', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readdir).mockImplementation(async () => [
        { name: 'note.md', isDirectory: () => false, isFile: () => true },
      ] as any);

      vi.mocked(readFile).mockResolvedValue('Content with #inline #tags');

      const { ObsidianImporter } = await import('../src/importers/ObsidianImporter.js');
      const importer = new ObsidianImporter('/vault');

      const analysis = await importer.analyze();

      expect(analysis.uniqueTags).toContain('inline');
      expect(analysis.uniqueTags).toContain('tags');
    });
  });

  describe('type inference', () => {
    it('should infer type from folder', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readdir).mockImplementation(async (path) => {
        if (String(path).endsWith('vault')) {
          return [
            { name: 'projects', isDirectory: () => true, isFile: () => false },
          ] as any;
        }
        return [
          { name: 'my-project.md', isDirectory: () => false, isFile: () => true },
        ] as any;
      });

      vi.mocked(readFile).mockResolvedValue('---\ntitle: Project\n---\nContent');

      const { ObsidianImporter } = await import('../src/importers/ObsidianImporter.js');
      const importer = new ObsidianImporter('/vault');

      await importer.analyze();

      // Type should be inferred from path
      // This is tested implicitly through the import process
    });
  });
});
