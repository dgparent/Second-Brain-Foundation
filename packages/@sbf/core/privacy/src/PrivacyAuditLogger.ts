/**
 * Privacy Audit Logger - Audit trail for AI access
 * Logs all AI interactions with user content
 */

import { EventEmitter } from 'events';
import {
  PrivacyAuditEntry,
  PrivacyViolation,
  AIProvider,
  PrivacyLevel,
} from './types';

export interface AuditStorage {
  saveAuditEntry(entry: PrivacyAuditEntry): Promise<void>;
  getAuditTrail(entityId: string): Promise<PrivacyAuditEntry[]>;
  getViolations(entityId?: string): Promise<PrivacyViolation[]>;
  saveViolation(violation: PrivacyViolation): Promise<void>;
}

export class PrivacyAuditLogger extends EventEmitter {
  private storage: AuditStorage;
  private auditBuffer: PrivacyAuditEntry[] = [];
  private violationBuffer: PrivacyViolation[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  constructor(storage: AuditStorage, flushIntervalMs: number = 5000) {
    super();
    this.storage = storage;
    this.startAutoFlush(flushIntervalMs);
  }

  private startAutoFlush(intervalMs: number): void {
    this.flushInterval = setInterval(() => {
      void this.flush();
    }, intervalMs);
  }

  async logAccess(params: {
    entityId: string;
    entityType: string;
    action: 'access' | 'filter' | 'deny';
    aiProvider: AIProvider;
    privacyLevel: PrivacyLevel;
    confidenceScore?: number;
    wasFiltered: boolean;
    violations: string[];
    userId: string;
  }): Promise<void> {
    const entry: PrivacyAuditEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      ...params,
    };

    this.auditBuffer.push(entry);
    this.emit('audit:logged', entry);

    if (params.action === 'deny' || params.violations.length > 0) {
      this.emit('audit:violation', entry);
    }
  }

  async logViolation(params: {
    entityId: string;
    rule: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    aiProvider?: AIProvider;
  }): Promise<void> {
    const violation: PrivacyViolation = {
      id: this.generateId(),
      timestamp: new Date(),
      ...params,
    };

    this.violationBuffer.push(violation);
    this.emit('violation:detected', violation);
  }

  async getAuditTrail(entityId: string): Promise<PrivacyAuditEntry[]> {
    await this.flush();
    return this.storage.getAuditTrail(entityId);
  }

  async getViolations(entityId?: string): Promise<PrivacyViolation[]> {
    await this.flush();
    return this.storage.getViolations(entityId);
  }

  async getStatistics(): Promise<{
    totalAccesses: number;
    totalDenials: number;
    totalFiltered: number;
    totalViolations: number;
    byProvider: Record<AIProvider, number>;
    byPrivacyLevel: Record<PrivacyLevel, number>;
  }> {
    await this.flush();
    const allAudits = await this.storage.getAuditTrail('');
    const allViolations = await this.storage.getViolations();

    const byProvider: Record<AIProvider, number> = {
      [AIProvider.None]: 0,
      [AIProvider.LocalLLM]: 0,
      [AIProvider.OpenAI]: 0,
      [AIProvider.Anthropic]: 0,
      [AIProvider.Google]: 0,
      [AIProvider.Custom]: 0,
    };

    const byPrivacyLevel: Record<PrivacyLevel, number> = {
      [PrivacyLevel.Public]: 0,
      [PrivacyLevel.Personal]: 0,
      [PrivacyLevel.Private]: 0,
      [PrivacyLevel.Confidential]: 0,
    };

    let totalDenials = 0;
    let totalFiltered = 0;

    for (const audit of allAudits) {
      byProvider[audit.aiProvider]++;
      byPrivacyLevel[audit.privacyLevel]++;
      if (audit.action === 'deny') totalDenials++;
      if (audit.wasFiltered) totalFiltered++;
    }

    return {
      totalAccesses: allAudits.length,
      totalDenials,
      totalFiltered,
      totalViolations: allViolations.length,
      byProvider,
      byPrivacyLevel,
    };
  }

  async flush(): Promise<void> {
    const auditsToFlush = [...this.auditBuffer];
    const violationsToFlush = [...this.violationBuffer];

    this.auditBuffer = [];
    this.violationBuffer = [];

    await Promise.all([
      ...auditsToFlush.map((entry) => this.storage.saveAuditEntry(entry)),
      ...violationsToFlush.map((violation) => this.storage.saveViolation(violation)),
    ]);
  }

  async shutdown(): Promise<void> {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    await this.flush();
  }

  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
