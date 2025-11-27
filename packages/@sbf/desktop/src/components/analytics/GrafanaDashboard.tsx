import React, { useState, useEffect } from 'react';
import { Card, Spin, message, Select } from 'antd';
import { analyticsApi } from '../../services/api';

const { Option } = Select;

interface GrafanaDashboardProps {
  tenantId: string;
  userId: string;
}

const GrafanaDashboard: React.FC<GrafanaDashboardProps> = ({ tenantId, userId }) => {
  const [loading, setLoading] = useState(true);
  const [embedUrl, setEmbedUrl] = useState('');
  const [selectedDashboard, setSelectedDashboard] = useState('tenant-metrics');
  const [availableDashboards] = useState([
    { uid: 'tenant-metrics', name: 'Tenant Metrics' },
    { uid: 'task-timeline', name: 'Task Timeline' },
    { uid: 'entity-relationships', name: 'Entity Relationships' },
    { uid: 'activity-heatmap', name: 'Activity Heatmap' },
  ]);

  useEffect(() => {
    loadDashboard(selectedDashboard);
  }, [tenantId, userId, selectedDashboard]);

  const loadDashboard = async (dashboardUid: string) => {
    try {
      setLoading(true);
      const response = await analyticsApi.getGrafanaEmbedUrl(tenantId, userId, dashboardUid);
      setEmbedUrl(response.iframeUrl);
    } catch (error) {
      message.error('Failed to load Grafana dashboard');
      console.error('Grafana error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDashboardChange = (value: string) => {
    setSelectedDashboard(value);
  };

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <p>Loading Grafana dashboard...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grafana-dashboard">
      <Card
        title="Grafana Monitoring"
        extra={
          <Select
            value={selectedDashboard}
            onChange={handleDashboardChange}
            style={{ width: 200 }}
          >
            {availableDashboards.map(dash => (
              <Option key={dash.uid} value={dash.uid}>
                {dash.name}
              </Option>
            ))}
          </Select>
        }
      >
        <iframe
          src={embedUrl}
          width="100%"
          height="800px"
          frameBorder="0"
          style={{ border: 'none' }}
          title="Grafana Dashboard"
        />
      </Card>
    </div>
  );
};

export default GrafanaDashboard;
