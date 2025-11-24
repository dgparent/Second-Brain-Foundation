// Tasks Repository
// Repository for tasks

import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import * as path from 'path';

export interface Task {
  uid: string;
  title: string;
  description?: string;
  status?: 'todo' | 'in-progress' | 'done' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: Date;
  project_uid?: string;
  tags?: string[];
  tenant_id: string;
  metadata?: Record<string, any>;
  created_at?: Date;
  updated_at?: Date;
}

@Injectable()
export class TasksRepository extends BaseRepository<Task> {
  protected getFolderName(): string {
    return 'Projects/Tasks';
  }

  protected getVectorCollection(): string {
    return 'tasks';
  }

  protected getGraphNodeType(): string {
    return 'task';
  }

  protected async buildEntity(tenantId: string, data: Partial<Task>): Promise<Task> {
    return {
      uid: data.uid || this.generateUid('task'),
      title: data.title || 'Untitled Task',
      description: data.description || '',
      status: data.status || 'todo',
      priority: data.priority || 'medium',
      due_date: data.due_date,
      project_uid: data.project_uid,
      tags: data.tags || [],
      metadata: data.metadata || {},
      tenant_id: tenantId,
      created_at: new Date(),
      updated_at: new Date()
    };
  }

  protected getFilePath(entity: Task): string {
    const fileName = `${entity.title.replace(/[^a-z0-9]/gi, '-')}-${entity.uid.slice(0, 8)}.md`;
    return path.join('Projects', 'Tasks', fileName);
  }

  protected getEmbeddingText(entity: Task): string {
    return `${entity.title}\n\n${entity.description || ''}`;
  }

  protected getEmbeddingMetadata(entity: Task): Record<string, any> {
    return {
      title: entity.title,
      status: entity.status,
      priority: entity.priority,
      due_date: entity.due_date?.toISOString(),
      project_uid: entity.project_uid,
      tags: entity.tags,
      tenant_id: entity.tenant_id
    };
  }

  protected getGraphProperties(entity: Task): Record<string, any> {
    return {
      title: entity.title,
      status: entity.status,
      priority: entity.priority,
      due_date: entity.due_date?.toISOString(),
      project_uid: entity.project_uid,
      tags: entity.tags,
      ...entity.metadata
    };
  }

  protected serializeEntity(entity: Task): string {
    const frontmatter = {
      uid: entity.uid,
      title: entity.title,
      status: entity.status,
      priority: entity.priority,
      due_date: entity.due_date?.toISOString(),
      project_uid: entity.project_uid,
      tags: entity.tags,
      tenant_id: entity.tenant_id,
      created_at: entity.created_at?.toISOString(),
      updated_at: entity.updated_at?.toISOString(),
      ...entity.metadata
    };

    return this.createFrontmatter(frontmatter) + 
      `# ${entity.title}\n\n${entity.description || ''}`;
  }

  protected parseEntity(content: string, uid?: string): Task | null {
    const parsed = this.parseFrontmatter(content);
    if (!parsed) return null;

    const { frontmatter, body } = parsed;
    const description = body.replace(/^#\s+.+$/m, '').trim();

    return {
      uid: uid || frontmatter.uid,
      title: frontmatter.title,
      description,
      status: frontmatter.status || 'todo',
      priority: frontmatter.priority || 'medium',
      due_date: frontmatter.due_date ? new Date(frontmatter.due_date) : undefined,
      project_uid: frontmatter.project_uid,
      tags: frontmatter.tags || [],
      metadata: frontmatter,
      tenant_id: frontmatter.tenant_id,
      created_at: frontmatter.created_at ? new Date(frontmatter.created_at) : undefined,
      updated_at: frontmatter.updated_at ? new Date(frontmatter.updated_at) : undefined
    };
  }

  async complete(tenantId: string, uid: string): Promise<Task> {
    return this.update(tenantId, uid, { status: 'done' });
  }

  async uncomplete(tenantId: string, uid: string): Promise<Task> {
    return this.update(tenantId, uid, { status: 'todo' });
  }

  async getToday(tenantId: string): Promise<Task[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const all = await this.findAll(tenantId, {});
    return all.filter(t => {
      if (!t.due_date) return false;
      const dueDate = new Date(t.due_date);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === today.getTime();
    });
  }

  async getOverdue(tenantId: string): Promise<Task[]> {
    const now = new Date();
    
    const all = await this.findAll(tenantId, {});
    return all.filter(t => {
      if (!t.due_date || t.status === 'done') return false;
      return new Date(t.due_date) < now;
    });
  }
}
