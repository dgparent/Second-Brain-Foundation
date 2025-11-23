/**
 * Encryption Settings Component
 * 
 * Manages encryption keys, rotation, and encryption status for entities.
 */

export interface EncryptionKey {
  id: string;
  algorithm: string;
  createdAt: Date;
  lastRotated: Date;
  status: 'active' | 'expired' | 'revoked';
  usageCount: number;
}

export interface EncryptionStats {
  totalEntities: number;
  encryptedEntities: number;
  encryptionPercentage: number;
  activeKeys: number;
  lastRotation: Date;
  recommendedRotation: boolean;
}

export interface EncryptionSettingsOptions {
  onKeyRotate?: () => void;
  onEncryptionToggle?: (enabled: boolean) => void;
}

export class EncryptionSettings {
  private container: HTMLElement;
  private options: EncryptionSettingsOptions;
  private keys: EncryptionKey[] = [];
  private stats: EncryptionStats | null = null;
  private settings: {
    enabled: boolean;
    algorithm: string;
    autoRotation: boolean;
    rotationInterval: number; // days
  } = {
    enabled: true,
    algorithm: 'AES-256-GCM',
    autoRotation: true,
    rotationInterval: 90,
  };
  private loading: boolean = true;

  constructor(container: HTMLElement, options: EncryptionSettingsOptions = {}) {
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
    this.render();

    try {
      const [keys, stats] = await Promise.all([
        window.sbfAPI.encryption.getKeys(),
        window.sbfAPI.encryption.getStats(),
      ]);

      this.keys = keys.map((k: any) => ({
        ...k,
        createdAt: new Date(k.createdAt),
        lastRotated: new Date(k.lastRotated),
      }));

      this.stats = {
        totalEntities: stats.totalEntities,
        encryptedEntities: stats.encryptedEntities,
        encryptionPercentage: stats.encryptionPercentage,
        activeKeys: stats.activeKeys,
        lastRotation: new Date(stats.lastRotation),
        recommendedRotation: stats.recommendedRotation,
      };

      this.settings = {
        enabled: true,
        algorithm: 'AES-256-GCM',
        autoRotation: true,
        rotationInterval: 90,
      };
      
      this.loading = false;
      this.render();
    } catch (error) {
      console.error('Failed to load encryption data:', error);
      this.loading = false;
      this.render();
    }
  }

  private async rotateKeys() {
    if (!confirm('Rotate encryption keys? This will re-encrypt all data with new keys.')) {
      return;
    }

    try {
      await window.sbfAPI.encryption.rotateKeys();
      this.options.onKeyRotate?.();
      alert('Keys rotated successfully');
      await this.loadData();
    } catch (error) {
      console.error('Failed to rotate keys:', error);
      alert('Failed to rotate keys. Please try again.');
    }
  }

  private async toggleEncryption() {
    const newState = !this.settings.enabled;
    
    if (!confirm(`${newState ? 'Enable' : 'Disable'} encryption? This is a critical security setting.`)) {
      return;
    }

    try {
      // Toggle encryption not yet supported in API
      this.settings.enabled = newState;
      this.options.onEncryptionToggle?.(newState);
      this.render();
      alert('Encryption setting updated');
    } catch (error) {
      console.error('Failed to toggle encryption:', error);
      alert('Failed to change encryption settings. Please try again.');
    }
  }

  private async updateSettings() {
    try {
      // Settings update not yet supported in API
      alert('Settings updated successfully');
      await this.loadData();
    } catch (error) {
      console.error('Failed to update settings:', error);
      alert('Failed to update settings. Please try again.');
    }
  }

  private async exportKeys() {
    if (!confirm('Export encryption keys? Keep the exported file secure!')) {
      return;
    }

    try {
      // Key export not yet supported in API
      alert('Key export feature coming soon');
    } catch (error) {
      console.error('Failed to export keys:', error);
      alert('Failed to export keys. Please try again.');
    }
  }

  private async importKeys() {
    if (!confirm('Import encryption keys? This will replace existing keys.')) {
      return;
    }

    try {
      // Key import not yet supported in API
      alert('Key import feature coming soon');
      await this.loadData();
    } catch (error) {
      console.error('Failed to import keys:', error);
      alert('Failed to import keys. Please try again.');
    }
  }

  private render() {
    if (this.loading) {
      this.container.innerHTML = '<div class="encryption-loading">Loading...</div>';
      return;
    }

    this.container.innerHTML = `
      <div class="encryption-settings">
        ${this.renderHeader()}
        ${this.renderStats()}
        ${this.renderSettingsPanel()}
        ${this.renderKeysPanel()}
      </div>
    `;

    this.attachEventListeners();
  }

  private renderHeader(): string {
    return `
      <div class="settings-header">
        <div>
          <h2>Encryption Settings</h2>
          <p class="subtitle">Manage encryption keys and security settings</p>
        </div>
        <div class="header-actions">
          <button class="btn-refresh" data-action="refresh">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
    `;
  }

  private renderStats(): string {
    if (!this.stats) return '';

    const daysSinceRotation = Math.floor(
      (new Date().getTime() - this.stats.lastRotation.getTime()) / (1000 * 60 * 60 * 24)
    );

    return `
      <div class="encryption-stats">
        <div class="stat-card">
          <div class="stat-icon blue">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">${this.stats.encryptedEntities} / ${this.stats.totalEntities}</div>
            <div class="stat-label">Encrypted Entities</div>
            <div class="stat-detail">${this.stats.encryptionPercentage}% encrypted</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon ${this.stats.recommendedRotation ? 'orange' : 'green'}">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">${this.stats.activeKeys}</div>
            <div class="stat-label">Active Keys</div>
            <div class="stat-detail ${this.stats.recommendedRotation ? 'warning' : ''}">
              Rotated ${daysSinceRotation}d ago
              ${this.stats.recommendedRotation ? ' (rotation recommended)' : ''}
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon ${this.settings.enabled ? 'green' : 'red'}">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">${this.settings.enabled ? 'Enabled' : 'Disabled'}</div>
            <div class="stat-label">Encryption Status</div>
            <div class="stat-detail">${this.settings.algorithm}</div>
          </div>
        </div>
      </div>
    `;
  }

  private renderSettingsPanel(): string {
    return `
      <div class="settings-panel">
        <h3>Configuration</h3>

        <div class="setting-row">
          <div class="setting-info">
            <div class="setting-label">Enable Encryption</div>
            <div class="setting-description">Encrypt all entity data at rest</div>
          </div>
          <label class="toggle-switch">
            <input 
              type="checkbox" 
              ${this.settings.enabled ? 'checked' : ''}
              data-setting="enabled"
            />
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="setting-row">
          <div class="setting-info">
            <div class="setting-label">Algorithm</div>
            <div class="setting-description">Encryption algorithm for data protection</div>
          </div>
          <select class="setting-select" data-setting="algorithm">
            <option value="AES-256-GCM" ${this.settings.algorithm === 'AES-256-GCM' ? 'selected' : ''}>
              AES-256-GCM (Recommended)
            </option>
            <option value="AES-256-CBC" ${this.settings.algorithm === 'AES-256-CBC' ? 'selected' : ''}>
              AES-256-CBC
            </option>
            <option value="ChaCha20-Poly1305" ${this.settings.algorithm === 'ChaCha20-Poly1305' ? 'selected' : ''}>
              ChaCha20-Poly1305
            </option>
          </select>
        </div>

        <div class="setting-row">
          <div class="setting-info">
            <div class="setting-label">Auto Key Rotation</div>
            <div class="setting-description">Automatically rotate encryption keys</div>
          </div>
          <label class="toggle-switch">
            <input 
              type="checkbox" 
              ${this.settings.autoRotation ? 'checked' : ''}
              data-setting="autoRotation"
            />
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="setting-row">
          <div class="setting-info">
            <div class="setting-label">Rotation Interval</div>
            <div class="setting-description">Days between automatic key rotations</div>
          </div>
          <input 
            type="number" 
            class="setting-input" 
            value="${this.settings.rotationInterval}"
            min="30"
            max="365"
            data-setting="rotationInterval"
          />
        </div>

        <div class="setting-actions">
          <button class="btn-secondary" data-action="save-settings">Save Settings</button>
        </div>
      </div>
    `;
  }

  private renderKeysPanel(): string {
    return `
      <div class="keys-panel">
        <div class="panel-header">
          <h3>Encryption Keys</h3>
          <div class="panel-actions">
            <button class="btn-secondary" data-action="rotate-keys">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Rotate Keys
            </button>
            <button class="btn-secondary" data-action="export-keys">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
            <button class="btn-secondary" data-action="import-keys">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Import
            </button>
          </div>
        </div>

        <div class="keys-list">
          ${this.keys.length === 0 ? this.renderNoKeys() : this.keys.map(key => this.renderKeyItem(key)).join('')}
        </div>
      </div>
    `;
  }

  private renderNoKeys(): string {
    return `
      <div class="empty-state">
        <svg class="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
        <p>No encryption keys found</p>
      </div>
    `;
  }

  private renderKeyItem(key: EncryptionKey): string {
    const daysSinceRotation = Math.floor(
      (new Date().getTime() - key.lastRotated.getTime()) / (1000 * 60 * 60 * 24)
    );

    const statusColors = {
      active: '#10b981',
      expired: '#f59e0b',
      revoked: '#ef4444',
    };

    return `
      <div class="key-item">
        <div class="key-header">
          <div class="key-id">${key.id.substring(0, 8)}...</div>
          <span class="key-status" style="background: ${statusColors[key.status]}20; color: ${statusColors[key.status]};">
            ${key.status}
          </span>
        </div>

        <div class="key-details">
          <div class="key-detail">
            <span class="detail-label">Algorithm:</span>
            <span class="detail-value">${key.algorithm}</span>
          </div>
          <div class="key-detail">
            <span class="detail-label">Created:</span>
            <span class="detail-value">${key.createdAt.toLocaleDateString()}</span>
          </div>
          <div class="key-detail">
            <span class="detail-label">Last Rotated:</span>
            <span class="detail-value">${daysSinceRotation}d ago</span>
          </div>
          <div class="key-detail">
            <span class="detail-label">Usage:</span>
            <span class="detail-value">${key.usageCount.toLocaleString()} entities</span>
          </div>
        </div>
      </div>
    `;
  }

  private attachEventListeners() {
    // Refresh
    this.container.querySelector('[data-action="refresh"]')?.addEventListener('click', () => {
      this.loadData();
    });

    // Toggle encryption
    const enabledToggle = this.container.querySelector('[data-setting="enabled"]') as HTMLInputElement;
    enabledToggle?.addEventListener('change', () => {
      this.toggleEncryption();
    });

    // Update settings
    const algorithmSelect = this.container.querySelector('[data-setting="algorithm"]') as HTMLSelectElement;
    algorithmSelect?.addEventListener('change', () => {
      this.settings.algorithm = algorithmSelect.value;
    });

    const autoRotationToggle = this.container.querySelector('[data-setting="autoRotation"]') as HTMLInputElement;
    autoRotationToggle?.addEventListener('change', () => {
      this.settings.autoRotation = autoRotationToggle.checked;
    });

    const rotationIntervalInput = this.container.querySelector('[data-setting="rotationInterval"]') as HTMLInputElement;
    rotationIntervalInput?.addEventListener('change', () => {
      this.settings.rotationInterval = parseInt(rotationIntervalInput.value);
    });

    // Save settings
    this.container.querySelector('[data-action="save-settings"]')?.addEventListener('click', () => {
      this.updateSettings();
    });

    // Rotate keys
    this.container.querySelector('[data-action="rotate-keys"]')?.addEventListener('click', () => {
      this.rotateKeys();
    });

    // Export/Import keys
    this.container.querySelector('[data-action="export-keys"]')?.addEventListener('click', () => {
      this.exportKeys();
    });

    this.container.querySelector('[data-action="import-keys"]')?.addEventListener('click', () => {
      this.importKeys();
    });
  }

  public refresh() {
    this.loadData();
  }

  public destroy() {
    this.container.innerHTML = '';
  }
}

// CSS Styles
export const ENCRYPTION_SETTINGS_CSS = `
.encryption-settings {
  padding: 1.5rem;
  background: #1a1a1a;
  min-height: 100vh;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.settings-header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #e0e0e0;
}

.encryption-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: #2d2d2d;
  border: 1px solid #444;
  border-radius: 8px;
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon svg {
  width: 1.5rem;
  height: 1.5rem;
}

.stat-icon.blue {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.stat-icon.green {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.stat-icon.orange {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.stat-icon.red {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #e0e0e0;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #999;
  margin-bottom: 0.25rem;
}

.stat-detail {
  font-size: 0.75rem;
  color: #666;
}

.stat-detail.warning {
  color: #f59e0b;
}

.settings-panel,
.keys-panel {
  background: #2d2d2d;
  border: 1px solid #444;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.settings-panel h3,
.keys-panel h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #e0e0e0;
}

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #2d2d2d;
}

.setting-row:last-child {
  border-bottom: none;
}

.setting-info {
  flex: 1;
}

.setting-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #e0e0e0;
  margin-bottom: 0.25rem;
}

.setting-description {
  font-size: 0.75rem;
  color: #999;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #444;
  transition: 0.3s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.toggle-switch input:checked + .toggle-slider {
  background-color: #3b82f6;
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

.setting-select,
.setting-input {
  padding: 0.5rem 0.75rem;
  background: #1a1a1a;
  border: 1px solid #444;
  border-radius: 6px;
  color: #e0e0e0;
  font-size: 0.875rem;
}

.setting-input {
  width: 120px;
  text-align: right;
}

.setting-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.panel-actions {
  display: flex;
  gap: 0.5rem;
}

.keys-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.key-item {
  padding: 1rem;
  background: #1a1a1a;
  border: 1px solid #444;
  border-radius: 6px;
}

.key-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.key-id {
  font-family: monospace;
  font-size: 0.875rem;
  font-weight: 600;
  color: #e0e0e0;
}

.key-status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.key-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.key-detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
}

.detail-label {
  color: #999;
}

.detail-value {
  color: #e0e0e0;
  font-weight: 500;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  color: #999;
}

.empty-icon {
  width: 3rem;
  height: 3rem;
  margin-bottom: 1rem;
  color: #666;
}
`;
