// Daily Service
// Business logic for daily notes with tenant isolation

import { Injectable } from '@nestjs/common';
import { DailyRepository } from '../repositories/daily.repository';

@Injectable()
export class DailyService {
  constructor(private readonly repository: DailyRepository) {}

  async getOrCreate(tenantId: string, date: string): Promise<any> {
    return this.repository.getOrCreate(tenantId, date);
  }

  async findByDate(tenantId: string, date: string): Promise<any> {
    return this.repository.findByDate(tenantId, date);
  }

  async findAll(
    tenantId: string,
    options: any
  ): Promise<{ dailies: any[]; total: number }> {
    const dailies = await this.repository.findAll(tenantId, options);
    return { dailies, total: dailies.length };
  }

  async update(tenantId: string, date: string, data: any): Promise<any> {
    const daily = await this.repository.findByDate(tenantId, date);
    if (!daily) throw new Error('Daily note not found');
    return this.repository.update(tenantId, daily.uid, data);
  }

  async delete(tenantId: string, date: string): Promise<void> {
    const daily = await this.repository.findByDate(tenantId, date);
    if (daily) {
      await this.repository.delete(tenantId, daily.uid);
    }
  }

  async getCalendar(
    tenantId: string,
    year: number,
    month: number
  ): Promise<{ dates: string[]; hasNotes: boolean[] }> {
    const dailies = await this.repository.findAll(tenantId, {});
    const monthDailies = dailies.filter(d => {
      const date = new Date(d.date);
      return date.getFullYear() === year && date.getMonth() === month - 1;
    });

    const dates = monthDailies.map(d => d.date);
    const hasNotes = monthDailies.map(() => true);

    return { dates, hasNotes };
  }
}
