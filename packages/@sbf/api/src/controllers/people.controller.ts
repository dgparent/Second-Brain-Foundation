// People Controller
// Person entity CRUD with tenant isolation

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

import { PeopleService } from '../services/people.service';

@ApiTags('people')
@Controller('api/v1/people')
@UseGuards(AuthGuard, TenantContextGuard)
export class PeopleController {
  constructor(private readonly peopleService: PeopleService) {}

  /**
   * Create a new person
   * POST /api/v1/people
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new person' })
  async create(
    @Body() dto: any,
    @TenantCtx() ctx: any
  ): Promise<any> {
    return this.peopleService.create(ctx.tenant_id, dto);
  }

  /**
   * List people
   * GET /api/v1/people
   */
  @Get()
  @ApiOperation({ summary: 'List all people in tenant' })
  async list(
    @TenantCtx() ctx: any,
    @Query('search') search?: string,
    @Query('tag') tag?: string,
    @Query('limit') limit: number = 100
  ): Promise<{ people: any[]; total: number }> {
    return this.peopleService.findAll(ctx.tenant_id, {
      search,
      tag,
      limit
    });
  }

  /**
   * Get person by UID
   * GET /api/v1/people/:uid
   */
  @Get(':uid')
  @ApiOperation({ summary: 'Get person by UID' })
  async getByUid(
    @Param('uid') uid: string,
    @TenantCtx() ctx: any
  ): Promise<any> {
    return this.peopleService.findByUid(ctx.tenant_id, uid);
  }

  /**
   * Update person
   * PATCH /api/v1/people/:uid
   */
  @Patch(':uid')
  @ApiOperation({ summary: 'Update person' })
  async update(
    @Param('uid') uid: string,
    @Body() dto: any,
    @TenantCtx() ctx: any
  ): Promise<any> {
    return this.peopleService.update(ctx.tenant_id, uid, dto);
  }

  /**
   * Delete person
   * DELETE /api/v1/people/:uid
   */
  @Delete(':uid')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete person' })
  async delete(
    @Param('uid') uid: string,
    @TenantCtx() ctx: any
  ): Promise<void> {
    await this.peopleService.delete(ctx.tenant_id, uid);
  }

  /**
   * Get person's interactions
   * GET /api/v1/people/:uid/interactions
   */
  @Get(':uid/interactions')
  @ApiOperation({ summary: 'Get person\'s interactions' })
  async getInteractions(
    @Param('uid') uid: string,
    @TenantCtx() ctx: any,
    @Query('limit') limit: number = 50
  ): Promise<{ interactions: any[] }> {
    return this.peopleService.getInteractions(ctx.tenant_id, uid, limit);
  }

  /**
   * Get people by tag
   * GET /api/v1/people/tags/:tag
   */
  @Get('tags/:tag')
  @ApiOperation({ summary: 'Get people by tag' })
  async getByTag(
    @Param('tag') tag: string,
    @TenantCtx() ctx: any
  ): Promise<{ people: any[] }> {
    return this.peopleService.findByTag(ctx.tenant_id, tag);
  }
}
