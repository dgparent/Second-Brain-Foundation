/**
 * Memory Engine Storage Types
 */

export type MemoryLevel = 'transitory' | 'temporary' | 'short_term' | 'long_term' | 'canonical' | 'archived';
export type RestrictionMode = 'permissive' | 'cautious' | 'hardened';
export type ScopeGroup = 'public_group' | 'shareable_group' | 'internal_group' | 'secret_group' | 'compartmentalized_group';

export interface SensitivityPrivacy {
  cloud_ai_allowed: boolean;
  local_ai_allowed: boolean;
  export_allowed: boolean;
}

export interface Sensitivity {
  level: number; // 0-9
  scope?: ScopeGroup;
  privacy: SensitivityPrivacy;
  visibility: 'public' | 'internal' | 'user' | 'restricted';
  group_access?: string[];
}

export interface Control {
  AEI_restriction_mode?: RestrictionMode;
  requires_human_approval?: boolean;
  requires_audit_log?: boolean;
}

export interface MemoryMetadata {
  memory_level: MemoryLevel;
  stability_score: number; // 0-1
  importance_score: number; // 0-1
  last_active_at: string; // ISO8601
  user_pinned: boolean;
}

export interface VaultEntityRaw {
  id: string;
  vault_path: string;
  title: string;
  content: string;
  memory: MemoryMetadata;
  sensitivity: Sensitivity;
  control?: Control;
}

export interface VaultEntity extends VaultEntityRaw {
  aei_code: string;
}

export interface StorageOptions {
  vaultRoot: string;
  autoComputeAeiCode?: boolean;
  emitEvents?: boolean;
}
