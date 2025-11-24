// Projects Controller
// Project entity CRUD with tenant isolation

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

import { ProjectsService } from '../services/projects.service';

@ApiTags('projects')
@Controller('api/v1/projects')
@UseGuards(AuthGuard, TenantContextGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  /**
   * Create a new project
   * POST /api/v1/projects
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new project' })
  async create(
    @Body() dto: any,
    @TenantCtx() ctx: any
  ): Promise<any> {
    return this.projectsService.create(ctx.tenant_id, dto);
  }

  /**
   * List projects
   * GET /api/v1/projects
   */
  @Get()
  @ApiOperation({ summary: 'List all projects in tenant' })
  async list(
    @TenantCtx() ctx: any,
    @Query('status') status?: string,
    @Query('tag') tag?: string,
    @Query('archived') archived: boolean = false,
    @Query('limit') limit: number = 100
  ): Promise<{ projects: any[]; total: number }> {
    return this.projectsService.findAll(ctx.tenant_id, {
      status,
      tag,
      archived,
      limit
    });
  }

  /**
   * Get project by UID
   * GET /api/v1/projects/:uid
   */
  @Get(':uid')
  @ApiOperation({ summary: 'Get project by UID' })
  async getByUid(
    @Param('uid') uid: string,
    @TenantCtx() ctx: any
  ): Promise<any> {
    return this.projectsService.findByUid(ctx.tenant_id, uid);
  }

  /**
   * Update project
   * PATCH /api/v1/projects/:uid
   */
  @Patch(':uid')
  @ApiOperation({ summary: 'Update project' })
  async update(
    @Param('uid') uid: string,
    @Body() dto: any,
    @TenantCtx() ctx: any
  ): Promise<any> {
    return this.projectsService.update(ctx.tenant_id, uid, dto);
  }

  /**
   * Delete project
   * DELETE /api/v1/projects/:uid
   */
  @Delete(':uid')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete project' })
  async delete(
    @Param('uid') uid: string,
    @TenantCtx() ctx: any
  ): Promise<void> {
    await this.projectsService.delete(ctx.tenant_id, uid);
  }

  /**
   * Archive project
   * POST /api/v1/projects/:uid/archive
   */
  @Post(':uid/archive')
  @ApiOperation({ summary: 'Archive project' })
  async archive(
    @Param('uid') uid: string,
    @TenantCtx() ctx: any
  ): Promise<any> {
    return this.projectsService.archive(ctx.tenant_id, uid);
  }

  /**
   * Unarchive project
   * POST /api/v1/projects/:uid/unarchive
   */
  @Post(':uid/unarchive')
  @ApiOperation({ summary: 'Unarchive project' })
  async unarchive(
    @Param('uid') uid: string,
    @TenantCtx() ctx: any
  ): Promise<any> {
    return this.projectsService.unarchive(ctx.tenant_id, uid);
  }

  /**
   * Get project tasks
   * GET /api/v1/projects/:uid/tasks
   */
  @Get(':uid/tasks')
  @ApiOperation({ summary: 'Get project tasks' })
  async getTasks(
    @Param('uid') uid: string,
    @TenantCtx() ctx: any,
    @Query('status') status?: string
  ): Promise<{ tasks: any[] }> {
    return this.projectsService.getTasks(ctx.tenant_id, uid, status);
  }
}
