// Entity Repository
// Data access layer for entities using VaultFS, Vector, and Graph services

import { Injectable, NotFoundException } from '@nestjs/common';
import { VaultFileSystemService } from '@sbf/core/entity-manager/services/VaultFileSystemService';
import { TenantVectorStoreService } from '@sbf/core/entity-manager/services/TenantVectorStoreService';
import { TenantGraphService } from '@sbf/core/entity-manager/services/TenantGraphService';
import * as yaml from 'js-yaml';
import * as path from 'path';

export interface Entity {
  uid: string;
  type: string;
  name?: string;
  content?: string;
  metadata?: Record<string, any>;
  tenant_id: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface EntityQueryOptions {
  type?: string;
  search?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

@Injectable()
export class EntityRepository {
  constructor(
    private readonly vaultFS: VaultFileSystemService,
    private readonly vectorStore: TenantVectorStoreService,
    private readonly graphService: TenantGraphService
  ) {}

  async create(tenantId: string, entityData: Partial<Entity>): Promise<Entity> {
    const uid = entityData.uid || this.generateUid();
    const now = new Date();

    const entity: Entity = {
      uid,
      type: entityData.type || 'entity',
      name: entityData.name || 'Untitled',
      content: entityData.content || '',
      metadata: entityData.metadata || {},
      tenant_id: tenantId,
      created_at: now,
      updated_at: now
    };

    await this.saveToVault(tenantId, entity);
    await this.createEmbedding(tenantId, entity);
    await this.createGraphNode(tenantId, entity);

    return entity;
  }

  async findAll(
    tenantId: string,
    options: EntityQueryOptions = {}
  ): Promise<{ entities: Entity[]; total: number }> {
    const { type, search, limit = 100, offset = 0 } = options;

    if (search) {
      return this.searchByVector(tenantId, search, { type, limit, offset });
    }

    const entities = await this.listFromVault(tenantId, { type });
    const total = entities.length;
    const paginated = entities.slice(offset, offset + limit);

    return { entities: paginated, total };
  }

  async findByUid(tenantId: string, uid: string): Promise<Entity> {
    const entity = await this.loadFromVault(tenantId, uid);

    if (!entity || entity.tenant_id !== tenantId) {
      throw new NotFoundException(`Entity ${uid} not found`);
    }

    return entity;
  }

  async update(tenantId: string, uid: string, updates: Partial<Entity>): Promise<Entity> {
    const existing = await this.findByUid(tenantId, uid);

    const updated: Entity = {
      ...existing,
      ...updates,
      uid,
      tenant_id: tenantId,
      updated_at: new Date()
    };

    await this.saveToVault(tenantId, updated);
    await this.updateEmbedding(tenantId, updated);
    await this.updateGraphNode(tenantId, updated);

    return updated;
  }

  async delete(tenantId: string, uid: string): Promise<void> {
    await this.findByUid(tenantId, uid);
    await this.deleteFromVault(tenantId, uid);
    await this.deleteEmbedding(tenantId, uid);
    await this.deleteGraphNode(tenantId, uid);
  }

  async search(
    tenantId: string,
    query: string,
    options: { type?: string; limit?: number } = {}
  ): Promise<{ results: Entity[] }> {
    const { entities } = await this.searchByVector(tenantId, query, options);
    return { results: entities };
  }

  async getRelationships(
    tenantId: string,
    uid: string,
    direction?: 'in' | 'out' | 'both'
  ): Promise<{ relationships: any[] }> {
    const relationships = await this.graphService.getNodeRelationships(
      tenantId,
      uid,
      direction
    );
    return { relationships };
  }

  private async saveToVault(tenantId: string, entity: Entity): Promise<void> {
    const filePath = this.getEntityFilePath(entity);
    const content = this.serializeToMarkdown(entity);
    await this.vaultFS.writeFile(tenantId, filePath, content);
  }

  private async loadFromVault(tenantId: string, uid: string): Promise<Entity | null> {
    const folders = ['Entities', 'Daily', 'People', 'Projects', 'Places', 'Events'];
    
    for (const folder of folders) {
      try {
        const files = await this.vaultFS.listFiles(tenantId, folder);
        for (const file of files) {
          if (file.includes(uid.slice(0, 8))) {
            const content = await this.vaultFS.readFile(tenantId, path.join(folder, file));
            return this.parseFromMarkdown(content, uid);
          }
        }
      } catch {
        continue;
      }
    }
    return null;
  }

  private async listFromVault(
    tenantId: string,
    options: { type?: string } = {}
  ): Promise<Entity[]> {
    const entities: Entity[] = [];
    const folders = this.getTypeFolder(options.type);

    for (const folder of folders) {
      try {
        const files = await this.vaultFS.listFiles(tenantId, folder);
        for (const file of files) {
          if (file.endsWith('.md')) {
            const content = await this.vaultFS.readFile(tenantId, path.join(folder, file));
            const entity = this.parseFromMarkdown(content);
            if (entity) entities.push(entity);
          }
        }
      } catch {
        continue;
      }
    }
    return entities;
  }

  private async deleteFromVault(tenantId: string, uid: string): Promise<void> {
    const entity = await this.loadFromVault(tenantId, uid);
    if (entity) {
      const filePath = this.getEntityFilePath(entity);
      await this.vaultFS.deleteFile(tenantId, filePath);
    }
  }

  private async createEmbedding(tenantId: string, entity: Entity): Promise<void> {
    const text = `${entity.name}\n\n${entity.content}`;
    await this.vectorStore.upsertDocument(tenantId, 'entities', {
      id: entity.uid,
      text,
      metadata: { type: entity.type, name: entity.name, tenant_id: tenantId }
    });
  }

  private async updateEmbedding(tenantId: string, entity: Entity): Promise<void> {
    await this.createEmbedding(tenantId, entity);
  }

  private async deleteEmbedding(tenantId: string, uid: string): Promise<void> {
    await this.vectorStore.deleteDocument(tenantId, 'entities', uid);
  }

  private async searchByVector(
    tenantId: string,
    query: string,
    options: any
  ): Promise<{ entities: Entity[]; total: number }> {
    const results = await this.vectorStore.search(tenantId, 'entities', query, {
      limit: options.limit || 20,
      filter: options.type ? { type: options.type } : undefined
    });

    const entities: Entity[] = [];
    for (const result of results) {
      try {
        const entity = await this.loadFromVault(tenantId, result.id);
        if (entity) entities.push(entity);
      } catch {
        continue;
      }
    }
    return { entities, total: entities.length };
  }

  private async createGraphNode(tenantId: string, entity: Entity): Promise<void> {
    await this.graphService.createNode(tenantId, {
      uid: entity.uid,
      type: entity.type,
      properties: { name: entity.name, ...entity.metadata }
    });
  }

  private async updateGraphNode(tenantId: string, entity: Entity): Promise<void> {
    await this.graphService.updateNode(tenantId, entity.uid, {
      properties: { name: entity.name, ...entity.metadata, updated_at: entity.updated_at }
    });
  }

  private async deleteGraphNode(tenantId: string, uid: string): Promise<void> {
    await this.graphService.deleteNode(tenantId, uid);
  }

  private serializeToMarkdown(entity: Entity): string {
    const frontmatter = {
      uid: entity.uid,
      type: entity.type,
      tenant_id: entity.tenant_id,
      created_at: entity.created_at?.toISOString(),
      updated_at: entity.updated_at?.toISOString(),
      ...entity.metadata
    };
    const yamlStr = yaml.dump(frontmatter);
    return `---\n${yamlStr}---\n\n# ${entity.name}\n\n${entity.content}`;
  }

  private parseFromMarkdown(content: string, uid?: string): Entity | null {
    const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
    if (!match) return null;

    const frontmatter = yaml.load(match[1]) as any;
    const body = match[2];
    const titleMatch = body.match(/^#\s+(.+)$/m);
    const name = titleMatch ? titleMatch[1] : frontmatter.name || 'Untitled';

    return {
      uid: uid || frontmatter.uid,
      type: frontmatter.type || 'entity',
      name,
      content: body.replace(/^#\s+.+$/m, '').trim(),
      metadata: frontmatter,
      tenant_id: frontmatter.tenant_id,
      created_at: frontmatter.created_at ? new Date(frontmatter.created_at) : undefined,
      updated_at: frontmatter.updated_at ? new Date(frontmatter.updated_at) : undefined
    };
  }

  private getEntityFilePath(entity: Entity): string {
    const folder = this.getTypeFolderName(entity.type);
    const fileName = `${entity.name.replace(/[^a-z0-9]/gi, '-')}-${entity.uid.slice(0, 8)}.md`;
    return path.join(folder, fileName);
  }

  private getTypeFolderName(type: string): string {
    const map: Record<string, string> = {
      entity: 'Entities', daily: 'Daily', person: 'People',
      project: 'Projects', task: 'Projects', place: 'Places', event: 'Events'
    };
    return map[type] || 'Entities';
  }

  private getTypeFolder(type?: string): string[] {
    return type ? [this.getTypeFolderName(type)] : 
      ['Entities', 'Daily', 'People', 'Projects', 'Places', 'Events'];
  }

  private generateUid(): string {
    return `entity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
