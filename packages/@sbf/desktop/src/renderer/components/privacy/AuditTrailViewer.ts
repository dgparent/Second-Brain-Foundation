/**
 * Audit Trail Viewer Component
 * Shows history of AI access attempts and privacy violations
 */

import { PrivacyLevel, PRIVACY_CONFIGS } from './PrivacySelector';

export interface AuditEntry {
  id: string;
  timestamp: Date;
  entityId: string;
  entityName: string;
  aiProvider: string;
  privacyLevel: PrivacyLevel;
  action: 'allowed' | 'denied' | 'filtered';
  reason?: string;
  userId: string;
}

export interface PrivacyViolation {
  id: string;
  timestamp: Date;
  entityId: string;
  entityName: string;
  aiProvider: string;
  attemptedLevel: PrivacyLevel;
  requiredLevel: PrivacyLevel;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId: string;
}

export class AuditTrailViewer {
  private container: HTMLElement;
  private entries: AuditEntry[] = [];
  private violations: PrivacyViolation[] = [];
  private filter: 'all' | 'allowed' | 'denied' | 'filtered' | 'violations' = 'all';

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  setEntries(entries: AuditEntry[]): void {
    this.entries = entries;
    this.render();
  }

  setViolations(violations: PrivacyViolation[]): void {
    this.violations = violations;
    this.render();
  }

  setFilter(filter: 'all' | 'allowed' | 'denied' | 'filtered' | 'violations'): void {
    this.filter = filter;
    this.render();
  }

  private getFilteredEntries(): AuditEntry[] {
    if (this.filter === 'all') return this.entries;
    return this.entries.filter(e => e.action === this.filter);
  }

  private render(): void {
    const filteredEntries = this.getFilteredEntries();
    const showViolations = this.filter === 'all' || this.filter === 'violations';

    this.container.innerHTML = `
      <div class="audit-trail-viewer">
        <div class="audit-header">
          <h3>Privacy Audit Trail</h3>
          <div class="audit-stats">
            <span class="stat">Total: ${this.entries.length}</span>
            <span class="stat stat-success">Allowed: ${this.entries.filter(e => e.action === 'allowed').length}</span>
            <span class="stat stat-warning">Filtered: ${this.entries.filter(e => e.action === 'filtered').length}</span>
            <span class="stat stat-danger">Denied: ${this.entries.filter(e => e.action === 'denied').length}</span>
            <span class="stat stat-critical">Violations: ${this.violations.length}</span>
          </div>
        </div>

        <div class="audit-filters">
          <button class="filter-btn ${this.filter === 'all' ? 'active' : ''}" data-filter="all">All</button>
          <button class="filter-btn ${this.filter === 'allowed' ? 'active' : ''}" data-filter="allowed">Allowed</button>
          <button class="filter-btn ${this.filter === 'filtered' ? 'active' : ''}" data-filter="filtered">Filtered</button>
          <button class="filter-btn ${this.filter === 'denied' ? 'active' : ''}" data-filter="denied">Denied</button>
          <button class="filter-btn ${this.filter === 'violations' ? 'active' : ''}" data-filter="violations">Violations</button>
        </div>

        <div class="audit-entries">
          ${showViolations && this.violations.length > 0 ? `
            <div class="violations-section">
              <h4>🚨 Privacy Violations</h4>
              ${this.violations.map(v => this.renderViolation(v)).join('')}
            </div>
          ` : ''}
          
          ${this.filter !== 'violations' ? `
            <div class="entries-section">
              ${filteredEntries.length === 0 ? '<p class="no-entries">No entries found</p>' : ''}
              ${filteredEntries.map(e => this.renderEntry(e)).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;

    // Add filter click handlers
    this.container.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filter = (e.currentTarget as HTMLElement).dataset.filter as any;
        this.setFilter(filter);
      });
    });
  }

  private renderEntry(entry: AuditEntry): string {
    const config = PRIVACY_CONFIGS[entry.privacyLevel];
    const actionClass = {
      allowed: 'success',
      denied: 'danger',
      filtered: 'warning',
    }[entry.action];

    return `
      <div class="audit-entry audit-${actionClass}">
        <div class="entry-time">${this.formatTime(entry.timestamp)}</div>
        <div class="entry-content">
          <div class="entry-entity">
            <span class="entry-icon">${config.icon}</span>
            <strong>${entry.entityName}</strong>
            <span class="entry-level" style="color: ${config.color};">${config.label}</span>
          </div>
          <div class="entry-details">
            <span class="entry-provider">${entry.aiProvider}</span>
            <span class="entry-action ${actionClass}">${entry.action.toUpperCase()}</span>
            ${entry.reason ? `<span class="entry-reason">${entry.reason}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  private renderViolation(violation: PrivacyViolation): string {
    const attemptedConfig = PRIVACY_CONFIGS[violation.attemptedLevel];
    const requiredConfig = PRIVACY_CONFIGS[violation.requiredLevel];

    const severityColors = {
      low: '#f59e0b',
      medium: '#f97316',
      high: '#ef4444',
      critical: '#991b1b',
    };

    return `
      <div class="violation-entry" style="border-left-color: ${severityColors[violation.severity]};">
        <div class="violation-severity" style="background: ${severityColors[violation.severity]};">
          ${violation.severity.toUpperCase()}
        </div>
        <div class="violation-content">
          <div class="violation-time">${this.formatTime(violation.timestamp)}</div>
          <div class="violation-entity">
            <strong>${violation.entityName}</strong>
          </div>
          <div class="violation-details">
            <span>AI Provider: <strong>${violation.aiProvider}</strong></span>
            <span>Attempted: ${attemptedConfig.icon} ${attemptedConfig.label}</span>
            <span>Required: ${requiredConfig.icon} ${requiredConfig.label}</span>
          </div>
        </div>
      </div>
    `;
  }

  private formatTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  }
}

export const AUDIT_TRAIL_CSS = `
.audit-trail-viewer {
  background: #2d2d2d;
  border-radius: 8px;
  padding: 1.5rem;
  max-height: 600px;
  overflow-y: auto;
}

.audit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #404040;
}

.audit-header h3 {
  margin: 0;
}

.audit-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
}

.stat {
  padding: 0.25rem 0.75rem;
  background: #242424;
  border-radius: 4px;
}

.stat-success { color: #10b981; }
.stat-warning { color: #f59e0b; }
.stat-danger { color: #ef4444; }
.stat-critical { color: #991b1b; font-weight: 600; }

.audit-filters {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.filter-btn {
  padding: 0.5rem 1rem;
  background: #242424;
  border: 1px solid #404040;
  border-radius: 6px;
  color: #e0e0e0;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  background: #3d3d3d;
}

.filter-btn.active {
  background: #0066cc;
  border-color: #0066cc;
}

.audit-entries {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.violations-section {
  margin-bottom: 1.5rem;
}

.violations-section h4 {
  margin: 0 0 0.75rem 0;
  color: #ef4444;
}

.audit-entry {
  display: flex;
  gap: 1rem;
  padding: 0.75rem;
  background: #242424;
  border-radius: 6px;
  border-left: 3px solid;
}

.audit-entry.audit-success { border-left-color: #10b981; }
.audit-entry.audit-warning { border-left-color: #f59e0b; }
.audit-entry.audit-danger { border-left-color: #ef4444; }

.entry-time {
  font-size: 0.75rem;
  color: #999;
  white-space: nowrap;
  min-width: 60px;
}

.entry-content {
  flex: 1;
}

.entry-entity {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.entry-level {
  font-size: 0.75rem;
  font-weight: 500;
}

.entry-details {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
  color: #999;
}

.entry-action {
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.entry-action.success {
  background: #10b98120;
  color: #10b981;
}

.entry-action.warning {
  background: #f59e0b20;
  color: #f59e0b;
}

.entry-action.danger {
  background: #ef444420;
  color: #ef4444;
}

.violation-entry {
  display: flex;
  gap: 1rem;
  padding: 0.75rem;
  background: #242424;
  border-radius: 6px;
  border-left: 4px solid;
}

.violation-severity {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  height: fit-content;
}

.violation-content {
  flex: 1;
}

.violation-time {
  font-size: 0.75rem;
  color: #999;
  margin-bottom: 0.25rem;
}

.violation-entity {
  margin-bottom: 0.5rem;
}

.violation-details {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #999;
}

.no-entries {
  text-align: center;
  color: #999;
  padding: 2rem;
}
`;
