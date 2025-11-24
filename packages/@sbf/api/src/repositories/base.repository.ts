// Base Repository
// Shared repository logic for all entity types

import { Injectable } from '@nestjs/common';
import { VaultFileSystemService } from '@sbf/core/entity-manager/services/VaultFileSystemService';
import { TenantVectorStoreService } from '@sbf/core/entity-manager/services/TenantVectorStoreService';
import { TenantGraphService } from '@sbf/core/entity-manager/services/TenantGraphService';
import * as yaml from 'js-yaml';
import * as path from 'path';

export interface BaseEntity {
  uid: string;
  tenant_id: string;
  created_at?: Date;
  updated_at?: Date;
  [key: string]: any;
}

@Injectable()
export abstract class BaseRepository<T extends BaseEntity> {
  constructor(
    protected readonly vaultFS: VaultFileSystemService,
    protected readonly vectorStore: TenantVectorStoreService,
    protected readonly graphService: TenantGraphService
  ) {}

  protected abstract getFolderName(): string;
  protected abstract getVectorCollection(): string;
  protected abstract serializeEntity(entity: T): string;
  protected abstract parseEntity(content: string, uid?: string): T | null;

  async create(tenantId: string, data: Partial<T>): Promise<T> {
    const entity = await this.buildEntity(tenantId, data);
    
    await this.saveToVault(tenantId, entity);
    await this.createEmbedding(tenantId, entity);
    await this.createGraphNode(tenantId, entity);

    return entity;
  }

  async findByUid(tenantId: string, uid: string): Promise<T | null> {
    const entity = await this.loadFromVault(tenantId, uid);
    
    if (entity && entity.tenant_id !== tenantId) {
      return null;
    }

    return entity;
  }

  async findAll(tenantId: string, options: any = {}): Promise<T[]> {
    return this.listFromVault(tenantId, options);
  }

  async update(tenantId: string, uid: string, updates: Partial<T>): Promise<T> {
    const existing = await this.findByUid(tenantId, uid);
    if (!existing) throw new Error('Not found');

    const updated = { ...existing, ...updates, updated_at: new Date() } as T;

    await this.saveToVault(tenantId, updated);
    await this.updateEmbedding(tenantId, updated);
    await this.updateGraphNode(tenantId, updated);

    return updated;
  }

  async delete(tenantId: string, uid: string): Promise<void> {
    await this.deleteFromVault(tenantId, uid);
    await this.deleteEmbedding(tenantId, uid);
    await this.deleteGraphNode(tenantId, uid);
  }

  protected async saveToVault(tenantId: string, entity: T): Promise<void> {
    const filePath = this.getFilePath(entity);
    const content = this.serializeEntity(entity);
    await this.vaultFS.writeFile(tenantId, filePath, content);
  }

  protected async loadFromVault(tenantId: string, uid: string): Promise<T | null> {
    const folder = this.getFolderName();
    
    try {
      const files = await this.vaultFS.listFiles(tenantId, folder);
      
      for (const file of files) {
        if (file.includes(uid.slice(0, 8))) {
          const content = await this.vaultFS.readFile(tenantId, path.join(folder, file));
          return this.parseEntity(content, uid);
        }
      }
    } catch {
      return null;
    }

    return null;
  }

  protected async listFromVault(tenantId: string, options: any): Promise<T[]> {
    const entities: T[] = [];
    const folder = this.getFolderName();

    try {
      const files = await this.vaultFS.listFiles(tenantId, folder);
      
      for (const file of files) {
        if (file.endsWith('.md')) {
          const content = await this.vaultFS.readFile(tenantId, path.join(folder, file));
          const entity = this.parseEntity(content);
          if (entity) entities.push(entity);
        }
      }
    } catch {
      // Folder doesn't exist or empty
    }

    return entities;
  }

  protected async deleteFromVault(tenantId: string, uid: string): Promise<void> {
    const entity = await this.loadFromVault(tenantId, uid);
    if (entity) {
      const filePath = this.getFilePath(entity);
      await this.vaultFS.deleteFile(tenantId, filePath);
    }
  }

  protected async createEmbedding(tenantId: string, entity: T): Promise<void> {
    const text = this.getEmbeddingText(entity);
    const collection = this.getVectorCollection();

    await this.vectorStore.upsertDocument(tenantId, collection, {
      id: entity.uid,
      text,
      metadata: this.getEmbeddingMetadata(entity)
    });
  }

  protected async updateEmbedding(tenantId: string, entity: T): Promise<void> {
    await this.createEmbedding(tenantId, entity);
  }

  protected async deleteEmbedding(tenantId: string, uid: string): Promise<void> {
    await this.vectorStore.deleteDocument(tenantId, this.getVectorCollection(), uid);
  }

  protected async createGraphNode(tenantId: string, entity: T): Promise<void> {
    await this.graphService.createNode(tenantId, {
      uid: entity.uid,
      type: this.getGraphNodeType(),
      properties: this.getGraphProperties(entity)
    });
  }

  protected async updateGraphNode(tenantId: string, entity: T): Promise<void> {
    await this.graphService.updateNode(tenantId, entity.uid, {
      properties: this.getGraphProperties(entity)
    });
  }

  protected async deleteGraphNode(tenantId: string, uid: string): Promise<void> {
    await this.graphService.deleteNode(tenantId, uid);
  }

  protected abstract buildEntity(tenantId: string, data: Partial<T>): Promise<T>;
  protected abstract getFilePath(entity: T): string;
  protected abstract getEmbeddingText(entity: T): string;
  protected abstract getEmbeddingMetadata(entity: T): Record<string, any>;
  protected abstract getGraphNodeType(): string;
  protected abstract getGraphProperties(entity: T): Record<string, any>;

  protected parseFrontmatter(content: string): { frontmatter: any; body: string } | null {
    const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
    if (!match) return null;

    return {
      frontmatter: yaml.load(match[1]) as any,
      body: match[2]
    };
  }

  protected createFrontmatter(data: Record<string, any>): string {
    return `---\n${yaml.dump(data)}---\n\n`;
  }

  protected generateUid(prefix: string = 'entity'): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
