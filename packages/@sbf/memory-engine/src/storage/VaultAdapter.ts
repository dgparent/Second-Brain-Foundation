/**
 * Vault Adapter
 * Scans vault filesystem and converts markdown files to Entity objects
 */

import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';
import { Entity, MemoryLevel, Sensitivity, Control, MemoryMetadata, VaultScanResult } from '../types';
import { computeAeiCode } from './AeiCodeComputer';

export class VaultAdapter {
  private vaultRoot: string;

  constructor(vaultRoot: string) {
    this.vaultRoot = vaultRoot;
  }

  /**
   * Scans the vault and returns all entities
   */
  async scan(): Promise<VaultScanResult> {
    const entities: Entity[] = [];
    const errors: Array<{ path: string; error: string }> = [];

    try {
      await this.walkDirectory(this.vaultRoot, entities, errors);
    } catch (err) {
      errors.push({
        path: this.vaultRoot,
        error: err instanceof Error ? err.message : String(err)
      });
    }

    return { entities, errors };
  }

  /**
   * Recursively walks directory and processes markdown files
   */
  private async walkDirectory(
    dir: string,
    entities: Entity[],
    errors: Array<{ path: string; error: string }>
  ): Promise<void> {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Skip hidden and system directories
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          await this.walkDirectory(fullPath, entities, errors);
        }
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
        try {
          const entity = await this.processMarkdownFile(fullPath);
          if (entity) {
            entities.push(entity);
          }
        } catch (err) {
          errors.push({
            path: fullPath,
            error: err instanceof Error ? err.message : String(err)
          });
        }
      }
    }
  }

  /**
   * Processes a single markdown file and converts to Entity
   */
  private async processMarkdownFile(filePath: string): Promise<Entity | null> {
    const content = fs.readFileSync(filePath, 'utf-8');
    const relativePath = path.relative(this.vaultRoot, filePath).replace(/\\/g, '/');

    // Parse frontmatter
    const { data: frontmatter, content: bodyContent } = matter(content);

    // Extract or generate ID
    const id = frontmatter.uid || frontmatter.id || this.generateIdFromPath(relativePath);

    // Extract title (from frontmatter or filename)
    const title = frontmatter.title || this.deriveTitleFromFilename(filePath);

    // Parse memory metadata
    const memory: MemoryMetadata = this.parseMemoryMetadata(frontmatter);

    // Parse sensitivity
    const sensitivity: Sensitivity = this.parseSensitivity(frontmatter);

    // Parse control
    const control: Control | undefined = this.parseControl(frontmatter);

    // Compute AEI code
    const aei_code = computeAeiCode(memory.memory_level, sensitivity, control);

    // Extract tags
    const tags = frontmatter.tags || frontmatter.tag || [];
    const normalizedTags = Array.isArray(tags) ? tags : [tags];

    const entity: Entity = {
      id,
      uid: id,
      vault_path: relativePath,
      title,
      content: bodyContent.trim(),
      tags: normalizedTags,
      memory,
      sensitivity,
      control,
      aei_code
    };

    return entity;
  }

  /**
   * Parses memory metadata from frontmatter
   */
  private parseMemoryMetadata(frontmatter: any): MemoryMetadata {
    const now = new Date().toISOString();

    return {
      memory_level: (frontmatter.memory_level as MemoryLevel) || 'transitory',
      stability_score: frontmatter.stability_score ?? 0.5,
      importance_score: frontmatter.importance_score ?? 0.5,
      last_active_at: frontmatter.last_active_at || now,
      user_pinned: frontmatter.user_pinned ?? false,
      created_at: frontmatter.created_at || now,
      updated_at: frontmatter.updated_at || now
    };
  }

  /**
   * Parses sensitivity from frontmatter
   */
  private parseSensitivity(frontmatter: any): Sensitivity {
    const sensitivityData = frontmatter.sensitivity || {};

    return {
      level: sensitivityData.level ?? 1,
      scope: sensitivityData.scope,
      privacy: {
        cloud_ai_allowed: sensitivityData.privacy?.cloud_ai_allowed ?? true,
        local_ai_allowed: sensitivityData.privacy?.local_ai_allowed ?? true,
        export_allowed: sensitivityData.privacy?.export_allowed ?? true
      },
      visibility: sensitivityData.visibility || 'public',
      group_access: sensitivityData.group_access
    };
  }

  /**
   * Parses control metadata from frontmatter
   */
  private parseControl(frontmatter: any): Control | undefined {
    if (!frontmatter.control) {
      return undefined;
    }

    return {
      AEI_restriction_mode: frontmatter.control.AEI_restriction_mode,
      requires_human_approval: frontmatter.control.requires_human_approval ?? false,
      requires_audit_log: frontmatter.control.requires_audit_log ?? false
    };
  }

  /**
   * Generates ID from file path
   */
  private generateIdFromPath(relativePath: string): string {
    return relativePath.replace(/\\/g, '/').replace(/\.md$/i, '');
  }

  /**
   * Derives title from filename
   */
  private deriveTitleFromFilename(filePath: string): string {
    const basename = path.basename(filePath, path.extname(filePath));
    // Convert kebab-case and snake_case to Title Case
    return basename
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  /**
   * Reads a single entity by path
   */
  async readEntity(relativePath: string): Promise<Entity | null> {
    const fullPath = path.join(this.vaultRoot, relativePath);

    if (!fs.existsSync(fullPath)) {
      return null;
    }

    return this.processMarkdownFile(fullPath);
  }

  /**
   * Writes an entity to disk
   */
  async writeEntity(entity: Entity): Promise<void> {
    const fullPath = path.join(this.vaultRoot, entity.vault_path);

    // Ensure directory exists
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Prepare frontmatter
    const frontmatter: any = {
      uid: entity.id,
      title: entity.title,
      tags: entity.tags,
      memory_level: entity.memory.memory_level,
      stability_score: entity.memory.stability_score,
      importance_score: entity.memory.importance_score,
      last_active_at: entity.memory.last_active_at,
      user_pinned: entity.memory.user_pinned,
      created_at: entity.memory.created_at,
      updated_at: entity.memory.updated_at,
      sensitivity: {
        level: entity.sensitivity.level,
        scope: entity.sensitivity.scope,
        privacy: entity.sensitivity.privacy,
        visibility: entity.sensitivity.visibility,
        group_access: entity.sensitivity.group_access
      }
    };

    if (entity.control) {
      frontmatter.control = entity.control;
    }

    // Generate markdown with frontmatter
    const fileContent = matter.stringify(entity.content, frontmatter);

    // Write to disk
    fs.writeFileSync(fullPath, fileContent, 'utf-8');
  }

  /**
   * Deletes an entity from disk
   */
  async deleteEntity(relativePath: string): Promise<boolean> {
    const fullPath = path.join(this.vaultRoot, relativePath);

    if (!fs.existsSync(fullPath)) {
      return false;
    }

    fs.unlinkSync(fullPath);
    return true;
  }
}
