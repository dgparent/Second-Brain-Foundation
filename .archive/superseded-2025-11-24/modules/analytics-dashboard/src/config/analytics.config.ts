/**
 * Analytics configuration
 */

export interface AnalyticsConfig {
  superset: SupersetConfig;
  grafana?: GrafanaConfig;
  metabase?: MetabaseConfig;
  database: DatabaseConfig;
  cache?: CacheConfig;
}

export interface SupersetConfig {
  url: string;
  apiKey?: string;
  username?: string;
  password?: string;
  embedding: {
    enabled: boolean;
    domains: string[];
  };
}

export interface GrafanaConfig {
  url: string;
  apiKey: string;
  orgId?: number;
}

export interface MetabaseConfig {
  url: string;
  apiKey: string;
  siteUrl?: string;
}

export interface DatabaseConfig {
  analyticsSchema: string;
  refreshInterval: number; // in seconds
  enableMaterializedViews: boolean;
}

export interface CacheConfig {
  enabled: boolean;
  ttl: number; // in seconds
  redis?: {
    host: string;
    port: number;
    password?: string;
  };
}

export const defaultConfig: AnalyticsConfig = {
  superset: {
    url: process.env.SUPERSET_URL || 'http://localhost:8088',
    username: process.env.SUPERSET_USERNAME || 'admin',
    password: process.env.SUPERSET_PASSWORD || 'admin',
    embedding: {
      enabled: true,
      domains: ['localhost', 'app.sbf.local'],
    },
  },
  database: {
    analyticsSchema: 'analytics',
    refreshInterval: 3600, // 1 hour
    enableMaterializedViews: true,
  },
  cache: {
    enabled: true,
    ttl: 300, // 5 minutes
  },
};

export function getConfig(): AnalyticsConfig {
  return defaultConfig;
}
