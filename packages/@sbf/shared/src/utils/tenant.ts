import { TenantContext, TenantRole } from '../types/tenant.types';

export function createTenantContext(
  tenantId: string,
  userId: string,
  channel: string = 'web',
  roles: TenantRole[] = ['member']
): TenantContext {
  return {
    tenant_id: tenantId,
    tenant_type: 'personal', // Default, should be fetched from DB in real impl
    user_id: userId,
    user_roles: roles,
    attributes: {
      channel
    },
    isOwner: () => roles.includes('tenant_owner'),
    isAdmin: () => roles.includes('tenant_admin') || roles.includes('tenant_owner'),
    isGuardian: () => roles.includes('guardian'),
    hasRole: (role: TenantRole) => roles.includes(role),
    canPerform: (action: string) => true // Simplified for now
  };
}
