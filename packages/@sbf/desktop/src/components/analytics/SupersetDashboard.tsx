import React, { useState, useEffect } from 'react';
import { Card, Spin, message, Select } from 'antd';
import { analyticsApi } from '../../services/api';

const { Option } = Select;

interface SupersetDashboardProps {
  tenantId: string;
  userId: string;
}

const SupersetDashboard: React.FC<SupersetDashboardProps> = ({ tenantId, userId }) => {
  const [loading, setLoading] = useState(true);
  const [embedToken, setEmbedToken] = useState('');
  const [embedUrl, setEmbedUrl] = useState('');
  const [selectedDashboard, setSelectedDashboard] = useState('tenant-overview');
  const [availableDashboards] = useState([
    { id: 'tenant-overview', name: 'Tenant Overview' },
    { id: 'task-analytics', name: 'Task Analytics' },
    { id: 'project-progress', name: 'Project Progress' },
    { id: 'user-activity', name: 'User Activity' },
  ]);

  useEffect(() => {
    loadDashboard(selectedDashboard);
  }, [tenantId, userId, selectedDashboard]);

  const loadDashboard = async (dashboardId: string) => {
    try {
      setLoading(true);
      const response = await analyticsApi.getSupersetEmbedToken(tenantId, userId, dashboardId);
      setEmbedToken(response.token);
      setEmbedUrl(response.embedUrl);
    } catch (error) {
      message.error('Failed to load Superset dashboard');
      console.error('Superset error:', error);
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
          <p>Loading Superset dashboard...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="superset-dashboard">
      <Card
        title="Superset Analytics"
        extra={
          <Select
            value={selectedDashboard}
            onChange={handleDashboardChange}
            style={{ width: 200 }}
          >
            {availableDashboards.map(dash => (
              <Option key={dash.id} value={dash.id}>
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
          title="Superset Dashboard"
        />
      </Card>
    </div>
  );
};

export default SupersetDashboard;
