/**
 * AnalyticsCharts.ts
 * Analytics charts using Chart.js for visualizing productivity data
 */

import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

export interface AnalyticsData {
  entityTrend: { dates: string[]; counts: number[] };
  typeDistribution: { types: string[]; counts: number[] };
  lifecycleDistribution: { states: string[]; counts: number[] };
  privacyDistribution: { levels: string[]; counts: number[] };
}

export class AnalyticsCharts {
  private container: HTMLElement;
  private charts: Map<string, Chart> = new Map();
  private data: AnalyticsData | null = null;

  constructor(containerId: string) {
    const element = document.getElementById(containerId);
    if (!element) {
      throw new Error(`Container element #${containerId} not found`);
    }
    this.container = element;
  }

  /**
   * Load analytics data from APIs
   */
  async loadData(): Promise<void> {
    try {
      // Load entities
      const entities = await window.sbfAPI.entities.getAll();
      
      // Calculate entity creation trend (last 30 days)
      const entityTrend = this.calculateEntityTrend(entities);
      
      // Calculate type distribution
      const typeDistribution = this.calculateTypeDistribution(entities);
      
      // Load lifecycle stats
      const lifecycleStats = await window.sbfAPI.lifecycle.getStats();
      const lifecycleDistribution = {
        states: ['Active', 'Stale', 'Archived', 'Dissolved'],
        counts: [
          lifecycleStats.activeEntities || 0,
          lifecycleStats.staleEntities || 0,
          lifecycleStats.archivedEntities || 0,
          lifecycleStats.dissolvedEntities || 0
        ]
      };

      // Load privacy stats
      const privacyStats = await window.sbfAPI.privacy.getStats();
      const privacyDistribution = {
        levels: ['Public', 'Personal', 'Private', 'Confidential'],
        counts: [
          privacyStats.publicEntities || 0,
          privacyStats.personalEntities || 0,
          privacyStats.privateEntities || 0,
          privacyStats.confidentialEntities || 0
        ]
      };

      this.data = {
        entityTrend,
        typeDistribution,
        lifecycleDistribution,
        privacyDistribution
      };

    } catch (error) {
      console.error('Failed to load analytics data:', error);
      throw error;
    }
  }

  /**
   * Calculate entity creation trend for last 30 days
   */
  private calculateEntityTrend(entities: any[]): { dates: string[]; counts: number[] } {
    const dates: string[] = [];
    const counts: number[] = [];
    const today = new Date();

    // Generate last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dates.push(dateStr);

      // Count entities created on this date
      const count = entities.filter((e: any) => {
        const created = new Date(e.created_at).toISOString().split('T')[0];
        return created === dateStr;
      }).length;
      counts.push(count);
    }

    return { dates, counts };
  }

  /**
   * Calculate type distribution
   */
  private calculateTypeDistribution(entities: any[]): { types: string[]; counts: number[] } {
    const typeCounts = new Map<string, number>();

    entities.forEach((entity: any) => {
      const type = entity.type || 'unknown';
      typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
    });

    const types = Array.from(typeCounts.keys());
    const counts = types.map(type => typeCounts.get(type) || 0);

    return { types, counts };
  }

  /**
   * Render all charts
   */
  render(): void {
    if (!this.data) {
      this.container.innerHTML = '<div class="loading">Loading analytics...</div>';
      return;
    }

    // Clear existing charts
    this.destroyAllCharts();

    // Create container structure
    this.container.innerHTML = `
      <div class="analytics-charts">
        <div class="charts-grid">
          <div class="chart-card">
            <h3>📈 Entity Creation Trend (30 Days)</h3>
            <canvas id="entity-trend-chart"></canvas>
          </div>
          <div class="chart-card">
            <h3>📊 Entity Type Distribution</h3>
            <canvas id="type-distribution-chart"></canvas>
          </div>
          <div class="chart-card">
            <h3>♻️ Lifecycle State Distribution</h3>
            <canvas id="lifecycle-distribution-chart"></canvas>
          </div>
          <div class="chart-card">
            <h3>🔒 Privacy Level Distribution</h3>
            <canvas id="privacy-distribution-chart"></canvas>
          </div>
        </div>
      </div>
    `;

    // Render individual charts
    this.renderEntityTrendChart();
    this.renderTypeDistributionChart();
    this.renderLifecycleDistributionChart();
    this.renderPrivacyDistributionChart();

    this.applyStyles();
  }

  /**
   * Render entity trend line chart
   */
  private renderEntityTrendChart(): void {
    if (!this.data) return;

    const canvas = document.getElementById('entity-trend-chart') as HTMLCanvasElement;
    if (!canvas) return;

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: this.data.entityTrend.dates.map(d => {
          const date = new Date(d);
          return `${date.getMonth() + 1}/${date.getDate()}`;
        }),
        datasets: [{
          label: 'Entities Created',
          data: this.data.entityTrend.counts,
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 3,
          pointHoverRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            labels: { color: '#E0E0E0' }
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          x: {
            ticks: { color: '#999' },
            grid: { color: '#333' }
          },
          y: {
            beginAtZero: true,
            ticks: { 
              color: '#999',
              stepSize: 1
            },
            grid: { color: '#333' }
          }
        }
      }
    };

    const chart = new Chart(canvas, config);
    this.charts.set('entity-trend', chart);
  }

  /**
   * Render type distribution pie chart
   */
  private renderTypeDistributionChart(): void {
    if (!this.data) return;

    const canvas = document.getElementById('type-distribution-chart') as HTMLCanvasElement;
    if (!canvas) return;

    const colors = this.generateColors(this.data.typeDistribution.types.length);

    const config: ChartConfiguration = {
      type: 'pie',
      data: {
        labels: this.data.typeDistribution.types,
        datasets: [{
          data: this.data.typeDistribution.counts,
          backgroundColor: colors,
          borderColor: '#1a1a1a',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            position: 'right',
            labels: { color: '#E0E0E0' }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    };

    const chart = new Chart(canvas, config);
    this.charts.set('type-distribution', chart);
  }

  /**
   * Render lifecycle distribution bar chart
   */
  private renderLifecycleDistributionChart(): void {
    if (!this.data) return;

    const canvas = document.getElementById('lifecycle-distribution-chart') as HTMLCanvasElement;
    if (!canvas) return;

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: this.data.lifecycleDistribution.states,
        datasets: [{
          label: 'Entities',
          data: this.data.lifecycleDistribution.counts,
          backgroundColor: [
            '#4CAF50', // Active - Green
            '#FF9800', // Stale - Orange
            '#2196F3', // Archived - Blue
            '#F44336'  // Dissolved - Red
          ],
          borderColor: '#1a1a1a',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `${context.parsed.y} entities`;
              }
            }
          }
        },
        scales: {
          x: {
            ticks: { color: '#999' },
            grid: { display: false }
          },
          y: {
            beginAtZero: true,
            ticks: { 
              color: '#999',
              stepSize: 1
            },
            grid: { color: '#333' }
          }
        }
      }
    };

    const chart = new Chart(canvas, config);
    this.charts.set('lifecycle-distribution', chart);
  }

  /**
   * Render privacy distribution doughnut chart
   */
  private renderPrivacyDistributionChart(): void {
    if (!this.data) return;

    const canvas = document.getElementById('privacy-distribution-chart') as HTMLCanvasElement;
    if (!canvas) return;

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: this.data.privacyDistribution.levels,
        datasets: [{
          data: this.data.privacyDistribution.counts,
          backgroundColor: [
            '#9E9E9E', // Public - Gray
            '#2196F3', // Personal - Blue
            '#FF9800', // Private - Orange
            '#F44336'  // Confidential - Red
          ],
          borderColor: '#1a1a1a',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            position: 'right',
            labels: { color: '#E0E0E0' }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    };

    const chart = new Chart(canvas, config);
    this.charts.set('privacy-distribution', chart);
  }

  /**
   * Generate colors for charts
   */
  private generateColors(count: number): string[] {
    const baseColors = [
      '#4CAF50', '#2196F3', '#FF9800', '#E91E63', 
      '#9C27B0', '#00BCD4', '#FFEB3B', '#795548'
    ];

    const colors: string[] = [];
    for (let i = 0; i < count; i++) {
      colors.push(baseColors[i % baseColors.length]);
    }
    return colors;
  }

  /**
   * Apply styles
   */
  private applyStyles(): void {
    const styleId = 'analytics-charts-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .analytics-charts {
        padding: 2rem;
        background: #1a1a1a;
        color: #E0E0E0;
        font-family: 'Segoe UI', system-ui, sans-serif;
      }

      .charts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 2rem;
      }

      .chart-card {
        background: #2a2a2a;
        padding: 1.5rem;
        border-radius: 8px;
        border: 1px solid #3a3a3a;
      }

      .chart-card h3 {
        margin: 0 0 1rem 0;
        font-size: 1rem;
        font-weight: 600;
        color: #E0E0E0;
      }

      .chart-card canvas {
        max-height: 300px;
      }

      .loading {
        padding: 4rem;
        text-align: center;
        font-size: 1.25rem;
        color: #666;
      }

      @media (max-width: 768px) {
        .charts-grid {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Destroy a specific chart
   */
  private destroyChart(chartId: string): void {
    const chart = this.charts.get(chartId);
    if (chart) {
      chart.destroy();
      this.charts.delete(chartId);
    }
  }

  /**
   * Destroy all charts
   */
  private destroyAllCharts(): void {
    this.charts.forEach(chart => chart.destroy());
    this.charts.clear();
  }

  /**
   * Initialize and render charts
   */
  async initialize(): Promise<void> {
    await this.loadData();
    this.render();
  }

  /**
   * Refresh charts with new data
   */
  async refresh(): Promise<void> {
    await this.loadData();
    this.render();
  }

  /**
   * Clean up
   */
  destroy(): void {
    this.destroyAllCharts();
    this.container.innerHTML = '';
  }
}
