// Entity Service
// Business logic for generic entities with tenant isolation

import { Injectable } from '@nestjs/common';
import { EntityRepository } from '../repositories/entity.repository';

@Injectable()
export class EntityService {
  constructor(private readonly repository: EntityRepository) {}

  async create(tenantId: string, data: any): Promise<any> {
    return this.repository.create(tenantId, data);
  }

  async findAll(
    tenantId: string,
    options: any
  ): Promise<{ entities: any[]; total: number }> {
    return this.repository.findAll(tenantId, options);
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

  async search(
    tenantId: string,
    query: string,
    options: any
  ): Promise<{ results: any[] }> {
    return this.repository.search(tenantId, query, options);
  }

  async getRelationships(
    tenantId: string,
    uid: string,
    direction?: 'in' | 'out' | 'both'
  ): Promise<{ relationships: any[] }> {
    return this.repository.getRelationships(tenantId, uid, direction);
  }
}
