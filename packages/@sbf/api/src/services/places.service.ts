// Places Service
// Business logic for places with tenant isolation

import { Injectable } from '@nestjs/common';
import { PlacesRepository } from '../repositories/places.repository';

@Injectable()
export class PlacesService {
  constructor(private readonly repository: PlacesRepository) {}

  async create(tenantId: string, data: any): Promise<any> {
    return this.repository.create(tenantId, data);
  }

  async findAll(
    tenantId: string,
    options: any
  ): Promise<{ places: any[]; total: number }> {
    const places = await this.repository.findAll(tenantId, options);
    return { places, total: places.length };
  }

  async findByUid(tenantId: string, uid: string): Promise<any> {
    return this.repository.findByUid(tenantId, uid);
  }

  async update(tenantId: string, uid: string, data: any): Promise<any> {
    return this.repository.update(tenantId, uid, data);
  }

  async delete(tenantId: string, uid: string): Promise<void> {
    await this.repository.delete(tenantId, uid);
  }

  async getNearby(
    tenantId: string,
    lat: number,
    lon: number,
    radius: number
  ): Promise<{ places: any[] }> {
    const places = await this.repository.getNearby(tenantId, lat, lon, radius);
    return { places };
  }

  async getEvents(
    tenantId: string,
    uid: string
  ): Promise<{ events: any[] }> {
    // TODO: Query events repository with place_uid filter
    return { events: [] };
  }
}
