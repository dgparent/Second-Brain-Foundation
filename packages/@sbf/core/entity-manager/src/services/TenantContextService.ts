// Tenant Context Service
// Manages runtime tenant context for multi-tenant operations

import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { TenantContext, Tenant, TenantMembership, TenantRole } from '@sbf/shared/types/tenant.types';

export interface TenantContextResolutionOptions {
  userId: string;
  tenantId: string;
  skipMembershipCheck?: boolean;  // For system operations
}

@Injectable()
export class TenantContextService {
  constructor(
    private readonly tenantRepository: any,  // Replace with actual TenantRepository
    private readonly membershipRepository: any,  // Replace with actual MembershipRepository
    private readonly authorizationService: any  // Replace with actual AuthorizationService
  ) {}

  /**
   * Resolve tenant context from authenticated session
   * This is the primary entry point for all tenant-scoped operations
   */
  async resolve(options: TenantContextResolutionOptions): Promise<TenantContext> {
    const { userId, tenantId, skipMembershipCheck } = options;

    // 1. Verify user has active membership in tenant (unless system operation)
    let membership: TenantMembership | null = null;
    
    if (!skipMembershipCheck) {
      membership = await this.membershipRepository.findOne({
        user_id: userId,
        tenant_id: tenantId,
        status: 'active'
      });

      if (!membership) {
        throw new ForbiddenException(
          `User ${userId} is not an active member of tenant ${tenantId}`
        );
      }
    }

    // 2. Load tenant
    const tenant = await this.tenantRepository.findById(tenantId);
    
    if (!tenant) {
      throw new NotFoundException(`Tenant ${tenantId} not found`);
    }

    if (tenant.status !== 'active') {
      throw new ForbiddenException(
        `Tenant ${tenantId} is ${tenant.status} and cannot be accessed`
      );
    }

    // 3. Build context object
    const context: TenantContext = {
      tenant_id: tenantId,
      tenant_type: tenant.type,
      user_id: userId,
      user_roles: membership ? [membership.role] : [],
      attributes: {
        tenant_slug: tenant.slug,
        tenant_display_name: tenant.display_name,
        ...(membership?.metadata || {})
      },

      // Helper methods
      isOwner: () => membership?.role === 'tenant_owner',
      
      isAdmin: () => {
        const adminRoles: TenantRole[] = ['tenant_owner', 'tenant_admin', 'org_admin'];
        return membership ? adminRoles.includes(membership.role) : false;
      },
      
      isGuardian: () => membership?.role === 'guardian',
      
      hasRole: (role: TenantRole) => membership?.role === role,
      
      canPerform: (action: string, resource?: any) => {
        if (!membership) return false;
        return this.authorizationService.check(
          membership.role,
          action,
          resource,
          tenant.type
        );
      }
    };

    return context;
  }

  /**
   * Set database session context for Row-Level Security (RLS)
   * CRITICAL: Must be called before any database queries
   */
  async setDatabaseContext(
    tenantId: string,
    userId: string,
    dbConnection: any  // Database connection/transaction
  ): Promise<void> {
    // Set session variables that RLS policies will read
    await dbConnection.query(`
      SET LOCAL app.current_tenant_id = '${this.sanitizeUuid(tenantId)}';
      SET LOCAL app.current_user_id = '${this.sanitizeUuid(userId)}';
    `);
  }

  /**
   * Clear database context (e.g., after request completion)
   */
  async clearDatabaseContext(dbConnection: any): Promise<void> {
    await dbConnection.query(`
      RESET app.current_tenant_id;
      RESET app.current_user_id;
    `);
  }

  /**
   * Get tenant context from database session
   * Useful for debugging and verification
   */
  async getCurrentDatabaseContext(dbConnection: any): Promise<{
    tenantId: string | null;
    userId: string | null;
  }> {
    try {
      const result = await dbConnection.query(`
        SELECT 
          current_setting('app.current_tenant_id', true) as tenant_id,
          current_setting('app.current_user_id', true) as user_id;
      `);

      return {
        tenantId: result.rows[0].tenant_id || null,
        userId: result.rows[0].user_id || null
      };
    } catch (error) {
      return { tenantId: null, userId: null };
    }
  }

  /**
   * Verify user can access tenant
   * Lightweight check without full context resolution
   */
  async canAccessTenant(userId: string, tenantId: string): Promise<boolean> {
    const membership = await this.membershipRepository.findOne({
      user_id: userId,
      tenant_id: tenantId,
      status: 'active'
    });

    return !!membership;
  }

  /**
   * List all tenants user has access to
   */
  async getUserTenants(userId: string): Promise<Array<{
    tenant: Tenant;
    membership: TenantMembership;
  }>> {
    const memberships = await this.membershipRepository.findByUser(userId, {
      status: 'active'
    });

    const tenants = await Promise.all(
      memberships.map(async (membership) => {
        const tenant = await this.tenantRepository.findById(membership.tenant_id);
        return { tenant, membership };
      })
    );

    return tenants.filter(t => t.tenant && t.tenant.status === 'active');
  }

  /**
   * Sanitize UUID to prevent SQL injection
   * Even though we use parameterized queries, extra safety for RLS context
   */
  private sanitizeUuid(uuid: string): string {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(uuid)) {
      throw new Error(`Invalid UUID format: ${uuid}`);
    }
    
    return uuid;
  }

  /**
   * Create a system-level context (no user, for background jobs)
   */
  async createSystemContext(tenantId: string): Promise<TenantContext> {
    return this.resolve({
      userId: '00000000-0000-0000-0000-000000000000',  // System user
      tenantId,
      skipMembershipCheck: true
    });
  }
}
