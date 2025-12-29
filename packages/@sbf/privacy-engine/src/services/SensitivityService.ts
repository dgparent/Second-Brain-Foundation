/**
 * @sbf/privacy-engine - SensitivityService
 *
 * Core service for managing entity sensitivity levels.
 * Implements PRD FR15-FR19 requirements.
 */

import {
  SensitivityLevel,
  SensitivityConfig,
  ContextPermissions,
  UpdateSensitivityRequest,
  BulkUpdateSensitivityRequest,
} from '../types';
import {
  DEFAULT_PERMISSIONS,
  PRIVACY_ERROR_MESSAGES,
  isMoreRestrictive,
} from '../constants';
import { InheritanceResolver, InheritableEntity, InheritanceDatabase } from './InheritanceResolver';
import { AuditLogger } from './AuditLogger';
import { PermissionChecker } from './PermissionChecker';

/**
 * Database interface for sensitivity operations.
 */
export interface SensitivityDatabase extends InheritanceDatabase {
  /**
   * Find entities by tenant.
   */
  findEntitiesByTenant(
    tenantId: string,
    options?: { inheritFromParent?: boolean }
  ): Promise<InheritableEntity[]>;
}

/**
 * SensitivityService - Core sensitivity management service.
 *
 * Provides methods to:
 * - Get effective sensitivity (with inheritance)
 * - Update entity sensitivity
 * - Check AI processing permissions
 * - Propagate sensitivity to children
 */
export class SensitivityService {
  private inheritanceResolver: InheritanceResolver;
  private permissionChecker: PermissionChecker;

  constructor(
    private db: SensitivityDatabase,
    private auditLogger: AuditLogger
  ) {
    this.inheritanceResolver = new InheritanceResolver(db, auditLogger);
    this.permissionChecker = new PermissionChecker();
  }

  /**
   * Get the effective sensitivity config for an entity.
   * Considers inheritance from parent entities.
   */
  async getEffectiveSensitivity(
    entityUid: string,
    tenantId: string
  ): Promise<SensitivityConfig> {
    const entity = await this.db.getEntity(tenantId, entityUid);

    if (!entity) {
      // Return default for non-existent entities
      return this.getDefaultConfig();
    }

    // If entity has explicit sensitivity and doesn't inherit, use it
    if (
      entity.sensitivity &&
      entity.sensitivityConfig?.inherit_from_parent === false
    ) {
      return {
        level: entity.sensitivity,
        permissions: this.getPermissionsForLevel(entity.sensitivity),
        inherit_from_parent: false,
      };
    }

    // Otherwise, resolve inheritance
    return this.inheritanceResolver.resolve(entity, tenantId);
  }

  /**
   * Get default sensitivity config (personal per FR16).
   */
  getDefaultConfig(): SensitivityConfig {
    return {
      level: SensitivityLevel.PERSONAL,
      permissions: { ...DEFAULT_PERMISSIONS[SensitivityLevel.PERSONAL] },
      inherit_from_parent: false,
    };
  }

  /**
   * Get permissions for a sensitivity level.
   */
  getPermissionsForLevel(level: SensitivityLevel): ContextPermissions {
    return { ...DEFAULT_PERMISSIONS[level] };
  }

  /**
   * Update entity sensitivity.
   */
  async updateSensitivity(
    request: UpdateSensitivityRequest,
    tenantId: string
  ): Promise<{ affectedChildren: string[] }> {
    const { entityUid, level, userId, reason, propagateToChildren = true } = request;

    const entity = await this.db.getEntity(tenantId, entityUid);
    if (!entity) {
      throw new Error(PRIVACY_ERROR_MESSAGES.ENTITY_NOT_FOUND);
    }

    const oldLevel = entity.sensitivity;

    // Create new config
    const newConfig: SensitivityConfig = {
      level,
      permissions: this.getPermissionsForLevel(level),
      inherit_from_parent: false,
      override_by: userId,
      override_at: new Date(),
      override_reason: reason,
    };

    // Update entity
    await this.db.updateEntitySensitivity(
      tenantId,
      entityUid,
      level,
      newConfig
    );

    // Audit log
    await this.auditLogger.logSensitivityChange(
      tenantId,
      entityUid,
      userId,
      oldLevel,
      level,
      reason
    );

    // Propagate to children if requested and more restrictive
    let affectedChildren: string[] = [];
    if (propagateToChildren && oldLevel && isMoreRestrictive(level, oldLevel)) {
      affectedChildren = await this.inheritanceResolver.propagateToChildren(
        { ...entity, sensitivity: level, sensitivityConfig: newConfig },
        level,
        tenantId
      );
    }

    return { affectedChildren };
  }

  /**
   * Bulk update sensitivity for multiple entities.
   */
  async bulkUpdateSensitivity(
    request: BulkUpdateSensitivityRequest,
    tenantId: string
  ): Promise<{
    updated: string[];
    failed: { uid: string; error: string }[];
  }> {
    const { entityUids, level, userId, reason } = request;

    const updated: string[] = [];
    const failed: { uid: string; error: string }[] = [];

    for (const entityUid of entityUids) {
      try {
        await this.updateSensitivity(
          {
            entityUid,
            level,
            userId,
            reason,
            propagateToChildren: false, // Don't cascade in bulk
          },
          tenantId
        );
        updated.push(entityUid);
      } catch (error) {
        failed.push({
          uid: entityUid,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return { updated, failed };
  }

  /**
   * Check if entity can be processed by AI.
   */
  async canProcessWithAI(
    entityUid: string,
    tenantId: string,
    aiType: 'cloud' | 'local'
  ): Promise<{ allowed: boolean; reason?: string }> {
    const config = await this.getEffectiveSensitivity(entityUid, tenantId);

    // FR19: Secret NEVER processed by any AI
    if (config.level === SensitivityLevel.SECRET) {
      return {
        allowed: false,
        reason: PRIVACY_ERROR_MESSAGES.SECRET_AI_BLOCKED,
      };
    }

    const result = this.permissionChecker.canAccessAI(config.level, aiType);

    return {
      allowed: result.allowed,
      reason: result.reason,
    };
  }

  /**
   * Check if entity can be exported.
   */
  async canExport(
    entityUid: string,
    tenantId: string
  ): Promise<{ allowed: boolean; reason?: string }> {
    const config = await this.getEffectiveSensitivity(entityUid, tenantId);
    const result = this.permissionChecker.canExport(config.level);

    return {
      allowed: result.allowed,
      reason: result.reason,
    };
  }

  /**
   * Check if entity can be shared.
   */
  async canShare(
    entityUid: string,
    tenantId: string
  ): Promise<{ allowed: boolean; reason?: string }> {
    const config = await this.getEffectiveSensitivity(entityUid, tenantId);
    const result = this.permissionChecker.canShare(config.level);

    return {
      allowed: result.allowed,
      reason: result.reason,
    };
  }

  /**
   * Check if entity can be synced.
   */
  async canSync(
    entityUid: string,
    tenantId: string
  ): Promise<{ allowed: boolean; reason?: string }> {
    const config = await this.getEffectiveSensitivity(entityUid, tenantId);
    const result = this.permissionChecker.canSync(config.level);

    return {
      allowed: result.allowed,
      reason: result.reason,
    };
  }

  /**
   * Check if entity can be indexed.
   */
  async canIndex(
    entityUid: string,
    tenantId: string
  ): Promise<{ allowed: boolean; reason?: string }> {
    const config = await this.getEffectiveSensitivity(entityUid, tenantId);
    const result = this.permissionChecker.canIndex(config.level);

    return {
      allowed: result.allowed,
      reason: result.reason,
    };
  }

  /**
   * Get the most restrictive sensitivity from multiple entities.
   */
  async getMostRestrictiveSensitivity(
    entityUids: string[],
    tenantId: string
  ): Promise<SensitivityLevel> {
    if (entityUids.length === 0) {
      return SensitivityLevel.PERSONAL;
    }

    let mostRestrictive = SensitivityLevel.PUBLIC;

    for (const uid of entityUids) {
      const config = await this.getEffectiveSensitivity(uid, tenantId);
      if (isMoreRestrictive(config.level, mostRestrictive)) {
        mostRestrictive = config.level;
      }
    }

    return mostRestrictive;
  }

  /**
   * Get entities by sensitivity level.
   */
  async getEntitiesBySensitivity(
    tenantId: string,
    level: SensitivityLevel
  ): Promise<string[]> {
    const entities = await this.db.findEntitiesByTenant(tenantId);

    const matching: string[] = [];
    for (const entity of entities) {
      const config = await this.getEffectiveSensitivity(entity.uid, tenantId);
      if (config.level === level) {
        matching.push(entity.uid);
      }
    }

    return matching;
  }

  /**
   * Set default sensitivity for a new entity.
   */
  async setDefaultSensitivity(
    entityUid: string,
    tenantId: string,
    defaultLevel: SensitivityLevel = SensitivityLevel.PERSONAL,
    inheritFromParent: boolean = true
  ): Promise<void> {
    const config: SensitivityConfig = {
      level: defaultLevel,
      permissions: this.getPermissionsForLevel(defaultLevel),
      inherit_from_parent: inheritFromParent,
    };

    await this.db.updateEntitySensitivity(
      tenantId,
      entityUid,
      defaultLevel,
      config
    );
  }

  /**
   * Check if a sensitivity downgrade (less restrictive) requires confirmation.
   */
  isDowngrade(
    fromLevel: SensitivityLevel,
    toLevel: SensitivityLevel
  ): boolean {
    return this.permissionChecker.isDowngrade(fromLevel, toLevel);
  }

  /**
   * Get the inheritance chain for an entity.
   */
  async getInheritanceChain(
    entityUid: string,
    tenantId: string
  ): Promise<
    {
      uid: string;
      level: SensitivityLevel;
      depth: number;
    }[]
  > {
    return this.inheritanceResolver.getInheritanceChain(entityUid, tenantId);
  }
}
