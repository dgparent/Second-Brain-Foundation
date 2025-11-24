// Daily Repository
// Repository for daily notes

import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import * as path from 'path';

export interface DailyNote {
  uid: string;
  date: string;
  content: string;
  tenant_id: string;
  metadata?: Record<string, any>;
  created_at?: Date;
  updated_at?: Date;
}

@Injectable()
export class DailyRepository extends BaseRepository<DailyNote> {
  protected getFolderName(): string {
    return 'Daily';
  }

  protected getVectorCollection(): string {
    return 'daily';
  }

  protected getGraphNodeType(): string {
    return 'daily';
  }

  protected async buildEntity(tenantId: string, data: Partial<DailyNote>): Promise<DailyNote> {
    const date = data.date || new Date().toISOString().split('T')[0];
    
    return {
      uid: data.uid || this.generateUid('daily'),
      date,
      content: data.content || '',
      metadata: data.metadata || {},
      tenant_id: tenantId,
      created_at: new Date(),
      updated_at: new Date()
    };
  }

  protected getFilePath(entity: DailyNote): string {
    return path.join('Daily', `${entity.date}.md`);
  }

  protected getEmbeddingText(entity: DailyNote): string {
    return `Daily note ${entity.date}\n\n${entity.content}`;
  }

  protected getEmbeddingMetadata(entity: DailyNote): Record<string, any> {
    return {
      date: entity.date,
      tenant_id: entity.tenant_id
    };
  }

  protected getGraphProperties(entity: DailyNote): Record<string, any> {
    return {
      date: entity.date,
      ...entity.metadata
    };
  }

  protected serializeEntity(entity: DailyNote): string {
    const frontmatter = {
      uid: entity.uid,
      date: entity.date,
      tenant_id: entity.tenant_id,
      created_at: entity.created_at?.toISOString(),
      updated_at: entity.updated_at?.toISOString(),
      ...entity.metadata
    };

    return this.createFrontmatter(frontmatter) + entity.content;
  }

  protected parseEntity(content: string, uid?: string): DailyNote | null {
    const parsed = this.parseFrontmatter(content);
    if (!parsed) return null;

    const { frontmatter, body } = parsed;

    return {
      uid: uid || frontmatter.uid,
      date: frontmatter.date,
      content: body.trim(),
      metadata: frontmatter,
      tenant_id: frontmatter.tenant_id,
      created_at: frontmatter.created_at ? new Date(frontmatter.created_at) : undefined,
      updated_at: frontmatter.updated_at ? new Date(frontmatter.updated_at) : undefined
    };
  }

  async findByDate(tenantId: string, date: string): Promise<DailyNote | null> {
    const filePath = path.join('Daily', `${date}.md`);
    
    try {
      const content = await this.vaultFS.readFile(tenantId, filePath);
      return this.parseEntity(content);
    } catch {
      return null;
    }
  }

  async getOrCreate(tenantId: string, date: string): Promise<DailyNote> {
    let daily = await this.findByDate(tenantId, date);
    
    if (!daily) {
      daily = await this.create(tenantId, { date, content: '' });
    }

    return daily;
  }
}
