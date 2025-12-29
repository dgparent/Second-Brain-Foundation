/**
 * @sbf/privacy-engine - PermissionChecker Service
 *
 * Checks permissions based on sensitivity levels.
 * Centralizes all permission checking logic.
 */

import {
  SensitivityLevel,
  ContextPermissions,
  PermissionCheckResult,
  SensitivityConfig,
  ExportRequest,
  ShareRequest,
} from '../types';
import {
  DEFAULT_PERMISSIONS,
  PRIVACY_ERROR_MESSAGES,
} from '../constants';

/**
 * Permission type enumeration for checking specific permissions.
 */
export type PermissionType = keyof ContextPermissions;

/**
 * PermissionChecker - Centralized permission checking service.
 *
 * Provides methods to check various permissions based on sensitivity level:
 * - AI access (cloud and local)
 * - Export permissions
 * - Share permissions
 * - Sync permissions
 * - Index permissions
 */
export class PermissionChecker {
  /**
   * Check if a specific permission is allowed for a sensitivity level.
   */
  checkPermission(
    level: SensitivityLevel,
    permission: PermissionType
  ): PermissionCheckResult {
    const permissions = DEFAULT_PERMISSIONS[level];
    const allowed = permissions[permission];

    return {
      allowed,
      reason: allowed ? undefined : this.getBlockReason(level, permission),
      effectiveLevel: level,
      effectivePermissions: { ...permissions },
    };
  }

  /**
   * Check if cloud AI access is allowed.
   */
  canAccessCloudAI(level: SensitivityLevel): PermissionCheckResult {
    return this.checkPermission(level, 'cloud_ai_allowed');
  }

  /**
   * Check if local AI access is allowed.
   */
  canAccessLocalAI(level: SensitivityLevel): PermissionCheckResult {
    return this.checkPermission(level, 'local_ai_allowed');
  }

  /**
   * Check AI access based on provider type.
   */
  canAccessAI(
    level: SensitivityLevel,
    aiType: 'cloud' | 'local'
  ): PermissionCheckResult {
    return aiType === 'cloud'
      ? this.canAccessCloudAI(level)
      : this.canAccessLocalAI(level);
  }

  /**
   * Check if export is allowed.
   */
  canExport(level: SensitivityLevel): PermissionCheckResult {
    return this.checkPermission(level, 'export_allowed');
  }

  /**
   * Check if sharing is allowed.
   */
  canShare(level: SensitivityLevel): PermissionCheckResult {
    return this.checkPermission(level, 'share_allowed');
  }

  /**
   * Check if sync is allowed.
   */
  canSync(level: SensitivityLevel): PermissionCheckResult {
    return this.checkPermission(level, 'sync_allowed');
  }

  /**
   * Check if indexing is allowed.
   */
  canIndex(level: SensitivityLevel): PermissionCheckResult {
    return this.checkPermission(level, 'index_allowed');
  }

  /**
   * Check export request against multiple entities.
   * Returns which entities can and cannot be exported.
   */
  checkExportRequest(
    entities: { uid: string; sensitivity: SensitivityLevel }[],
    _request: ExportRequest
  ): {
    allowed: string[];
    blocked: { uid: string; reason: string }[];
    canProceed: boolean;
  } {
    const allowed: string[] = [];
    const blocked: { uid: string; reason: string }[] = [];

    for (const entity of entities) {
      const result = this.canExport(entity.sensitivity);
      if (result.allowed) {
        allowed.push(entity.uid);
      } else {
        blocked.push({
          uid: entity.uid,
          reason: result.reason ?? PRIVACY_ERROR_MESSAGES.EXPORT_BLOCKED,
        });
      }
    }

    return {
      allowed,
      blocked,
      canProceed: allowed.length > 0,
    };
  }

  /**
   * Check share request against multiple entities.
   * Returns which entities can and cannot be shared.
   */
  checkShareRequest(
    entities: { uid: string; sensitivity: SensitivityLevel }[],
    _request: ShareRequest
  ): {
    allowed: string[];
    blocked: { uid: string; reason: string }[];
    canProceed: boolean;
  } {
    const allowed: string[] = [];
    const blocked: { uid: string; reason: string }[] = [];

    for (const entity of entities) {
      const result = this.canShare(entity.sensitivity);
      if (result.allowed) {
        allowed.push(entity.uid);
      } else {
        blocked.push({
          uid: entity.uid,
          reason: result.reason ?? PRIVACY_ERROR_MESSAGES.SHARE_BLOCKED,
        });
      }
    }

    return {
      allowed,
      blocked,
      canProceed: allowed.length > 0,
    };
  }

  /**
   * Get all permissions for a sensitivity level.
   */
  getPermissions(level: SensitivityLevel): ContextPermissions {
    return { ...DEFAULT_PERMISSIONS[level] };
  }

  /**
   * Check if moving to a less restrictive level is allowed.
   * This is used to determine if confirmation is needed.
   */
  isDowngrade(
    fromLevel: SensitivityLevel,
    toLevel: SensitivityLevel
  ): boolean {
    const levels = [
      SensitivityLevel.PUBLIC,
      SensitivityLevel.PERSONAL,
      SensitivityLevel.CONFIDENTIAL,
      SensitivityLevel.SECRET,
    ];

    const fromIndex = levels.indexOf(fromLevel);
    const toIndex = levels.indexOf(toLevel);

    return toIndex < fromIndex; // Lower index = less restrictive
  }

  /**
   * Get human-readable block reason for a permission.
   */
  private getBlockReason(
    level: SensitivityLevel,
    permission: PermissionType
  ): string {
    switch (level) {
      case SensitivityLevel.SECRET:
        switch (permission) {
          case 'cloud_ai_allowed':
          case 'local_ai_allowed':
            return PRIVACY_ERROR_MESSAGES.SECRET_AI_BLOCKED;
          case 'export_allowed':
            return PRIVACY_ERROR_MESSAGES.EXPORT_BLOCKED;
          case 'share_allowed':
            return PRIVACY_ERROR_MESSAGES.SHARE_BLOCKED;
          case 'sync_allowed':
            return PRIVACY_ERROR_MESSAGES.SYNC_BLOCKED;
          case 'index_allowed':
            return PRIVACY_ERROR_MESSAGES.INDEX_BLOCKED;
        }
        break;

      case SensitivityLevel.CONFIDENTIAL:
        switch (permission) {
          case 'cloud_ai_allowed':
            return PRIVACY_ERROR_MESSAGES.CONFIDENTIAL_CLOUD_BLOCKED;
          case 'export_allowed':
            return PRIVACY_ERROR_MESSAGES.EXPORT_BLOCKED;
          case 'share_allowed':
            return PRIVACY_ERROR_MESSAGES.SHARE_BLOCKED;
          case 'sync_allowed':
            return PRIVACY_ERROR_MESSAGES.SYNC_BLOCKED;
        }
        break;

      case SensitivityLevel.PERSONAL:
        switch (permission) {
          case 'cloud_ai_allowed':
            return PRIVACY_ERROR_MESSAGES.PERSONAL_CLOUD_BLOCKED;
          case 'share_allowed':
            return PRIVACY_ERROR_MESSAGES.SHARE_BLOCKED;
        }
        break;
    }

    return `Permission '${permission}' not allowed for ${level} content`;
  }

  /**
   * Get a summary of permissions for display.
   */
  getPermissionSummary(level: SensitivityLevel): string[] {
    const permissions = DEFAULT_PERMISSIONS[level];
    const summary: string[] = [];

    if (permissions.cloud_ai_allowed) {
      summary.push('Cloud AI processing');
    }
    if (permissions.local_ai_allowed) {
      summary.push('Local AI processing');
    }
    if (permissions.export_allowed) {
      summary.push('Export to files');
    }
    if (permissions.sync_allowed) {
      summary.push('Cloud sync');
    }
    if (permissions.share_allowed) {
      summary.push('Sharing with others');
    }
    if (permissions.index_allowed) {
      summary.push('Search indexing');
    }

    return summary;
  }

  /**
   * Get a summary of restrictions for display.
   */
  getRestrictionSummary(level: SensitivityLevel): string[] {
    const permissions = DEFAULT_PERMISSIONS[level];
    const restrictions: string[] = [];

    if (!permissions.cloud_ai_allowed) {
      restrictions.push('No cloud AI');
    }
    if (!permissions.local_ai_allowed) {
      restrictions.push('No local AI');
    }
    if (!permissions.export_allowed) {
      restrictions.push('No export');
    }
    if (!permissions.sync_allowed) {
      restrictions.push('No cloud sync');
    }
    if (!permissions.share_allowed) {
      restrictions.push('No sharing');
    }
    if (!permissions.index_allowed) {
      restrictions.push('Not searchable');
    }

    return restrictions;
  }
}
