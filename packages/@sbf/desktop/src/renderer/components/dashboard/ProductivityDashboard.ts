/**
 * ProductivityDashboard.ts
 * Main productivity dashboard with system overview and quick actions
 */

import { VAChat } from '../va/VAChat';

export interface DashboardStats {
  entities: { total: number; recent: number };
  privacy: { encrypted: number; total: number; percentage: number };
  lifecycle: { active: number; stale: number; archived: number };
  tasks: { total: number; completed: number; overdue: number };
}

export interface RecentActivity {
  id: string;
  type: string;
  action: string;
  title: string;
  timestamp: Date;
}

export class ProductivityDashboard {
  private container: HTMLElement;
  private stats: DashboardStats | null = null;
  private activities: RecentActivity[] = [];

  constructor(containerId: string) {
    const element = document.getElementById(containerId);
    if (!element) {
      throw new Error(`Container element #${containerId} not found`);
    }
    this.container = element;
  }

  /**
   * Load data from all APIs
   */
  async loadData(): Promise<void> {
    try {
      // Load lifecycle stats
      const lifecycleStats = await window.sbfAPI.lifecycle.getStats();
      
      // Load privacy stats
      const privacyStats = await window.sbfAPI.privacy.getStats();
      
      // Load entities for recent activity
      const entities = await window.sbfAPI.entities.getAll();
      
      // Calculate stats
      this.stats = {
        entities: {
          total: entities.length,
          recent: entities.filter((e: any) => {
            const created = new Date(e.created_at);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return created > weekAgo;
          }).length
        },
        privacy: {
          encrypted: privacyStats.encryptedEntities || 0,
          total: privacyStats.totalEntities || 0,
          percentage: privacyStats.encryptionPercentage || 0
        },
        lifecycle: {
          active: lifecycleStats.activeEntities || 0,
          stale: lifecycleStats.staleEntities || 0,
          archived: lifecycleStats.archivedEntities || 0
        },
        tasks: {
          total: 0,
          completed: 0,
          overdue: 0
        }
      };

      // Get recent activities (last 10 entities created)
      this.activities = entities
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10)
        .map((entity: any) => ({
          id: entity.id,
          type: entity.type,
          action: 'created',
          title: entity.metadata?.title || entity.type,
          timestamp: new Date(entity.created_at)
        }));

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      throw error;
    }
  }

  /**
   * Render the dashboard
   */
  render(): void {
    if (!this.stats) {
      this.container.innerHTML = '<div class="loading">Loading dashboard...</div>';
      return;
    }

    this.container.innerHTML = `
      <div class="productivity-dashboard">
        <header class="dashboard-header">
          <h1>📊 Second Brain Productivity Dashboard</h1>
        </header>

        <div class="stats-grid">
          ${this.renderStatCard('Entities', this.stats.entities.total, `${this.stats.entities.recent} this week`)}
          ${this.renderStatCard('Privacy', `${this.stats.privacy.percentage.toFixed(1)}%`, 'encrypted')}
          ${this.renderStatCard('Lifecycle', this.stats.lifecycle.active, 'active entities')}
          ${this.renderStatCard('Tasks', this.stats.tasks.total, `${this.stats.tasks.completed} completed`)}
        </div>

        <div class="dashboard-content">
          <div class="main-column">
            <div class="recent-activity">
              <h2>📈 Recent Activity</h2>
              <div class="activity-list">
                ${this.renderRecentActivity()}
              </div>
            </div>
          </div>

          <div class="side-column">
            <div class="quick-actions">
              <h2>⚡ Quick Actions</h2>
              <div class="action-buttons">
                <button class="action-btn" data-action="new-note">
                  <span class="icon">📝</span>
                  <span class="label">New Note</span>
                </button>
                <button class="action-btn" data-action="new-task">
                  <span class="icon">✓</span>
                  <span class="label">New Task</span>
                </button>
                <button class="action-btn" data-action="search">
                  <span class="icon">🔍</span>
                  <span class="label">Search</span>
                </button>
                <button class="action-btn" data-action="analytics">
                  <span class="icon">📊</span>
                  <span class="label">Analytics</span>
                </button>
              </div>
            </div>
            
            <div id="va-chat-container" class="va-chat-panel">
              <!-- VA Chat will be rendered here -->
            </div>
          </div>
        </div>

        <div class="navigation-panel">
          <h2>🧭 Explore</h2>
          <div class="nav-grid">
            <a href="#/knowledge-graph" class="nav-card">
              <span class="icon">🕸️</span>
              <span class="label">Knowledge Graph</span>
            </a>
            <a href="#/analytics" class="nav-card">
              <span class="icon">📈</span>
              <span class="label">Analytics</span>
            </a>
            <a href="#/privacy" class="nav-card">
              <span class="icon">🔒</span>
              <span class="label">Privacy Center</span>
            </a>
            <a href="#/lifecycle" class="nav-card">
              <span class="icon">♻️</span>
              <span class="label">Lifecycle</span>
            </a>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
    this.applyStyles();

    // Initialize VA Chat
    const vaChat = new VAChat('va-chat-container');
    vaChat.render();
  }

  /**
   * Render a stat card
   */
  private renderStatCard(title: string, value: number | string, subtitle: string): string {
    return `
      <div class="stat-card">
        <div class="stat-title">${title}</div>
        <div class="stat-value">${value}</div>
        <div class="stat-subtitle">${subtitle}</div>
      </div>
    `;
  }

  /**
   * Render recent activity list
   */
  private renderRecentActivity(): string {
    if (this.activities.length === 0) {
      return '<div class="empty-state">No recent activity</div>';
    }

    return this.activities.map(activity => {
      const timeAgo = this.formatTimeAgo(activity.timestamp);
      const icon = this.getActivityIcon(activity.type);
      
      return `
        <div class="activity-item" data-id="${activity.id}">
          <span class="activity-icon">${icon}</span>
          <div class="activity-content">
            <div class="activity-title">${activity.title}</div>
            <div class="activity-meta">${activity.action} • ${timeAgo}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Get icon for activity type
   */
  private getActivityIcon(type: string): string {
    const icons: Record<string, string> = {
      task: '✓',
      note: '📝',
      budget: '💰',
      workout: '💪',
      meal: '🍽️',
      medication: '💊',
      default: '📄'
    };
    return icons[type] || icons.default;
  }

  /**
   * Format timestamp as time ago
   */
  private formatTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  }

  /**
   * Attach event listeners
   */
  private attachEventListeners(): void {
    // Quick action buttons
    this.container.querySelectorAll('.action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = (e.currentTarget as HTMLElement).dataset.action;
        this.handleQuickAction(action || '');
      });
    });

    // Activity items
    this.container.querySelectorAll('.activity-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.id;
        this.handleActivityClick(id || '');
      });
    });
  }

  /**
   * Handle quick action
   */
  private handleQuickAction(action: string): void {
    console.log(`Quick action triggered: ${action}`);
    // TODO: Implement action handlers
    switch (action) {
      case 'new-note':
        alert('Create new note - TODO');
        break;
      case 'new-task':
        alert('Create new task - TODO');
        break;
      case 'search':
        alert('Open search - TODO');
        break;
      case 'analytics':
        window.location.hash = '#/analytics';
        break;
    }
  }

  /**
   * Handle activity item click
   */
  private handleActivityClick(id: string): void {
    console.log(`Activity clicked: ${id}`);
    // TODO: Navigate to entity detail view
  }

  /**
   * Apply styles
   */
  private applyStyles(): void {
    const styleId = 'productivity-dashboard-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .productivity-dashboard {
        padding: 2rem;
        background: #1a1a1a;
        color: #E0E0E0;
        font-family: 'Segoe UI', system-ui, sans-serif;
        min-height: 100vh;
      }

      .dashboard-header {
        margin-bottom: 2rem;
      }

      .dashboard-header h1 {
        font-size: 2rem;
        font-weight: 600;
        margin: 0;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
      }

      .stat-card {
        background: #2a2a2a;
        padding: 1.5rem;
        border-radius: 8px;
        border: 1px solid #3a3a3a;
      }

      .stat-title {
        font-size: 0.875rem;
        color: #999;
        margin-bottom: 0.5rem;
      }

      .stat-value {
        font-size: 2rem;
        font-weight: 700;
        color: #4CAF50;
        margin-bottom: 0.25rem;
      }

      .stat-subtitle {
        font-size: 0.875rem;
        color: #666;
      }

      .dashboard-content {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 2rem;
        margin-bottom: 2rem;
      }

      .main-column {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .side-column {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .recent-activity, .quick-actions, .va-chat-panel {
        background: #2a2a2a;
        padding: 1.5rem;
        border-radius: 8px;
        border: 1px solid #3a3a3a;
      }

      .va-chat-panel {
        height: 400px;
        padding: 0; /* Chat component handles its own padding */
        overflow: hidden;
      }

      .recent-activity h2, .quick-actions h2, .navigation-panel h2 {
        font-size: 1.25rem;
        margin: 0 0 1rem 0;
        font-weight: 600;
      }

      .activity-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .activity-item {
        display: flex;
        align-items: center;
        padding: 0.75rem;
        background: #1a1a1a;
        border-radius: 6px;
        cursor: pointer;
        transition: background 0.2s;
      }

      .activity-item:hover {
        background: #333;
      }

      .activity-icon {
        font-size: 1.5rem;
        margin-right: 1rem;
      }

      .activity-content {
        flex: 1;
      }

      .activity-title {
        font-weight: 500;
        margin-bottom: 0.25rem;
      }

      .activity-meta {
        font-size: 0.75rem;
        color: #666;
      }

      .action-buttons {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.75rem;
      }

      .action-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem;
        background: #1a1a1a;
        border: 1px solid #3a3a3a;
        border-radius: 6px;
        color: #E0E0E0;
        cursor: pointer;
        transition: all 0.2s;
      }

      .action-btn:hover {
        background: #333;
        border-color: #4CAF50;
      }

      .action-btn .icon {
        font-size: 1.5rem;
      }

      .action-btn .label {
        font-size: 0.875rem;
      }

      .navigation-panel {
        background: #2a2a2a;
        padding: 1.5rem;
        border-radius: 8px;
        border: 1px solid #3a3a3a;
      }

      .nav-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
      }

      .nav-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        padding: 1.5rem 1rem;
        background: #1a1a1a;
        border: 1px solid #3a3a3a;
        border-radius: 6px;
        color: #E0E0E0;
        text-decoration: none;
        transition: all 0.2s;
      }

      .nav-card:hover {
        background: #333;
        border-color: #2196F3;
        transform: translateY(-2px);
      }

      .nav-card .icon {
        font-size: 2rem;
      }

      .nav-card .label {
        font-size: 0.875rem;
        text-align: center;
      }

      .empty-state {
        padding: 2rem;
        text-align: center;
        color: #666;
      }

      .loading {
        padding: 4rem;
        text-align: center;
        font-size: 1.25rem;
        color: #666;
      }

      @media (max-width: 768px) {
        .dashboard-content {
          grid-template-columns: 1fr;
        }
        
        .stats-grid {
          grid-template-columns: 1fr;
        }
        
        .nav-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Initialize and render the dashboard
   */
  async initialize(): Promise<void> {
    await this.loadData();
    this.render();
  }

  /**
   * Refresh dashboard data
   */
  async refresh(): Promise<void> {
    await this.loadData();
    this.render();
  }
}
