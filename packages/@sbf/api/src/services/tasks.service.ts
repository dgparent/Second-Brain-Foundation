// Tasks Service
// Business logic for tasks with tenant isolation

import { Injectable } from '@nestjs/common';
import { TasksRepository } from '../repositories/tasks.repository';

@Injectable()
export class TasksService {
  constructor(private readonly repository: TasksRepository) {}

  async create(tenantId: string, data: any): Promise<any> {
    return this.repository.create(tenantId, data);
  }

  async findAll(
    tenantId: string,
    options: any
  ): Promise<{ tasks: any[]; total: number }> {
    const tasks = await this.repository.findAll(tenantId, options);
    return { tasks, total: tasks.length };
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

  async complete(tenantId: string, uid: string): Promise<any> {
    return this.repository.complete(tenantId, uid);
  }

  async uncomplete(tenantId: string, uid: string): Promise<any> {
    return this.repository.uncomplete(tenantId, uid);
  }

  async getToday(tenantId: string): Promise<{ tasks: any[] }> {
    const tasks = await this.repository.getToday(tenantId);
    return { tasks };
  }

  async getOverdue(tenantId: string): Promise<{ tasks: any[] }> {
    const tasks = await this.repository.getOverdue(tenantId);
    return { tasks };
  }
}
