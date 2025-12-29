/**
 * Notion Export Importer
 *
 * Imports from Notion's HTML/Markdown ZIP export format.
 */

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, basename, extname } from 'node:path';
import matter from 'gray-matter';
import { api } from '../utils/api.js';
import type { ImportAnalysis, RemoteEntity } from '../types.js';

// @ts-ignore - unzipper types
import unzipper from 'unzipper';

interface ImportOptions {
  onProgress?: (current: number, total: number) => void;
}

interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

interface NotionPage {
  path: string;
  title: string;
  content: string;
  properties: Record<string, unknown>;
  parentPath?: string;
}

export class NotionImporter {
  private exportPath: string;
  private pages: NotionPage[] = [];
  private idMap = new Map<string, string>(); // notion path -> sbf uid

  constructor(exportPath: string) {
    this.exportPath = exportPath;
  }

  /**
   * Analyze the Notion export
   */
  async analyze(): Promise<ImportAnalysis> {
    if (!existsSync(this.exportPath)) {
      throw new Error(`Export not found: ${this.exportPath}`);
    }

    const warnings: string[] = [];

    // Check if it's a ZIP file
    if (this.exportPath.endsWith('.zip')) {
      this.pages = await this.parseZip(this.exportPath);
    } else {
      // Assume it's an extracted folder
      this.pages = await this.parseFolder(this.exportPath);
    }

    // Extract tags from properties
    const allTags = new Set<string>();
    let totalLinks = 0;

    for (const page of this.pages) {
      // Notion uses properties like "Tags" or "Category"
      const tags = this.extractTags(page.properties);
      for (const tag of tags) {
        allTags.add(tag);
      }

      // Count internal links
      const links = this.countLinks(page.content);
      totalLinks += links;
    }

    // Count unique parent paths as folders
    const folders = new Set<string>();
    for (const page of this.pages) {
      if (page.parentPath) {
        folders.add(page.parentPath);
      }
    }

    return {
      noteCount: this.pages.length,
      folderCount: folders.size,
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
        this.idMap.set(page.path, entity.uid);
        result.imported++;
      } catch (e) {
        result.errors.push(`${page.path}: ${(e as Error).message}`);
      }
    }

    return result;
  }

  private async parseZip(zipPath: string): Promise<NotionPage[]> {
    const pages: NotionPage[] = [];

    // Read and extract ZIP
    const buffer = await readFile(zipPath);
    const directory = await unzipper.Open.buffer(buffer);

    for (const file of directory.files) {
      if (file.type === 'Directory') continue;

      const ext = extname(file.path);
      if (ext !== '.md' && ext !== '.html') continue;

      const content = await file.buffer();
      const page = this.parsePage(file.path, content.toString('utf-8'));
      pages.push(page);
    }

    return pages;
  }

  private async parseFolder(folderPath: string): Promise<NotionPage[]> {
    // For simplicity, just use recursive glob
    // In a real implementation, you'd recursively read the directory
    return [];
  }

  private parsePage(path: string, content: string): NotionPage {
    // Notion export titles often have UUID suffixes like "Page Name abc123def456"
    const titleMatch = path.match(/([^/]+?)(?:\s+[a-f0-9]{32})?\.(?:md|html)$/i);
    const title = titleMatch ? titleMatch[1] : basename(path, extname(path));

    // Parse frontmatter if present
    const parsed = matter(content);

    // Convert HTML to Markdown if needed
    let markdown = parsed.content;
    if (path.endsWith('.html')) {
      markdown = this.htmlToMarkdown(parsed.content);
    }

    return {
      path,
      title,
      content: markdown,
      properties: parsed.data,
      parentPath: this.getParentPath(path),
    };
  }

  private htmlToMarkdown(html: string): string {
    // Basic HTML to Markdown conversion
    // In production, use a proper library like turndown
    return html
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n')
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
      .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<em>(.*?)<\/em>/gi, '*$1*')
      .replace(/<code>(.*?)<\/code>/gi, '`$1`')
      .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
      .replace(/<ul[^>]*>(.*?)<\/ul>/gis, '$1')
      .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
      .replace(/<[^>]+>/g, '')
      .trim();
  }

  private getParentPath(path: string): string | undefined {
    const parts = path.split('/');
    if (parts.length > 1) {
      return parts.slice(0, -1).join('/');
    }
    return undefined;
  }

  private extractTags(properties: Record<string, unknown>): string[] {
    const tags: string[] = [];

    // Check common Notion property names
    const tagFields = ['tags', 'Tags', 'category', 'Category', 'labels', 'Labels'];

    for (const field of tagFields) {
      const value = properties[field];
      if (Array.isArray(value)) {
        tags.push(...value.map(String));
      } else if (typeof value === 'string') {
        tags.push(...value.split(',').map((s) => s.trim()));
      }
    }

    return tags;
  }

  private countLinks(content: string): number {
    // Count markdown links
    const markdownLinks = (content.match(/\[([^\]]+)\]\([^)]+\)/g) || []).length;
    return markdownLinks;
  }

  private async createEntity(page: NotionPage): Promise<RemoteEntity> {
    const type = this.inferType(page);
    const tags = this.extractTags(page.properties);

    const metadata: Record<string, unknown> = {
      ...page.properties,
      notion_path: page.path,
    };

    // Clean up metadata
    delete metadata.tags;
    delete metadata.Tags;

    const entity = await api.createEntity({
      type,
      title: page.title,
      content: page.content,
      tags,
      metadata,
    });

    return entity as RemoteEntity;
  }

  private inferType(page: NotionPage): string {
    // Check properties
    const typeField = page.properties.type || page.properties.Type;
    if (typeField) {
      return String(typeField).toLowerCase();
    }

    // Infer from path
    const pathLower = page.path.toLowerCase();

    if (pathLower.includes('project')) return 'project';
    if (pathLower.includes('people') || pathLower.includes('contacts')) return 'person';
    if (pathLower.includes('resource') || pathLower.includes('reference')) return 'resource';

    return 'note';
  }
}
