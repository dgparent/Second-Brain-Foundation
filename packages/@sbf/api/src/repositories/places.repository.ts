// Places Repository
// Repository for locations/places

import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import * as path from 'path';

export interface Place {
  uid: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  type?: string;
  notes?: string;
  tags?: string[];
  tenant_id: string;
  metadata?: Record<string, any>;
  created_at?: Date;
  updated_at?: Date;
}

@Injectable()
export class PlacesRepository extends BaseRepository<Place> {
  protected getFolderName(): string {
    return 'Places';
  }

  protected getVectorCollection(): string {
    return 'places';
  }

  protected getGraphNodeType(): string {
    return 'place';
  }

  protected async buildEntity(tenantId: string, data: Partial<Place>): Promise<Place> {
    return {
      uid: data.uid || this.generateUid('place'),
      name: data.name || 'Unnamed Place',
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      type: data.type || 'location',
      notes: data.notes || '',
      tags: data.tags || [],
      metadata: data.metadata || {},
      tenant_id: tenantId,
      created_at: new Date(),
      updated_at: new Date()
    };
  }

  protected getFilePath(entity: Place): string {
    const fileName = `${entity.name.replace(/[^a-z0-9]/gi, '-')}-${entity.uid.slice(0, 8)}.md`;
    return path.join('Places', fileName);
  }

  protected getEmbeddingText(entity: Place): string {
    return `${entity.name}\n${entity.address || ''}\n${entity.notes || ''}`;
  }

  protected getEmbeddingMetadata(entity: Place): Record<string, any> {
    return {
      name: entity.name,
      address: entity.address,
      type: entity.type,
      latitude: entity.latitude,
      longitude: entity.longitude,
      tags: entity.tags,
      tenant_id: entity.tenant_id
    };
  }

  protected getGraphProperties(entity: Place): Record<string, any> {
    return {
      name: entity.name,
      address: entity.address,
      latitude: entity.latitude,
      longitude: entity.longitude,
      type: entity.type,
      tags: entity.tags,
      ...entity.metadata
    };
  }

  protected serializeEntity(entity: Place): string {
    const frontmatter = {
      uid: entity.uid,
      name: entity.name,
      address: entity.address,
      latitude: entity.latitude,
      longitude: entity.longitude,
      type: entity.type,
      tags: entity.tags,
      tenant_id: entity.tenant_id,
      created_at: entity.created_at?.toISOString(),
      updated_at: entity.updated_at?.toISOString(),
      ...entity.metadata
    };

    return this.createFrontmatter(frontmatter) + 
      `# ${entity.name}\n\n${entity.notes || ''}`;
  }

  protected parseEntity(content: string, uid?: string): Place | null {
    const parsed = this.parseFrontmatter(content);
    if (!parsed) return null;

    const { frontmatter, body } = parsed;
    const notes = body.replace(/^#\s+.+$/m, '').trim();

    return {
      uid: uid || frontmatter.uid,
      name: frontmatter.name,
      address: frontmatter.address,
      latitude: frontmatter.latitude,
      longitude: frontmatter.longitude,
      type: frontmatter.type || 'location',
      notes,
      tags: frontmatter.tags || [],
      metadata: frontmatter,
      tenant_id: frontmatter.tenant_id,
      created_at: frontmatter.created_at ? new Date(frontmatter.created_at) : undefined,
      updated_at: frontmatter.updated_at ? new Date(frontmatter.updated_at) : undefined
    };
  }

  async getNearby(
    tenantId: string,
    lat: number,
    lon: number,
    radius: number = 10
  ): Promise<Place[]> {
    const all = await this.findAll(tenantId, {});
    
    // Filter by distance (simplified - uses basic lat/lon distance)
    return all.filter(place => {
      if (!place.latitude || !place.longitude) return false;
      
      const distance = this.calculateDistance(
        lat, lon,
        place.latitude, place.longitude
      );
      
      return distance <= radius;
    });
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    // Haversine formula (simplified)
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
