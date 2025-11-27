// Authorization Service
// RBAC + ABAC hybrid model for multi-tenant access control

import { Injectable } from '@nestjs/common';

// Tenant roles
export type TenantRole = 
  // Common roles
  | 'tenant_owner'
  | 'tenant_admin'
  | 'member'
  | 'viewer'
  // Pseudo-personal roles
  | 'subject'
  | 'guardian'
  | 'care_team'
  // Professional roles
  | 'billing_admin'
  | 'org_admin'
  | 'manager'
  | 'guest';

export type TenantType = 'personal' | 'pseudo_personal' | 'professional';

// Sensitivity levels
export type SensitivityLevel = 
  | 'public'
  | 'internal'
  | 'personal'
  | 'confidential'
  | 'strictly_confidential';

// Action types
export type Action =
  | 'read'
  | 'create'
  | 'update'
  | 'delete'
  | 'export'
  | 'share'
  | 'manage_users'
  | 'manage_settings'
  | 'change_sensitivity'
  | 'view_audit_logs';

interface Policy {
  actions: Action[];
  max_sensitivity: SensitivityLevel;
  conditions?: Record<string, any>;
}

interface Resource {
  sensitivity?: SensitivityLevel;
  type?: string;
  owner_id?: string;
  is_subject?: boolean;
  [key: string]: any;
}

@Injectable()
export class AuthorizationService {
  private readonly sensitivityLevels: SensitivityLevel[] = [
    'public',
    'internal',
    'personal',
    'confidential',
    'strictly_confidential'
  ];

  /**
   * Check if user can perform action on resource
   */
  canPerform(
    role: TenantRole,
    action: Action,
    resource: Resource | undefined,
    tenantType: TenantType,
    userId?: string
  ): boolean {
    const policy = this.getPolicyForRole(role, tenantType);
    
    // Check RBAC rules - does role allow this action?
    if (!this.isActionAllowed(policy, action)) {
      return false;
    }
    
    // Check ABAC conditions - attribute-based constraints
    if (resource) {
      // Sensitivity check
      if (resource.sensitivity) {
        if (!this.canAccessSensitivity(resource.sensitivity, policy.max_sensitivity)) {
          return false;
        }
      }

      // Resource-specific conditions
      if (policy.conditions) {
        if (!this.checkConditions(policy.conditions, resource, action, userId)) {
          return false;
        }
      }
    }
    
    return true;
  }

  /**
   * Check if action is allowed by policy
   */
  private isActionAllowed(policy: Policy, action: Action): boolean {
    // Wildcard means all actions
    if (policy.actions.includes('*' as Action)) {
      return true;
    }
    
    return policy.actions.includes(action);
  }

  /**
   * Check if user can access resource with given sensitivity
   */
  private canAccessSensitivity(
    resourceSensitivity: SensitivityLevel,
    maxSensitivity: SensitivityLevel
  ): boolean {
    const resourceLevel = this.sensitivityLevels.indexOf(resourceSensitivity);
    const maxLevel = this.sensitivityLevels.indexOf(maxSensitivity);
    
    if (resourceLevel === -1 || maxLevel === -1) {
      return false;
    }
    
    return resourceLevel <= maxLevel;
  }

  /**
   * Check attribute-based conditions
   */
  private checkConditions(
    conditions: Record<string, any>,
    resource: Resource,
    action: Action,
    userId?: string
  ): boolean {
    // Cannot change sensitivity condition
    if (conditions.cannot_change_sensitivity && action === 'change_sensitivity') {
      return false;
    }

    // Cannot delete subject entity
    if (conditions.cannot_delete_subject_entity && 
        action === 'delete' && 
        resource.is_subject) {
      return false;
    }

    // Owner-only actions
    if (conditions.owner_only && resource.owner_id !== userId) {
      return false;
    }

    // MFA required
    if (conditions.require_mfa && action === 'export') {
      // Would check if user has active MFA session
      // For now, we'll assume this is checked elsewhere
    }

    return true;
  }

  /**
   * Get policy for role and tenant type
   */
  private getPolicyForRole(role: TenantRole, tenantType: TenantType): Policy {
    const policies: Record<TenantType, Record<string, Policy>> = {
      // Personal tenant policies
      personal: {
        tenant_owner: {
          actions: ['*' as Action], // Full control
          max_sensitivity: 'strictly_confidential'
        }
      },
      
      // Pseudo-personal tenant policies
      pseudo_personal: {
        subject: {
          actions: ['read'],
          max_sensitivity: 'personal'
        },
        guardian: {
          actions: ['read', 'create', 'update'],
          max_sensitivity: 'confidential',
          conditions: {
            cannot_change_sensitivity: true,
            cannot_delete_subject_entity: true
          }
        },
        care_team: {
          actions: ['read', 'create'],
          max_sensitivity: 'internal',
          conditions: {
            cannot_change_sensitivity: true,
            cannot_delete_subject_entity: true
          }
        },
        tenant_owner: {
          actions: ['*' as Action],
          max_sensitivity: 'strictly_confidential'
        },
        tenant_admin: {
          actions: ['read', 'create', 'update', 'delete', 'manage_users', 'view_audit_logs'],
          max_sensitivity: 'strictly_confidential'
        }
      },
      
      // Professional tenant policies
      professional: {
        tenant_owner: {
          actions: ['*' as Action],
          max_sensitivity: 'strictly_confidential'
        },
        org_admin: {
          actions: [
            'read', 
            'create', 
            'update', 
            'delete', 
            'manage_users', 
            'manage_settings',
            'view_audit_logs'
          ],
          max_sensitivity: 'confidential'
        },
        billing_admin: {
          actions: ['read', 'manage_settings'],
          max_sensitivity: 'internal',
          conditions: {
            owner_only: false // Can see billing but not all data
          }
        },
        manager: {
          actions: ['read', 'create', 'update', 'delete'],
          max_sensitivity: 'confidential'
        },
        member: {
          actions: ['read', 'create', 'update'],
          max_sensitivity: 'internal'
        },
        viewer: {
          actions: ['read'],
          max_sensitivity: 'internal'
        },
        guest: {
          actions: ['read'],
          max_sensitivity: 'public'
        }
      }
    };

    // Return policy or default deny policy
    return policies[tenantType]?.[role] || {
      actions: [],
      max_sensitivity: 'public'
    };
  }

  /**
   * Get maximum sensitivity level for role
   */
  getMaxSensitivity(role: TenantRole, tenantType: TenantType): SensitivityLevel {
    const policy = this.getPolicyForRole(role, tenantType);
    return policy.max_sensitivity;
  }

  /**
   * Get allowed actions for role
   */
  getAllowedActions(role: TenantRole, tenantType: TenantType): Action[] {
    const policy = this.getPolicyForRole(role, tenantType);
    return policy.actions;
  }

  /**
   * Check if role can manage users
   */
  canManageUsers(role: TenantRole, tenantType: TenantType): boolean {
    return this.canPerform(role, 'manage_users', undefined, tenantType);
  }

  /**
   * Check if role can view audit logs
   */
  canViewAuditLogs(role: TenantRole, tenantType: TenantType): boolean {
    return this.canPerform(role, 'view_audit_logs', undefined, tenantType);
  }

  /**
   * Check if role can manage settings
   */
  canManageSettings(role: TenantRole, tenantType: TenantType): boolean {
    return this.canPerform(role, 'manage_settings', undefined, tenantType);
  }

  /**
   * Validate that action is allowed (throws error if not)
   */
  requirePermission(
    role: TenantRole,
    action: Action,
    resource: Resource | undefined,
    tenantType: TenantType,
    userId?: string
  ): void {
    if (!this.canPerform(role, action, resource, tenantType, userId)) {
      throw new Error(
        `Permission denied: ${role} cannot ${action} ${resource ? 'on resource with sensitivity ' + resource.sensitivity : ''}`
      );
    }
  }

  /**
   * Get human-readable permission summary for role
   */
  getPermissionSummary(role: TenantRole, tenantType: TenantType): string {
    const policy = this.getPolicyForRole(role, tenantType);
    const actions = policy.actions.join(', ');
    const maxSensitivity = policy.max_sensitivity;
    
    let summary = `Role: ${role}\n`;
    summary += `Tenant Type: ${tenantType}\n`;
    summary += `Allowed Actions: ${actions}\n`;
    summary += `Max Sensitivity: ${maxSensitivity}\n`;
    
    if (policy.conditions) {
      summary += `Conditions: ${JSON.stringify(policy.conditions, null, 2)}\n`;
    }
    
    return summary;
  }
}
