import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AnalyticsService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      database: process.env.POSTGRES_DB || 'sbf_db',
      user: process.env.POSTGRES_USER || 'sbf_user',
      password: process.env.POSTGRES_PASSWORD || 'changeme',
    });
  }

  async getTenantActivitySummary(tenantId: string) {
    const result = await this.pool.query(
      `SELECT * FROM analytics.tenant_activity_summary WHERE tenant_id = $1`,
      [tenantId]
    );
    return result.rows[0] || null;
  }

  async getUserActivityMetrics(
    tenantId: string,
    userId: string,
    startDate?: string,
    endDate?: string
  ) {
    let query = `
      SELECT * FROM analytics.user_activity_metrics 
      WHERE tenant_id = $1 AND user_id = $2
    `;
    const params: any[] = [tenantId, userId];

    if (startDate) {
      params.push(startDate);
      query += ` AND activity_date >= $${params.length}`;
    }
    if (endDate) {
      params.push(endDate);
      query += ` AND activity_date <= $${params.length}`;
    }

    query += ` ORDER BY activity_date DESC`;

    const result = await this.pool.query(query, params);
    return result.rows;
  }

  async getTaskCompletionMetrics(tenantId: string, period?: string) {
    let query = `
      SELECT * FROM analytics.task_completion_metrics 
      WHERE tenant_id = $1
    `;

    if (period === 'current_week') {
      query += ` AND week_start = DATE_TRUNC('week', CURRENT_DATE)`;
    } else if (period === 'last_month') {
      query += ` AND week_start >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
                 AND week_start < DATE_TRUNC('month', CURRENT_DATE)`;
    }

    query += ` ORDER BY week_start DESC`;

    const result = await this.pool.query(query, [tenantId]);
    return result.rows;
  }

  async getProjectProgressMetrics(tenantId: string) {
    const result = await this.pool.query(
      `SELECT * FROM analytics.project_progress_metrics 
       WHERE tenant_id = $1 
       ORDER BY project_updated_at DESC`,
      [tenantId]
    );
    return result.rows;
  }

  async getEntityRelationshipMetrics(tenantId: string) {
    const result = await this.pool.query(
      `SELECT * FROM analytics.entity_relationship_metrics WHERE tenant_id = $1`,
      [tenantId]
    );
    return result.rows;
  }

  async getDailyActivityTimeline(tenantId: string, days: number = 30) {
    const result = await this.pool.query(
      `SELECT * FROM analytics.daily_activity_timeline 
       WHERE tenant_id = $1 
       AND activity_date >= CURRENT_DATE - INTERVAL '${days} days'
       ORDER BY activity_date DESC, entity_type`,
      [tenantId]
    );
    return result.rows;
  }

  async saveDashboardConfig(tenantId: string, userId: string, config: any) {
    const { dashboardName, dashboardType, configData, isDefault } = config;

    const result = await this.pool.query(
      `INSERT INTO analytics.dashboard_configs 
       (tenant_id, user_id, dashboard_name, dashboard_type, config_data, is_default, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (tenant_id, user_id, dashboard_name) 
       DO UPDATE SET 
         dashboard_type = EXCLUDED.dashboard_type,
         config_data = EXCLUDED.config_data,
         is_default = EXCLUDED.is_default,
         updated_at = NOW()
       RETURNING *`,
      [tenantId, userId, dashboardName, dashboardType, JSON.stringify(configData), isDefault || false]
    );

    return result.rows[0];
  }

  async getDashboardConfig(tenantId: string, userId: string, dashboardName?: string) {
    let query = `
      SELECT * FROM analytics.dashboard_configs 
      WHERE tenant_id = $1 AND user_id = $2
    `;
    const params: any[] = [tenantId, userId];

    if (dashboardName) {
      params.push(dashboardName);
      query += ` AND dashboard_name = $${params.length}`;
    }

    query += ` ORDER BY is_default DESC, created_at DESC`;

    const result = await this.pool.query(query, params);
    return dashboardName ? result.rows[0] : result.rows;
  }

  async generateSupersetEmbedToken(tenantId: string, userId: string, dashboardId: string) {
    const supersetSecret = process.env.SUPERSET_SECRET_KEY || 'your-superset-secret-key';
    
    // Set tenant context for RLS
    await this.pool.query(`SET app.current_tenant_id = $1`, [tenantId]);

    const payload = {
      user: {
        username: userId,
        first_name: 'User',
        last_name: userId.substring(0, 8),
      },
      resources: [{
        type: 'dashboard',
        id: dashboardId,
      }],
      rls: [
        {
          clause: `tenant_id = '${tenantId}'`,
        },
      ],
    };

    const token = jwt.sign(payload, supersetSecret, {
      expiresIn: '1h',
      audience: 'superset',
    });

    return {
      token,
      embedUrl: `${process.env.SUPERSET_URL || 'http://localhost:8088'}/superset/dashboard/${dashboardId}/?standalone=true`,
    };
  }

  async generateGrafanaEmbedUrl(tenantId: string, userId: string, dashboardUid: string) {
    // Set tenant context for queries
    await this.pool.query(`SET app.current_tenant_id = $1`, [tenantId]);

    const grafanaUrl = process.env.GRAFANA_URL || 'http://localhost:3000';
    const embedUrl = `${grafanaUrl}/d/${dashboardUid}?kiosk=tv&var-tenant_id=${tenantId}`;

    return {
      embedUrl,
      iframeUrl: `${grafanaUrl}/d/${dashboardUid}?kiosk=true&var-tenant_id=${tenantId}`,
    };
  }

  async refreshMaterializedViews() {
    await this.pool.query('SELECT analytics.refresh_all_views()');
    return { message: 'Analytics views refreshed successfully' };
  }

  async getAnalyticsHealth() {
    try {
      const result = await this.pool.query(
        `SELECT 
          schemaname, 
          matviewname as view_name, 
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||matviewname)) as size
         FROM pg_matviews 
         WHERE schemaname = 'analytics'`
      );
      return {
        status: 'healthy',
        materializedViews: result.rows,
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
      };
    }
  }
}
