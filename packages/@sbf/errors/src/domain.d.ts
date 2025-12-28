import { SBFError, SBFErrorOptions } from './base';
import { ErrorCode } from './codes';
export type SensitivityLevel = 'public' | 'personal' | 'confidential' | 'secret';
export type LifecycleState = 'capture' | 'transitional' | 'permanent' | 'archived';
export declare class DomainError extends SBFError {
    constructor(options: Omit<SBFErrorOptions, 'code'> & {
        code?: ErrorCode;
    });
}
export declare class SensitivityViolationError extends SBFError {
    readonly entityId?: string;
    readonly entitySensitivity?: SensitivityLevel;
    readonly attemptedAction?: string;
    readonly requiredSensitivity?: SensitivityLevel;
    constructor(options: Omit<SBFErrorOptions, 'code'> & {
        entityId?: string;
        entitySensitivity?: SensitivityLevel;
        attemptedAction?: string;
        requiredSensitivity?: SensitivityLevel;
    });
    static cloudAINotAllowed(entityId: string, sensitivity: SensitivityLevel): SensitivityViolationError;
    static localAINotAllowed(entityId: string, sensitivity: SensitivityLevel): SensitivityViolationError;
    static exportNotAllowed(entityId: string, sensitivity: SensitivityLevel): SensitivityViolationError;
    static cannotDowngrade(entityId: string, fromSensitivity: SensitivityLevel, toSensitivity: SensitivityLevel): SensitivityViolationError;
}
export declare class LifecycleTransitionError extends SBFError {
    readonly entityId?: string;
    readonly currentState?: LifecycleState;
    readonly targetState?: LifecycleState;
    readonly entityType?: string;
    constructor(options: Omit<SBFErrorOptions, 'code'> & {
        entityId?: string;
        currentState?: LifecycleState;
        targetState?: LifecycleState;
        entityType?: string;
    });
    static invalidTransition(entityId: string, fromState: LifecycleState, toState: LifecycleState): LifecycleTransitionError;
    static getValidTransitions(state: LifecycleState): LifecycleState[];
}
export declare class LifecycleExpiredError extends SBFError {
    readonly entityId?: string;
    readonly expiredAt?: Date;
    readonly entityType?: string;
    constructor(options: Omit<SBFErrorOptions, 'code'> & {
        entityId?: string;
        expiredAt?: Date;
        entityType?: string;
    });
    static dailyNoteExpired(entityId: string, expiredAt: Date): LifecycleExpiredError;
}
export declare class RelationshipError extends SBFError {
    readonly sourceId?: string;
    readonly targetId?: string;
    readonly relationshipType?: string;
    readonly reason?: string;
    constructor(options: Omit<SBFErrorOptions, 'code'> & {
        sourceId?: string;
        targetId?: string;
        relationshipType?: string;
        reason?: string;
    });
    static selfReference(entityId: string, relationshipType: string): RelationshipError;
    static invalidType(sourceType: string, targetType: string, relationshipType: string): RelationshipError;
}
export declare class CircularDependencyError extends SBFError {
    readonly path: string[];
    constructor(options: Omit<SBFErrorOptions, 'code'> & {
        path: string[];
    });
}
export declare class TenantIsolationError extends SBFError {
    readonly expectedTenantId?: string;
    readonly actualTenantId?: string;
    readonly resourceId?: string;
    readonly resourceType?: string;
    constructor(options: Omit<SBFErrorOptions, 'code'> & {
        expectedTenantId?: string;
        actualTenantId?: string;
        resourceId?: string;
        resourceType?: string;
    });
    static crossTenantAccess(resourceType: string, resourceId: string): TenantIsolationError;
}
export declare class ChecksumMismatchError extends SBFError {
    readonly entityId?: string;
    readonly expectedChecksum?: string;
    readonly actualChecksum?: string;
    constructor(options: Omit<SBFErrorOptions, 'code'> & {
        entityId?: string;
        expectedChecksum?: string;
        actualChecksum?: string;
    });
    static verificationFailed(entityId: string): ChecksumMismatchError;
}
//# sourceMappingURL=domain.d.ts.map