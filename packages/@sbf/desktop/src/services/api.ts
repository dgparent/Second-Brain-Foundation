import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const analyticsApi = {
  getTenantSummary: async (tenantId: string) => {
    const response = await apiClient.get('/analytics/tenant-summary', {
      headers: { 'X-Tenant-ID': tenantId },
    });
    return response.data;
  },

  getUserActivity: async (tenantId: string, userId: string, startDate?: string, endDate?: string) => {
    const response = await apiClient.get('/analytics/user-activity', {
      headers: { 'X-Tenant-ID': tenantId },
      params: { startDate, endDate },
    });
    return response.data;
  },

  getTaskMetrics: async (tenantId: string, period?: string) => {
    const response = await apiClient.get('/analytics/task-metrics', {
      headers: { 'X-Tenant-ID': tenantId },
      params: { period },
    });
    return response.data;
  },

  getProjectProgress: async (tenantId: string) => {
    const response = await apiClient.get('/analytics/project-progress', {
      headers: { 'X-Tenant-ID': tenantId },
    });
    return response.data;
  },

  getEntityRelationships: async (tenantId: string) => {
    const response = await apiClient.get('/analytics/entity-relationships', {
      headers: { 'X-Tenant-ID': tenantId },
    });
    return response.data;
  },

  getDailyTimeline: async (tenantId: string, days?: number) => {
    const response = await apiClient.get('/analytics/daily-timeline', {
      headers: { 'X-Tenant-ID': tenantId },
      params: { days },
    });
    return response.data;
  },

  saveDashboardConfig: async (tenantId: string, userId: string, config: any) => {
    const response = await apiClient.post('/analytics/dashboard-config', config, {
      headers: { 'X-Tenant-ID': tenantId },
    });
    return response.data;
  },

  getDashboardConfigs: async (tenantId: string, userId: string, dashboardName?: string) => {
    const response = await apiClient.get('/analytics/dashboard-config', {
      headers: { 'X-Tenant-ID': tenantId },
      params: { dashboardName },
    });
    return response.data;
  },

  getSupersetEmbedToken: async (tenantId: string, userId: string, dashboardId: string) => {
    const response = await apiClient.get('/analytics/superset-embed-token', {
      headers: { 'X-Tenant-ID': tenantId },
      params: { dashboardId },
    });
    return response.data;
  },

  getGrafanaEmbedUrl: async (tenantId: string, userId: string, dashboardUid: string) => {
    const response = await apiClient.get('/analytics/grafana-embed-url', {
      headers: { 'X-Tenant-ID': tenantId },
      params: { dashboardUid },
    });
    return response.data;
  },

  refreshViews: async () => {
    const response = await apiClient.post('/analytics/refresh-views');
    return response.data;
  },
};

export default apiClient;
