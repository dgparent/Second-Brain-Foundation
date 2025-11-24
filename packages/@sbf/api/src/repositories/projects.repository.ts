// Projects Repository
// Repository for projects

import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import * as path from 'path';

export interface Project {
  uid: string;
  name: string;
  description?: string;
  status?: 'active' | 'completed' | 'on-hold' | 'cancelled';
  tags?: string[];
  archived?: boolean;
  tenant_id: string;
  metadata?: Record<string, any>;
  created_at?: Date;
  updated_at?: Date;
}

@Injectable()
export class ProjectsRepository extends BaseRepository<Project> {
  protected getFolderName(): string {
    return 'Projects';
  }

  protected getVectorCollection(): string {
    return 'projects';
  }

  protected getGraphNodeType(): string {
    return 'project';
  }

  protected async buildEntity(tenantId: string, data: Partial<Project>): Promise<Project> {
    return {
      uid: data.uid || this.generateUid('project'),
      name: data.name || 'Untitled Project',
      description: data.description || '',
      status: data.status || 'active',
      tags: data.tags || [],
      archived: data.archived || false,
      metadata: data.metadata || {},
      tenant_id: tenantId,
      created_at: new Date(),
      updated_at: new Date()
    };
  }

  protected getFilePath(entity: Project): string {
    const fileName = `${entity.name.replace(/[^a-z0-9]/gi, '-')}-${entity.uid.slice(0, 8)}.md`;
    return path.join('Projects', fileName);
  }

  protected getEmbeddingText(entity: Project): string {
    return `${entity.name}\n\n${entity.description || ''}`;
  }

  protected getEmbeddingMetadata(entity: Project): Record<string, any> {
    return {
      name: entity.name,
      status: entity.status,
      tags: entity.tags,
      archived: entity.archived,
      tenant_id: entity.tenant_id
    };
  }

  protected getGraphProperties(entity: Project): Record<string, any> {
    return {
      name: entity.name,
      status: entity.status,
      tags: entity.tags,
      archived: entity.archived,
      ...entity.metadata
    };
  }

  protected serializeEntity(entity: Project): string {
    const frontmatter = {
      uid: entity.uid,
      name: entity.name,
      status: entity.status,
      tags: entity.tags,
      archived: entity.archived,
      tenant_id: entity.tenant_id,
      created_at: entity.created_at?.toISOString(),
      updated_at: entity.updated_at?.toISOString(),
      ...entity.metadata
    };

    return this.createFrontmatter(frontmatter) + 
      `# ${entity.name}\n\n${entity.description || ''}`;
  }

  protected parseEntity(content: string, uid?: string): Project | null {
    const parsed = this.parseFrontmatter(content);
    if (!parsed) return null;

    const { frontmatter, body } = parsed;
    const description = body.replace(/^#\s+.+$/m, '').trim();

    return {
      uid: uid || frontmatter.uid,
      name: frontmatter.name,
      description,
      status: frontmatter.status || 'active',
      tags: frontmatter.tags || [],
      archived: frontmatter.archived || false,
      metadata: frontmatter,
      tenant_id: frontmatter.tenant_id,
      created_at: frontmatter.created_at ? new Date(frontmatter.created_at) : undefined,
      updated_at: frontmatter.updated_at ? new Date(frontmatter.updated_at) : undefined
    };
  }

  async archive(tenantId: string, uid: string): Promise<Project> {
    return this.update(tenantId, uid, { archived: true });
  }

  async unarchive(tenantId: string, uid: string): Promise<Project> {
    return this.update(tenantId, uid, { archived: false });
  }
}
