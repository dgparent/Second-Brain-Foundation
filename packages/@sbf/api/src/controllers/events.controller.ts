// Events Controller
// Event entity CRUD with tenant isolation

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { AuthGuard } from '../guards/auth.guard';
import { TenantContextGuard } from '../guards/tenant-context.guard';
import { TenantCtx } from '../decorators/tenant-context.decorator';

import { EventsService } from '../services/events.service';

@ApiTags('events')
@Controller('api/v1/events')
@UseGuards(AuthGuard, TenantContextGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  /**
   * Create a new event
   * POST /api/v1/events
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new event' })
  async create(
    @Body() dto: any,
    @TenantCtx() ctx: any
  ): Promise<any> {
    return this.eventsService.create(ctx.tenant_id, dto);
  }

  /**
   * List events
   * GET /api/v1/events
   */
  @Get()
  @ApiOperation({ summary: 'List all events in tenant' })
  async list(
    @TenantCtx() ctx: any,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('type') type?: string,
    @Query('limit') limit: number = 100
  ): Promise<{ events: any[]; total: number }> {
    return this.eventsService.findAll(ctx.tenant_id, {
      from,
      to,
      type,
      limit
    });
  }

  /**
   * Get event by UID
   * GET /api/v1/events/:uid
   */
  @Get(':uid')
  @ApiOperation({ summary: 'Get event by UID' })
  async getByUid(
    @Param('uid') uid: string,
    @TenantCtx() ctx: any
  ): Promise<any> {
    return this.eventsService.findByUid(ctx.tenant_id, uid);
  }

  /**
   * Update event
   * PATCH /api/v1/events/:uid
   */
  @Patch(':uid')
  @ApiOperation({ summary: 'Update event' })
  async update(
    @Param('uid') uid: string,
    @Body() dto: any,
    @TenantCtx() ctx: any
  ): Promise<any> {
    return this.eventsService.update(ctx.tenant_id, uid, dto);
  }

  /**
   * Delete event
   * DELETE /api/v1/events/:uid
   */
  @Delete(':uid')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete event' })
  async delete(
    @Param('uid') uid: string,
    @TenantCtx() ctx: any
  ): Promise<void> {
    await this.eventsService.delete(ctx.tenant_id, uid);
  }

  /**
   * Get upcoming events
   * GET /api/v1/events/upcoming
   */
  @Get('filter/upcoming')
  @ApiOperation({ summary: 'Get upcoming events' })
  async getUpcoming(
    @TenantCtx() ctx: any,
    @Query('days') days: number = 7
  ): Promise<{ events: any[] }> {
    return this.eventsService.getUpcoming(ctx.tenant_id, days);
  }

  /**
   * Get past events
   * GET /api/v1/events/past
   */
  @Get('filter/past')
  @ApiOperation({ summary: 'Get past events' })
  async getPast(
    @TenantCtx() ctx: any,
    @Query('days') days: number = 30,
    @Query('limit') limit: number = 50
  ): Promise<{ events: any[] }> {
    return this.eventsService.getPast(ctx.tenant_id, days, limit);
  }

  /**
   * Get events calendar view
   * GET /api/v1/events/calendar/:year/:month
   */
  @Get('calendar/:year/:month')
  @ApiOperation({ summary: 'Get calendar view of events' })
  async getCalendar(
    @Param('year') year: number,
    @Param('month') month: number,
    @TenantCtx() ctx: any
  ): Promise<{ events: any[] }> {
    return this.eventsService.getCalendar(ctx.tenant_id, year, month);
  }

  /**
   * Get event attendees
   * GET /api/v1/events/:uid/attendees
   */
  @Get(':uid/attendees')
  @ApiOperation({ summary: 'Get event attendees' })
  async getAttendees(
    @Param('uid') uid: string,
    @TenantCtx() ctx: any
  ): Promise<{ attendees: any[] }> {
    return this.eventsService.getAttendees(ctx.tenant_id, uid);
  }
}
