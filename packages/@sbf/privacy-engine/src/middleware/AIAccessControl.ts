/**
 * @sbf/privacy-engine - AIAccessControl Middleware
 *
 * Controls access to AI services based on entity sensitivity.
 * Implements PRD FR19 (secret blocking) and NFR10 (audit logging).
 */

import {
  AIAccessRequest,
  AIAccessResult,
  SensitivityLevel,
} from '../types';
import { SensitivityService } from '../services/SensitivityService';
import { AuditLogger } from '../services/AuditLogger';
import { PRIVACY_ERROR_MESSAGES } from '../constants';

/**
 * AIAccessControl - Middleware for controlling AI access.
 *
 * SECURITY CRITICAL:
 * - Secret content MUST NEVER be processed by ANY AI (cloud or local)
 * - All access attempts MUST be logged
 * - Sensitivity metadata MUST NOT be exposed to cloud AI
 */
export class AIAccessControl {
  constructor(
    private sensitivityService: SensitivityService,
    private auditLogger: AuditLogger
  ) {}

  /**
   * Check if AI request is allowed.
   * Filters out entities that cannot be processed.
   */
  async checkAccess(request: AIAccessRequest): Promise<AIAccessResult> {
    const blockedEntities: string[] = [];
    const allowedEntities: string[] = [];
    const blockDetails = new Map<string, string>();
    const blockReasons: string[] = [];

    for (const entityUid of request.entityUids) {
      const { allowed, reason } = await this.sensitivityService.canProcessWithAI(
        entityUid,
        request.tenantId,
        request.aiType
      );

      if (allowed) {
        allowedEntities.push(entityUid);

        // Log allowed access
        await this.auditLogger.logAIAccessAllowed(
          request.tenantId,
          entityUid,
          request.userId,
          request.aiProvider,
          request.aiType,
          request.operation
        );
      } else {
        blockedEntities.push(entityUid);
        const blockReason = reason ?? PRIVACY_ERROR_MESSAGES.SECRET_AI_BLOCKED;
        blockDetails.set(entityUid, blockReason);
        if (!blockReasons.includes(blockReason)) {
          blockReasons.push(blockReason);
        }

        // Log blocked access
        await this.auditLogger.logAIAccessBlocked(
          request.tenantId,
          entityUid,
          request.userId,
          request.aiProvider,
          request.aiType,
          request.operation,
          blockReason
        );
      }
    }

    return {
      allowed: allowedEntities.length > 0,
      blockedEntities,
      allowedEntities,
      reason:
        blockedEntities.length > 0
          ? `${blockedEntities.length} entities blocked: ${blockReasons[0]}`
          : undefined,
      blockDetails,
      warning: this.generateWarning(blockedEntities.length, allowedEntities.length),
    };
  }

  /**
   * Strictly check access - throws if ANY entity is blocked.
   * Use this for operations that require all-or-nothing access.
   */
  async checkStrictAccess(request: AIAccessRequest): Promise<void> {
    const result = await this.checkAccess(request);

    if (result.blockedEntities.length > 0) {
      const reasons = Array.from(result.blockDetails?.values() ?? []);
      throw new Error(
        `AI access blocked for ${result.blockedEntities.length} entities: ${reasons[0]}`
      );
    }
  }

  /**
   * Filter entity UIDs to only allowed ones.
   * Returns the filtered list without throwing.
   */
  async filterAllowed(request: AIAccessRequest): Promise<string[]> {
    const result = await this.checkAccess(request);
    return result.allowedEntities;
  }

  /**
   * Check if a single entity can be processed.
   */
  async canProcess(
    entityUid: string,
    tenantId: string,
    userId: string,
    aiProvider: string,
    aiType: 'cloud' | 'local'
  ): Promise<boolean> {
    const result = await this.checkAccess({
      tenantId,
      userId,
      entityUids: [entityUid],
      aiProvider,
      aiType,
      operation: 'check',
    });

    return result.allowedEntities.includes(entityUid);
  }

  /**
   * Get a user-friendly warning message.
   */
  getWarningMessage(result: AIAccessResult): string | null {
    if (result.blockedEntities.length === 0) {
      return null;
    }

    return (
      `${result.blockedEntities.length} source(s) were excluded due to privacy settings. ` +
      `Only ${result.allowedEntities.length} source(s) will be processed.`
    );
  }

  /**
   * Generate warning message for mixed results.
   */
  private generateWarning(
    blockedCount: number,
    allowedCount: number
  ): string | undefined {
    if (blockedCount === 0) {
      return undefined;
    }

    if (allowedCount === 0) {
      return 'All sources were excluded due to privacy settings. No content can be processed.';
    }

    return (
      `${blockedCount} source(s) excluded due to privacy settings. ` +
      `${allowedCount} source(s) will be processed.`
    );
  }

  /**
   * Create a request builder for common use cases.
   */
  createRequest(
    tenantId: string,
    userId: string,
    entityUids: string[],
    aiProvider: string,
    aiType: 'cloud' | 'local',
    operation: string
  ): AIAccessRequest {
    return {
      tenantId,
      userId,
      entityUids,
      aiProvider,
      aiType,
      operation,
    };
  }
}
