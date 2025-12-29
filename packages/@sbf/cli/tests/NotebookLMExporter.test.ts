/**
 * NotebookLMExporter Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { existsSync } from 'node:fs';
import { mkdir, writeFile, stat } from 'node:fs/promises';

// Mock fs modules
vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
}));

vi.mock('node:fs/promises', () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  writeFile: vi.fn().mockResolvedValue(undefined),
  stat: vi.fn().mockResolvedValue({ size: 1000 }),
}));

// Mock API
vi.mock('../src/utils/api.js', () => ({
  api: {
    listEntities: vi.fn().mockResolvedValue({
      items: [
        {
          uid: 'uid-1',
          type: 'note',
          title: 'Test Note',
          content: 'Test content',
          tags: ['tag1'],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
        },
        {
          uid: 'uid-2',
          type: 'project',
          title: 'Test Project',
          content: 'Project content',
          tags: ['work'],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
        },
      ],
    }),
    getEntity: vi.fn().mockImplementation((uid: string) => {
      if (uid === 'uid-1') {
        return {
          uid: 'uid-1',
          type: 'note',
          title: 'Test Note',
          content: 'Test content',
          tags: ['tag1'],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
        };
      }
      return null;
    }),
  },
}));

describe('NotebookLMExporter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(existsSync).mockReturnValue(false);
  });

  describe('export', () => {
    it('should export in NotebookLM format', async () => {
      const { NotebookLMExporter } = await import('../src/exporters/NotebookLMExporter.js');
      const exporter = new NotebookLMExporter();

      const result = await exporter.export({
        outputPath: '/output',
        format: 'notebooklm',
      });

      expect(result.fileCount).toBeGreaterThan(0);
      expect(mkdir).toHaveBeenCalled();
      expect(writeFile).toHaveBeenCalled();
    });

    it('should export in markdown format', async () => {
      const { NotebookLMExporter } = await import('../src/exporters/NotebookLMExporter.js');
      const exporter = new NotebookLMExporter();

      const result = await exporter.export({
        outputPath: '/output',
        format: 'markdown',
      });

      expect(result.fileCount).toBeGreaterThan(0);
      expect(writeFile).toHaveBeenCalled();
    });

    it('should export in JSON format', async () => {
      const { NotebookLMExporter } = await import('../src/exporters/NotebookLMExporter.js');
      const exporter = new NotebookLMExporter();

      const result = await exporter.export({
        outputPath: '/output',
        format: 'json',
      });

      expect(result.fileCount).toBe(1); // Single JSON file
      expect(writeFile).toHaveBeenCalled();
    });

    it('should create output directory', async () => {
      const { NotebookLMExporter } = await import('../src/exporters/NotebookLMExporter.js');
      const exporter = new NotebookLMExporter();

      await exporter.export({
        outputPath: '/new/output/path',
        format: 'json',
      });

      expect(mkdir).toHaveBeenCalledWith('/new/output/path', { recursive: true });
    });

    it('should group by type in NotebookLM format', async () => {
      const { NotebookLMExporter } = await import('../src/exporters/NotebookLMExporter.js');
      const exporter = new NotebookLMExporter();

      await exporter.export({
        outputPath: '/output',
        format: 'notebooklm',
      });

      // Should create type directories
      expect(mkdir).toHaveBeenCalledWith(expect.stringContaining('note'), { recursive: true });
      expect(mkdir).toHaveBeenCalledWith(expect.stringContaining('project'), { recursive: true });
    });

    it('should create index file for NotebookLM', async () => {
      const { NotebookLMExporter } = await import('../src/exporters/NotebookLMExporter.js');
      const exporter = new NotebookLMExporter();

      await exporter.export({
        outputPath: '/output',
        format: 'notebooklm',
      });

      expect(writeFile).toHaveBeenCalledWith(
        expect.stringContaining('_index.md'),
        expect.any(String)
      );
    });
  });

  describe('content formatting', () => {
    it('should include citation headers in NotebookLM format', async () => {
      let writtenContent = '';
      vi.mocked(writeFile).mockImplementation(async (path, content) => {
        if (String(path).includes('test-note.md')) {
          writtenContent = content as string;
        }
      });

      const { NotebookLMExporter } = await import('../src/exporters/NotebookLMExporter.js');
      const exporter = new NotebookLMExporter();

      await exporter.export({
        outputPath: '/output',
        format: 'notebooklm',
      });

      expect(writtenContent).toContain('Source:');
      expect(writtenContent).toContain('ID:');
    });

    it('should include YAML frontmatter in markdown format', async () => {
      let writtenContent = '';
      vi.mocked(writeFile).mockImplementation(async (path, content) => {
        if (String(path).includes('.md') && !String(path).includes('_index')) {
          writtenContent = content as string;
        }
      });

      const { NotebookLMExporter } = await import('../src/exporters/NotebookLMExporter.js');
      const exporter = new NotebookLMExporter();

      await exporter.export({
        outputPath: '/output',
        format: 'markdown',
      });

      expect(writtenContent).toContain('---');
      expect(writtenContent).toContain('uid:');
    });
  });

  describe('filename sanitization', () => {
    it('should sanitize filenames', async () => {
      // Update mock to include special characters
      vi.mocked(mkdir).mockClear();
      vi.mocked(writeFile).mockClear();

      const { api } = await import('../src/utils/api.js');
      vi.mocked(api.listEntities).mockResolvedValueOnce({
        items: [
          {
            uid: 'uid-special',
            type: 'note',
            title: 'Title: With/Special\\Characters?',
            content: 'Content',
            tags: [],
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-02T00:00:00Z',
          },
        ],
      } as any);

      const { NotebookLMExporter } = await import('../src/exporters/NotebookLMExporter.js');
      const exporter = new NotebookLMExporter();

      await exporter.export({
        outputPath: '/output',
        format: 'markdown',
      });

      // Filename should not contain special characters
      const writeCallPath = vi.mocked(writeFile).mock.calls.find(
        (call) => String(call[0]).includes('title')
      );

      if (writeCallPath) {
        expect(String(writeCallPath[0])).not.toMatch(/[:<>?*|]/);
      }
    });
  });
});
