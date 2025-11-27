import React, { useState, useEffect } from 'react';
import { Card, Tabs, Spin, message } from 'antd';
import { DashboardOutlined, BarChartOutlined, LineChartOutlined } from '@ant-design/icons';
import SupersetDashboard from './SupersetDashboard';
import GrafanaDashboard from './GrafanaDashboard';
import CustomAnalytics from './CustomAnalytics';
import { analyticsApi } from '../../services/api';

const { TabPane } = Tabs;

interface AnalyticsDashboardProps {
  tenantId: string;
  userId: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ tenantId, userId }) => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardConfigs, setDashboardConfigs] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardConfigs();
  }, [tenantId, userId]);

  const loadDashboardConfigs = async () => {
    try {
      setLoading(true);
      const configs = await analyticsApi.getDashboardConfigs(tenantId, userId);
      setDashboardConfigs(configs);
      
      // Set default tab from config
      const defaultConfig = configs.find((c: any) => c.is_default);
      if (defaultConfig) {
        setActiveTab(defaultConfig.dashboard_type);
      }
    } catch (error) {
      message.error('Failed to load dashboard configurations');
      console.error('Dashboard config error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>Loading analytics dashboard...</p>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard" style={{ padding: '24px' }}>
      <h1>
        <DashboardOutlined /> Analytics Dashboard
      </h1>
      
      <Tabs activeKey={activeTab} onChange={handleTabChange} size="large">
        <TabPane
          tab={
            <span>
              <BarChartOutlined />
              Overview
            </span>
          }
          key="overview"
        >
          <CustomAnalytics tenantId={tenantId} userId={userId} />
        </TabPane>

        <TabPane
          tab={
            <span>
              <LineChartOutlined />
              Superset
            </span>
          }
          key="superset"
        >
          <SupersetDashboard tenantId={tenantId} userId={userId} />
        </TabPane>

        <TabPane
          tab={
            <span>
              <DashboardOutlined />
              Grafana
            </span>
          }
          key="grafana"
        >
          <GrafanaDashboard tenantId={tenantId} userId={userId} />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
