import React, { useState } from 'react';
import { Card, Input, Button, Form, Alert, Typography, Space } from 'antd';
import { BarChartOutlined, LinkOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const SupersetEmbed: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [dashboardUrl, setDashboardUrl] = useState('');
  
  React.useEffect(() => {
    const savedConfig = localStorage.getItem('sbf_analytics_config');
    if (savedConfig) {
      try {
        const { url } = JSON.parse(savedConfig);
        if (url) {
          setDashboardUrl(url);
          setConnected(true);
        }
      } catch (e) {
        console.error('Failed to load analytics config', e);
      }
    }
  }, []);

  const handleConnect = (values: any) => {
    console.log('Connecting to Superset:', values);
    setDashboardUrl(values.url);
    setConnected(true);
    localStorage.setItem('sbf_analytics_config', JSON.stringify(values));
  };

  const handleDisconnect = () => {
    setConnected(false);
    setDashboardUrl('');
    localStorage.removeItem('sbf_analytics_config');
  };

  if (connected) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Alert 
          message="Connected to External Analytics" 
          description={`Showing dashboard from: ${dashboardUrl}`}
          type="success" 
          showIcon 
          action={
            <Button size="small" type="text" onClick={handleDisconnect}>
              Disconnect
            </Button>
          }
        />
        <div style={{ flex: 1, border: '1px solid #d9d9d9', borderRadius: '8px', overflow: 'hidden', background: '#f0f2f5' }}>
          <iframe
            src={dashboardUrl}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="External Dashboard"
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <BarChartOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
          <Title level={2}>External Analytics Integration</Title>
          <Paragraph>
            Connect to Apache Superset or Grafana to view advanced analytics dashboards directly within the application.
          </Paragraph>
        </div>

        <Form
          layout="vertical"
          onFinish={handleConnect}
          initialValues={{
            url: 'https://superset.example.com/superset/dashboard/p/123/',
            token: ''
          }}
        >
          <Form.Item
            label="Dashboard URL"
            name="url"
            rules={[{ required: true, message: 'Please enter the dashboard URL' }]}
            tooltip="The full URL to the Superset or Grafana dashboard you want to embed."
          >
            <Input prefix={<LinkOutlined />} placeholder="https://..." />
          </Form.Item>

          <Form.Item
            label="Guest Token (Optional)"
            name="token"
            tooltip="If your dashboard requires authentication, provide a guest token here."
          >
            <Input.Password placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              Connect Dashboard
            </Button>
          </Form.Item>
        </Form>

        <Alert
          message="Integration Note"
          description="Ensure that your Superset/Grafana instance is configured to allow embedding (X-Frame-Options) and that you have the necessary permissions."
          type="info"
          showIcon
          style={{ marginTop: '24px' }}
        />
      </Card>
    </div>
  );
};

export default SupersetEmbed;
