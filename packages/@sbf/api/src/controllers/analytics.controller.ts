import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { AnalyticsService } from '../services/analytics.service';
import { AuthGuard } from '../guards/auth.guard';
import { TenantContextGuard } from '../guards/tenant-context.guard';
import { TenantContext } from '../decorators/tenant-context.decorator';
import { User } from '../decorators/user.decorator';

@Controller('analytics')
@UseGuards(AuthGuard, TenantContextGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('tenant-summary')
  async getTenantSummary(@TenantContext('tenantId') tenantId: string) {
    return this.analyticsService.getTenantActivitySummary(tenantId);
  }

  @Get('user-activity')
  async getUserActivity(
    @TenantContext('tenantId') tenantId: string,
    @User('userId') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.analyticsService.getUserActivityMetrics(tenantId, userId, startDate, endDate);
  }

  @Get('task-metrics')
  async getTaskMetrics(
    @TenantContext('tenantId') tenantId: string,
    @Query('period') period?: string
  ) {
    return this.analyticsService.getTaskCompletionMetrics(tenantId, period);
  }

  @Get('project-progress')
  async getProjectProgress(@TenantContext('tenantId') tenantId: string) {
    return this.analyticsService.getProjectProgressMetrics(tenantId);
  }

  @Get('entity-relationships')
  async getEntityRelationships(@TenantContext('tenantId') tenantId: string) {
    return this.analyticsService.getEntityRelationshipMetrics(tenantId);
  }

  @Get('daily-timeline')
  async getDailyTimeline(
    @TenantContext('tenantId') tenantId: string,
    @Query('days') days?: number
  ) {
    return this.analyticsService.getDailyActivityTimeline(tenantId, days || 30);
  }

  @Post('dashboard-config')
  async saveDashboardConfig(
    @TenantContext('tenantId') tenantId: string,
    @User('userId') userId: string,
    @Body() config: any
  ) {
    return this.analyticsService.saveDashboardConfig(tenantId, userId, config);
  }

  @Get('dashboard-config')
  async getDashboardConfig(
    @TenantContext('tenantId') tenantId: string,
    @User('userId') userId: string,
    @Query('dashboardName') dashboardName?: string
  ) {
    return this.analyticsService.getDashboardConfig(tenantId, userId, dashboardName);
  }

  @Get('superset-embed-token')
  async getSupersetEmbedToken(
    @TenantContext('tenantId') tenantId: string,
    @User('userId') userId: string,
    @Query('dashboardId') dashboardId: string
  ) {
    return this.analyticsService.generateSupersetEmbedToken(tenantId, userId, dashboardId);
  }

  @Get('grafana-embed-url')
  async getGrafanaEmbedUrl(
    @TenantContext('tenantId') tenantId: string,
    @User('userId') userId: string,
    @Query('dashboardUid') dashboardUid: string
  ) {
    return this.analyticsService.generateGrafanaEmbedUrl(tenantId, userId, dashboardUid);
  }

  @Post('refresh-views')
  async refreshAnalyticsViews() {
    return this.analyticsService.refreshMaterializedViews();
  }
}
