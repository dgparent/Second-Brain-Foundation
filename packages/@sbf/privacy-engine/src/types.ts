/**
 * @sbf/privacy-engine - Types
 *
 * Core type definitions for privacy and sensitivity management.
 * Implements PRD FR15-FR19 requirements.
 */

/**
 * Sensitivity levels per PRD FR15
 * Controls what operations are allowed on content.
 *
 * - PUBLIC: Can be shared anywhere, processed by any AI
 * - PERSONAL: Local AI only, can be exported but not shared (default per FR16)
 * - CONFIDENTIAL: Local AI only, no export or cloud sync
 * - SECRET: Never processed by ANY AI (FR19) - not even local!
 */
export enum SensitivityLevel {
  PUBLIC = 'public',
  PERSONAL = 'personal',
  CONFIDENTIAL = 'confidential',
  SECRET = 'secret',
}

/**
 * Context-based permissions per PRD FR18
 * Defines what operations are permitted for each sensitivity level.
 */
export interface ContextPermissions {
  /** Can send content to cloud AI providers (OpenAI, Anthropic, etc.) */
  cloud_ai_allowed: boolean;

  /** Can process with local AI (Ollama, local models, etc.) */
  local_ai_allowed: boolean;

  /** Can export to files/PDF */
  export_allowed: boolean;

  /** Can sync to cloud storage (Dropbox, iCloud, etc.) */
  sync_allowed: boolean;

  /** Can share with other users */
  share_allowed: boolean;

  /** Can include in search index */
  index_allowed: boolean;
}

/**
 * Full sensitivity configuration for an entity
 */
export interface SensitivityConfig {
  /** The sensitivity level */
  level: SensitivityLevel;

  /** Effective permissions based on level */
  permissions: ContextPermissions;

  /** Whether this entity inherits sensitivity from parent */
  inherit_from_parent: boolean;

  /** Parent entity UID if sensitivity was inherited */
  inherited_from?: string;

  /** User ID who last overrode the sensitivity */
  override_by?: string;

  /** When sensitivity was last overridden */
  override_at?: Date;

  /** Reason for the override */
  override_reason?: string;
}

/**
 * Privacy action types for audit logging
 */
export type PrivacyAction =
  | 'sensitivity_changed'
  | 'ai_access_allowed'
  | 'ai_access_blocked'
  | 'export_allowed'
  | 'export_blocked'
  | 'share_attempted'
  | 'share_blocked'
  | 'sync_allowed'
  | 'sync_blocked'
  | 'inheritance_applied'
  | 'override_applied'
  | 'permission_check';

/**
 * Actor types for audit logging
 */
export type ActorType = 'user' | 'system' | 'ai' | 'api';

/**
 * Audit log entry for privacy operations
 */
export interface PrivacyAuditEntry {
  /** Unique identifier for this log entry */
  id: string;

  /** Tenant ID for multi-tenancy */
  tenant_id: string;

  /** Entity UID that was acted upon */
  entity_uid: string;

  /** The privacy action performed */
  action: PrivacyAction;

  /** ID of the actor (user, system, or AI service) */
  actor_id: string;

  /** Type of actor */
  actor_type: ActorType;

  /** Previous sensitivity level (for changes) */
  from_level?: SensitivityLevel;

  /** New sensitivity level (for changes) */
  to_level?: SensitivityLevel;

  /** Permissions that were requested */
  permissions_requested?: Partial<ContextPermissions>;

  /** Permissions that were granted */
  permissions_granted?: Partial<ContextPermissions>;

  /** Reason if action was blocked */
  blocked_reason?: string;

  /** Additional metadata */
  metadata?: Record<string, unknown>;

  /** When the action occurred */
  timestamp: Date;

  /** IP address of the request (if applicable) */
  ip_address?: string;

  /** User agent (if applicable) */
  user_agent?: string;
}

/**
 * Create audit entry input (without auto-generated fields)
 */
export interface CreateAuditEntryInput {
  tenant_id: string;
  entity_uid: string;
  action: PrivacyAction;
  actor_id: string;
  actor_type: ActorType;
  from_level?: SensitivityLevel;
  to_level?: SensitivityLevel;
  permissions_requested?: Partial<ContextPermissions>;
  permissions_granted?: Partial<ContextPermissions>;
  blocked_reason?: string;
  metadata?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
}

/**
 * AI request for access control checking
 */
export interface AIAccessRequest {
  /** Tenant ID for multi-tenancy */
  tenantId: string;

  /** User requesting the AI operation */
  userId: string;

  /** Entity UIDs being processed */
  entityUids: string[];

  /** AI provider name (e.g., 'openai', 'anthropic', 'ollama') */
  aiProvider: string;

  /** Type of AI (cloud or local) */
  aiType: 'cloud' | 'local';

  /** Operation being performed (e.g., 'chat', 'transformation', 'embedding') */
  operation: string;

  /** Optional request metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Result of AI access check
 */
export interface AIAccessResult {
  /** Whether at least some entities are allowed */
  allowed: boolean;

  /** Entity UIDs that were blocked */
  blockedEntities: string[];

  /** Entity UIDs that are allowed */
  allowedEntities: string[];

  /** Overall reason if something was blocked */
  reason?: string;

  /** Detailed reasons for each blocked entity */
  blockDetails?: Map<string, string>;

  /** Warning message for UI display */
  warning?: string;
}

/**
 * Content item with sensitivity for filtering
 */
export interface ContentWithSensitivity {
  /** Entity UID */
  entityUid: string;

  /** Content text */
  content: string;

  /** Optional sensitivity level (if already known) */
  sensitivity?: SensitivityLevel;

  /** Optional additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Filtered content result
 */
export interface FilteredContent {
  /** Content items that passed the filter */
  allowed: ContentWithSensitivity[];

  /** Content items that were blocked */
  blocked: ContentWithSensitivity[];

  /** Warning message for UI display */
  warning?: string;
}

/**
 * Privacy preferences for a user
 */
export interface PrivacyPreferences {
  /** Default sensitivity for new content */
  defaultSensitivity: SensitivityLevel;

  /** Whether new content inherits from parent */
  inheritFromParent: boolean;

  /** Require confirmation when making content public */
  requireConfirmForPublic: boolean;

  /** How many days to retain audit logs */
  auditLogRetentionDays: number;

  /** Show privacy warnings in UI */
  showPrivacyWarnings: boolean;
}

/**
 * Default privacy preferences
 */
export const DEFAULT_PRIVACY_PREFERENCES: PrivacyPreferences = {
  defaultSensitivity: SensitivityLevel.PERSONAL,
  inheritFromParent: true,
  requireConfirmForPublic: true,
  auditLogRetentionDays: 90,
  showPrivacyWarnings: true,
};

/**
 * Sensitivity update request
 */
export interface UpdateSensitivityRequest {
  /** Entity UID to update */
  entityUid: string;

  /** New sensitivity level */
  level: SensitivityLevel;

  /** User making the change */
  userId: string;

  /** Reason for the change (recommended for downgrades) */
  reason?: string;

  /** Whether to propagate to children */
  propagateToChildren?: boolean;
}

/**
 * Bulk sensitivity update request
 */
export interface BulkUpdateSensitivityRequest {
  /** Entity UIDs to update */
  entityUids: string[];

  /** New sensitivity level */
  level: SensitivityLevel;

  /** User making the change */
  userId: string;

  /** Reason for the change */
  reason?: string;
}

/**
 * Permission check result
 */
export interface PermissionCheckResult {
  /** Whether the permission is granted */
  allowed: boolean;

  /** Reason if not allowed */
  reason?: string;

  /** The effective sensitivity level */
  effectiveLevel: SensitivityLevel;

  /** The effective permissions */
  effectivePermissions: ContextPermissions;
}

/**
 * Export permission types
 */
export type ExportFormat = 'pdf' | 'markdown' | 'html' | 'json' | 'csv';

/**
 * Export request for permission checking
 */
export interface ExportRequest {
  tenantId: string;
  userId: string;
  entityUids: string[];
  format: ExportFormat;
  destination?: 'local' | 'cloud';
}

/**
 * Share request for permission checking
 */
export interface ShareRequest {
  tenantId: string;
  userId: string;
  entityUids: string[];
  shareWith: string[];
  shareType: 'view' | 'edit' | 'full';
}
