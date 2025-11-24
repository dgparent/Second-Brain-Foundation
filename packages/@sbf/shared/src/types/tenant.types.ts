// Multi-Tenant Core Types
// Second Brain Foundation

/**
 * Tenant represents a logical isolation boundary for data and users
 */
export interface Tenant {
  id: string;  // UUID
  type: 'personal' | 'pseudo_personal' | 'professional';
  slug: string;  // Unique human-readable identifier
  display_name: string;
  created_at: Date;
  updated_at: Date;
  status: 'active' | 'pending_delete' | 'suspended';
  
  // Type-specific metadata
  subject_person_uid?: string;  // For pseudo_personal type
  org_metadata?: OrganizationMetadata;
  
  // Configuration
  features: TenantFeatures;
  policies: TenantPolicies;
}

export interface OrganizationMetadata {
  legal_name?: string;
  country?: string;
  industry?: string;
  size?: string;
}

export interface TenantFeatures {
  sso_enabled: boolean;
  max_members: number;
  retention_days: number;
  enable_cross_workspace_search: boolean;
}

export interface TenantPolicies {
  export_requires_two_guardians?: boolean;
  allow_subject_login?: boolean;
  audit_retention_days: number;
  min_password_length?: number;
  require_mfa?: boolean;
}

/**
 * TenantMembership links users to tenants with roles
 */
export interface TenantMembership {
  id: string;
  tenant_id: string;
  user_id: string;
  role: TenantRole;
  status: 'active' | 'invited' | 'suspended';
  invited_by?: string;
  joined_at?: Date;
  invited_at: Date;
  metadata?: Record<string, any>;
}

/**
 * Tenant roles covering all three tenant types
 */
export type TenantRole =
  // Common roles
  | 'tenant_owner'
  | 'tenant_admin'
  | 'member'
  | 'viewer'
  // Pseudo-personal specific
  | 'subject'
  | 'guardian'
  | 'care_team'
  // Professional specific
  | 'billing_admin'
  | 'org_admin'
  | 'manager'
  | 'guest';

/**
 * TenantContext provides runtime context for tenant-scoped operations
 */
export interface TenantContext {
  tenant_id: string;
  tenant_type: 'personal' | 'pseudo_personal' | 'professional';
  user_id: string;
  user_roles: TenantRole[];
  attributes: Record<string, any>;
  
  // Helper methods
  isOwner(): boolean;
  isAdmin(): boolean;
  isGuardian(): boolean;
  hasRole(role: TenantRole): boolean;
  canPerform(action: string, resource?: any): boolean;
}

/**
 * Audit log entry for tenant actions
 */
export interface TenantAuditLog {
  id: string;
  tenant_id: string;
  user_id: string;
  action: string;
  entity_type?: string;
  entity_uid?: string;
  metadata: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  timestamp: Date;
}

/**
 * DTOs for tenant operations
 */

export interface CreateTenantDto {
  type: 'personal' | 'pseudo_personal' | 'professional';
  display_name: string;
  slug?: string;
  features?: Partial<TenantFeatures>;
  policies?: Partial<TenantPolicies>;
  
  // Pseudo-personal specific
  subject_data?: SubjectData;
  authority_basis?: string;
  
  // Professional specific
  organization_name?: string;
  legal_name?: string;
  country?: string;
  industry?: string;
  size?: string;
  enable_sso?: boolean;
  max_members?: number;
  require_mfa?: boolean;
}

export interface SubjectData {
  name: string;
  date_of_birth?: string;
  relationship?: string;
}

export interface UpdateTenantDto {
  display_name?: string;
  features?: Partial<TenantFeatures>;
  policies?: Partial<TenantPolicies>;
  org_metadata?: Partial<OrganizationMetadata>;
}

export interface InviteMemberDto {
  email: string;
  role: TenantRole;
  metadata?: Record<string, any>;
}

/**
 * Authorization policies
 */
export interface AuthorizationPolicy {
  actions: string[];
  max_sensitivity: string;
  conditions?: Record<string, any>;
}

export interface RolePolicy {
  [role: string]: AuthorizationPolicy;
}

export interface TenantPolicySet {
  personal: RolePolicy;
  pseudo_personal: RolePolicy;
  professional: RolePolicy;
}
