/**
 * @sbf/privacy-engine - InheritanceResolver Service
 *
 * Resolves sensitivity inheritance from parent entities.
 * Implements PRD FR17 requirement for sensitivity inheritance.
 */

import {
  SensitivityLevel,
  SensitivityConfig,
  ContextPermissions,
} from '../types';
import {
  DEFAULT_PERMISSIONS,
  getMostRestrictive,
  isMoreRestrictive,
} from '../constants';
import { AuditLogger } from './AuditLogger';

/**
 * Entity interface for inheritance resolution.
 * This is a simplified interface that should be implemented by the entity class.
 */
export interface InheritableEntity {
  uid: string;
  tenant_id: string;
  sensitivity?: SensitivityLevel;
  sensitivityConfig?: Partial<SensitivityConfig>;
}

/**
 * Relationship interface for finding parent entities.
 */
export interface EntityRelationship {
  source_uid: string;
  target_uid: string;
  relationship_type: string;
}

/**
 * Database interface for inheritance resolution.
 */
export interface InheritanceDatabase {
  /**
   * Get entity by UID.
   */
  getEntity(tenantId: string, uid: string): Promise<InheritableEntity | null>;

  /**
   * Get relationships where this entity is the target (i.e., find parents).
   */
  getParentRelationships(
    tenantId: string,
    targetUid: string
  ): Promise<EntityRelationship[]>;

  /**
   * Get relationships where this entity is the source (i.e., find children).
   */
  getChildRelationships(
    tenantId: string,
    sourceUid: string
  ): Promise<EntityRelationship[]>;

  /**
   * Update entity sensitivity.
   */
  updateEntitySensitivity(
    tenantId: string,
    uid: string,
    sensitivity: SensitivityLevel,
    config: SensitivityConfig
  ): Promise<void>;
}

/**
 * Relationship types that establish parent-child hierarchy.
 */
const PARENT_RELATIONSHIP_TYPES = [
  'contains',
  'has_child',
  'parent_of',
  'includes',
  'owns',
];

/**
 * InheritanceResolver - Resolves sensitivity from parent entities.
 *
 * When an entity doesn't have explicit sensitivity, it inherits from its parent.
 * The inheritance follows these rules:
 * 1. If entity has explicit sensitivity, use it
 * 2. If entity is set to inherit, find parent entities
 * 3. Use the most restrictive sensitivity from all parents
 * 4. If no parents, use default (personal)
 */
export class InheritanceResolver {
  constructor(
    private db: InheritanceDatabase,
    private auditLogger?: AuditLogger
  ) {}

  /**
   * Resolve the effective sensitivity for an entity.
   * Considers inheritance from parent entities.
   */
  async resolve(
    entity: InheritableEntity,
    tenantId: string
  ): Promise<SensitivityConfig> {
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

    // Find parent entities
    const parentRelationships = await this.db.getParentRelationships(
      tenantId,
      entity.uid
    );

    // Filter to parent-type relationships
    const parentRels = parentRelationships.filter((rel) =>
      PARENT_RELATIONSHIP_TYPES.includes(rel.relationship_type)
    );

    if (parentRels.length === 0) {
      // No parents - use entity's own sensitivity or default
      const level = entity.sensitivity ?? SensitivityLevel.PERSONAL;
      return {
        level,
        permissions: this.getPermissionsForLevel(level),
        inherit_from_parent: false,
      };
    }

    // Get sensitivity from all parents
    const parentSensitivities: {
      uid: string;
      level: SensitivityLevel;
    }[] = [];

    for (const rel of parentRels) {
      const parent = await this.db.getEntity(tenantId, rel.source_uid);
      if (parent?.sensitivity) {
        parentSensitivities.push({
          uid: parent.uid,
          level: parent.sensitivity,
        });
      }
    }

    if (parentSensitivities.length === 0) {
      // Parents exist but have no sensitivity - use default
      const level = entity.sensitivity ?? SensitivityLevel.PERSONAL;
      return {
        level,
        permissions: this.getPermissionsForLevel(level),
        inherit_from_parent: false,
      };
    }

    // Find the most restrictive parent sensitivity
    let mostRestrictive = parentSensitivities[0];
    for (const parent of parentSensitivities.slice(1)) {
      if (isMoreRestrictive(parent.level, mostRestrictive.level)) {
        mostRestrictive = parent;
      }
    }

    // If entity has its own sensitivity, take the more restrictive
    let effectiveLevel = mostRestrictive.level;
    let inheritedFrom = mostRestrictive.uid;

    if (entity.sensitivity) {
      if (isMoreRestrictive(entity.sensitivity, mostRestrictive.level)) {
        effectiveLevel = entity.sensitivity;
        inheritedFrom = undefined as unknown as string;
      }
    }

    return {
      level: effectiveLevel,
      permissions: this.getPermissionsForLevel(effectiveLevel),
      inherit_from_parent: true,
      inherited_from: inheritedFrom,
    };
  }

  /**
   * Propagate sensitivity change to child entities.
   * Only propagates if the new level is MORE restrictive.
   */
  async propagateToChildren(
    parentEntity: InheritableEntity,
    newLevel: SensitivityLevel,
    tenantId: string
  ): Promise<string[]> {
    const affectedChildren: string[] = [];

    const childRelationships = await this.db.getChildRelationships(
      tenantId,
      parentEntity.uid
    );

    // Filter to parent-type relationships
    const childRels = childRelationships.filter((rel) =>
      PARENT_RELATIONSHIP_TYPES.includes(rel.relationship_type)
    );

    for (const rel of childRels) {
      const child = await this.db.getEntity(tenantId, rel.target_uid);

      if (!child) continue;

      // Check if child inherits from parent
      if (child.sensitivityConfig?.inherit_from_parent === false) {
        continue; // Child has explicit sensitivity, don't override
      }

      // Only propagate if more restrictive
      const childLevel = child.sensitivity ?? SensitivityLevel.PERSONAL;
      if (!isMoreRestrictive(newLevel, childLevel)) {
        continue; // New level is not more restrictive
      }

      // Update child
      const newConfig: SensitivityConfig = {
        level: newLevel,
        permissions: this.getPermissionsForLevel(newLevel),
        inherit_from_parent: true,
        inherited_from: parentEntity.uid,
      };

      await this.db.updateEntitySensitivity(
        tenantId,
        child.uid,
        newLevel,
        newConfig
      );

      affectedChildren.push(child.uid);

      // Log inheritance
      if (this.auditLogger) {
        await this.auditLogger.logInheritanceApplied(
          tenantId,
          child.uid,
          parentEntity.uid,
          newLevel
        );
      }

      // Recursively propagate to grandchildren
      const grandchildren = await this.propagateToChildren(
        { ...child, sensitivity: newLevel, sensitivityConfig: newConfig },
        newLevel,
        tenantId
      );
      affectedChildren.push(...grandchildren);
    }

    return affectedChildren;
  }

  /**
   * Get the full inheritance chain for an entity.
   * Returns the list of ancestor entities that contribute to sensitivity.
   */
  async getInheritanceChain(
    entityUid: string,
    tenantId: string,
    maxDepth: number = 10
  ): Promise<
    {
      uid: string;
      level: SensitivityLevel;
      depth: number;
    }[]
  > {
    const chain: {
      uid: string;
      level: SensitivityLevel;
      depth: number;
    }[] = [];

    const visited = new Set<string>();
    let currentUid = entityUid;
    let depth = 0;

    while (depth < maxDepth) {
      if (visited.has(currentUid)) {
        break; // Circular reference protection
      }
      visited.add(currentUid);

      const relationships = await this.db.getParentRelationships(
        tenantId,
        currentUid
      );

      const parentRel = relationships.find((rel) =>
        PARENT_RELATIONSHIP_TYPES.includes(rel.relationship_type)
      );

      if (!parentRel) break;

      const parent = await this.db.getEntity(tenantId, parentRel.source_uid);
      if (!parent) break;

      depth++;
      chain.push({
        uid: parent.uid,
        level: parent.sensitivity ?? SensitivityLevel.PERSONAL,
        depth,
      });

      currentUid = parent.uid;
    }

    return chain;
  }

  /**
   * Get permissions for a sensitivity level.
   */
  private getPermissionsForLevel(level: SensitivityLevel): ContextPermissions {
    return { ...DEFAULT_PERMISSIONS[level] };
  }
}
