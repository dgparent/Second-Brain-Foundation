/**
 * Apache Superset Integration Service
 * Handles communication with Superset API for dashboard embedding and data retrieval
 */

import axios, { AxiosInstance } from 'axios';
import type { Dashboard, DashboardConfig } from '../types';

export interface SupersetConfig {
  url: string;
  apiKey?: string;
  username?: string;
  password?: string;
}

export class SupersetService {
  private client: AxiosInstance;
  private accessToken?: string;
  private config: SupersetConfig;

  constructor(config: SupersetConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.url,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Authenticate with Superset and obtain access token
   */
  async authenticate(): Promise<void> {
    try {
      const response = await this.client.post('/api/v1/security/login', {
        username: this.config.username,
        password: this.config.password,
        provider: 'db',
        refresh: true,
      });

      this.accessToken = response.data.access_token;
      this.client.defaults.headers.common['Authorization'] = `Bearer ${this.accessToken}`;
    } catch (error) {
      console.error('Superset authentication failed:', error);
      throw new Error('Failed to authenticate with Superset');
    }
  }

  /**
   * Get embedded dashboard URL with guest token
   */
  async getEmbeddedDashboardUrl(
    dashboardId: string,
    tenantId: string,
    filters?: Record<string, any>
  ): Promise<string> {
    if (!this.accessToken) {
      await this.authenticate();
    }

    try {
      // Create guest token for embedded access
      const guestTokenResponse = await this.client.post('/api/v1/security/guest_token', {
        user: {
          username: 'guest',
          first_name: 'Guest',
          last_name: 'User',
        },
        resources: [
          {
            type: 'dashboard',
            id: dashboardId,
          },
        ],
        rls: [
          {
            clause: `tenantId = '${tenantId}'`,
          },
        ],
      });

      const guestToken = guestTokenResponse.data.token;
      const embeddedUrl = `${this.config.url}/superset/dashboard/${dashboardId}/?standalone=3&guest_token=${guestToken}`;

      if (filters) {
        const filterParams = new URLSearchParams(filters).toString();
        return `${embeddedUrl}&${filterParams}`;
      }

      return embeddedUrl;
    } catch (error) {
      console.error('Failed to get embedded dashboard URL:', error);
      throw new Error('Failed to generate embedded dashboard URL');
    }
  }

  /**
   * Execute SQL query via Superset SQL Lab
   */
  async executeQuery(sql: string, tenantId: string): Promise<any> {
    if (!this.accessToken) {
      await this.authenticate();
    }

    try {
      const response = await this.client.post('/api/v1/sqllab/execute', {
        sql: `SET app.current_tenant = '${tenantId}'; ${sql}`,
        runAsync: false,
      });

      return response.data;
    } catch (error) {
      console.error('Failed to execute query:', error);
      throw new Error('Query execution failed');
    }
  }

  /**
   * Get chart data
   */
  async getChartData(chartId: string, tenantId: string, filters?: Record<string, any>): Promise<any> {
    if (!this.accessToken) {
      await this.authenticate();
    }

    try {
      const response = await this.client.post(`/api/v1/chart/${chartId}/data`, {
        filters: filters || {},
        row_limit: 10000,
      });

      return response.data;
    } catch (error) {
      console.error('Failed to get chart data:', error);
      throw new Error('Failed to retrieve chart data');
    }
  }

  /**
   * List available dashboards
   */
  async listDashboards(): Promise<any[]> {
    if (!this.accessToken) {
      await this.authenticate();
    }

    try {
      const response = await this.client.get('/api/v1/dashboard/', {
        params: {
          page: 0,
          page_size: 100,
        },
      });

      return response.data.result;
    } catch (error) {
      console.error('Failed to list dashboards:', error);
      throw new Error('Failed to retrieve dashboards');
    }
  }

  /**
   * Create a new dashboard
   */
  async createDashboard(config: DashboardConfig, tenantId: string): Promise<Dashboard> {
    if (!this.accessToken) {
      await this.authenticate();
    }

    try {
      const response = await this.client.post('/api/v1/dashboard/', {
        dashboard_title: config.name,
        json_metadata: JSON.stringify({
          description: config.description,
          type: config.type,
          tenantId: tenantId,
        }),
      });

      return response.data.result;
    } catch (error) {
      console.error('Failed to create dashboard:', error);
      throw new Error('Failed to create dashboard');
    }
  }

  /**
   * Export dashboard configuration
   */
  async exportDashboard(dashboardId: string): Promise<any> {
    if (!this.accessToken) {
      await this.authenticate();
    }

    try {
      const response = await this.client.get(`/api/v1/dashboard/${dashboardId}`);
      return response.data.result;
    } catch (error) {
      console.error('Failed to export dashboard:', error);
      throw new Error('Failed to export dashboard');
    }
  }

  /**
   * Import dashboard configuration
   */
  async importDashboard(dashboardData: any, tenantId: string): Promise<Dashboard> {
    if (!this.accessToken) {
      await this.authenticate();
    }

    try {
      // Add tenant ID to metadata
      if (dashboardData.json_metadata) {
        const metadata = JSON.parse(dashboardData.json_metadata);
        metadata.tenantId = tenantId;
        dashboardData.json_metadata = JSON.stringify(metadata);
      }

      const response = await this.client.post('/api/v1/dashboard/import/', dashboardData);
      return response.data.result;
    } catch (error) {
      console.error('Failed to import dashboard:', error);
      throw new Error('Failed to import dashboard');
    }
  }

  /**
   * Refresh dashboard cache
   */
  async refreshDashboard(dashboardId: string): Promise<void> {
    if (!this.accessToken) {
      await this.authenticate();
    }

    try {
      await this.client.put(`/api/v1/dashboard/${dashboardId}/refresh`);
    } catch (error) {
      console.error('Failed to refresh dashboard:', error);
      throw new Error('Failed to refresh dashboard cache');
    }
  }
}

export default SupersetService;
