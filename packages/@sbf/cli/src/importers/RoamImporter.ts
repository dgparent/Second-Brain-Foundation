/**
 * Roam Research Export Importer
 *
 * Imports from Roam's JSON export format.
 */

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
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

interface RoamBlock {
  uid: string;
  string: string;
  'create-time'?: number;
  'edit-time'?: number;
  children?: RoamBlock[];
  refs?: Array<{ uid: string }>;
}

interface RoamPage {
  uid: string;
  title: string;
  'create-time'?: number;
  'edit-time'?: number;
  children?: RoamBlock[];
}

interface RoamExport extends Array<RoamPage> {}

interface ProcessedPage {
  uid: string;
  title: string;
  content: string;
  created?: Date;
  modified?: Date;
  tags: string[];
  links: string[];
}

export class RoamImporter {
  private exportPath: string;
  private pages: ProcessedPage[] = [];
  private uidMap = new Map<string, string>(); // roam uid -> sbf uid

  constructor(exportPath: string) {
    this.exportPath = exportPath;
  }

  /**
   * Analyze the Roam export
   */
  async analyze(): Promise<ImportAnalysis> {
    if (!existsSync(this.exportPath)) {
      throw new Error(`Export not found: ${this.exportPath}`);
    }

    const content = await readFile(this.exportPath, 'utf-8');
    const roamData: RoamExport = JSON.parse(content);

    this.pages = roamData.map((page) => this.processPage(page));

    const allTags = new Set<string>();
    let totalLinks = 0;
    const warnings: string[] = [];

    for (const page of this.pages) {
      for (const tag of page.tags) {
        allTags.add(tag);
      }
      totalLinks += page.links.length;

      // Check for empty pages
      if (!page.content.trim()) {
        warnings.push(`Empty page: ${page.title}`);
      }
    }

    return {
      noteCount: this.pages.length,
      folderCount: 0, // Roam doesn't have folders
      linkCount: totalLinks,
      uniqueTags: Array.from(allTags),
      estimatedEntities: this.pages.length,
      warnings,
    };
  }

  /**
   * Import pages to SBF
   */
  async import(options: ImportOptions = {}): Promise<ImportResult> {
    if (this.pages.length === 0) {
      await this.analyze();
    }

    const result: ImportResult = {
      imported: 0,
      skipped: 0,
      errors: [],
    };

    const total = this.pages.length;

    for (let i = 0; i < this.pages.length; i++) {
      const page = this.pages[i];
      options.onProgress?.(i + 1, total);

      try {
        const entity = await this.createEntity(page);
        this.uidMap.set(page.uid, entity.uid);
        result.imported++;
      } catch (e) {
        result.errors.push(`${page.title}: ${(e as Error).message}`);
      }
    }

    return result;
  }

  private processPage(page: RoamPage): ProcessedPage {
    const content = this.blocksToMarkdown(page.children || []);
    const tags = this.extractTags(content, page.title);
    const links = this.extractLinks(content);

    return {
      uid: page.uid,
      title: page.title,
      content,
      created: page['create-time'] ? new Date(page['create-time']) : undefined,
      modified: page['edit-time'] ? new Date(page['edit-time']) : undefined,
      tags,
      links,
    };
  }

  private blocksToMarkdown(blocks: RoamBlock[], indent = 0): string {
    const lines: string[] = [];

    for (const block of blocks) {
      // Convert block string
      const converted = this.convertBlockString(block.string);
      const prefix = indent > 0 ? '  '.repeat(indent) + '- ' : '';

      if (converted) {
        lines.push(prefix + converted);
      }

      // Process children recursively
      if (block.children && block.children.length > 0) {
        const childContent = this.blocksToMarkdown(block.children, indent + 1);
        lines.push(childContent);
      }
    }

    return lines.join('\n');
  }

  private convertBlockString(str: string): string {
    if (!str) return '';

    return (
      str
        // Convert [[page references]] to SBF links
        .replace(/\[\[([^\]]+)\]\]/g, '[[$1]]')
        // Convert ((block references)) to inline refs
        .replace(/\(\(([^)]+)\)\)/g, '(ref:$1)')
        // Convert #[[tags]] to #tags
        .replace(/#\[\[([^\]]+)\]\]/g, '#$1')
        // Convert ^^highlights^^ to ==highlights==
        .replace(/\^\^(.+?)\^\^/g, '==$1==')
        // Convert {{embed}} blocks
        .replace(/\{\{embed:\s*\[\[([^\]]+)\]\]\}\}/g, '!embed[[$1]]')
        // Convert TODO/DONE
        .replace(/\{\{TODO\}\}/g, '- [ ]')
        .replace(/\{\{DONE\}\}/g, '- [x]')
    );
  }

  private extractTags(content: string, title: string): string[] {
    const tags = new Set<string>();

    // Extract hashtags
    const hashtagRegex = /#([a-zA-Z][a-zA-Z0-9_/-]*)/g;
    let match;
    while ((match = hashtagRegex.exec(content)) !== null) {
      tags.add(match[1]);
    }

    // Check if title is a date (daily note)
    if (this.isDateTitle(title)) {
      tags.add('daily-note');
    }

    return Array.from(tags);
  }

  private extractLinks(content: string): string[] {
    const links: string[] = [];

    // Extract [[page links]]
    const linkRegex = /\[\[([^\]]+)\]\]/g;
    let match;
    while ((match = linkRegex.exec(content)) !== null) {
      links.push(match[1]);
    }

    return links;
  }

  private isDateTitle(title: string): boolean {
    // Roam daily notes format: "January 1st, 2024" or "January 1, 2024"
    const datePatterns = [
      /^(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}$/,
      /^\d{4}-\d{2}-\d{2}$/, // ISO format
    ];

    return datePatterns.some((pattern) => pattern.test(title));
  }

  private async createEntity(page: ProcessedPage): Promise<RemoteEntity> {
    const type = this.inferType(page);

    const metadata: Record<string, unknown> = {
      roam_uid: page.uid,
      roam_links: page.links,
    };

    if (page.created) {
      metadata.roam_created = page.created.toISOString();
    }
    if (page.modified) {
      metadata.roam_modified = page.modified.toISOString();
    }

    const entity = await api.createEntity({
      type,
      title: page.title,
      content: page.content,
      tags: page.tags,
      metadata,
    });

    return entity as RemoteEntity;
  }

  private inferType(page: ProcessedPage): string {
    // Check tags for type hints
    if (page.tags.includes('project') || page.tags.includes('projects')) {
      return 'project';
    }
    if (page.tags.includes('person') || page.tags.includes('people')) {
      return 'person';
    }
    if (page.tags.includes('resource') || page.tags.includes('reference')) {
      return 'resource';
    }
    if (page.tags.includes('daily-note')) {
      return 'daily';
    }

    return 'note';
  }
}
