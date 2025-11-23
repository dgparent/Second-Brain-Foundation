/**
 * Sensitivity Classification Component
 * 
 * UI for classifying entity sensitivity levels, bulk operations,
 * and auto-classification settings.
 */

export type SensitivityLevel = 'public' | 'internal' | 'confidential' | 'restricted' | 'secret';

// Map string levels to numeric PrivacyLevel enum
const SENSITIVITY_TO_PRIVACY_LEVEL: Record<SensitivityLevel, number> = {
  'public': 0,      // PrivacyLevel.Public
  'internal': 1,    // PrivacyLevel.Personal  
  'confidential': 2, // PrivacyLevel.Private
  'restricted': 3,  // PrivacyLevel.Confidential
  'secret': 3,      // PrivacyLevel.Confidential
};

export interface EntityClassification {
  id: string;
  title: string;
  type: string;
  currentLevel: SensitivityLevel | null;
  suggestedLevel?: SensitivityLevel;
  confidence?: number;
  lastModified: Date;
}

export interface ClassificationRule {
  id: string;
  name: string;
  pattern: string;
  level: SensitivityLevel;
  enabled: boolean;
  priority: number;
}

export interface SensitivityClassificationOptions {
  onClassify?: (entityId: string, level: SensitivityLevel) => void;
  onBulkClassify?: (entityIds: string[], level: SensitivityLevel) => void;
}

export class SensitivityClassification {
  private container: HTMLElement;
  private options: SensitivityClassificationOptions;
  private entities: EntityClassification[] = [];
  private rules: ClassificationRule[] = [];
  private selectedEntityIds: Set<string> = new Set();
  private filterLevel: SensitivityLevel | 'all' | 'unclassified' = 'all';
  private searchQuery: string = '';
  private loading: boolean = true;
  private showRulesPanel: boolean = false;

  private readonly SENSITIVITY_LEVELS = [
    {
      value: 'public' as SensitivityLevel,
      label: 'Public',
      icon: '🌍',
      color: '#10b981',
      description: 'Can be shared publicly without restrictions',
    },
    {
      value: 'internal' as SensitivityLevel,
      label: 'Internal',
      icon: '🏢',
      color: '#3b82f6',
      description: 'For internal use only, not public',
    },
    {
      value: 'confidential' as SensitivityLevel,
      label: 'Confidential',
      icon: '🔒',
      color: '#f59e0b',
      description: 'Sensitive information, limited access',
    },
    {
      value: 'restricted' as SensitivityLevel,
      label: 'Restricted',
      icon: '⚠️',
      color: '#f97316',
      description: 'Highly sensitive, strict access control',
    },
    {
      value: 'secret' as SensitivityLevel,
      label: 'Secret',
      icon: '🔐',
      color: '#ef4444',
      description: 'Maximum security, minimal access',
    },
  ];

  constructor(container: HTMLElement, options: SensitivityClassificationOptions = {}) {
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
      const entities = await window.sbfAPI.privacy.getEntitiesForClassification();
      const rules = []; // Rules not yet supported in API

      this.entities = entities.map((e: any) => ({
        ...e,
        lastModified: new Date(e.lastModified),
      }));

      this.rules = rules;
      this.loading = false;
      this.render();
    } catch (error) {
      console.error('Failed to load classification data:', error);
      this.loading = false;
      this.render();
    }
  }

  private async classifyEntity(entityId: string, level: SensitivityLevel) {
    try {
      const numericLevel = SENSITIVITY_TO_PRIVACY_LEVEL[level];
      await window.sbfAPI.privacy.classifyEntity({ entityId, level: numericLevel });
      
      const entity = this.entities.find(e => e.id === entityId);
      if (entity) {
        entity.currentLevel = level;
      }

      this.options.onClassify?.(entityId, level);
      this.render();
    } catch (error) {
      console.error('Failed to classify entity:', error);
      alert('Failed to classify entity. Please try again.');
    }
  }

  private async bulkClassify(level: SensitivityLevel) {
    if (this.selectedEntityIds.size === 0) {
      alert('Please select at least one entity');
      return;
    }

    if (!confirm(`Classify ${this.selectedEntityIds.size} entities as ${level}?`)) {
      return;
    }

    try {
      const entityIds = Array.from(this.selectedEntityIds);
      const numericLevel = SENSITIVITY_TO_PRIVACY_LEVEL[level];
      await window.sbfAPI.privacy.bulkClassify({ entityIds, level: numericLevel });

      entityIds.forEach(id => {
        const entity = this.entities.find(e => e.id === id);
        if (entity) {
          entity.currentLevel = level;
        }
      });

      this.selectedEntityIds.clear();
      this.options.onBulkClassify?.(entityIds, level);
      this.render();
    } catch (error) {
      console.error('Failed to bulk classify:', error);
      alert('Failed to bulk classify entities. Please try again.');
    }
  }

  private async runAutoClassification() {
    if (!confirm('Run auto-classification on all unclassified entities?')) {
      return;
    }

    try {
      // Auto-classification not yet supported in API
      alert('Auto-classification feature coming soon');
      await this.loadData();
    } catch (error) {
      console.error('Failed to run auto-classification:', error);
      alert('Failed to run auto-classification. Please try again.');
    }
  }

  private toggleEntitySelection(entityId: string) {
    if (this.selectedEntityIds.has(entityId)) {
      this.selectedEntityIds.delete(entityId);
    } else {
      this.selectedEntityIds.add(entityId);
    }
    this.render();
  }

  private toggleSelectAll() {
    const filtered = this.getFilteredEntities();
    
    if (this.selectedEntityIds.size === filtered.length) {
      this.selectedEntityIds.clear();
    } else {
      filtered.forEach(e => this.selectedEntityIds.add(e.id));
    }
    
    this.render();
  }

  private getFilteredEntities(): EntityClassification[] {
    return this.entities.filter(entity => {
      // Filter by level
      if (this.filterLevel === 'unclassified') {
        if (entity.currentLevel !== null) return false;
      } else if (this.filterLevel !== 'all') {
        if (entity.currentLevel !== this.filterLevel) return false;
      }

      // Filter by search query
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        const matches = 
          entity.title.toLowerCase().includes(query) ||
          entity.type.toLowerCase().includes(query);
        if (!matches) return false;
      }

      return true;
    });
  }

  private render() {
    if (this.loading) {
      this.container.innerHTML = '<div class="classification-loading">Loading...</div>';
      return;
    }

    this.container.innerHTML = `
      <div class="sensitivity-classification">
        ${this.renderHeader()}
        ${this.renderFilters()}
        ${this.renderBulkActions()}
        ${this.renderLegend()}
        ${this.renderEntityList()}
        ${this.showRulesPanel ? this.renderRulesPanel() : ''}
      </div>
    `;

    this.attachEventListeners();
  }

  private renderHeader(): string {
    const unclassified = this.entities.filter(e => e.currentLevel === null).length;
    
    return `
      <div class="classification-header">
        <div>
          <h2>Sensitivity Classification</h2>
          <p class="subtitle">
            ${this.entities.length} total entities
            ${unclassified > 0 ? `• ${unclassified} unclassified` : ''}
          </p>
        </div>
        <div class="header-actions">
          <button class="btn-secondary" data-action="run-auto">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Auto-Classify
          </button>
          <button class="btn-secondary" data-action="toggle-rules">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Rules (${this.rules.filter(r => r.enabled).length})
          </button>
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

  private renderFilters(): string {
    return `
      <div class="classification-filters">
        <div class="filter-group">
          <label>Filter by Level:</label>
          <select class="filter-select" data-filter="level">
            <option value="all" ${this.filterLevel === 'all' ? 'selected' : ''}>All</option>
            <option value="unclassified" ${this.filterLevel === 'unclassified' ? 'selected' : ''}>Unclassified</option>
            ${this.SENSITIVITY_LEVELS.map(level => `
              <option value="${level.value}" ${this.filterLevel === level.value ? 'selected' : ''}>
                ${level.icon} ${level.label}
              </option>
            `).join('')}
          </select>
        </div>

        <div class="filter-group search-group">
          <input 
            type="text" 
            class="search-input" 
            placeholder="Search entities..." 
            value="${this.searchQuery}"
            data-filter="search"
          />
        </div>
      </div>
    `;
  }

  private renderBulkActions(): string {
    const selectedCount = this.selectedEntityIds.size;
    
    if (selectedCount === 0) return '';

    return `
      <div class="bulk-actions">
        <div class="bulk-info">
          ${selectedCount} selected
        </div>
        <div class="bulk-buttons">
          <span class="bulk-label">Classify as:</span>
          ${this.SENSITIVITY_LEVELS.map(level => `
            <button 
              class="bulk-classify-btn" 
              data-action="bulk-classify" 
              data-level="${level.value}"
              style="background: ${level.color}20; color: ${level.color}; border-color: ${level.color}40;">
              ${level.icon} ${level.label}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  private renderLegend(): string {
    return `
      <div class="sensitivity-legend">
        ${this.SENSITIVITY_LEVELS.map(level => `
          <div class="legend-item">
            <div class="legend-icon" style="background: ${level.color};">
              ${level.icon}
            </div>
            <div class="legend-content">
              <div class="legend-label">${level.label}</div>
              <div class="legend-description">${level.description}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  private renderEntityList(): string {
    const filtered = this.getFilteredEntities();
    const allSelected = filtered.length > 0 && this.selectedEntityIds.size === filtered.length;

    return `
      <div class="entity-list">
        <div class="list-header">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              ${allSelected ? 'checked' : ''}
              data-action="toggle-all"
            />
            <span>Select All (${filtered.length})</span>
          </label>
        </div>
        
        <div class="list-items">
          ${filtered.length === 0 ? this.renderEmpty() : filtered.map(e => this.renderEntityItem(e)).join('')}
        </div>
      </div>
    `;
  }

  private renderEmpty(): string {
    return `
      <div class="empty-state">
        <svg class="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p>No entities found</p>
        <p class="text-muted">Try adjusting your filters</p>
      </div>
    `;
  }

  private renderEntityItem(entity: EntityClassification): string {
    const isSelected = this.selectedEntityIds.has(entity.id);
    const levelInfo = entity.currentLevel 
      ? this.SENSITIVITY_LEVELS.find(l => l.value === entity.currentLevel)
      : null;

    return `
      <div class="entity-item ${isSelected ? 'selected' : ''}">
        <label class="entity-checkbox">
          <input 
            type="checkbox" 
            ${isSelected ? 'checked' : ''}
            data-action="toggle-select"
            data-entity-id="${entity.id}"
          />
        </label>

        <div class="entity-content">
          <div class="entity-header">
            <h4 class="entity-title">${entity.title}</h4>
            <span class="entity-type">${entity.type}</span>
          </div>

          <div class="entity-classification">
            ${entity.currentLevel ? `
              <div class="current-level" style="background: ${levelInfo!.color}20; border-color: ${levelInfo!.color}40;">
                <span style="color: ${levelInfo!.color};">${levelInfo!.icon} ${levelInfo!.label}</span>
              </div>
            ` : `
              <div class="unclassified-badge">Unclassified</div>
            `}

            ${entity.suggestedLevel && entity.suggestedLevel !== entity.currentLevel ? `
              <div class="suggested-level">
                <span class="suggestion-label">Suggested:</span>
                ${this.renderLevelBadge(entity.suggestedLevel)}
                ${entity.confidence ? `<span class="confidence">(${Math.round(entity.confidence * 100)}%)</span>` : ''}
              </div>
            ` : ''}
          </div>
        </div>

        <div class="entity-actions">
          <select 
            class="level-select" 
            data-action="classify-entity" 
            data-entity-id="${entity.id}"
          >
            <option value="">Classify as...</option>
            ${this.SENSITIVITY_LEVELS.map(level => `
              <option value="${level.value}" ${entity.currentLevel === level.value ? 'selected' : ''}>
                ${level.icon} ${level.label}
              </option>
            `).join('')}
          </select>
        </div>
      </div>
    `;
  }

  private renderLevelBadge(level: SensitivityLevel): string {
    const levelInfo = this.SENSITIVITY_LEVELS.find(l => l.value === level)!;
    return `<span class="level-badge" style="background: ${levelInfo.color}20; color: ${levelInfo.color};">${levelInfo.icon} ${levelInfo.label}</span>`;
  }

  private renderRulesPanel(): string {
    return `
      <div class="rules-panel-overlay" data-action="close-rules">
        <div class="rules-panel" onclick="event.stopPropagation()">
          <div class="panel-header">
            <h3>Auto-Classification Rules</h3>
            <button class="btn-close" data-action="close-rules">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="panel-content">
            ${this.rules.length === 0 ? `
              <div class="empty-state">
                <p>No classification rules defined</p>
              </div>
            ` : `
              <div class="rules-list">
                ${this.rules.map(rule => this.renderRule(rule)).join('')}
              </div>
            `}
          </div>

          <div class="panel-footer">
            <button class="btn-secondary" data-action="add-rule">
              Add New Rule
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private renderRule(rule: ClassificationRule): string {
    const levelInfo = this.SENSITIVITY_LEVELS.find(l => l.value === rule.level)!;
    
    return `
      <div class="rule-item ${rule.enabled ? '' : 'disabled'}">
        <div class="rule-header">
          <label class="rule-toggle">
            <input 
              type="checkbox" 
              ${rule.enabled ? 'checked' : ''}
              data-action="toggle-rule"
              data-rule-id="${rule.id}"
            />
            <span class="rule-name">${rule.name}</span>
          </label>
          <span class="rule-priority">Priority: ${rule.priority}</span>
        </div>
        <div class="rule-details">
          <div class="rule-pattern">Pattern: <code>${rule.pattern}</code></div>
          <div class="rule-level">
            Classifies as: ${this.renderLevelBadge(rule.level)}
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

    // Run auto-classification
    this.container.querySelector('[data-action="run-auto"]')?.addEventListener('click', () => {
      this.runAutoClassification();
    });

    // Toggle rules panel
    this.container.querySelectorAll('[data-action="toggle-rules"]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.showRulesPanel = !this.showRulesPanel;
        this.render();
      });
    });

    this.container.querySelectorAll('[data-action="close-rules"]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.showRulesPanel = false;
        this.render();
      });
    });

    // Filters
    const levelFilter = this.container.querySelector('[data-filter="level"]') as HTMLSelectElement;
    levelFilter?.addEventListener('change', () => {
      this.filterLevel = levelFilter.value as any;
      this.render();
    });

    const searchInput = this.container.querySelector('[data-filter="search"]') as HTMLInputElement;
    searchInput?.addEventListener('input', () => {
      this.searchQuery = searchInput.value;
      this.render();
    });

    // Select all
    this.container.querySelector('[data-action="toggle-all"]')?.addEventListener('change', () => {
      this.toggleSelectAll();
    });

    // Toggle individual selection
    this.container.querySelectorAll('[data-action="toggle-select"]').forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        const entityId = (checkbox as HTMLElement).dataset.entityId!;
        this.toggleEntitySelection(entityId);
      });
    });

    // Bulk classify
    this.container.querySelectorAll('[data-action="bulk-classify"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const level = (btn as HTMLElement).dataset.level as SensitivityLevel;
        this.bulkClassify(level);
      });
    });

    // Classify entity
    this.container.querySelectorAll('[data-action="classify-entity"]').forEach(select => {
      select.addEventListener('change', () => {
        const elem = select as HTMLSelectElement;
        const entityId = elem.dataset.entityId!;
        const level = elem.value as SensitivityLevel;
        
        if (level) {
          this.classifyEntity(entityId, level);
        }
      });
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
export const SENSITIVITY_CLASSIFICATION_CSS = `
.sensitivity-classification {
  padding: 1.5rem;
  background: #1a1a1a;
  min-height: 100vh;
}

.classification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.classification-header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #e0e0e0;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.classification-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #2d2d2d;
  border: 1px solid #444;
  border-radius: 8px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.875rem;
  color: #999;
  white-space: nowrap;
}

.search-group {
  flex: 1;
}

.filter-select,
.search-input {
  padding: 0.5rem 0.75rem;
  background: #1a1a1a;
  border: 1px solid #444;
  border-radius: 6px;
  color: #e0e0e0;
  font-size: 0.875rem;
}

.search-input {
  width: 100%;
}

.bulk-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #2563eb20;
  border: 1px solid #2563eb40;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.bulk-info {
  font-weight: 600;
  color: #3b82f6;
}

.bulk-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.bulk-label {
  font-size: 0.875rem;
  color: #999;
}

.bulk-classify-btn {
  padding: 0.375rem 0.75rem;
  border: 1px solid;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.bulk-classify-btn:hover {
  transform: translateY(-1px);
  opacity: 0.9;
}

.sensitivity-legend {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.legend-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #2d2d2d;
  border: 1px solid #444;
  border-radius: 6px;
}

.legend-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.legend-content {
  flex: 1;
}

.legend-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #e0e0e0;
  margin-bottom: 0.25rem;
}

.legend-description {
  font-size: 0.75rem;
  color: #999;
}

.entity-list {
  background: #2d2d2d;
  border: 1px solid #444;
  border-radius: 8px;
}

.list-header {
  padding: 1rem;
  border-bottom: 1px solid #444;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #e0e0e0;
  cursor: pointer;
}

.list-items {
  max-height: 600px;
  overflow-y: auto;
}

.entity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #2d2d2d;
  transition: background 0.2s;
}

.entity-item:hover {
  background: #242424;
}

.entity-item.selected {
  background: #1e2a35;
}

.entity-checkbox {
  flex-shrink: 0;
}

.entity-content {
  flex: 1;
}

.entity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.entity-title {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #e0e0e0;
}

.entity-type {
  font-size: 0.75rem;
  color: #999;
  padding: 0.125rem 0.5rem;
  background: #1a1a1a;
  border-radius: 12px;
}

.entity-classification {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.current-level,
.unclassified-badge {
  padding: 0.25rem 0.75rem;
  border: 1px solid;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.unclassified-badge {
  background: #66666620;
  border-color: #66666640;
  color: #999;
}

.suggested-level {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
}

.suggestion-label {
  color: #999;
}

.level-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.confidence {
  color: #999;
}

.entity-actions {
  flex-shrink: 0;
}

.level-select {
  padding: 0.5rem 0.75rem;
  background: #1a1a1a;
  border: 1px solid #444;
  border-radius: 6px;
  color: #e0e0e0;
  font-size: 0.875rem;
  cursor: pointer;
}

.rules-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.rules-panel {
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  background: #1a1a1a;
  border: 1px solid #444;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #444;
}

.panel-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #e0e0e0;
}

.btn-close {
  background: none;
  border: none;
  color: #e0e0e0;
  cursor: pointer;
  padding: 0.25rem;
  width: 2rem;
  height: 2rem;
}

.btn-close:hover {
  color: #ef4444;
}

.btn-close svg {
  width: 1.25rem;
  height: 1.25rem;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.rules-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.rule-item {
  padding: 1rem;
  background: #2d2d2d;
  border: 1px solid #444;
  border-radius: 6px;
}

.rule-item.disabled {
  opacity: 0.5;
}

.rule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.rule-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.rule-name {
  font-weight: 600;
  color: #e0e0e0;
}

.rule-priority {
  font-size: 0.75rem;
  color: #999;
}

.rule-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.rule-pattern code {
  background: #1a1a1a;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  color: #3b82f6;
}

.panel-footer {
  padding: 1rem;
  border-top: 1px solid #444;
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

.text-muted {
  color: #999;
  font-size: 0.875rem;
}
`;
