/**
 * Obsidian Vault Importer
 *
 * Imports notes from an Obsidian vault with full frontmatter
 * and wikilink support.
 */

import { readdir, stat, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname, basename, relative } from 'node:path';
import matter from 'gray-matter';
import { api } from '../utils/api.js';
import type { ImportAnalysis, RemoteEntity } from '../types.js';

interface ImportOptions {
  onProgress?: (current: number, total: number) => void;
}

interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

interface LocalNote {
  path: string;
  fullPath: string;
  title: string;
  content: string;
  frontmatter: Record<string, unknown>;
  links: string[];
  tags: string[];
}

export class ObsidianImporter {
  private vaultPath: string;
  private notes: LocalNote[] = [];
  private linkMap = new Map<string, string>(); // path -> uid

  constructor(vaultPath: string) {
    this.vaultPath = vaultPath;
  }

  /**
   * Analyze the vault before import
   */
  async analyze(): Promise<ImportAnalysis> {
    if (!existsSync(this.vaultPath)) {
      throw new Error(`Vault not found: ${this.vaultPath}`);
    }

    this.notes = await this.scanVault(this.vaultPath);

    const allTags = new Set<string>();
    let totalLinks = 0;
    const warnings: string[] = [];

    for (const note of this.notes) {
      for (const tag of note.tags) {
        allTags.add(tag);
      }
      totalLinks += note.links.length;

      // Check for potential issues
      if (!note.frontmatter.title && !note.title) {
        warnings.push(`No title: ${note.path}`);
      }
    }

    // Count folders
    const folders = new Set<string>();
    for (const note of this.notes) {
      const parts = note.path.split('/');
      for (let i = 1; i < parts.length; i++) {
        folders.add(parts.slice(0, i).join('/'));
      }
    }

    return {
      noteCount: this.notes.length,
      folderCount: folders.size,
      linkCount: totalLinks,
      uniqueTags: Array.from(allTags),
      estimatedEntities: this.notes.length,
      warnings,
    };
  }

  /**
   * Import notes to SBF
   */
  async import(options: ImportOptions = {}): Promise<ImportResult> {
    if (this.notes.length === 0) {
      await this.analyze();
    }

    const result: ImportResult = {
      imported: 0,
      skipped: 0,
      errors: [],
    };

    const total = this.notes.length;

    // First pass: Create all entities
    for (let i = 0; i < this.notes.length; i++) {
      const note = this.notes[i];
      options.onProgress?.(i + 1, total);

      try {
        const entity = await this.createEntity(note);
        this.linkMap.set(note.path, entity.uid);
        result.imported++;
      } catch (e) {
        result.errors.push(`${note.path}: ${(e as Error).message}`);
      }
    }

    // Second pass: Update relationships based on links
    // (This could be done as a batch update)

    return result;
  }

  private async scanVault(dirPath: string, basePath?: string): Promise<LocalNote[]> {
    const notes: LocalNote[] = [];
    basePath = basePath || dirPath;

    const entries = await readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);

      // Skip hidden files/folders and .obsidian
      if (entry.name.startsWith('.') || entry.name === '.obsidian') {
        continue;
      }

      if (entry.isDirectory()) {
        const nested = await this.scanVault(fullPath, basePath);
        notes.push(...nested);
      } else if (entry.isFile() && extname(entry.name) === '.md') {
        const note = await this.parseNote(fullPath, basePath);
        notes.push(note);
      }
    }

    return notes;
  }

  private async parseNote(fullPath: string, basePath: string): Promise<LocalNote> {
    const content = await readFile(fullPath, 'utf-8');
    const parsed = matter(content);

    // Extract wikilinks
    const links = this.extractWikilinks(parsed.content);

    // Extract tags from frontmatter and content
    const tags = this.extractTags(parsed.data, parsed.content);

    return {
      path: relative(basePath, fullPath),
      fullPath,
      title: parsed.data.title || basename(fullPath, '.md'),
      content: parsed.content,
      frontmatter: parsed.data,
      links,
      tags,
    };
  }

  private extractWikilinks(content: string): string[] {
    const links: string[] = [];
    const regex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
      links.push(match[1]);
    }

    return links;
  }

  private extractTags(frontmatter: Record<string, unknown>, content: string): string[] {
    const tags = new Set<string>();

    // From frontmatter
    if (Array.isArray(frontmatter.tags)) {
      for (const tag of frontmatter.tags) {
        tags.add(String(tag));
      }
    }

    // From content (hashtags)
    const regex = /#([a-zA-Z][a-zA-Z0-9_/-]*)/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      tags.add(match[1]);
    }

    return Array.from(tags);
  }

  private async createEntity(note: LocalNote): Promise<RemoteEntity> {
    // Infer type from path or frontmatter
    const type = this.inferType(note);

    // Build metadata preserving Obsidian fields
    const metadata: Record<string, unknown> = {
      ...note.frontmatter,
      obsidian_path: note.path,
      obsidian_links: note.links,
    };

    // Remove fields we handle specially
    delete metadata.tags;
    delete metadata.title;

    const entity = await api.createEntity({
      type,
      title: note.title,
      content: note.content,
      tags: note.tags,
      metadata,
    });

    return entity as RemoteEntity;
  }

  private inferType(note: LocalNote): string {
    // Check frontmatter
    if (note.frontmatter.type) {
      return String(note.frontmatter.type);
    }

    // Infer from path
    const pathLower = note.path.toLowerCase();

    if (pathLower.startsWith('projects/')) return 'project';
    if (pathLower.startsWith('people/')) return 'person';
    if (pathLower.startsWith('resources/')) return 'resource';
    if (pathLower.startsWith('templates/')) return 'template';
    if (pathLower.startsWith('daily/') || pathLower.includes('daily notes/')) return 'daily';

    return 'note';
  }
}
