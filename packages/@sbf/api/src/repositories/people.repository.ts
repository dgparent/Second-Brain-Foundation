// People Repository
// Repository for people/contacts

import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import * as path from 'path';

export interface Person {
  uid: string;
  name: string;
  email?: string;
  phone?: string;
  tags?: string[];
  notes?: string;
  tenant_id: string;
  metadata?: Record<string, any>;
  created_at?: Date;
  updated_at?: Date;
}

@Injectable()
export class PeopleRepository extends BaseRepository<Person> {
  protected getFolderName(): string {
    return 'People';
  }

  protected getVectorCollection(): string {
    return 'people';
  }

  protected getGraphNodeType(): string {
    return 'person';
  }

  protected async buildEntity(tenantId: string, data: Partial<Person>): Promise<Person> {
    return {
      uid: data.uid || this.generateUid('person'),
      name: data.name || 'Unknown',
      email: data.email,
      phone: data.phone,
      tags: data.tags || [],
      notes: data.notes || '',
      metadata: data.metadata || {},
      tenant_id: tenantId,
      created_at: new Date(),
      updated_at: new Date()
    };
  }

  protected getFilePath(entity: Person): string {
    const fileName = `${entity.name.replace(/[^a-z0-9]/gi, '-')}-${entity.uid.slice(0, 8)}.md`;
    return path.join('People', fileName);
  }

  protected getEmbeddingText(entity: Person): string {
    return `${entity.name}\n${entity.email || ''}\n${entity.notes || ''}`;
  }

  protected getEmbeddingMetadata(entity: Person): Record<string, any> {
    return {
      name: entity.name,
      email: entity.email,
      tags: entity.tags,
      tenant_id: entity.tenant_id
    };
  }

  protected getGraphProperties(entity: Person): Record<string, any> {
    return {
      name: entity.name,
      email: entity.email,
      phone: entity.phone,
      tags: entity.tags,
      ...entity.metadata
    };
  }

  protected serializeEntity(entity: Person): string {
    const frontmatter = {
      uid: entity.uid,
      name: entity.name,
      email: entity.email,
      phone: entity.phone,
      tags: entity.tags,
      tenant_id: entity.tenant_id,
      created_at: entity.created_at?.toISOString(),
      updated_at: entity.updated_at?.toISOString(),
      ...entity.metadata
    };

    return this.createFrontmatter(frontmatter) + `# ${entity.name}\n\n${entity.notes || ''}`;
  }

  protected parseEntity(content: string, uid?: string): Person | null {
    const parsed = this.parseFrontmatter(content);
    if (!parsed) return null;

    const { frontmatter, body } = parsed;
    const notes = body.replace(/^#\s+.+$/m, '').trim();

    return {
      uid: uid || frontmatter.uid,
      name: frontmatter.name,
      email: frontmatter.email,
      phone: frontmatter.phone,
      tags: frontmatter.tags || [],
      notes,
      metadata: frontmatter,
      tenant_id: frontmatter.tenant_id,
      created_at: frontmatter.created_at ? new Date(frontmatter.created_at) : undefined,
      updated_at: frontmatter.updated_at ? new Date(frontmatter.updated_at) : undefined
    };
  }

  async findByTag(tenantId: string, tag: string): Promise<Person[]> {
    const all = await this.findAll(tenantId, {});
    return all.filter(p => p.tags?.includes(tag));
  }
}
