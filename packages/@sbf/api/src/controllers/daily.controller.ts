// Daily Notes Controller
// Daily note CRUD with tenant isolation

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

import { DailyService } from '../services/daily.service';

@ApiTags('daily')
@Controller('api/v1/daily')
@UseGuards(AuthGuard, TenantContextGuard)
export class DailyController {
  constructor(private readonly dailyService: DailyService) {}

  /**
   * Create or get today's daily note
   * GET /api/v1/daily/today
   */
  @Get('today')
  @ApiOperation({ summary: 'Get or create today\'s daily note' })
  async getToday(@TenantCtx() ctx: any): Promise<any> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return this.dailyService.getOrCreate(ctx.tenant_id, today);
  }

  /**
   * Get daily note by date
   * GET /api/v1/daily/:date
   */
  @Get(':date')
  @ApiOperation({ summary: 'Get daily note by date' })
  @ApiResponse({ status: 200, description: 'Daily note retrieved' })
  @ApiResponse({ status: 404, description: 'Daily note not found' })
  async getByDate(
    @Param('date') date: string,
    @TenantCtx() ctx: any
  ): Promise<any> {
    return this.dailyService.findByDate(ctx.tenant_id, date);
  }

  /**
   * List daily notes
   * GET /api/v1/daily
   */
  @Get()
  @ApiOperation({ summary: 'List daily notes' })
  async list(
    @TenantCtx() ctx: any,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit: number = 30
  ): Promise<{ dailies: any[]; total: number }> {
    return this.dailyService.findAll(ctx.tenant_id, {
      from,
      to,
      limit
    });
  }

  /**
   * Update daily note
   * PATCH /api/v1/daily/:date
   */
  @Patch(':date')
  @ApiOperation({ summary: 'Update daily note' })
  async update(
    @Param('date') date: string,
    @Body() dto: any,
    @TenantCtx() ctx: any
  ): Promise<any> {
    return this.dailyService.update(ctx.tenant_id, date, dto);
  }

  /**
   * Delete daily note
   * DELETE /api/v1/daily/:date
   */
  @Delete(':date')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete daily note' })
  async delete(
    @Param('date') date: string,
    @TenantCtx() ctx: any
  ): Promise<void> {
    await this.dailyService.delete(ctx.tenant_id, date);
  }

  /**
   * Get daily note calendar view
   * GET /api/v1/daily/calendar/:year/:month
   */
  @Get('calendar/:year/:month')
  @ApiOperation({ summary: 'Get calendar view of daily notes' })
  async getCalendar(
    @Param('year') year: number,
    @Param('month') month: number,
    @TenantCtx() ctx: any
  ): Promise<{ dates: string[]; hasNotes: boolean[] }> {
    return this.dailyService.getCalendar(ctx.tenant_id, year, month);
  }
}
