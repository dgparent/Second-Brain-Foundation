/**
 * Lifecycle Dashboard Component
 * Displays entities grouped by lifecycle state with statistics and controls
 */

export enum LifecycleState {
  Active = 'active',
  Stale = 'stale',
  Archived = 'archived',
  Dissolved = 'dissolved',
}

export interface LifecycleStats {
  active: number;
  stale: number;
  archived: number;
  dissolved: number;
  total: number;
}

export interface EntitySummary {
  id: string;
  title: string;
  type: string;
  state: LifecycleState;
  lastModified: Date;
  createdAt: Date;
  daysSinceModified: number;
}

export interface LifecycleDashboardOptions {
  onEntityClick?: (entityId: string) => void;
  onStateChange?: (entityId: string, newState: LifecycleState) => void;
  onRefresh?: () => void;
}

export class LifecycleDashboard {
  private container: HTMLElement;
  private options: LifecycleDashboardOptions;
  private stats: LifecycleStats | null = null;
  private entities: EntitySummary[] = [];
  private selectedState: LifecycleState | 'all' = 'all';
  private searchQuery: string = '';

  constructor(container: HTMLElement, options: LifecycleDashboardOptions = {}) {
    this.container = container;
    this.options = options;
    this.loadData();
  }

  private async loadData(): Promise<void> {
    try {
      // Fetch data from backend via IPC
      const [stats, entities] = await Promise.all([
        (window as any).electron.invoke('lifecycle:getStats'),
        (window as any).electron.invoke('lifecycle:getAllEntities'),
      ]);

      this.stats = stats;
      this.entities = entities.map((e: any) => ({
        ...e,
        lastModified: new Date(e.lastModified),
        createdAt: new Date(e.createdAt),
      }));

      this.render();
    } catch (error) {
      console.error('Failed to load lifecycle data:', error);
      this.renderError();
    }
  }

  private render(): void {
    if (!this.stats) {
      this.renderLoading();
      return;
    }

    const filteredEntities = this.getFilteredEntities();

    this.container.innerHTML = `
      <div class="lifecycle-dashboard">
        ${this.renderHeader()}
        ${this.renderStatsCards()}
        ${this.renderFilters()}
        ${this.renderEntityList(filteredEntities)}
      </div>
    `;

    this.attachEventListeners();
  }

  private renderHeader(): string {
    return `
      <div class="lifecycle-header">
        <div class="lifecycle-title">
          <h2>🔄 Lifecycle Management</h2>
          <p class="lifecycle-subtitle">Manage entity lifecycle states and automation</p>
        </div>
        <button class="btn-refresh" data-action="refresh">
          <span>🔄</span>
          <span>Refresh</span>
        </button>
      </div>
    `;
  }

  private renderStatsCards(): string {
    if (!this.stats) return '';

    const cards = [
      {
        state: 'active' as const,
        label: 'Active',
        icon: '✅',
        color: '#10b981',
        description: 'Recently modified entities',
      },
      {
        state: 'stale' as const,
        label: 'Stale',
        icon: '⏳',
        color: '#f59e0b',
        description: 'Not modified in 14+ days',
      },
      {
        state: 'archived' as const,
        label: 'Archived',
        icon: '📦',
        color: '#3b82f6',
        description: 'Not modified in 30+ days',
      },
      {
        state: 'dissolved' as const,
        label: 'Dissolved',
        icon: '💨',
        color: '#999',
        description: 'Content extracted, file removed',
      },
    ];

    return `
      <div class="lifecycle-stats">
        ${cards.map(card => {
          const count = this.stats![card.state];
          const percentage = this.stats!.total > 0 
            ? ((count / this.stats!.total) * 100).toFixed(1)
            : '0.0';

          return `
            <div 
              class="lifecycle-stat-card ${this.selectedState === card.state ? 'active' : ''}"
              data-state="${card.state}"
              style="border-left-color: ${card.color};"
            >
              <div class="stat-icon" style="color: ${card.color};">${card.icon}</div>
              <div class="stat-content">
                <div class="stat-label">${card.label}</div>
                <div class="stat-count">${count}</div>
                <div class="stat-percentage">${percentage}%</div>
                <div class="stat-description">${card.description}</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  private renderFilters(): string {
    return `
      <div class="lifecycle-filters">
        <div class="filter-group">
          <label for="state-filter">Filter by State:</label>
          <select id="state-filter" class="state-filter">
            <option value="all" ${this.selectedState === 'all' ? 'selected' : ''}>All States</option>
            <option value="active" ${this.selectedState === 'active' ? 'selected' : ''}>Active</option>
            <option value="stale" ${this.selectedState === 'stale' ? 'selected' : ''}>Stale</option>
            <option value="archived" ${this.selectedState === 'archived' ? 'selected' : ''}>Archived</option>
            <option value="dissolved" ${this.selectedState === 'dissolved' ? 'selected' : ''}>Dissolved</option>
          </select>
        </div>
        <div class="filter-group">
          <label for="search-input">Search:</label>
          <input 
            type="text" 
            id="search-input" 
            class="search-input" 
            placeholder="Search entities..."
            value="${this.searchQuery}"
          />
        </div>
      </div>
    `;
  }

  private renderEntityList(entities: EntitySummary[]): string {
    if (entities.length === 0) {
      return `
        <div class="entity-list-empty">
          <div class="empty-icon">📭</div>
          <div class="empty-text">No entities found</div>
          <div class="empty-subtext">
            ${this.searchQuery ? 'Try a different search query' : 'No entities match the selected filters'}
          </div>
        </div>
      `;
    }

    return `
      <div class="entity-list">
        <div class="entity-list-header">
          <span>${entities.length} ${entities.length === 1 ? 'entity' : 'entities'}</span>
        </div>
        <div class="entity-list-items">
          ${entities.map(entity => this.renderEntityItem(entity)).join('')}
        </div>
      </div>
    `;
  }

  private renderEntityItem(entity: EntitySummary): string {
    const stateConfig = this.getStateConfig(entity.state);

    return `
      <div class="entity-item" data-entity-id="${entity.id}">
        <div class="entity-icon" style="color: ${stateConfig.color};">
          ${stateConfig.icon}
        </div>
        <div class="entity-content">
          <div class="entity-title">${this.escapeHtml(entity.title)}</div>
          <div class="entity-meta">
            <span class="entity-type">${entity.type}</span>
            <span class="entity-separator">•</span>
            <span class="entity-modified">Modified ${this.formatRelativeTime(entity.lastModified)}</span>
            <span class="entity-separator">•</span>
            <span class="entity-days">${entity.daysSinceModified} days old</span>
          </div>
        </div>
        <div class="entity-state">
          <span class="state-badge" style="background: ${stateConfig.color}20; color: ${stateConfig.color};">
            ${entity.state}
          </span>
        </div>
        <button 
          class="entity-action-btn" 
          data-action="view" 
          data-entity-id="${entity.id}"
          title="View details"
        >
          👁️
        </button>
      </div>
    `;
  }

  private renderLoading(): void {
    this.container.innerHTML = `
      <div class="lifecycle-loading">
        <div class="loading-spinner"></div>
        <div class="loading-text">Loading lifecycle data...</div>
      </div>
    `;
  }

  private renderError(): void {
    this.container.innerHTML = `
      <div class="lifecycle-error">
        <div class="error-icon">⚠️</div>
        <div class="error-text">Failed to load lifecycle data</div>
        <button class="btn-retry" data-action="refresh">Try Again</button>
      </div>
    `;
    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    // Refresh button
    this.container.querySelectorAll('[data-action="refresh"]').forEach(btn => {
      btn.addEventListener('click', () => this.refresh());
    });

    // State cards
    this.container.querySelectorAll('.lifecycle-stat-card').forEach(card => {
      card.addEventListener('click', () => {
        const state = (card as HTMLElement).dataset.state as LifecycleState;
        this.selectedState = this.selectedState === state ? 'all' : state;
        this.render();
      });
    });

    // State filter
    const stateFilter = this.container.querySelector('#state-filter');
    if (stateFilter) {
      stateFilter.addEventListener('change', (e) => {
        this.selectedState = (e.target as HTMLSelectElement).value as LifecycleState | 'all';
        this.render();
      });
    }

    // Search input
    const searchInput = this.container.querySelector('#search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = (e.target as HTMLInputElement).value;
        this.render();
      });
    }

    // Entity click
    this.container.querySelectorAll('[data-action="view"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const entityId = (e.currentTarget as HTMLElement).dataset.entityId!;
        if (this.options.onEntityClick) {
          this.options.onEntityClick(entityId);
        }
      });
    });
  }

  private getFilteredEntities(): EntitySummary[] {
    let filtered = this.entities;

    // Filter by state
    if (this.selectedState !== 'all') {
      filtered = filtered.filter(e => e.state === this.selectedState);
    }

    // Filter by search query
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(query) ||
        e.type.toLowerCase().includes(query)
      );
    }

    // Sort by most recently modified
    filtered.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());

    return filtered;
  }

  private getStateConfig(state: LifecycleState) {
    const configs = {
      active: { icon: '✅', color: '#10b981' },
      stale: { icon: '⏳', color: '#f59e0b' },
      archived: { icon: '📦', color: '#3b82f6' },
      dissolved: { icon: '💨', color: '#999' },
    };
    return configs[state];
  }

  private formatRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  public refresh(): void {
    this.renderLoading();
    this.loadData();
    if (this.options.onRefresh) {
      this.options.onRefresh();
    }
  }

  public destroy(): void {
    this.container.innerHTML = '';
  }
}

// Component CSS
export const LIFECYCLE_DASHBOARD_CSS = `
.lifecycle-dashboard {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.lifecycle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.lifecycle-title h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #e0e0e0;
  margin: 0 0 0.5rem 0;
}

.lifecycle-subtitle {
  color: #999;
  margin: 0;
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
  cursor: pointer;
  transition: all 0.2s;
}

.btn-refresh:hover {
  background: #3d3d3d;
  border-color: #555;
}

.lifecycle-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.lifecycle-stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: #2d2d2d;
  border: 1px solid #444;
  border-left: 4px solid;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.lifecycle-stat-card:hover {
  background: #3d3d3d;
  border-color: #555;
  transform: translateY(-2px);
}

.lifecycle-stat-card.active {
  background: #3d3d3d;
  border-width: 2px;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.stat-icon {
  font-size: 2rem;
  line-height: 1;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.stat-count {
  font-size: 2rem;
  font-weight: 700;
  color: #e0e0e0;
  line-height: 1.2;
}

.stat-percentage {
  font-size: 0.875rem;
  color: #3b82f6;
  margin-top: 0.25rem;
}

.stat-description {
  font-size: 0.75rem;
  color: #666;
  margin-top: 0.25rem;
}

.lifecycle-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #2d2d2d;
  border-radius: 8px;
}

.filter-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.875rem;
  color: #999;
  font-weight: 500;
}

.state-filter,
.search-input {
  padding: 0.625rem;
  background: #242424;
  border: 1px solid #444;
  border-radius: 6px;
  color: #e0e0e0;
  font-size: 0.875rem;
}

.state-filter:focus,
.search-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.entity-list-header {
  padding: 0.75rem 1rem;
  background: #2d2d2d;
  border-radius: 8px 8px 0 0;
  font-size: 0.875rem;
  color: #999;
  font-weight: 500;
}

.entity-list-items {
  background: #242424;
  border-radius: 0 0 8px 8px;
  overflow: hidden;
}

.entity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #2d2d2d;
  transition: background 0.2s;
}

.entity-item:last-child {
  border-bottom: none;
}

.entity-item:hover {
  background: #2d2d2d;
}

.entity-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.entity-content {
  flex: 1;
  min-width: 0;
}

.entity-title {
  font-size: 1rem;
  font-weight: 500;
  color: #e0e0e0;
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.entity-meta {
  font-size: 0.875rem;
  color: #999;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.entity-separator {
  color: #666;
}

.entity-state {
  flex-shrink: 0;
}

.state-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.entity-action-btn {
  flex-shrink: 0;
  padding: 0.5rem;
  background: #2d2d2d;
  border: 1px solid #444;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1.25rem;
}

.entity-action-btn:hover {
  background: #3d3d3d;
  border-color: #555;
}

.entity-list-empty {
  padding: 4rem 2rem;
  text-align: center;
  background: #242424;
  border-radius: 8px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-text {
  font-size: 1.25rem;
  font-weight: 600;
  color: #e0e0e0;
  margin-bottom: 0.5rem;
}

.empty-subtext {
  color: #999;
}

.lifecycle-loading,
.lifecycle-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  min-height: 400px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #2d2d2d;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  margin-top: 1rem;
  color: #999;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.error-text {
  font-size: 1.25rem;
  font-weight: 600;
  color: #e0e0e0;
  margin-bottom: 1.5rem;
}

.btn-retry {
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  border: none;
  border-radius: 6px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-retry:hover {
  background: #2563eb;
}
`;
