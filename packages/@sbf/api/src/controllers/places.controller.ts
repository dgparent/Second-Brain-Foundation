// Places Controller
// Place entity CRUD with tenant isolation

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

import { PlacesService } from '../services/places.service';

@ApiTags('places')
@Controller('api/v1/places')
@UseGuards(AuthGuard, TenantContextGuard)
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  /**
   * Create a new place
   * POST /api/v1/places
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new place' })
  async create(
    @Body() dto: any,
    @TenantCtx() ctx: any
  ): Promise<any> {
    return this.placesService.create(ctx.tenant_id, dto);
  }

  /**
   * List places
   * GET /api/v1/places
   */
  @Get()
  @ApiOperation({ summary: 'List all places in tenant' })
  async list(
    @TenantCtx() ctx: any,
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('limit') limit: number = 100
  ): Promise<{ places: any[]; total: number }> {
    return this.placesService.findAll(ctx.tenant_id, {
      search,
      type,
      limit
    });
  }

  /**
   * Get place by UID
   * GET /api/v1/places/:uid
   */
  @Get(':uid')
  @ApiOperation({ summary: 'Get place by UID' })
  async getByUid(
    @Param('uid') uid: string,
    @TenantCtx() ctx: any
  ): Promise<any> {
    return this.placesService.findByUid(ctx.tenant_id, uid);
  }

  /**
   * Update place
   * PATCH /api/v1/places/:uid
   */
  @Patch(':uid')
  @ApiOperation({ summary: 'Update place' })
  async update(
    @Param('uid') uid: string,
    @Body() dto: any,
    @TenantCtx() ctx: any
  ): Promise<any> {
    return this.placesService.update(ctx.tenant_id, uid, dto);
  }

  /**
   * Delete place
   * DELETE /api/v1/places/:uid
   */
  @Delete(':uid')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete place' })
  async delete(
    @Param('uid') uid: string,
    @TenantCtx() ctx: any
  ): Promise<void> {
    await this.placesService.delete(ctx.tenant_id, uid);
  }

  /**
   * Get nearby places
   * GET /api/v1/places/nearby
   */
  @Get('filter/nearby')
  @ApiOperation({ summary: 'Get nearby places' })
  async getNearby(
    @TenantCtx() ctx: any,
    @Query('lat') lat: number,
    @Query('lon') lon: number,
    @Query('radius') radius: number = 10
  ): Promise<{ places: any[] }> {
    return this.placesService.getNearby(ctx.tenant_id, lat, lon, radius);
  }

  /**
   * Get events at place
   * GET /api/v1/places/:uid/events
   */
  @Get(':uid/events')
  @ApiOperation({ summary: 'Get events at place' })
  async getEvents(
    @Param('uid') uid: string,
    @TenantCtx() ctx: any
  ): Promise<{ events: any[] }> {
    return this.placesService.getEvents(ctx.tenant_id, uid);
  }
}
