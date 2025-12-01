/**
 * Vault Adapter
 * Scans vault filesystem and converts markdown files to Entity objects
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import matter from 'gray-matter';
import { Entity, MemoryLevel, Sensitivity, Control, MemoryMetadata, VaultScanResult } from '../types';
import { computeAeiCode } from './AeiCodeComputer';

export class VaultAdapter {
  public vaultRoot: string;

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
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

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
    } catch (error) {
      // Directory might not exist or be accessible
      errors.push({
        path: dir,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Processes a single markdown file and converts to Entity
   */
  private async processMarkdownFile(filePath: string): Promise<Entity | null> {
    const content = await fs.readFile(filePath, 'utf-8');
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
    const data = frontmatter.memory || frontmatter;

    return {
      memory_level: (data.memory_level as MemoryLevel) || 'transitory',
      stability_score: data.stability_score ?? 0.5,
      importance_score: data.importance_score ?? 0.5,
      last_active_at: data.last_active_at || now,
      user_pinned: data.user_pinned ?? false,
      created_at: data.created_at || now,
      updated_at: data.updated_at || now
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
  async readEntity(filePath: string): Promise<Entity | null> {
    let fullPath = filePath;
    
    // If path is relative, join with vault root
    if (!path.isAbsolute(filePath)) {
      fullPath = path.join(this.vaultRoot, filePath);
    }

    try {
      await fs.access(fullPath);
    } catch {
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
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
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
    await fs.writeFile(fullPath, fileContent, 'utf-8');
  }

  /**
   * Deletes an entity from disk
   */
  async deleteEntity(relativePath: string): Promise<boolean> {
    const fullPath = path.join(this.vaultRoot, relativePath);

    try {
      await fs.access(fullPath);
      await fs.unlink(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Moves an entity to a new path
   */
  async moveEntity(oldRelativePath: string, newRelativePath: string): Promise<boolean> {
    const oldFullPath = path.join(this.vaultRoot, oldRelativePath);
    const newFullPath = path.join(this.vaultRoot, newRelativePath);

    try {
      // Ensure source exists
      await fs.access(oldFullPath);

      // Ensure target directory exists
      const targetDir = path.dirname(newFullPath);
      await fs.mkdir(targetDir, { recursive: true });

      // Move file
      await fs.rename(oldFullPath, newFullPath);
      return true;
    } catch (error) {
      console.error(`Failed to move entity from ${oldRelativePath} to ${newRelativePath}:`, error);
      return false;
    }
  }
}
