// Projects Service
// Business logic for projects with tenant isolation

import { Injectable } from '@nestjs/common';
import { ProjectsRepository } from '../repositories/projects.repository';

@Injectable()
export class ProjectsService {
  constructor(private readonly repository: ProjectsRepository) {}

  async create(tenantId: string, data: any): Promise<any> {
    return this.repository.create(tenantId, data);
  }

  async findAll(
    tenantId: string,
    options: any
  ): Promise<{ projects: any[]; total: number }> {
    const projects = await this.repository.findAll(tenantId, options);
    return { projects, total: projects.length };
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

  async archive(tenantId: string, uid: string): Promise<any> {
    return this.repository.archive(tenantId, uid);
  }

  async unarchive(tenantId: string, uid: string): Promise<any> {
    return this.repository.unarchive(tenantId, uid);
  }

  async getTasks(
    tenantId: string,
    uid: string,
    status?: string
  ): Promise<{ tasks: any[] }> {
    // TODO: Query tasks repository with project_uid filter
    return { tasks: [] };
  }
}
