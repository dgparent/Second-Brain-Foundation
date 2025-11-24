// Events Repository
// Repository for events and calendar items

import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import * as path from 'path';

export interface Event {
  uid: string;
  title: string;
  description?: string;
  start_date: Date;
  end_date?: Date;
  type?: string;
  location?: string;
  place_uid?: string;
  attendees?: string[];
  tags?: string[];
  tenant_id: string;
  metadata?: Record<string, any>;
  created_at?: Date;
  updated_at?: Date;
}

@Injectable()
export class EventsRepository extends BaseRepository<Event> {
  protected getFolderName(): string {
    return 'Events';
  }

  protected getVectorCollection(): string {
    return 'events';
  }

  protected getGraphNodeType(): string {
    return 'event';
  }

  protected async buildEntity(tenantId: string, data: Partial<Event>): Promise<Event> {
    return {
      uid: data.uid || this.generateUid('event'),
      title: data.title || 'Untitled Event',
      description: data.description || '',
      start_date: data.start_date || new Date(),
      end_date: data.end_date,
      type: data.type || 'event',
      location: data.location,
      place_uid: data.place_uid,
      attendees: data.attendees || [],
      tags: data.tags || [],
      metadata: data.metadata || {},
      tenant_id: tenantId,
      created_at: new Date(),
      updated_at: new Date()
    };
  }

  protected getFilePath(entity: Event): string {
    const dateStr = entity.start_date.toISOString().split('T')[0];
    const fileName = `${dateStr}-${entity.title.replace(/[^a-z0-9]/gi, '-')}-${entity.uid.slice(0, 8)}.md`;
    return path.join('Events', fileName);
  }

  protected getEmbeddingText(entity: Event): string {
    return `${entity.title}\n${entity.description || ''}\n${entity.location || ''}`;
  }

  protected getEmbeddingMetadata(entity: Event): Record<string, any> {
    return {
      title: entity.title,
      start_date: entity.start_date.toISOString(),
      end_date: entity.end_date?.toISOString(),
      type: entity.type,
      location: entity.location,
      tags: entity.tags,
      tenant_id: entity.tenant_id
    };
  }

  protected getGraphProperties(entity: Event): Record<string, any> {
    return {
      title: entity.title,
      start_date: entity.start_date.toISOString(),
      end_date: entity.end_date?.toISOString(),
      type: entity.type,
      location: entity.location,
      place_uid: entity.place_uid,
      attendees: entity.attendees,
      tags: entity.tags,
      ...entity.metadata
    };
  }

  protected serializeEntity(entity: Event): string {
    const frontmatter = {
      uid: entity.uid,
      title: entity.title,
      start_date: entity.start_date.toISOString(),
      end_date: entity.end_date?.toISOString(),
      type: entity.type,
      location: entity.location,
      place_uid: entity.place_uid,
      attendees: entity.attendees,
      tags: entity.tags,
      tenant_id: entity.tenant_id,
      created_at: entity.created_at?.toISOString(),
      updated_at: entity.updated_at?.toISOString(),
      ...entity.metadata
    };

    return this.createFrontmatter(frontmatter) + 
      `# ${entity.title}\n\n${entity.description || ''}`;
  }

  protected parseEntity(content: string, uid?: string): Event | null {
    const parsed = this.parseFrontmatter(content);
    if (!parsed) return null;

    const { frontmatter, body } = parsed;
    const description = body.replace(/^#\s+.+$/m, '').trim();

    return {
      uid: uid || frontmatter.uid,
      title: frontmatter.title,
      description,
      start_date: new Date(frontmatter.start_date),
      end_date: frontmatter.end_date ? new Date(frontmatter.end_date) : undefined,
      type: frontmatter.type || 'event',
      location: frontmatter.location,
      place_uid: frontmatter.place_uid,
      attendees: frontmatter.attendees || [],
      tags: frontmatter.tags || [],
      metadata: frontmatter,
      tenant_id: frontmatter.tenant_id,
      created_at: frontmatter.created_at ? new Date(frontmatter.created_at) : undefined,
      updated_at: frontmatter.updated_at ? new Date(frontmatter.updated_at) : undefined
    };
  }

  async getUpcoming(tenantId: string, days: number = 7): Promise<Event[]> {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);

    const all = await this.findAll(tenantId, {});
    return all.filter(e => {
      const start = new Date(e.start_date);
      return start >= now && start <= future;
    }).sort((a, b) => a.start_date.getTime() - b.start_date.getTime());
  }

  async getPast(tenantId: string, days: number = 30, limit: number = 50): Promise<Event[]> {
    const now = new Date();
    const past = new Date();
    past.setDate(past.getDate() - days);

    const all = await this.findAll(tenantId, {});
    return all.filter(e => {
      const start = new Date(e.start_date);
      return start < now && start >= past;
    })
    .sort((a, b) => b.start_date.getTime() - a.start_date.getTime())
    .slice(0, limit);
  }

  async getCalendar(tenantId: string, year: number, month: number): Promise<Event[]> {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const all = await this.findAll(tenantId, {});
    return all.filter(e => {
      const eventDate = new Date(e.start_date);
      return eventDate >= start && eventDate <= end;
    }).sort((a, b) => a.start_date.getTime() - b.start_date.getTime());
  }
}
