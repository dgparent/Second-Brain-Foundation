/**
 * @sbf/errors - Domain-Specific Errors
 * 
 * Errors specific to SBF domain concepts including sensitivity,
 * lifecycle, relationships, and tenant isolation.
 */

import { SBFError, SBFErrorOptions } from './base';
import { ErrorCode } from './codes';

/**
 * Sensitivity levels as defined in PRD
 */
export type SensitivityLevel = 'public' | 'personal' | 'confidential' | 'secret';

/**
 * Lifecycle states as defined in PRD
 */
export type LifecycleState = 'capture' | 'transitional' | 'permanent' | 'archived';

/**
 * General domain error
 */
export class DomainError extends SBFError {
  constructor(options: Omit<SBFErrorOptions, 'code'> & { code?: ErrorCode }) {
    super({
      ...options,
      code: options.code || ErrorCode.DOMAIN_ERROR,
    });
  }
}

/**
 * Sensitivity violation error
 * 
 * @example
 * ```typescript
 * throw new SensitivityViolationError({
 *   entityId: 'note-123',
 *   entitySensitivity: 'secret',
 *   attemptedAction: 'cloud_ai_processing',
 *   message: 'Secret content cannot be processed by cloud AI'
 * });
 * ```
 */
export class SensitivityViolationError extends SBFError {
  public readonly entityId?: string;
  public readonly entitySensitivity?: SensitivityLevel;
  public readonly attemptedAction?: string;
  public readonly requiredSensitivity?: SensitivityLevel;

  constructor(
    options: Omit<SBFErrorOptions, 'code'> & {
      entityId?: string;
      entitySensitivity?: SensitivityLevel;
      attemptedAction?: string;
      requiredSensitivity?: SensitivityLevel;
    }
  ) {
    super({
      ...options,
      code: ErrorCode.SENSITIVITY_VIOLATION,
      details: {
        entityId: options.entityId,
        entitySensitivity: options.entitySensitivity,
        attemptedAction: options.attemptedAction,
        requiredSensitivity: options.requiredSensitivity,
        ...options.details,
      },
    });
    this.entityId = options.entityId;
    this.entitySensitivity = options.entitySensitivity;
    this.attemptedAction = options.attemptedAction;
    this.requiredSensitivity = options.requiredSensitivity;
  }

  /**
   * Create error for cloud AI processing violation
   */
  static cloudAINotAllowed(entityId: string, sensitivity: SensitivityLevel): SensitivityViolationError {
    return new SensitivityViolationError({
      message: `Cloud AI processing not allowed for ${sensitivity} content`,
      entityId,
      entitySensitivity: sensitivity,
      attemptedAction: 'cloud_ai_processing',
    });
  }

  /**
   * Create error for local AI processing violation
   */
  static localAINotAllowed(entityId: string, sensitivity: SensitivityLevel): SensitivityViolationError {
    return new SensitivityViolationError({
      message: `Local AI processing not allowed for ${sensitivity} content`,
      entityId,
      entitySensitivity: sensitivity,
      attemptedAction: 'local_ai_processing',
    });
  }

  /**
   * Create error for export violation
   */
  static exportNotAllowed(entityId: string, sensitivity: SensitivityLevel): SensitivityViolationError {
    return new SensitivityViolationError({
      message: `Export not allowed for ${sensitivity} content`,
      entityId,
      entitySensitivity: sensitivity,
      attemptedAction: 'export',
    });
  }

  /**
   * Create error for sensitivity downgrade attempt
   */
  static cannotDowngrade(
    entityId: string,
    fromSensitivity: SensitivityLevel,
    toSensitivity: SensitivityLevel
  ): SensitivityViolationError {
    return new SensitivityViolationError({
      message: `Cannot downgrade sensitivity from ${fromSensitivity} to ${toSensitivity}`,
      entityId,
      entitySensitivity: fromSensitivity,
      requiredSensitivity: toSensitivity,
      attemptedAction: 'sensitivity_downgrade',
    });
  }
}

/**
 * Invalid lifecycle state transition error
 */
export class LifecycleTransitionError extends SBFError {
  public readonly entityId?: string;
  public readonly currentState?: LifecycleState;
  public readonly targetState?: LifecycleState;
  public readonly entityType?: string;

  constructor(
    options: Omit<SBFErrorOptions, 'code'> & {
      entityId?: string;
      currentState?: LifecycleState;
      targetState?: LifecycleState;
      entityType?: string;
    }
  ) {
    super({
      ...options,
      code: ErrorCode.LIFECYCLE_INVALID_TRANSITION,
      details: {
        entityId: options.entityId,
        currentState: options.currentState,
        targetState: options.targetState,
        entityType: options.entityType,
        ...options.details,
      },
    });
    this.entityId = options.entityId;
    this.currentState = options.currentState;
    this.targetState = options.targetState;
    this.entityType = options.entityType;
  }

  /**
   * Create error for invalid transition
   */
  static invalidTransition(
    entityId: string,
    fromState: LifecycleState,
    toState: LifecycleState
  ): LifecycleTransitionError {
    return new LifecycleTransitionError({
      message: `Cannot transition from '${fromState}' to '${toState}'`,
      entityId,
      currentState: fromState,
      targetState: toState,
    });
  }

  /**
   * Get valid transitions for a state
   */
  static getValidTransitions(state: LifecycleState): LifecycleState[] {
    const transitions: Record<LifecycleState, LifecycleState[]> = {
      capture: ['transitional', 'permanent', 'archived'],
      transitional: ['permanent', 'archived'],
      permanent: ['archived'],
      archived: [], // Terminal state
    };
    return transitions[state] || [];
  }
}

/**
 * Lifecycle expired error (for 48-hour daily notes, etc.)
 */
export class LifecycleExpiredError extends SBFError {
  public readonly entityId?: string;
  public readonly expiredAt?: Date;
  public readonly entityType?: string;

  constructor(
    options: Omit<SBFErrorOptions, 'code'> & {
      entityId?: string;
      expiredAt?: Date;
      entityType?: string;
    }
  ) {
    super({
      ...options,
      code: ErrorCode.LIFECYCLE_EXPIRED,
      details: {
        entityId: options.entityId,
        expiredAt: options.expiredAt?.toISOString(),
        entityType: options.entityType,
        ...options.details,
      },
    });
    this.entityId = options.entityId;
    this.expiredAt = options.expiredAt;
    this.entityType = options.entityType;
  }

  /**
   * Create error for daily note expiration
   */
  static dailyNoteExpired(entityId: string, expiredAt: Date): LifecycleExpiredError {
    return new LifecycleExpiredError({
      message: `Daily note has expired and been dissolved`,
      entityId,
      expiredAt,
      entityType: 'daily-note',
    });
  }
}

/**
 * Invalid relationship error
 */
export class RelationshipError extends SBFError {
  public readonly sourceId?: string;
  public readonly targetId?: string;
  public readonly relationshipType?: string;
  public readonly reason?: string;

  constructor(
    options: Omit<SBFErrorOptions, 'code'> & {
      sourceId?: string;
      targetId?: string;
      relationshipType?: string;
      reason?: string;
    }
  ) {
    super({
      ...options,
      code: ErrorCode.RELATIONSHIP_INVALID,
      details: {
        sourceId: options.sourceId,
        targetId: options.targetId,
        relationshipType: options.relationshipType,
        reason: options.reason,
        ...options.details,
      },
    });
    this.sourceId = options.sourceId;
    this.targetId = options.targetId;
    this.relationshipType = options.relationshipType;
    this.reason = options.reason;
  }

  /**
   * Create error for self-referential relationship
   */
  static selfReference(entityId: string, relationshipType: string): RelationshipError {
    return new RelationshipError({
      message: `Entity cannot have a ${relationshipType} relationship with itself`,
      sourceId: entityId,
      targetId: entityId,
      relationshipType,
      reason: 'self_reference',
    });
  }

  /**
   * Create error for invalid relationship type
   */
  static invalidType(
    sourceType: string,
    targetType: string,
    relationshipType: string
  ): RelationshipError {
    return new RelationshipError({
      message: `Relationship type '${relationshipType}' is not valid between ${sourceType} and ${targetType}`,
      relationshipType,
      reason: 'invalid_type',
      details: { sourceType, targetType },
    });
  }
}

/**
 * Circular dependency error
 */
export class CircularDependencyError extends SBFError {
  public readonly path: string[];

  constructor(
    options: Omit<SBFErrorOptions, 'code'> & {
      path: string[];
    }
  ) {
    const pathStr = options.path.join(' → ');
    super({
      message: options.message || `Circular dependency detected: ${pathStr}`,
      code: ErrorCode.CIRCULAR_DEPENDENCY,
      details: {
        path: options.path,
        ...options.details,
      },
      cause: options.cause,
    });
    this.path = options.path;
  }
}

/**
 * Tenant isolation violation error
 */
export class TenantIsolationError extends SBFError {
  public readonly expectedTenantId?: string;
  public readonly actualTenantId?: string;
  public readonly resourceId?: string;
  public readonly resourceType?: string;

  constructor(
    options: Omit<SBFErrorOptions, 'code'> & {
      expectedTenantId?: string;
      actualTenantId?: string;
      resourceId?: string;
      resourceType?: string;
    }
  ) {
    super({
      ...options,
      code: ErrorCode.TENANT_ISOLATION_VIOLATION,
      details: {
        resourceId: options.resourceId,
        resourceType: options.resourceType,
        ...options.details,
      },
    });
    this.expectedTenantId = options.expectedTenantId;
    this.actualTenantId = options.actualTenantId;
    this.resourceId = options.resourceId;
    this.resourceType = options.resourceType;
  }

  /**
   * Create error for cross-tenant access attempt
   */
  static crossTenantAccess(resourceType: string, resourceId: string): TenantIsolationError {
    return new TenantIsolationError({
      message: `Access denied: ${resourceType} belongs to another tenant`,
      resourceType,
      resourceId,
    });
  }
}

/**
 * Checksum mismatch error (data integrity)
 */
export class ChecksumMismatchError extends SBFError {
  public readonly entityId?: string;
  public readonly expectedChecksum?: string;
  public readonly actualChecksum?: string;

  constructor(
    options: Omit<SBFErrorOptions, 'code'> & {
      entityId?: string;
      expectedChecksum?: string;
      actualChecksum?: string;
    }
  ) {
    super({
      ...options,
      code: ErrorCode.CHECKSUM_MISMATCH,
      details: {
        entityId: options.entityId,
        ...options.details,
      },
    });
    this.entityId = options.entityId;
    this.expectedChecksum = options.expectedChecksum;
    this.actualChecksum = options.actualChecksum;
  }

  /**
   * Create error for checksum verification failure
   */
  static verificationFailed(entityId: string): ChecksumMismatchError {
    return new ChecksumMismatchError({
      message: `Checksum verification failed for entity ${entityId}`,
      entityId,
    });
  }
}
