/**
 * @sbf/privacy-engine - AuditLogger Service
 *
 * Logs all privacy-related actions for compliance and auditing.
 * Implements PRD NFR10 requirement for audit logging.
 */

import { v4 as uuidv4 } from 'uuid';
import {
  PrivacyAuditEntry,
  CreateAuditEntryInput,
  PrivacyAction,
  SensitivityLevel,
} from '../types';
import { AUDIT_LOG_CONFIG } from '../constants';

/**
 * Database interface for audit logging.
 * Implementation should be provided by the consuming application.
 */
export interface AuditLogDatabase {
  insert(entry: PrivacyAuditEntry): Promise<void>;
  query(
    tenantId: string,
    options: AuditQueryOptions
  ): Promise<PrivacyAuditEntry[]>;
  countByEntity(tenantId: string, entityUid: string): Promise<number>;
  deleteOlderThan(tenantId: string, date: Date): Promise<number>;
}

/**
 * Query options for audit log retrieval.
 */
export interface AuditQueryOptions {
  /** Filter by entity UID */
  entityUid?: string;

  /** Filter by action types */
  actions?: PrivacyAction[];

  /** Filter by actor ID */
  actorId?: string;

  /** Start date for time range */
  startDate?: Date;

  /** End date for time range */
  endDate?: Date;

  /** Maximum results to return */
  limit?: number;

  /** Offset for pagination */
  offset?: number;

  /** Sort order */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Audit log statistics.
 */
export interface AuditLogStats {
  totalEntries: number;
  entriesByAction: Record<PrivacyAction, number>;
  entriesByLevel: Record<SensitivityLevel, number>;
  blockedAccessCount: number;
  allowedAccessCount: number;
}

/**
 * AuditLogger - Privacy audit logging service.
 *
 * Records all privacy-related actions including:
 * - Sensitivity changes
 * - AI access attempts (allowed and blocked)
 * - Export attempts
 * - Share attempts
 * - Inheritance applications
 */
export class AuditLogger {
  constructor(private db: AuditLogDatabase) {}

  /**
   * Log a privacy action.
   */
  async log(input: CreateAuditEntryInput): Promise<PrivacyAuditEntry> {
    const entry: PrivacyAuditEntry = {
      id: uuidv4(),
      ...input,
      timestamp: new Date(),
    };

    await this.db.insert(entry);
    return entry;
  }

  /**
   * Log a sensitivity change.
   */
  async logSensitivityChange(
    tenantId: string,
    entityUid: string,
    actorId: string,
    fromLevel: SensitivityLevel | undefined,
    toLevel: SensitivityLevel,
    reason?: string
  ): Promise<PrivacyAuditEntry> {
    return this.log({
      tenant_id: tenantId,
      entity_uid: entityUid,
      action: 'sensitivity_changed',
      actor_id: actorId,
      actor_type: 'user',
      from_level: fromLevel,
      to_level: toLevel,
      metadata: reason ? { reason } : undefined,
    });
  }

  /**
   * Log AI access attempt (allowed).
   */
  async logAIAccessAllowed(
    tenantId: string,
    entityUid: string,
    actorId: string,
    aiProvider: string,
    aiType: 'cloud' | 'local',
    operation: string
  ): Promise<PrivacyAuditEntry> {
    return this.log({
      tenant_id: tenantId,
      entity_uid: entityUid,
      action: 'ai_access_allowed',
      actor_id: actorId,
      actor_type: 'user',
      metadata: {
        ai_provider: aiProvider,
        ai_type: aiType,
        operation,
      },
    });
  }

  /**
   * Log AI access attempt (blocked).
   */
  async logAIAccessBlocked(
    tenantId: string,
    entityUid: string,
    actorId: string,
    aiProvider: string,
    aiType: 'cloud' | 'local',
    operation: string,
    reason: string
  ): Promise<PrivacyAuditEntry> {
    return this.log({
      tenant_id: tenantId,
      entity_uid: entityUid,
      action: 'ai_access_blocked',
      actor_id: actorId,
      actor_type: 'user',
      blocked_reason: reason,
      metadata: {
        ai_provider: aiProvider,
        ai_type: aiType,
        operation,
      },
    });
  }

  /**
   * Log export attempt.
   */
  async logExportAttempt(
    tenantId: string,
    entityUid: string,
    actorId: string,
    allowed: boolean,
    format: string,
    reason?: string
  ): Promise<PrivacyAuditEntry> {
    return this.log({
      tenant_id: tenantId,
      entity_uid: entityUid,
      action: allowed ? 'export_allowed' : 'export_blocked',
      actor_id: actorId,
      actor_type: 'user',
      blocked_reason: !allowed ? reason : undefined,
      metadata: { format },
    });
  }

  /**
   * Log share attempt.
   */
  async logShareAttempt(
    tenantId: string,
    entityUid: string,
    actorId: string,
    allowed: boolean,
    shareWith: string[],
    reason?: string
  ): Promise<PrivacyAuditEntry> {
    return this.log({
      tenant_id: tenantId,
      entity_uid: entityUid,
      action: allowed ? 'share_attempted' : 'share_blocked',
      actor_id: actorId,
      actor_type: 'user',
      blocked_reason: !allowed ? reason : undefined,
      metadata: { share_with: shareWith },
    });
  }

  /**
   * Log inheritance application.
   */
  async logInheritanceApplied(
    tenantId: string,
    entityUid: string,
    parentUid: string,
    inheritedLevel: SensitivityLevel
  ): Promise<PrivacyAuditEntry> {
    return this.log({
      tenant_id: tenantId,
      entity_uid: entityUid,
      action: 'inheritance_applied',
      actor_id: 'system',
      actor_type: 'system',
      to_level: inheritedLevel,
      metadata: { parent_uid: parentUid },
    });
  }

  /**
   * Query audit logs.
   */
  async query(
    tenantId: string,
    options: AuditQueryOptions = {}
  ): Promise<PrivacyAuditEntry[]> {
    const limit = Math.min(
      options.limit ?? AUDIT_LOG_CONFIG.defaultQueryLimit,
      AUDIT_LOG_CONFIG.maxQueryLimit
    );

    return this.db.query(tenantId, {
      ...options,
      limit,
    });
  }

  /**
   * Get audit logs for a specific entity.
   */
  async getEntityLogs(
    tenantId: string,
    entityUid: string,
    limit?: number
  ): Promise<PrivacyAuditEntry[]> {
    return this.query(tenantId, {
      entityUid,
      limit,
      sortOrder: 'desc',
    });
  }

  /**
   * Get recent blocked access attempts.
   */
  async getBlockedAttempts(
    tenantId: string,
    limit?: number
  ): Promise<PrivacyAuditEntry[]> {
    return this.query(tenantId, {
      actions: [
        'ai_access_blocked',
        'export_blocked',
        'share_blocked',
        'sync_blocked',
      ],
      limit,
      sortOrder: 'desc',
    });
  }

  /**
   * Get audit log statistics.
   */
  async getStats(
    tenantId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<AuditLogStats> {
    const entries = await this.query(tenantId, {
      startDate,
      endDate,
      limit: AUDIT_LOG_CONFIG.maxQueryLimit,
    });

    const stats: AuditLogStats = {
      totalEntries: entries.length,
      entriesByAction: {} as Record<PrivacyAction, number>,
      entriesByLevel: {} as Record<SensitivityLevel, number>,
      blockedAccessCount: 0,
      allowedAccessCount: 0,
    };

    for (const entry of entries) {
      // Count by action
      stats.entriesByAction[entry.action] =
        (stats.entriesByAction[entry.action] || 0) + 1;

      // Count by level
      if (entry.to_level) {
        stats.entriesByLevel[entry.to_level] =
          (stats.entriesByLevel[entry.to_level] || 0) + 1;
      }

      // Count access results
      if (entry.action === 'ai_access_blocked') {
        stats.blockedAccessCount++;
      } else if (entry.action === 'ai_access_allowed') {
        stats.allowedAccessCount++;
      }
    }

    return stats;
  }

  /**
   * Cleanup old audit logs based on retention policy.
   */
  async cleanup(tenantId: string, retentionDays: number): Promise<number> {
    const effectiveRetention = Math.max(
      AUDIT_LOG_CONFIG.minRetentionDays,
      Math.min(retentionDays, AUDIT_LOG_CONFIG.maxRetentionDays)
    );

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - effectiveRetention);

    return this.db.deleteOlderThan(tenantId, cutoffDate);
  }
}
