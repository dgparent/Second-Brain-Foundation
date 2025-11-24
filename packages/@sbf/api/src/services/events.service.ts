// Events Service
// Business logic for events with tenant isolation

import { Injectable } from '@nestjs/common';
import { EventsRepository } from '../repositories/events.repository';

@Injectable()
export class EventsService {
  constructor(private readonly repository: EventsRepository) {}

  async create(tenantId: string, data: any): Promise<any> {
    return this.repository.create(tenantId, data);
  }

  async findAll(
    tenantId: string,
    options: any
  ): Promise<{ events: any[]; total: number }> {
    const events = await this.repository.findAll(tenantId, options);
    return { events, total: events.length };
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

  async getUpcoming(
    tenantId: string,
    days: number
  ): Promise<{ events: any[] }> {
    const events = await this.repository.getUpcoming(tenantId, days);
    return { events };
  }

  async getPast(
    tenantId: string,
    days: number,
    limit: number
  ): Promise<{ events: any[] }> {
    const events = await this.repository.getPast(tenantId, days, limit);
    return { events };
  }

  async getCalendar(
    tenantId: string,
    year: number,
    month: number
  ): Promise<{ events: any[] }> {
    const events = await this.repository.getCalendar(tenantId, year, month);
    return { events };
  }

  async getAttendees(
    tenantId: string,
    uid: string
  ): Promise<{ attendees: any[] }> {
    const event = await this.repository.findByUid(tenantId, uid);
    if (!event) return { attendees: [] };
    
    // TODO: Map attendee UIDs to actual people entities
    return { attendees: event.attendees || [] };
  }
}
