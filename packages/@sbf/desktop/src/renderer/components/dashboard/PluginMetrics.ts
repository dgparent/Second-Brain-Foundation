/**
 * PluginMetrics.ts
 * Display metrics for all active plugins (Tasks, Finance, Health, etc.)
 */

export interface PluginMetric {
  pluginId: string;
  pluginName: string;
  icon: string;
  metrics: {
    label: string;
    value: string | number;
    color?: string;
  }[];
}

export class PluginMetrics {
  private container: HTMLElement;
  private metrics: PluginMetric[] = [];

  constructor(containerId: string) {
    const element = document.getElementById(containerId);
    if (!element) {
      throw new Error(`Container element #${containerId} not found`);
    }
    this.container = element;
  }

  /**
   * Load metrics from all plugins
   */
  async loadData(): Promise<void> {
    try {
      // Load all entities
      const entities = await window.sbfAPI.entities.getAll();

      // Calculate Task Management metrics
      const taskMetrics = this.calculateTaskMetrics(entities);
      this.metrics.push(taskMetrics);

      // Calculate Financial metrics
      const financialMetrics = this.calculateFinancialMetrics(entities);
      this.metrics.push(financialMetrics);

      // Calculate Health & Fitness metrics
      const healthMetrics = this.calculateHealthMetrics(entities);
      this.metrics.push(healthMetrics);

      // Calculate Knowledge & Learning metrics
      const knowledgeMetrics = this.calculateKnowledgeMetrics(entities);
      this.metrics.push(knowledgeMetrics);

    } catch (error) {
      console.error('Failed to load plugin metrics:', error);
      throw error;
    }
  }

  /**
   * Calculate Task Management metrics
   */
  private calculateTaskMetrics(entities: any[]): PluginMetric {
    const tasks = entities.filter(e => e.type === 'task');
    const completedTasks = tasks.filter(t => t.metadata?.status === 'completed');
    const today = new Date().toISOString().split('T')[0];
    const completedToday = completedTasks.filter(t => 
      t.metadata?.completedAt?.startsWith(today)
    );
    const overdueTasks = tasks.filter(t => {
      const dueDate = t.metadata?.dueDate;
      return dueDate && new Date(dueDate) < new Date() && t.metadata?.status !== 'completed';
    });

    const completionRate = tasks.length > 0 
      ? ((completedTasks.length / tasks.length) * 100).toFixed(1)
      : '0';

    return {
      pluginId: 'task-management',
      pluginName: 'Task Management',
      icon: '✓',
      metrics: [
        { label: 'Total Tasks', value: tasks.length },
        { label: 'Completed Today', value: completedToday.length, color: '#4CAF50' },
        { label: 'Overdue', value: overdueTasks.length, color: '#F44336' },
        { label: 'Completion Rate', value: `${completionRate}%`, color: '#2196F3' }
      ]
    };
  }

  /**
   * Calculate Financial metrics
   */
  private calculateFinancialMetrics(entities: any[]): PluginMetric {
    const budgets = entities.filter(e => e.type === 'budget');
    const activeBudgets = budgets.filter(b => b.metadata?.status === 'active');
    const transactions = entities.filter(e => e.type === 'transaction');
    
    const totalAmount = transactions.reduce((sum, t) => {
      const amount = parseFloat(t.metadata?.amount || '0');
      return sum + amount;
    }, 0);

    return {
      pluginId: 'financial',
      pluginName: 'Financial',
      icon: '💰',
      metrics: [
        { label: 'Total Budgets', value: budgets.length },
        { label: 'Active Budgets', value: activeBudgets.length, color: '#4CAF50' },
        { label: 'Transactions', value: transactions.length },
        { label: 'Total Amount', value: `$${totalAmount.toFixed(2)}`, color: '#FF9800' }
      ]
    };
  }

  /**
   * Calculate Health & Fitness metrics
   */
  private calculateHealthMetrics(entities: any[]): PluginMetric {
    const workouts = entities.filter(e => e.type === 'workout');
    const meals = entities.filter(e => e.type === 'meal');
    const medications = entities.filter(e => e.type === 'medication');
    
    const activeWorkouts = workouts.filter(w => w.metadata?.status === 'active');
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentMeals = meals.filter(m => 
      new Date(m.created_at) > weekAgo
    );

    return {
      pluginId: 'health-fitness',
      pluginName: 'Health & Fitness',
      icon: '💪',
      metrics: [
        { label: 'Active Workouts', value: activeWorkouts.length, color: '#E91E63' },
        { label: 'Meals (7 days)', value: recentMeals.length },
        { label: 'Medications Tracked', value: medications.length },
        { label: 'Total Workouts', value: workouts.length, color: '#4CAF50' }
      ]
    };
  }

  /**
   * Calculate Knowledge & Learning metrics
   */
  private calculateKnowledgeMetrics(entities: any[]): PluginMetric {
    const notes = entities.filter(e => e.type === 'note');
    const flashcards = entities.filter(e => e.type === 'flashcard');
    const courses = entities.filter(e => e.type === 'course');
    
    const activeCourses = courses.filter(c => c.metadata?.status === 'in-progress');
    const masteredCards = flashcards.filter(f => f.metadata?.masteryLevel === 'mastered');

    return {
      pluginId: 'knowledge-learning',
      pluginName: 'Knowledge & Learning',
      icon: '📚',
      metrics: [
        { label: 'Total Notes', value: notes.length },
        { label: 'Flashcards', value: flashcards.length },
        { label: 'Active Courses', value: activeCourses.length, color: '#2196F3' },
        { label: 'Mastered Cards', value: masteredCards.length, color: '#4CAF50' }
      ]
    };
  }

  /**
   * Render the metrics dashboard
   */
  render(): void {
    if (this.metrics.length === 0) {
      this.container.innerHTML = '<div class="loading">Loading plugin metrics...</div>';
      return;
    }

    this.container.innerHTML = `
      <div class="plugin-metrics">
        <h2>🔌 Plugin Metrics</h2>
        <div class="metrics-grid">
          ${this.metrics.map(plugin => this.renderPluginCard(plugin)).join('')}
        </div>
      </div>
    `;

    this.attachEventListeners();
    this.applyStyles();
  }

  /**
   * Render a plugin metrics card
   */
  private renderPluginCard(plugin: PluginMetric): string {
    return `
      <div class="plugin-card" data-plugin="${plugin.pluginId}">
        <div class="plugin-header">
          <span class="plugin-icon">${plugin.icon}</span>
          <h3 class="plugin-name">${plugin.pluginName}</h3>
        </div>
        <div class="plugin-metrics">
          ${plugin.metrics.map(metric => `
            <div class="metric-row">
              <span class="metric-label">${metric.label}</span>
              <span class="metric-value" ${metric.color ? `style="color: ${metric.color}"` : ''}>
                ${metric.value}
              </span>
            </div>
          `).join('')}
        </div>
        <button class="view-plugin-btn" data-plugin="${plugin.pluginId}">
          View Details →
        </button>
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  private attachEventListeners(): void {
    this.container.querySelectorAll('.view-plugin-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const pluginId = (e.currentTarget as HTMLElement).dataset.plugin;
        this.handleViewPlugin(pluginId || '');
      });
    });

    this.container.querySelectorAll('.plugin-card').forEach(card => {
      card.addEventListener('click', (e) => {
        // Don't trigger if clicking the button
        if ((e.target as HTMLElement).classList.contains('view-plugin-btn')) return;
        
        const pluginId = (e.currentTarget as HTMLElement).dataset.plugin;
        this.handleViewPlugin(pluginId || '');
      });
    });
  }

  /**
   * Handle view plugin details
   */
  private handleViewPlugin(pluginId: string): void {
    console.log(`Viewing plugin: ${pluginId}`);
    // TODO: Navigate to plugin-specific view
    window.location.hash = `#/plugins/${pluginId}`;
  }

  /**
   * Apply styles
   */
  private applyStyles(): void {
    const styleId = 'plugin-metrics-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .plugin-metrics {
        padding: 2rem;
        background: #1a1a1a;
        color: #E0E0E0;
        font-family: 'Segoe UI', system-ui, sans-serif;
      }

      .plugin-metrics h2 {
        font-size: 1.5rem;
        margin: 0 0 1.5rem 0;
        font-weight: 600;
      }

      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.5rem;
      }

      .plugin-card {
        background: #2a2a2a;
        border: 1px solid #3a3a3a;
        border-radius: 8px;
        padding: 1.5rem;
        cursor: pointer;
        transition: all 0.3s;
      }

      .plugin-card:hover {
        border-color: #4CAF50;
        transform: translateY(-4px);
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
      }

      .plugin-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1.25rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid #3a3a3a;
      }

      .plugin-icon {
        font-size: 2rem;
      }

      .plugin-name {
        font-size: 1.125rem;
        margin: 0;
        font-weight: 600;
      }

      .plugin-metrics {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-bottom: 1.25rem;
      }

      .metric-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem;
        background: #1a1a1a;
        border-radius: 4px;
      }

      .metric-label {
        font-size: 0.875rem;
        color: #999;
      }

      .metric-value {
        font-size: 1rem;
        font-weight: 600;
        color: #E0E0E0;
      }

      .view-plugin-btn {
        width: 100%;
        padding: 0.75rem;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;
      }

      .view-plugin-btn:hover {
        background: #45a049;
      }

      .loading {
        padding: 4rem;
        text-align: center;
        font-size: 1.25rem;
        color: #666;
      }

      @media (max-width: 768px) {
        .metrics-grid {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Initialize and render plugin metrics
   */
  async initialize(): Promise<void> {
    await this.loadData();
    this.render();
  }

  /**
   * Refresh metrics
   */
  async refresh(): Promise<void> {
    this.metrics = [];
    await this.loadData();
    this.render();
  }

  /**
   * Clean up
   */
  destroy(): void {
    this.container.innerHTML = '';
  }
}
