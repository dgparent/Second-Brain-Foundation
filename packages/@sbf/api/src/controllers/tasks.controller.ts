// Tasks Controller
// Task entity CRUD with tenant isolation

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

import { TasksService } from '../services/tasks.service';

@ApiTags('tasks')
@Controller('api/v1/tasks')
@UseGuards(AuthGuard, TenantContextGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  /**
   * Create a new task
   * POST /api/v1/tasks
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new task' })
  async create(
    @Body() dto: any,
    @TenantCtx() ctx: any
  ): Promise<any> {
    return this.tasksService.create(ctx.tenant_id, dto);
  }

  /**
   * List tasks
   * GET /api/v1/tasks
   */
  @Get()
  @ApiOperation({ summary: 'List all tasks in tenant' })
  async list(
    @TenantCtx() ctx: any,
    @Query('status') status?: string,
    @Query('project') projectUid?: string,
    @Query('priority') priority?: string,
    @Query('dueDate') dueDate?: string,
    @Query('limit') limit: number = 100
  ): Promise<{ tasks: any[]; total: number }> {
    return this.tasksService.findAll(ctx.tenant_id, {
      status,
      projectUid,
      priority,
      dueDate,
      limit
    });
  }

  /**
   * Get task by UID
   * GET /api/v1/tasks/:uid
   */
  @Get(':uid')
  @ApiOperation({ summary: 'Get task by UID' })
  async getByUid(
    @Param('uid') uid: string,
    @TenantCtx() ctx: any
  ): Promise<any> {
    return this.tasksService.findByUid(ctx.tenant_id, uid);
  }

  /**
   * Update task
   * PATCH /api/v1/tasks/:uid
   */
  @Patch(':uid')
  @ApiOperation({ summary: 'Update task' })
  async update(
    @Param('uid') uid: string,
    @Body() dto: any,
    @TenantCtx() ctx: any
  ): Promise<any> {
    return this.tasksService.update(ctx.tenant_id, uid, dto);
  }

  /**
   * Delete task
   * DELETE /api/v1/tasks/:uid
   */
  @Delete(':uid')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete task' })
  async delete(
    @Param('uid') uid: string,
    @TenantCtx() ctx: any
  ): Promise<void> {
    await this.tasksService.delete(ctx.tenant_id, uid);
  }

  /**
   * Complete task
   * POST /api/v1/tasks/:uid/complete
   */
  @Post(':uid/complete')
  @ApiOperation({ summary: 'Mark task as complete' })
  async complete(
    @Param('uid') uid: string,
    @TenantCtx() ctx: any
  ): Promise<any> {
    return this.tasksService.complete(ctx.tenant_id, uid);
  }

  /**
   * Uncomplete task
   * POST /api/v1/tasks/:uid/uncomplete
   */
  @Post(':uid/uncomplete')
  @ApiOperation({ summary: 'Mark task as incomplete' })
  async uncomplete(
    @Param('uid') uid: string,
    @TenantCtx() ctx: any
  ): Promise<any> {
    return this.tasksService.uncomplete(ctx.tenant_id, uid);
  }

  /**
   * Get today's tasks
   * GET /api/v1/tasks/today
   */
  @Get('filter/today')
  @ApiOperation({ summary: 'Get today\'s tasks' })
  async getToday(@TenantCtx() ctx: any): Promise<{ tasks: any[] }> {
    return this.tasksService.getToday(ctx.tenant_id);
  }

  /**
   * Get overdue tasks
   * GET /api/v1/tasks/overdue
   */
  @Get('filter/overdue')
  @ApiOperation({ summary: 'Get overdue tasks' })
  async getOverdue(@TenantCtx() ctx: any): Promise<{ tasks: any[] }> {
    return this.tasksService.getOverdue(ctx.tenant_id);
  }
}
