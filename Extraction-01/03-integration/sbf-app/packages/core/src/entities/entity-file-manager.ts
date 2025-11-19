/**
 * EntityFileManager - Entity CRUD operations on filesystem
 * 
 * Manages entities as markdown files with YAML frontmatter
 * Implements SBF entity architecture patterns
 * 
 * Features:
 * - UID generation (type-slug-counter pattern)
 * - Entity file organization (type-based folders)
 * - Frontmatter-based entity storage
 * - Search and filtering
 * 
 * Based on:
 * - SBF architecture v2.0
 * - Vault filesystem operations
 */

import { Vault } from '../filesystem';
import { Entity, EntityType, LifecycleState, SensitivityLevel } from '../types';

export interface EntityManagerInterface {
  create(entity: Partial<Entity>): Promise<string>; // Returns UID
  read(uid: string): Promise<Entity | null>;
  update(uid: string, updates: Partial<Entity>): Promise<void>;
  delete(uid: string): Promise<void>;
  list(type?: EntityType): Promise<Entity[]>;
}

export class EntityFileManager implements EntityManagerInterface {
  constructor(private vault: Vault) {}

  /**
   * Create a new entity
   * Auto-generates UID if not provided
   */
  async create(entity: Partial<Entity>): Promise<string> {
    // Validate required fields
    if (!entity.type || !entity.title) {
      throw new Error('Entity must have type and title');
    }

    // Generate UID if not provided
    const uid = entity.uid || await this.generateUID(entity.type, entity.title);

    // Build complete entity with defaults
    const now = new Date().toISOString();
    const completeEntity: Entity = {
      uid,
      type: entity.type,
      title: entity.title,
      aliases: entity.aliases || [],
      created: entity.created || now,
      updated: now,
      lifecycle: entity.lifecycle || {
        state: this.getDefaultLifecycleState(entity.type),
      },
      sensitivity: entity.sensitivity || {
        level: 'personal' as SensitivityLevel,
        privacy: {
          cloud_ai_allowed: false,
          local_ai_allowed: true,
          export_allowed: true,
        },
      },
      rel: entity.rel || [],
      tags: entity.tags || [],
      content: entity.content || '',
      ...entity, // Override with any provided fields
    };

    // Determine file path
    const filePath = this.getFilePath(completeEntity);

    // Write to vault
    const { content, ...frontmatter } = completeEntity;
    await this.vault.writeFile(filePath, frontmatter, content || '');

    return uid;
  }

  /**
   * Read an entity by UID
   */
  async read(uid: string): Promise<Entity | null> {
    const filePath = await this.findFileByUID(uid);
    if (!filePath) {
      return null;
    }

    const fileContent = await this.vault.readFile(filePath);
    if (!fileContent) {
      return null;
    }

    return {
      ...fileContent.frontmatter,
      content: fileContent.content,
    } as Entity;
  }

  /**
   * Update an entity
   */
  async update(uid: string, updates: Partial<Entity>): Promise<void> {
    const entity = await this.read(uid);
    if (!entity) {
      throw new Error(`Entity not found: ${uid}`);
    }

    // Update timestamp
    const updatedEntity: Entity = {
      ...entity,
      ...updates,
      updated: new Date().toISOString(),
    };

    // Write back to vault
    const filePath = await this.findFileByUID(uid);
    if (!filePath) {
      throw new Error(`Entity file not found: ${uid}`);
    }

    const { content, ...frontmatter } = updatedEntity;
    await this.vault.writeFile(filePath, frontmatter, content || '');
  }

  /**
   * Delete an entity
   */
  async delete(uid: string): Promise<void> {
    const filePath = await this.findFileByUID(uid);
    if (!filePath) {
      throw new Error(`Entity not found: ${uid}`);
    }

    await this.vault.deleteFile(filePath);
  }

  /**
   * List all entities (optionally filtered by type)
   */
  async list(type?: EntityType): Promise<Entity[]> {
    const entities: Entity[] = [];

    // If type specified, only scan that folder
    if (type) {
      const folder = this.getFolderForType(type);
      const tree = await this.vault.listFiles(folder);
      await this.collectEntities(tree, entities);
    } else {
      // Scan all entity types
      const tree = await this.vault.listFiles();
      await this.collectEntities(tree, entities);
    }

    return entities;
  }

  /**
   * Recursively collect entities from file tree
   */
  private async collectEntities(tree: any, entities: Entity[]): Promise<void> {
    if (tree.type === 'file' && tree.name.endsWith('.md')) {
      // Extract relative path from full path
      const vaultPath = this.vault.getVaultPath();
      const relativePath = tree.path.substring(vaultPath.length + 1);

      const fileContent = await this.vault.readFile(relativePath);
      if (fileContent && fileContent.frontmatter.uid) {
        entities.push({
          ...fileContent.frontmatter,
          content: fileContent.content,
        } as Entity);
      }
    }

    if (tree.items) {
      for (const item of tree.items) {
        await this.collectEntities(item, entities);
      }
    }
  }

  /**
   * Generate UID for entity
   * Pattern: type-slug-counter
   * Example: topic-machine-learning-042
   */
  private async generateUID(type: EntityType, title: string): Promise<string> {
    const slug = this.slugify(title);
    const counter = await this.getNextCounter(type, slug);
    return `${type}-${slug}-${counter.toString().padStart(3, '0')}`;
  }

  /**
   * Convert title to URL-friendly slug
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50); // Max 50 chars
  }

  /**
   * Get next counter for type-slug combination
   */
  private async getNextCounter(type: EntityType, slug: string): Promise<number> {
    const prefix = `${type}-${slug}-`;
    const entities = await this.list(type);

    let maxCounter = 0;
    for (const entity of entities) {
      if (entity.uid.startsWith(prefix)) {
        const counterStr = entity.uid.substring(prefix.length);
        const counter = parseInt(counterStr, 10);
        if (!isNaN(counter) && counter > maxCounter) {
          maxCounter = counter;
        }
      }
    }

    return maxCounter + 1;
  }

  /**
   * Get file path for entity
   */
  private getFilePath(entity: Entity): string {
    const folder = this.getFolderForType(entity.type);
    return `${folder}/${entity.uid}.md`;
  }

  /**
   * Get folder path for entity type
   * Follows SBF architecture folder structure
   */
  private getFolderForType(type: EntityType): string {
    switch (type) {
      case 'daily-note':
        return 'Capture';
      case 'person':
      case 'place':
        return 'Core';
      case 'topic':
      case 'source':
        return 'Knowledge';
      case 'project':
      case 'task':
        return 'Projects';
      case 'process':
      case 'artifact':
        return 'Resources';
      case 'event':
        return 'Events';
      default:
        return 'Transitional';
    }
  }

  /**
   * Find file by UID (searches all entity folders)
   */
  private async findFileByUID(uid: string): Promise<string | null> {
    // Extract type from UID
    const type = uid.split('-')[0] as EntityType;
    const folder = this.getFolderForType(type);
    const filePath = `${folder}/${uid}.md`;

    const exists = await this.vault.exists(filePath);
    return exists ? filePath : null;
  }

  /**
   * Get default lifecycle state for entity type
   */
  private getDefaultLifecycleState(type: EntityType): LifecycleState {
    if (type === 'daily-note') {
      return 'capture';
    }
    return 'permanent';
  }
}
