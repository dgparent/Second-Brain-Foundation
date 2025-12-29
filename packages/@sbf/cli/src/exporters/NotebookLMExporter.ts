/**
 * NotebookLM-Compatible Exporter
 *
 * Exports entities in formats compatible with NotebookLM and other tools.
 * Supports NFR8 citation format requirements.
 */

import { mkdir, writeFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { api } from '../utils/api.js';
import type { RemoteEntity, ExportOptions } from '../types.js';

interface ExportResult {
  fileCount: number;
  totalSize: number;
  files: string[];
}

export class NotebookLMExporter {
  /**
   * Export entities to specified format
   */
  async export(options: ExportOptions): Promise<ExportResult> {
    const { outputPath, sourceUids, format } = options;

    // Ensure output directory exists
    if (!existsSync(outputPath)) {
      await mkdir(outputPath, { recursive: true });
    }

    // Fetch entities
    let entities: RemoteEntity[];
    if (sourceUids && sourceUids.length > 0) {
      entities = await Promise.all(sourceUids.map((uid) => api.getEntity(uid)));
    } else {
      const result = await api.listEntities({ limit: 1000 });
      entities = result.items;
    }

    const result: ExportResult = {
      fileCount: 0,
      totalSize: 0,
      files: [],
    };

    switch (format) {
      case 'notebooklm':
        await this.exportNotebookLM(entities, outputPath, result);
        break;
      case 'markdown':
        await this.exportMarkdown(entities, outputPath, result);
        break;
      case 'json':
        await this.exportJSON(entities, outputPath, result);
        break;
      default:
        throw new Error(`Unknown format: ${format}`);
    }

    return result;
  }

  /**
   * Export in NotebookLM-compatible format
   * - Plain markdown files
   * - Proper citation headers
   * - Cross-reference annotations
   */
  private async exportNotebookLM(
    entities: RemoteEntity[],
    outputPath: string,
    result: ExportResult
  ): Promise<void> {
    // Group by type for organization
    const byType = this.groupByType(entities);

    for (const [type, typeEntities] of Object.entries(byType)) {
      const typeDir = join(outputPath, type);
      await mkdir(typeDir, { recursive: true });

      for (const entity of typeEntities) {
        const filename = this.sanitizeFilename(entity.title) + '.md';
        const filepath = join(typeDir, filename);

        // Build NotebookLM-optimized content
        const content = this.buildNotebookLMContent(entity);

        await writeFile(filepath, content);

        const stats = await stat(filepath);
        result.files.push(filepath);
        result.fileCount++;
        result.totalSize += stats.size;
      }
    }

    // Create a master index file for NotebookLM
    const indexContent = this.buildNotebookLMIndex(entities);
    const indexPath = join(outputPath, '_index.md');
    await writeFile(indexPath, indexContent);

    const indexStats = await stat(indexPath);
    result.files.push(indexPath);
    result.fileCount++;
    result.totalSize += indexStats.size;
  }

  /**
   * Build content optimized for NotebookLM consumption
   */
  private buildNotebookLMContent(entity: RemoteEntity): string {
    const lines: string[] = [];

    // Citation header - helps NotebookLM understand source
    lines.push(`# ${entity.title}`);
    lines.push('');
    lines.push(`> Source: ${entity.type} | ID: ${entity.uid}`);
    lines.push(`> Created: ${entity.createdAt} | Updated: ${entity.updatedAt}`);

    if (entity.tags && entity.tags.length > 0) {
      lines.push(`> Tags: ${entity.tags.join(', ')}`);
    }

    lines.push('');
    lines.push('---');
    lines.push('');

    // Main content
    if (entity.content) {
      lines.push(entity.content);
    }

    // Add metadata section for rich context
    if (entity.metadata && Object.keys(entity.metadata).length > 0) {
      lines.push('');
      lines.push('---');
      lines.push('');
      lines.push('## Metadata');
      lines.push('');

      for (const [key, value] of Object.entries(entity.metadata)) {
        if (value !== null && value !== undefined) {
          lines.push(`- **${key}**: ${JSON.stringify(value)}`);
        }
      }
    }

    // Add relationships section
    if (entity.relationships && entity.relationships.length > 0) {
      lines.push('');
      lines.push('## Related');
      lines.push('');

      for (const rel of entity.relationships) {
        lines.push(`- ${rel.type}: ${rel.targetTitle || rel.targetUid}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Build master index for NotebookLM
   */
  private buildNotebookLMIndex(entities: RemoteEntity[]): string {
    const lines: string[] = [];

    lines.push('# Second Brain Foundation Export');
    lines.push('');
    lines.push(`Exported: ${new Date().toISOString()}`);
    lines.push(`Total entities: ${entities.length}`);
    lines.push('');
    lines.push('---');
    lines.push('');

    // Group by type
    const byType = this.groupByType(entities);

    for (const [type, typeEntities] of Object.entries(byType)) {
      lines.push(`## ${type.charAt(0).toUpperCase() + type.slice(1)}s (${typeEntities.length})`);
      lines.push('');

      for (const entity of typeEntities.slice(0, 50)) {
        const tags = entity.tags?.length ? ` [${entity.tags.slice(0, 3).join(', ')}]` : '';
        lines.push(`- ${entity.title}${tags}`);
      }

      if (typeEntities.length > 50) {
        lines.push(`- ... and ${typeEntities.length - 50} more`);
      }

      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Export as plain markdown files
   */
  private async exportMarkdown(
    entities: RemoteEntity[],
    outputPath: string,
    result: ExportResult
  ): Promise<void> {
    const byType = this.groupByType(entities);

    for (const [type, typeEntities] of Object.entries(byType)) {
      const typeDir = join(outputPath, type);
      await mkdir(typeDir, { recursive: true });

      for (const entity of typeEntities) {
        const filename = this.sanitizeFilename(entity.title) + '.md';
        const filepath = join(typeDir, filename);

        // Build standard markdown with frontmatter
        const content = this.buildMarkdownContent(entity);

        await writeFile(filepath, content);

        const stats = await stat(filepath);
        result.files.push(filepath);
        result.fileCount++;
        result.totalSize += stats.size;
      }
    }
  }

  /**
   * Build standard markdown with YAML frontmatter
   */
  private buildMarkdownContent(entity: RemoteEntity): string {
    const lines: string[] = [];

    // YAML frontmatter
    lines.push('---');
    lines.push(`uid: ${entity.uid}`);
    lines.push(`title: "${entity.title.replace(/"/g, '\\"')}"`);
    lines.push(`type: ${entity.type}`);

    if (entity.tags && entity.tags.length > 0) {
      lines.push(`tags: [${entity.tags.map((t) => `"${t}"`).join(', ')}]`);
    }

    lines.push(`created: ${entity.createdAt}`);
    lines.push(`modified: ${entity.updatedAt}`);
    lines.push('---');
    lines.push('');

    // Content
    if (entity.content) {
      lines.push(entity.content);
    }

    return lines.join('\n');
  }

  /**
   * Export as JSON
   */
  private async exportJSON(
    entities: RemoteEntity[],
    outputPath: string,
    result: ExportResult
  ): Promise<void> {
    // Single JSON file with all entities
    const data = {
      exported: new Date().toISOString(),
      count: entities.length,
      entities: entities.map((e) => ({
        uid: e.uid,
        type: e.type,
        title: e.title,
        content: e.content,
        tags: e.tags,
        metadata: e.metadata,
        relationships: e.relationships,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
      })),
    };

    const filepath = join(outputPath, 'sbf-export.json');
    await writeFile(filepath, JSON.stringify(data, null, 2));

    const stats = await stat(filepath);
    result.files.push(filepath);
    result.fileCount = 1;
    result.totalSize = stats.size;
  }

  /**
   * Group entities by type
   */
  private groupByType(entities: RemoteEntity[]): Record<string, RemoteEntity[]> {
    const byType: Record<string, RemoteEntity[]> = {};

    for (const entity of entities) {
      const type = entity.type || 'note';
      if (!byType[type]) {
        byType[type] = [];
      }
      byType[type].push(entity);
    }

    return byType;
  }

  /**
   * Sanitize filename for cross-platform compatibility
   */
  private sanitizeFilename(title: string): string {
    return title
      .replace(/[<>:"/\\|?*]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase()
      .slice(0, 100);
  }
}
