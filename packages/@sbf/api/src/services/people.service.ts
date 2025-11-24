// People Service  
// Business logic for people with tenant isolation

import { Injectable } from '@nestjs/common';
import { PeopleRepository } from '../repositories/people.repository';

@Injectable()
export class PeopleService {
  constructor(private readonly repository: PeopleRepository) {}

  async create(tenantId: string, data: any): Promise<any> {
    return this.repository.create(tenantId, data);
  }

  async findAll(
    tenantId: string,
    options: any
  ): Promise<{ people: any[]; total: number }> {
    const people = await this.repository.findAll(tenantId, options);
    return { people, total: people.length };
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

  async getInteractions(
    tenantId: string,
    uid: string,
    limit: number
  ): Promise<{ interactions: any[] }> {
    // TODO: Query graph for relationships to this person
    // For now, return empty
    return { interactions: [] };
  }

  async findByTag(
    tenantId: string,
    tag: string
  ): Promise<{ people: any[] }> {
    const people = await this.repository.findByTag(tenantId, tag);
    return { people };
  }
}
