/**
 * Privacy Dashboard Component
 * 
 * Central privacy management interface showing overview of privacy settings,
 * entity sensitivity distribution, encryption status, and access controls.
 */

export interface PrivacyStats {
  totalEntities: number;
  byLevel?: {
    public: number;
    internal: number;
    confidential: number;
    restricted: number;
    secret: number;
  };
  encrypted?: number;
  withAccessControls?: number;
  recentAuditEvents?: number;
}

export interface EncryptionStatus {
  enabled: boolean;
  algorithm: string;
  keyRotationDate: Date;
  encryptedEntities: number;
  totalEntities: number;
}

export interface AccessControlSummary {
  totalRoles: number;
  totalPermissions: number;
  activeUsers: number;
  recentChanges: number;
}

export interface PrivacyDashboardOptions {
  onNavigate?: (section: string) => void;
}

export class PrivacyDashboard {
  private container: HTMLElement;
  private options: PrivacyDashboardOptions;
  private stats: PrivacyStats | null = null;
  private encryptionStatus: EncryptionStatus | null = null;
  private accessControlSummary: AccessControlSummary | null = null;
  private loading: boolean = true;
  private error: string | null = null;

  constructor(container: HTMLElement, options: PrivacyDashboardOptions = {}) {
    this.container = container;
    this.options = options;
    this.initialize();
  }

  private async initialize() {
    await this.loadData();
    this.render();
  }

  private async loadData() {
    this.loading = true;
    this.error = null;
    this.render();

    try {
      const [stats, encryption, accessControl] = await Promise.all([
        window.sbfAPI.privacy.getStats(),
        window.sbfAPI.privacy.getEncryptionStatus(),
        window.sbfAPI.privacy.getAccessControlSummary(),
      ]);

      this.stats = stats;
      this.encryptionStatus = {
        ...encryption,
        keyRotationDate: new Date(encryption.keyRotationDate),
      };
      this.accessControlSummary = accessControl;
      this.loading = false;
      this.render();
    } catch (error) {
      console.error('Failed to load privacy data:', error);
      this.error = 'Failed to load privacy data. Please try again.';
      this.loading = false;
      this.render();
    }
  }

  public refresh() {
    this.loadData();
  }

  private navigate(section: string) {
    this.options.onNavigate?.(section);
  }

  private render() {
    if (this.loading) {
      this.container.innerHTML = this.renderLoading();
      return;
    }

    if (this.error) {
      this.container.innerHTML = this.renderError();
      this.attachEventListeners();
      return;
    }

    this.container.innerHTML = `
      <div class="privacy-dashboard">
        <div class="dashboard-header">
          <div>
            <h2>Privacy & Security Dashboard</h2>
            <p class="subtitle">Manage data protection, encryption, and access controls</p>
          </div>
          <button class="btn-refresh" data-action="refresh">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        ${this.renderOverviewCards()}
        ${this.renderSensitivityDistribution()}
        
        <div class="privacy-sections">
          ${this.renderEncryptionSection()}
          ${this.renderAccessControlSection()}
        </div>

        ${this.renderQuickActions()}
      </div>
    `;

    this.attachEventListeners();
  }

  private renderLoading(): string {
    return `
      <div class="privacy-dashboard loading">
        <div class="loading-spinner"></div>
        <p>Loading privacy dashboard...</p>
      </div>
    `;
  }

  private renderError(): string {
    return `
      <div class="privacy-dashboard error">
        <svg class="error-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3>Error Loading Dashboard</h3>
        <p>${this.error}</p>
        <button class="btn-primary" data-action="refresh">Try Again</button>
      </div>
    `;
  }

  private renderOverviewCards(): string {
    if (!this.stats) return '';

    const encryptionPercentage = this.stats.totalEntities > 0
      ? Math.round((this.stats.encrypted / this.stats.totalEntities) * 100)
      : 0;

    const accessControlPercentage = this.stats.totalEntities > 0
      ? Math.round((this.stats.withAccessControls / this.stats.totalEntities) * 100)
      : 0;

    return `
      <div class="overview-cards">
        <div class="overview-card">
          <div class="card-icon blue">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div class="card-content">
            <div class="card-value">${this.stats.totalEntities.toLocaleString()}</div>
            <div class="card-label">Total Entities</div>
          </div>
        </div>

        <div class="overview-card">
          <div class="card-icon green">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div class="card-content">
            <div class="card-value">${encryptionPercentage}%</div>
            <div class="card-label">Encrypted</div>
            <div class="card-detail">${this.stats.encrypted} of ${this.stats.totalEntities}</div>
          </div>
        </div>

        <div class="overview-card">
          <div class="card-icon orange">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div class="card-content">
            <div class="card-value">${accessControlPercentage}%</div>
            <div class="card-label">Access Controlled</div>
            <div class="card-detail">${this.stats.withAccessControls} of ${this.stats.totalEntities}</div>
          </div>
        </div>

        <div class="overview-card">
          <div class="card-icon purple">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div class="card-content">
            <div class="card-value">${this.stats.recentAuditEvents.toLocaleString()}</div>
            <div class="card-label">Recent Audit Events</div>
            <div class="card-detail">Last 7 days</div>
          </div>
        </div>
      </div>
    `;
  }

  private renderSensitivityDistribution(): string {
    if (!this.stats) return '';

    const levels = [
      { key: 'public', label: 'Public', color: '#10b981', icon: '🌍' },
      { key: 'internal', label: 'Internal', color: '#3b82f6', icon: '🏢' },
      { key: 'confidential', label: 'Confidential', color: '#f59e0b', icon: '🔒' },
      { key: 'restricted', label: 'Restricted', color: '#f97316', icon: '⚠️' },
      { key: 'secret', label: 'Secret', color: '#ef4444', icon: '🔐' },
    ];

    const total = this.stats.totalEntities;

    return `
      <div class="sensitivity-section">
        <div class="section-header">
          <h3>Sensitivity Distribution</h3>
          <button class="btn-secondary" data-action="navigate" data-section="classification">
            Manage Classification
          </button>
        </div>

        <div class="sensitivity-chart">
          ${levels.map(level => {
            const count = this.stats!.byLevel[level.key as keyof typeof this.stats.byLevel];
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
            
            return `
              <div class="sensitivity-bar">
                <div class="bar-header">
                  <span class="bar-label">
                    <span class="level-icon">${level.icon}</span>
                    ${level.label}
                  </span>
                  <span class="bar-value">${count} (${percentage}%)</span>
                </div>
                <div class="bar-track">
                  <div class="bar-fill" style="width: ${percentage}%; background: ${level.color};"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  private renderEncryptionSection(): string {
    if (!this.encryptionStatus) return '';

    const daysSinceRotation = Math.floor(
      (new Date().getTime() - this.encryptionStatus.keyRotationDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const rotationStatus = daysSinceRotation > 90 ? 'warning' : 'ok';

    return `
      <div class="privacy-section encryption-section">
        <div class="section-header">
          <h3>
            <svg class="section-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Encryption
          </h3>
          <span class="status-badge ${this.encryptionStatus.enabled ? 'success' : 'warning'}">
            ${this.encryptionStatus.enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>

        <div class="section-content">
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Algorithm</div>
              <div class="info-value">${this.encryptionStatus.algorithm}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Encrypted Entities</div>
              <div class="info-value">${this.encryptionStatus.encryptedEntities} / ${this.encryptionStatus.totalEntities}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Key Rotation</div>
              <div class="info-value ${rotationStatus}">
                ${daysSinceRotation} days ago
                ${rotationStatus === 'warning' ? ' (rotation recommended)' : ''}
              </div>
            </div>
          </div>

          <div class="section-actions">
            <button class="btn-secondary" data-action="navigate" data-section="encryption">
              Manage Encryption
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private renderAccessControlSection(): string {
    if (!this.accessControlSummary) return '';

    return `
      <div class="privacy-section access-control-section">
        <div class="section-header">
          <h3>
            <svg class="section-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Access Control
          </h3>
        </div>

        <div class="section-content">
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Roles</div>
              <div class="info-value">${this.accessControlSummary.totalRoles}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Permissions</div>
              <div class="info-value">${this.accessControlSummary.totalPermissions}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Active Users</div>
              <div class="info-value">${this.accessControlSummary.activeUsers}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Recent Changes</div>
              <div class="info-value">${this.accessControlSummary.recentChanges}</div>
            </div>
          </div>

          <div class="section-actions">
            <button class="btn-secondary" data-action="navigate" data-section="access-control">
              Manage Access Control
            </button>
            <button class="btn-secondary" data-action="navigate" data-section="audit-log">
              View Audit Log
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private renderQuickActions(): string {
    return `
      <div class="quick-actions-section">
        <h3>Quick Actions</h3>
        <div class="quick-actions-grid">
          <button class="quick-action-btn" data-action="navigate" data-section="classification">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Classify Entities
          </button>

          <button class="quick-action-btn" data-action="navigate" data-section="encryption">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            Rotate Keys
          </button>

          <button class="quick-action-btn" data-action="navigate" data-section="access-control">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Manage Roles
          </button>

          <button class="quick-action-btn" data-action="navigate" data-section="audit-log">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            View Audit Trail
          </button>
        </div>
      </div>
    `;
  }

  private attachEventListeners() {
    const refreshBtn = this.container.querySelector('[data-action="refresh"]');
    refreshBtn?.addEventListener('click', () => this.refresh());

    this.container.querySelectorAll('[data-action="navigate"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const section = (btn as HTMLElement).dataset.section!;
        this.navigate(section);
      });
    });
  }

  public destroy() {
    this.container.innerHTML = '';
  }
}

// CSS Styles
export const PRIVACY_DASHBOARD_CSS = `
.privacy-dashboard {
  padding: 1.5rem;
  background: #1a1a1a;
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.dashboard-header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #e0e0e0;
}

.subtitle {
  margin: 0;
  font-size: 0.875rem;
  color: #999;
}

.btn-refresh {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: #2d2d2d;
  border: 1px solid #444;
  border-radius: 6px;
  color: #e0e0e0;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-refresh:hover {
  background: #3d3d3d;
  border-color: #555;
}

.btn-refresh svg {
  width: 1.25rem;
  height: 1.25rem;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.overview-card {
  background: #2d2d2d;
  border: 1px solid #444;
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.card-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-icon svg {
  width: 1.5rem;
  height: 1.5rem;
}

.card-icon.blue {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.card-icon.green {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.card-icon.orange {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.card-icon.purple {
  background: rgba(168, 85, 247, 0.2);
  color: #a855f7;
}

.card-content {
  flex: 1;
}

.card-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #e0e0e0;
  margin-bottom: 0.25rem;
}

.card-label {
  font-size: 0.875rem;
  color: #999;
  margin-bottom: 0.25rem;
}

.card-detail {
  font-size: 0.75rem;
  color: #666;
}

.sensitivity-section {
  background: #2d2d2d;
  border: 1px solid #444;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #e0e0e0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.btn-secondary {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-secondary:hover {
  background: #2563eb;
}

.sensitivity-chart {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sensitivity-bar {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.bar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bar-label {
  font-size: 0.875rem;
  color: #e0e0e0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.level-icon {
  font-size: 1rem;
}

.bar-value {
  font-size: 0.875rem;
  color: #999;
  font-weight: 500;
}

.bar-track {
  height: 8px;
  background: #1a1a1a;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.privacy-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.privacy-section {
  background: #2d2d2d;
  border: 1px solid #444;
  border-radius: 8px;
  padding: 1.5rem;
}

.section-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.status-badge.success {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.status-badge.warning {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.75rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-value {
  font-size: 1rem;
  font-weight: 600;
  color: #e0e0e0;
}

.info-value.warning {
  color: #f59e0b;
}

.section-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.quick-actions-section {
  background: #2d2d2d;
  border: 1px solid #444;
  border-radius: 8px;
  padding: 1.5rem;
}

.quick-actions-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #e0e0e0;
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.quick-action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem 1rem;
  background: #1a1a1a;
  border: 1px solid #444;
  border-radius: 6px;
  color: #e0e0e0;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-action-btn:hover {
  background: #242424;
  border-color: #3b82f6;
  color: #3b82f6;
}

.quick-action-btn svg {
  width: 2rem;
  height: 2rem;
}

.privacy-dashboard.loading,
.privacy-dashboard.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid #444;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.privacy-dashboard.loading p {
  margin-top: 1rem;
  color: #999;
}

.error-icon {
  width: 4rem;
  height: 4rem;
  color: #ef4444;
  margin-bottom: 1rem;
}

.privacy-dashboard.error h3 {
  margin: 0 0 0.5rem 0;
  color: #e0e0e0;
}

.privacy-dashboard.error p {
  margin: 0 0 1.5rem 0;
  color: #999;
}

.btn-primary {
  padding: 0.625rem 1.5rem;
  background: #3b82f6;
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #2563eb;
}
`;
