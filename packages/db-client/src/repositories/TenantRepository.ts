import type { LegacyTenant as Tenant, TenantContext, LegacyUser as User, LegacyTenantMembership as TenantMembership } from '@sbf/shared';
import { db } from '../client';
import { v4 as uuidv4 } from 'uuid';

export class TenantRepository {
  /**
   * Create a new tenant
   */
  async createTenant(data: {
    slug: string;
    name: string;
    plan?: 'free' | 'pro' | 'enterprise';
    settings?: Record<string, any>;
  }): Promise<Tenant> {
    const id = uuidv4();
    
    // Note: This is a system operation, so we create a temporary context
    const systemContext = {
      tenant_id: id,
      user_id: 'system',
      tenant_type: 'professional', // Default for system ops
      user_roles: ['tenant_owner'],
      attributes: {}
    } as unknown as TenantContext;

    const result = await db.query<Tenant>(
      systemContext,
      `INSERT INTO tenants (id, slug, name, plan, settings)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, data.slug, data.name, data.plan || 'free', JSON.stringify(data.settings || {})]
    );

    return result.rows[0];
  }

  /**
   * Get tenant by ID
   */
  async getTenantById(tenantId: string): Promise<Tenant | null> {
    const systemContext = {
      tenant_id: tenantId,
      user_id: 'system',
      tenant_type: 'professional',
      user_roles: ['tenant_owner'],
      attributes: {}
    } as unknown as TenantContext;

    const result = await db.query<Tenant>(
      systemContext,
      'SELECT * FROM tenants WHERE id = $1',
      [tenantId]
    );

    return result.rows[0] || null;
  }

  /**
   * Get tenant by slug
   */
  async getTenantBySlug(slug: string): Promise<Tenant | null> {
    const systemContext = {
      tenant_id: 'system',
      user_id: 'system',
      tenant_type: 'professional',
      user_roles: ['tenant_owner'],
      attributes: {}
    } as unknown as TenantContext;

    const result = await db.query<Tenant>(
      systemContext,
      'SELECT * FROM tenants WHERE slug = $1',
      [slug]
    );

    return result.rows[0] || null;
  }

  /**
   * Add user to tenant
   */
  async addMember(
    tenantId: string,
    userId: string,
    role: 'owner' | 'admin' | 'member' | 'viewer' = 'member'
  ): Promise<TenantMembership> {
    const id = uuidv4();
    
    const systemContext = {
      tenant_id: tenantId,
      user_id: 'system',
      tenant_type: 'professional',
      user_roles: ['tenant_owner'],
      attributes: {}
    } as unknown as TenantContext;

    const result = await db.query<TenantMembership>(
      systemContext,
      `INSERT INTO tenant_memberships (id, tenant_id, user_id, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (tenant_id, user_id) 
       DO UPDATE SET role = EXCLUDED.role
       RETURNING *`,
      [id, tenantId, userId, role]
    );

    return result.rows[0];
  }

  /**
   * Get user's tenants
   */
  async getUserTenants(userId: string): Promise<Array<Tenant & { role: string }>> {
    const systemContext = {
      tenant_id: 'system',
      user_id: userId,
      tenant_type: 'professional',
      user_roles: ['member'],
      attributes: {}
    } as unknown as TenantContext;

    const result = await db.query<Tenant & { role: string }>(
      systemContext,
      `SELECT t.*, tm.role
       FROM tenants t
       INNER JOIN tenant_memberships tm ON t.id = tm.tenant_id
       WHERE tm.user_id = $1
       ORDER BY t.created_at DESC`,
      [userId]
    );

    return result.rows;
  }

  /**
   * Get tenant members
   */
  async getTenantMembers(context: TenantContext): Promise<Array<User & { role: string }>> {
    const result = await db.query<User & { role: string }>(
      context,
      `SELECT u.*, tm.role
       FROM users u
       INNER JOIN tenant_memberships tm ON u.id = tm.user_id
       WHERE tm.tenant_id = $1
       ORDER BY tm.created_at ASC`,
      [context.tenant_id]
    );

    return result.rows;
  }

  /**
   * Remove member from tenant
   */
  async removeMember(context: TenantContext, userId: string): Promise<void> {
    await db.query(
      context,
      'DELETE FROM tenant_memberships WHERE tenant_id = $1 AND user_id = $2',
      [context.tenant_id, userId]
    );
  }

  /**
   * Update tenant
   */
  async updateTenant(
    context: TenantContext,
    updates: Partial<Pick<Tenant, 'name' | 'plan' | 'settings'>>
  ): Promise<Tenant> {
    const setClauses: string[] = [];
    const params: any[] = [context.tenant_id];
    let paramCount = 2;

    if (updates.name !== undefined) {
      setClauses.push(`name = $${paramCount}`);
      params.push(updates.name);
      paramCount++;
    }

    if (updates.plan !== undefined) {
      setClauses.push(`plan = $${paramCount}`);
      params.push(updates.plan);
      paramCount++;
    }

    if (updates.settings !== undefined) {
      setClauses.push(`settings = $${paramCount}`);
      params.push(JSON.stringify(updates.settings));
      paramCount++;
    }

    setClauses.push('updated_at = NOW()');

    const query = `
      UPDATE tenants
      SET ${setClauses.join(', ')}
      WHERE id = $1
      RETURNING *
    `;

    const result = await db.query<Tenant>(context, query, params);
    return result.rows[0];
  }
}

export const tenantRepository = new TenantRepository();
