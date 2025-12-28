"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChecksumMismatchError = exports.TenantIsolationError = exports.CircularDependencyError = exports.RelationshipError = exports.LifecycleExpiredError = exports.LifecycleTransitionError = exports.SensitivityViolationError = exports.DomainError = void 0;
const base_1 = require("./base");
const codes_1 = require("./codes");
class DomainError extends base_1.SBFError {
    constructor(options) {
        super({
            ...options,
            code: options.code || codes_1.ErrorCode.DOMAIN_ERROR,
        });
    }
}
exports.DomainError = DomainError;
class SensitivityViolationError extends base_1.SBFError {
    constructor(options) {
        super({
            ...options,
            code: codes_1.ErrorCode.SENSITIVITY_VIOLATION,
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
    static cloudAINotAllowed(entityId, sensitivity) {
        return new SensitivityViolationError({
            message: `Cloud AI processing not allowed for ${sensitivity} content`,
            entityId,
            entitySensitivity: sensitivity,
            attemptedAction: 'cloud_ai_processing',
        });
    }
    static localAINotAllowed(entityId, sensitivity) {
        return new SensitivityViolationError({
            message: `Local AI processing not allowed for ${sensitivity} content`,
            entityId,
            entitySensitivity: sensitivity,
            attemptedAction: 'local_ai_processing',
        });
    }
    static exportNotAllowed(entityId, sensitivity) {
        return new SensitivityViolationError({
            message: `Export not allowed for ${sensitivity} content`,
            entityId,
            entitySensitivity: sensitivity,
            attemptedAction: 'export',
        });
    }
    static cannotDowngrade(entityId, fromSensitivity, toSensitivity) {
        return new SensitivityViolationError({
            message: `Cannot downgrade sensitivity from ${fromSensitivity} to ${toSensitivity}`,
            entityId,
            entitySensitivity: fromSensitivity,
            requiredSensitivity: toSensitivity,
            attemptedAction: 'sensitivity_downgrade',
        });
    }
}
exports.SensitivityViolationError = SensitivityViolationError;
class LifecycleTransitionError extends base_1.SBFError {
    constructor(options) {
        super({
            ...options,
            code: codes_1.ErrorCode.LIFECYCLE_INVALID_TRANSITION,
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
    static invalidTransition(entityId, fromState, toState) {
        return new LifecycleTransitionError({
            message: `Cannot transition from '${fromState}' to '${toState}'`,
            entityId,
            currentState: fromState,
            targetState: toState,
        });
    }
    static getValidTransitions(state) {
        const transitions = {
            capture: ['transitional', 'permanent', 'archived'],
            transitional: ['permanent', 'archived'],
            permanent: ['archived'],
            archived: [],
        };
        return transitions[state] || [];
    }
}
exports.LifecycleTransitionError = LifecycleTransitionError;
class LifecycleExpiredError extends base_1.SBFError {
    constructor(options) {
        super({
            ...options,
            code: codes_1.ErrorCode.LIFECYCLE_EXPIRED,
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
    static dailyNoteExpired(entityId, expiredAt) {
        return new LifecycleExpiredError({
            message: `Daily note has expired and been dissolved`,
            entityId,
            expiredAt,
            entityType: 'daily-note',
        });
    }
}
exports.LifecycleExpiredError = LifecycleExpiredError;
class RelationshipError extends base_1.SBFError {
    constructor(options) {
        super({
            ...options,
            code: codes_1.ErrorCode.RELATIONSHIP_INVALID,
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
    static selfReference(entityId, relationshipType) {
        return new RelationshipError({
            message: `Entity cannot have a ${relationshipType} relationship with itself`,
            sourceId: entityId,
            targetId: entityId,
            relationshipType,
            reason: 'self_reference',
        });
    }
    static invalidType(sourceType, targetType, relationshipType) {
        return new RelationshipError({
            message: `Relationship type '${relationshipType}' is not valid between ${sourceType} and ${targetType}`,
            relationshipType,
            reason: 'invalid_type',
            details: { sourceType, targetType },
        });
    }
}
exports.RelationshipError = RelationshipError;
class CircularDependencyError extends base_1.SBFError {
    constructor(options) {
        const pathStr = options.path.join(' → ');
        super({
            message: options.message || `Circular dependency detected: ${pathStr}`,
            code: codes_1.ErrorCode.CIRCULAR_DEPENDENCY,
            details: {
                path: options.path,
                ...options.details,
            },
            cause: options.cause,
        });
        this.path = options.path;
    }
}
exports.CircularDependencyError = CircularDependencyError;
class TenantIsolationError extends base_1.SBFError {
    constructor(options) {
        super({
            ...options,
            code: codes_1.ErrorCode.TENANT_ISOLATION_VIOLATION,
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
    static crossTenantAccess(resourceType, resourceId) {
        return new TenantIsolationError({
            message: `Access denied: ${resourceType} belongs to another tenant`,
            resourceType,
            resourceId,
        });
    }
}
exports.TenantIsolationError = TenantIsolationError;
class ChecksumMismatchError extends base_1.SBFError {
    constructor(options) {
        super({
            ...options,
            code: codes_1.ErrorCode.CHECKSUM_MISMATCH,
            details: {
                entityId: options.entityId,
                ...options.details,
            },
        });
        this.entityId = options.entityId;
        this.expectedChecksum = options.expectedChecksum;
        this.actualChecksum = options.actualChecksum;
    }
    static verificationFailed(entityId) {
        return new ChecksumMismatchError({
            message: `Checksum verification failed for entity ${entityId}`,
            entityId,
        });
    }
}
exports.ChecksumMismatchError = ChecksumMismatchError;
//# sourceMappingURL=domain.js.map