// Tenants Controller
// REST API for tenant CRUD operations

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
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { 
  CreateTenantDto, 
  UpdateTenantDto,
  Tenant 
} from '@sbf/shared/types/tenant.types';

// Decorators
import { AuthGuard } from '../guards/auth.guard';
import { TenantContextGuard } from '../guards/tenant-context.guard';
import { User } from '../decorators/user.decorator';
import { TenantCtx } from '../decorators/tenant-context.decorator';

// Services
import { TenantService } from '../services/tenant.service';
import { TenantContextService } from '@sbf/core/entity-manager/services/TenantContextService';
import { VaultFileSystemService } from '@sbf/core/entity-manager/services/VaultFileSystemService';
import { TenantVectorStoreService } from '@sbf/core/entity-manager/services/TenantVectorStoreService';

@ApiTags('tenants')
@Controller('api/v1/tenants')
@UseGuards(AuthGuard)
export class TenantsController {
  constructor(
    private readonly tenantService: TenantService,
    private readonly tenantContextService: TenantContextService,
    private readonly vaultFS: VaultFileSystemService,
    private readonly vectorStore: TenantVectorStoreService
  ) {}

  /**
   * Create a new tenant
   * POST /api/v1/tenants
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new tenant' })
  @ApiResponse({ status: 201, description: 'Tenant created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createTenant(
    @Body() dto: CreateTenantDto,
    @User() user: any
  ): Promise<{ tenant: Tenant; message: string }> {
    // Validate tenant type
    const validTypes = ['personal', 'pseudo_personal', 'professional'];
    if (!validTypes.includes(dto.type)) {
      throw new Error(`Invalid tenant type: ${dto.type}`);
    }

    // Create tenant record
    const tenant = await this.tenantService.create({
      type: dto.type,
      display_name: dto.display_name,
      slug: dto.slug || this.generateSlug(dto.display_name),
      features: this.getDefaultFeatures(dto.type, dto.features),
      policies: this.getDefaultPolicies(dto.type, dto.policies),
      org_metadata: dto.type === 'professional' ? {
        legal_name: dto.legal_name,
        country: dto.country,
        industry: dto.industry,
        size: dto.size
      } : undefined,
      subject_person_uid: dto.type === 'pseudo_personal' ? dto.subject_data?.name : undefined
    });

    // Add creator as owner
    await this.tenantService.addMembership({
      tenant_id: tenant.id,
      user_id: user.id,
      role: 'tenant_owner',
      status: 'active',
      joined_at: new Date()
    });

    // Initialize vault filesystem
    await this.vaultFS.initializeTenantVault({
      tenantId: tenant.id,
      tenantType: tenant.type,
      displayName: tenant.display_name
    });

    // Initialize vector collections
    await this.vectorStore.initializeTenantCollections(tenant.id);

    // For pseudo-personal: create subject entity and provenance
    if (dto.type === 'pseudo_personal' && dto.subject_data) {
      await this.createPseudoPersonalSetup(tenant.id, user.id, dto);
    }

    return {
      tenant,
      message: `${dto.type} tenant created successfully`
    };
  }

  /**
   * List user's tenants
   * GET /api/v1/tenants
   */
  @Get()
  @ApiOperation({ summary: 'List all tenants user has access to' })
  @ApiResponse({ status: 200, description: 'Tenants retrieved successfully' })
  async listTenants(
    @User() user: any,
    @Query('type') type?: string,
    @Query('status') status?: string
  ): Promise<{ tenants: any[]; total: number }> {
    const tenants = await this.tenantContextService.getUserTenants(user.id);

    // Filter by type if specified
    let filtered = tenants;
    if (type) {
      filtered = filtered.filter(t => t.tenant.type === type);
    }
    if (status) {
      filtered = filtered.filter(t => t.tenant.status === status);
    }

    return {
      tenants: filtered.map(({ tenant, membership }) => ({
        ...tenant,
        role: membership.role,
        joined_at: membership.joined_at
      })),
      total: filtered.length
    };
  }

  /**
   * Get tenant by ID
   * GET /api/v1/tenants/:tenantId
   */
  @Get(':tenantId')
  @UseGuards(TenantContextGuard)
  @ApiOperation({ summary: 'Get tenant details' })
  @ApiResponse({ status: 200, description: 'Tenant retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async getTenant(
    @Param('tenantId') tenantId: string,
    @TenantCtx() ctx: any
  ): Promise<{ tenant: Tenant; stats?: any }> {
    const tenant = await this.tenantService.findById(tenantId);

    // Get vault statistics if user is admin
    let stats;
    if (ctx.isAdmin()) {
      stats = {
        vault: await this.vaultFS.getVaultStats(tenantId),
        vectors: await this.vectorStore.getTenantStats(tenantId)
      };
    }

    return { tenant, stats };
  }

  /**
   * Update tenant
   * PATCH /api/v1/tenants/:tenantId
   */
  @Patch(':tenantId')
  @UseGuards(TenantContextGuard)
  @ApiOperation({ summary: 'Update tenant' })
  @ApiResponse({ status: 200, description: 'Tenant updated successfully' })
  @ApiResponse({ status: 403, description: 'Requires admin role' })
  async updateTenant(
    @Param('tenantId') tenantId: string,
    @Body() dto: UpdateTenantDto,
    @TenantCtx() ctx: any
  ): Promise<{ tenant: Tenant; message: string }> {
    // Require admin role
    if (!ctx.isAdmin()) {
      throw new Error('Only tenant admins can update tenant settings');
    }

    const tenant = await this.tenantService.update(tenantId, dto);

    return {
      tenant,
      message: 'Tenant updated successfully'
    };
  }

  /**
   * Delete tenant (soft delete)
   * DELETE /api/v1/tenants/:tenantId
   */
  @Delete(':tenantId')
  @UseGuards(TenantContextGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Delete tenant' })
  @ApiResponse({ status: 202, description: 'Tenant marked for deletion' })
  @ApiResponse({ status: 403, description: 'Only tenant owner can delete' })
  async deleteTenant(
    @Param('tenantId') tenantId: string,
    @TenantCtx() ctx: any
  ): Promise<{ message: string; deletion_date: Date }> {
    // Require owner role
    if (!ctx.isOwner()) {
      throw new Error('Only tenant owner can delete tenant');
    }

    const deletionDate = await this.tenantService.markForDeletion(tenantId);

    return {
      message: 'Tenant marked for deletion. Data will be permanently deleted after retention period.',
      deletion_date: deletionDate
    };
  }

  /**
   * Get tenant activity/audit logs
   * GET /api/v1/tenants/:tenantId/activity
   */
  @Get(':tenantId/activity')
  @UseGuards(TenantContextGuard)
  @ApiOperation({ summary: 'Get tenant activity logs' })
  async getTenantActivity(
    @Param('tenantId') tenantId: string,
    @TenantCtx() ctx: any,
    @Query('limit') limit: number = 100,
    @Query('offset') offset: number = 0
  ): Promise<{ logs: any[]; total: number }> {
    // Require admin for full logs
    if (!ctx.isAdmin()) {
      throw new Error('Requires admin role to view activity logs');
    }

    const logs = await this.tenantService.getAuditLogs(tenantId, {
      limit,
      offset
    });

    return logs;
  }

  /**
   * Export tenant data
   * GET /api/v1/tenants/:tenantId/export
   */
  @Get(':tenantId/export')
  @UseGuards(TenantContextGuard)
  @ApiOperation({ summary: 'Export tenant data' })
  async exportTenant(
    @Param('tenantId') tenantId: string,
    @TenantCtx() ctx: any
  ): Promise<{ export_url: string; expires_at: Date }> {
    // Require owner or admin
    if (!ctx.isOwner() && !ctx.isAdmin()) {
      throw new Error('Only tenant owner or admin can export data');
    }

    // For pseudo-personal with two-guardian requirement
    const tenant = await this.tenantService.findById(tenantId);
    if (tenant.type === 'pseudo_personal' && 
        tenant.policies?.export_requires_two_guardians) {
      // TODO: Implement two-guardian approval workflow
      throw new Error('Export requires two-guardian approval (not yet implemented)');
    }

    const exportJob = await this.tenantService.createExportJob(tenantId, ctx.user_id);

    return {
      export_url: exportJob.download_url,
      expires_at: exportJob.expires_at
    };
  }

  // ===== HELPER METHODS =====

  /**
   * Generate URL-safe slug from name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 100);
  }

  /**
   * Get default features for tenant type
   */
  private getDefaultFeatures(
    type: string,
    overrides?: any
  ): any {
    const defaults = {
      personal: {
        sso_enabled: false,
        max_members: 1,
        retention_days: 365,
        enable_cross_workspace_search: false
      },
      pseudo_personal: {
        sso_enabled: false,
        max_members: 10,
        retention_days: 2555, // 7 years
        enable_cross_workspace_search: false
      },
      professional: {
        sso_enabled: false,
        max_members: 50,
        retention_days: 2555, // 7 years
        enable_cross_workspace_search: true
      }
    };

    return {
      ...defaults[type],
      ...overrides
    };
  }

  /**
   * Get default policies for tenant type
   */
  private getDefaultPolicies(
    type: string,
    overrides?: any
  ): any {
    const defaults = {
      personal: {
        audit_retention_days: 90
      },
      pseudo_personal: {
        audit_retention_days: 2555, // 7 years
        export_requires_two_guardians: false,
        allow_subject_login: false
      },
      professional: {
        audit_retention_days: 2555, // 7 years
        min_password_length: 12,
        require_mfa: false
      }
    };

    return {
      ...defaults[type],
      ...overrides
    };
  }

  /**
   * Create pseudo-personal tenant setup
   */
  private async createPseudoPersonalSetup(
    tenantId: string,
    guardianUserId: string,
    dto: CreateTenantDto
  ): Promise<void> {
    // TODO: Implement subject entity creation
    // TODO: Implement provenance documentation
    // This will be part of the tenant-specific implementation in Phase 3
  }
}
