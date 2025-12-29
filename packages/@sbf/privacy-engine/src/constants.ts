/**
 * @sbf/privacy-engine - Constants
 *
 * Default permissions and configuration for privacy management.
 * Implements PRD FR15-FR19 permission matrix.
 */

import { SensitivityLevel, ContextPermissions, PrivacyPreferences } from './types';

/**
 * Default permissions for each sensitivity level per PRD FR15-FR19.
 *
 * Permission Matrix:
 * | Level        | cloud_ai | local_ai | export | sync | share | index |
 * |--------------|----------|----------|--------|------|-------|-------|
 * | public       | ✅       | ✅       | ✅     | ✅   | ✅    | ✅    |
 * | personal     | ❌       | ✅       | ✅     | ✅   | ❌    | ✅    |
 * | confidential | ❌       | ✅       | ❌     | ❌   | ❌    | ✅    |
 * | secret       | ❌       | ❌       | ❌     | ❌   | ❌    | ❌    |
 */
export const DEFAULT_PERMISSIONS: Record<SensitivityLevel, ContextPermissions> = {
  [SensitivityLevel.PUBLIC]: {
    cloud_ai_allowed: true,
    local_ai_allowed: true,
    export_allowed: true,
    sync_allowed: true,
    share_allowed: true,
    index_allowed: true,
  },
  [SensitivityLevel.PERSONAL]: {
    cloud_ai_allowed: false, // FR18: Default no cloud AI
    local_ai_allowed: true,
    export_allowed: true,
    sync_allowed: true,
    share_allowed: false,
    index_allowed: true,
  },
  [SensitivityLevel.CONFIDENTIAL]: {
    cloud_ai_allowed: false,
    local_ai_allowed: true,
    export_allowed: false, // Cannot export
    sync_allowed: false, // Cannot sync to cloud
    share_allowed: false,
    index_allowed: true, // Can search locally
  },
  [SensitivityLevel.SECRET]: {
    cloud_ai_allowed: false,
    local_ai_allowed: false, // FR19: NO AI at all
    export_allowed: false,
    sync_allowed: false,
    share_allowed: false,
    index_allowed: false, // Not even in search index
  },
};

/**
 * Sensitivity level hierarchy for inheritance.
 * Higher index = more restrictive.
 * Used to determine which level takes precedence in inheritance.
 */
export const SENSITIVITY_HIERARCHY: SensitivityLevel[] = [
  SensitivityLevel.PUBLIC,
  SensitivityLevel.PERSONAL,
  SensitivityLevel.CONFIDENTIAL,
  SensitivityLevel.SECRET,
];

/**
 * Get the restrictiveness index of a sensitivity level.
 * Higher values are more restrictive.
 */
export function getSensitivityIndex(level: SensitivityLevel): number {
  return SENSITIVITY_HIERARCHY.indexOf(level);
}

/**
 * Check if level A is more restrictive than level B.
 */
export function isMoreRestrictive(
  levelA: SensitivityLevel,
  levelB: SensitivityLevel
): boolean {
  return getSensitivityIndex(levelA) > getSensitivityIndex(levelB);
}

/**
 * Get the more restrictive of two sensitivity levels.
 */
export function getMostRestrictive(
  levelA: SensitivityLevel,
  levelB: SensitivityLevel
): SensitivityLevel {
  return isMoreRestrictive(levelA, levelB) ? levelA : levelB;
}

/**
 * Get the most restrictive level from an array of levels.
 */
export function getMostRestrictiveFromArray(
  levels: SensitivityLevel[]
): SensitivityLevel {
  if (levels.length === 0) {
    return SensitivityLevel.PERSONAL; // Default
  }

  return levels.reduce((most, current) =>
    isMoreRestrictive(current, most) ? current : most
  );
}

/**
 * Sensitivity level display configuration for UI.
 */
export const SENSITIVITY_DISPLAY_CONFIG = {
  [SensitivityLevel.PUBLIC]: {
    label: 'Public',
    description: 'Can be shared anywhere, processed by any AI',
    color: 'green',
    icon: 'shield-check',
    bgClass: 'bg-green-50',
    textClass: 'text-green-700',
    borderClass: 'border-green-300',
  },
  [SensitivityLevel.PERSONAL]: {
    label: 'Personal',
    description: 'Local AI only, can be exported but not shared',
    color: 'blue',
    icon: 'shield',
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-700',
    borderClass: 'border-blue-300',
  },
  [SensitivityLevel.CONFIDENTIAL]: {
    label: 'Confidential',
    description: 'Local AI only, no export or cloud sync',
    color: 'amber',
    icon: 'shield-alert',
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-700',
    borderClass: 'border-amber-300',
  },
  [SensitivityLevel.SECRET]: {
    label: 'Secret',
    description: 'Never processed by any AI, not searchable',
    color: 'red',
    icon: 'shield-off',
    bgClass: 'bg-red-50',
    textClass: 'text-red-700',
    borderClass: 'border-red-300',
  },
};

/**
 * Default privacy preferences per PRD FR16 (default = personal).
 */
export const DEFAULT_PRIVACY_PREFERENCES: PrivacyPreferences = {
  defaultSensitivity: SensitivityLevel.PERSONAL,
  inheritFromParent: true,
  requireConfirmForPublic: true,
  auditLogRetentionDays: 90,
  showPrivacyWarnings: true,
};

/**
 * Known cloud AI providers.
 * Used to detect cloud vs local AI.
 */
export const CLOUD_AI_PROVIDERS = [
  'openai',
  'anthropic',
  'google',
  'azure',
  'cohere',
  'mistral-cloud',
  'groq',
  'together',
  'fireworks',
  'replicate',
  'deepmind',
] as const;

/**
 * Known local AI providers.
 * Used to detect cloud vs local AI.
 */
export const LOCAL_AI_PROVIDERS = [
  'ollama',
  'llama.cpp',
  'gpt4all',
  'localai',
  'lmstudio',
  'text-generation-webui',
  'koboldcpp',
  'llamafile',
] as const;

/**
 * AI operations that process content.
 */
export const AI_CONTENT_OPERATIONS = [
  'chat',
  'transformation',
  'summarization',
  'embedding',
  'extraction',
  'analysis',
  'generation',
] as const;

/**
 * Check if an AI provider is a cloud provider.
 */
export function isCloudProvider(provider: string): boolean {
  return CLOUD_AI_PROVIDERS.includes(provider.toLowerCase() as typeof CLOUD_AI_PROVIDERS[number]);
}

/**
 * Check if an AI provider is a local provider.
 */
export function isLocalProvider(provider: string): boolean {
  return LOCAL_AI_PROVIDERS.includes(provider.toLowerCase() as typeof LOCAL_AI_PROVIDERS[number]);
}

/**
 * Audit log retention limits.
 */
export const AUDIT_LOG_CONFIG = {
  /** Minimum retention in days */
  minRetentionDays: 7,
  /** Maximum retention in days */
  maxRetentionDays: 365,
  /** Default retention in days */
  defaultRetentionDays: 90,
  /** Maximum entries to return in a single query */
  maxQueryLimit: 1000,
  /** Default entries to return in a single query */
  defaultQueryLimit: 100,
};

/**
 * Error messages for privacy operations.
 */
export const PRIVACY_ERROR_MESSAGES = {
  SECRET_AI_BLOCKED: 'Content marked as SECRET cannot be processed by any AI',
  CONFIDENTIAL_CLOUD_BLOCKED: 'Confidential content cannot be sent to cloud AI',
  PERSONAL_CLOUD_BLOCKED: 'Personal content cannot be sent to cloud AI',
  EXPORT_BLOCKED: 'This content cannot be exported due to sensitivity settings',
  SHARE_BLOCKED: 'This content cannot be shared due to sensitivity settings',
  SYNC_BLOCKED: 'This content cannot be synced to cloud due to sensitivity settings',
  INDEX_BLOCKED: 'This content cannot be indexed due to sensitivity settings',
  ENTITY_NOT_FOUND: 'Entity not found',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions to perform this action',
  INVALID_SENSITIVITY_LEVEL: 'Invalid sensitivity level',
};
