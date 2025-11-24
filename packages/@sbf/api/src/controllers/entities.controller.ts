// Entities Controller
// Generic entity CRUD with tenant isolation

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
import { User } from '../decorators/user.decorator';
import { TenantCtx } from '../decorators/tenant-context.decorator';

import { EntityService } from '../services/entity.service';

@ApiTags('entities')
@Controller('api/v1/entities')
@UseGuards(AuthGuard, TenantContextGuard)
export class EntitiesController {
  constructor(private readonly entityService: EntityService) {}

  /**
   * Create a new entity
   * POST /api/v1/entities
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new entity' })
  @ApiResponse({ status: 201, description: 'Entity created successfully' })
  async create(
    @Body() dto: any,
    @TenantCtx() ctx: any
  ): Promise<any> {
    return this.entityService.create(ctx.tenant_id, dto);
  }

  /**
   * List entities
   * GET /api/v1/entities
   */
  @Get()
  @ApiOperation({ summary: 'List all entities in tenant' })
  @ApiResponse({ status: 200, description: 'Entities retrieved successfully' })
  async list(
    @TenantCtx() ctx: any,
    @Query('type') type?: string,
    @Query('search') search?: string,
    @Query('limit') limit: number = 100,
    @Query('offset') offset: number = 0
  ): Promise<{ entities: any[]; total: number }> {
    return this.entityService.findAll(ctx.tenant_id, {
      type,
      search,
      limit,
      offset
    });
  }

  /**
   * Get entity by UID
   * GET /api/v1/entities/:uid
   */
  @Get(':uid')
  @ApiOperation({ summary: 'Get entity by UID' })
  @ApiResponse({ status: 200, description: 'Entity retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Entity not found' })
  async getByUid(
    @Param('uid') uid: string,
    @TenantCtx() ctx: any
  ): Promise<any> {
    return this.entityService.findByUid(ctx.tenant_id, uid);
  }

  /**
   * Update entity
   * PATCH /api/v1/entities/:uid
   */
  @Patch(':uid')
  @ApiOperation({ summary: 'Update entity' })
  @ApiResponse({ status: 200, description: 'Entity updated successfully' })
  async update(
    @Param('uid') uid: string,
    @Body() dto: any,
    @TenantCtx() ctx: any
  ): Promise<any> {
    return this.entityService.update(ctx.tenant_id, uid, dto);
  }

  /**
   * Delete entity
   * DELETE /api/v1/entities/:uid
   */
  @Delete(':uid')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete entity' })
  @ApiResponse({ status: 204, description: 'Entity deleted successfully' })
  async delete(
    @Param('uid') uid: string,
    @TenantCtx() ctx: any
  ): Promise<void> {
    await this.entityService.delete(ctx.tenant_id, uid);
  }

  /**
   * Search entities
   * GET /api/v1/entities/search
   */
  @Get('search/query')
  @ApiOperation({ summary: 'Search entities' })
  async search(
    @TenantCtx() ctx: any,
    @Query('q') query: string,
    @Query('type') type?: string,
    @Query('limit') limit: number = 20
  ): Promise<{ results: any[] }> {
    return this.entityService.search(ctx.tenant_id, query, {
      type,
      limit
    });
  }

  /**
   * Get entity relationships
   * GET /api/v1/entities/:uid/relationships
   */
  @Get(':uid/relationships')
  @ApiOperation({ summary: 'Get entity relationships' })
  async getRelationships(
    @Param('uid') uid: string,
    @TenantCtx() ctx: any,
    @Query('direction') direction?: 'in' | 'out' | 'both'
  ): Promise<{ relationships: any[] }> {
    return this.entityService.getRelationships(ctx.tenant_id, uid, direction);
  }
}
