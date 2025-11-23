/**
 * Vault Adapter
 * Scans vault directory and loads entities with metadata
 */

import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';
import { VaultEntity, VaultEntityRaw, MemoryLevel, Sensitivity, Control, MemoryMetadata } from './types';
import { computeAeiCode } from './AeiCodeComputer';

export class VaultAdapter {
  constructor(private vaultRoot: string) {
    if (!fs.existsSync(vaultRoot)) {
      throw new Error(`Vault root does not exist: ${vaultRoot}`);
    }
  }

  /**
   * Scan entire vault and return all entities
   */
  scanVault(): VaultEntity[] {
    const entities: VaultEntity[] = [];
    this.walkDirectory(this.vaultRoot, entities);
    return entities;
  }

  /**
   * Load a single entity by relative vault path
   */
  loadEntity(relativePath: string): VaultEntity | null {
    const fullPath = path.join(this.vaultRoot, relativePath);
    
    if (!fs.existsSync(fullPath) || !fullPath.toLowerCase().endsWith('.md')) {
      return null;
    }

    return this.parseMarkdownFile(fullPath, relativePath);
  }

  /**
   * Save entity to vault (create or update)
   */
  saveEntity(entity: VaultEntityRaw): void {
    const fullPath = path.join(this.vaultRoot, entity.vault_path);
    const dir = path.dirname(fullPath);

    // Ensure directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Compute AEI code
    const aei_code = computeAeiCode(
      entity.memory.memory_level,
      entity.sensitivity,
      entity.control
    );

    // Build frontmatter
    const frontmatter = {
      id: entity.id,
      title: entity.title,
      memory: entity.memory,
      sensitivity: entity.sensitivity,
      control: entity.control,
      aei_code
    };

    // Write file with frontmatter
    const content = matter.stringify(entity.content, frontmatter);
    fs.writeFileSync(fullPath, content, 'utf8');
  }

  /**
   * Delete entity from vault
   */
  deleteEntity(relativePath: string): boolean {
    const fullPath = path.join(this.vaultRoot, relativePath);
    
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
    
    return false;
  }

  /**
   * Recursively walk directory and collect entities
   */
  private walkDirectory(dir: string, entities: VaultEntity[]): void {
    const entries = fs.readdirSync(dir);

    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const relativePath = path.relative(this.vaultRoot, fullPath).replace(/\\/g, '/');

      if (fs.statSync(fullPath).isDirectory()) {
        this.walkDirectory(fullPath, entities);
      } else if (entry.toLowerCase().endsWith('.md')) {
        const entity = this.parseMarkdownFile(fullPath, relativePath);
        if (entity) {
          entities.push(entity);
        }
      }
    }
  }

  /**
   * Parse markdown file with frontmatter
   */
  private parseMarkdownFile(fullPath: string, relativePath: string): VaultEntity | null {
    try {
      const fileContent = fs.readFileSync(fullPath, 'utf8');
      const parsed = matter(fileContent);

      // Extract frontmatter
      const data = parsed.data as any;
      
      // Build entity
      const entity: VaultEntity = {
        id: data.id || this.deriveIdFromPath(relativePath),
        vault_path: relativePath,
        title: data.title || this.deriveTitleFromPath(relativePath),
        content: parsed.content,
        memory: data.memory || this.defaultMemory(),
        sensitivity: data.sensitivity || this.defaultSensitivity(),
        control: data.control,
        aei_code: data.aei_code || computeAeiCode(
          data.memory?.memory_level || 'transitory',
          data.sensitivity || this.defaultSensitivity(),
          data.control
        )
      };

      return entity;
    } catch (error) {
      console.error(`Failed to parse ${fullPath}:`, error);
      return null;
    }
  }

  /**
   * Derive ID from file path
   */
  private deriveIdFromPath(relativePath: string): string {
    return relativePath.replace(/\.md$/i, '').replace(/[\/\\]/g, '-');
  }

  /**
   * Derive title from file path
   */
  private deriveTitleFromPath(relativePath: string): string {
    const basename = path.basename(relativePath, '.md');
    return basename.replace(/[-_]/g, ' ');
  }

  /**
   * Default memory metadata
   */
  private defaultMemory(): MemoryMetadata {
    return {
      memory_level: 'transitory',
      stability_score: 0.1,
      importance_score: 0.1,
      last_active_at: new Date().toISOString(),
      user_pinned: false
    };
  }

  /**
   * Default sensitivity settings
   */
  private defaultSensitivity(): Sensitivity {
    return {
      level: 1,
      privacy: {
        cloud_ai_allowed: true,
        local_ai_allowed: true,
        export_allowed: true
      },
      visibility: 'public'
    };
  }
}
