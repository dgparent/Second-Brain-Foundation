/**
 * In-Memory Audit Storage - Simple implementation for testing
 * For production, replace with persistent storage (database, file system, etc.)
 */

import { AuditStorage } from './PrivacyAuditLogger';
import { PrivacyAuditEntry, PrivacyViolation } from './types';

export class InMemoryAuditStorage implements AuditStorage {
  private auditEntries: Map<string, PrivacyAuditEntry[]> = new Map();
  private violations: PrivacyViolation[] = [];

  async saveAuditEntry(entry: PrivacyAuditEntry): Promise<void> {
    const entries = this.auditEntries.get(entry.entityId) || [];
    entries.push(entry);
    this.auditEntries.set(entry.entityId, entries);
  }

  async getAuditTrail(entityId: string): Promise<PrivacyAuditEntry[]> {
    if (entityId === '') {
      // Return all entries
      const allEntries: PrivacyAuditEntry[] = [];
      for (const entries of this.auditEntries.values()) {
        allEntries.push(...entries);
      }
      return allEntries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
    return this.auditEntries.get(entityId) || [];
  }

  async getViolations(entityId?: string): Promise<PrivacyViolation[]> {
    if (entityId) {
      return this.violations.filter((v) => v.entityId === entityId);
    }
    return this.violations;
  }

  async saveViolation(violation: PrivacyViolation): Promise<void> {
    this.violations.push(violation);
  }

  clear(): void {
    this.auditEntries.clear();
    this.violations = [];
  }
}
