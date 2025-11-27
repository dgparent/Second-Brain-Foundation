import React from 'react';
import { Tabs, Typography } from 'antd';
import { PieChartOutlined, CloudServerOutlined } from '@ant-design/icons';
import LocalAnalytics from './analytics/LocalAnalytics';
import SupersetEmbed from './analytics/SupersetEmbed';

const { Title } = Typography;

const AnalyticsView: React.FC = () => {
  const items = [
    {
      key: 'local',
      label: (
        <span>
          <PieChartOutlined />
          Local Analytics
        </span>
      ),
      children: <LocalAnalytics />,
    },
    {
      key: 'external',
      label: (
        <span>
          <CloudServerOutlined />
          External Dashboards
        </span>
      ),
      children: <SupersetEmbed />,
    },
  ];

  return (
    <div style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '16px' }}>
        <Title level={2} style={{ margin: 0 }}>Analytics & Insights</Title>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Tabs 
          defaultActiveKey="local" 
          items={items} 
          type="card"
          style={{ height: '100%' }}
          tabBarStyle={{ marginBottom: 16 }}
        />
      </div>
    </div>
  );
};

export default AnalyticsView;
