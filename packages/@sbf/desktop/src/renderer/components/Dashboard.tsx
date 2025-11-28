import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Spin, Typography } from 'antd';
import { 
  DatabaseOutlined, 
  SafetyCertificateOutlined, 
  ClockCircleOutlined 
} from '@ant-design/icons';
import DailyBriefing from './DailyBriefing';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    entities: 0,
    privacy: {},
    lifecycle: {},
    notifications: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch data from API
        // Note: Some of these might fail if the backend services aren't fully initialized with data
        // so we wrap in try/catch blocks individually or handle gracefully
        
        let entityCount = 0;
        try {
          const entities = await window.sbfAPI.entities.getAll();
          entityCount = entities.length;
        } catch (e) {
          console.error("Failed to fetch entities", e);
        }

        let privacyStats = {};
        try {
          privacyStats = await window.sbfAPI.privacy.getStats();
        } catch (e) {
          console.error("Failed to fetch privacy stats", e);
        }

        let lifecycleStats = {};
        try {
          lifecycleStats = await window.sbfAPI.lifecycle.getStats();
        } catch (e) {
          console.error("Failed to fetch lifecycle stats", e);
        }

        let notifications = [];
        try {
          notifications = await window.sbfAPI.notifications.getAll();
        } catch (e) {
          console.error("Failed to fetch notifications", e);
        }

        // Check AI Health
        let aiStatus = 'unknown';
        try {
          // Simple ping to check if AI is responsive
          // We can use a lightweight call or just assume if other calls worked
          // For now, let's assume 'connected' if we reached this far, or add a specific health check later
          aiStatus = 'connected';
        } catch (e) {
          aiStatus = 'disconnected';
        }

        setStats({
          entities: entityCount,
          privacy: privacyStats,
          lifecycle: lifecycleStats,
          notifications: notifications,
          aiStatus
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <DailyBriefing />
      
      <Title level={4} style={{ marginTop: 32, marginBottom: 16 }}>System Internals</Title>
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card size="small">
            <Statistic 
              title="Total Notes & Entities" 
              value={stats.entities} 
              prefix={<DatabaseOutlined />} 
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic 
              title="Privacy Level" 
              value={stats.privacy?.averageLevel || 'N/A'} 
              prefix={<SafetyCertificateOutlined />} 
              suffix="/ 5"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic 
              title="Active Lifecycle" 
              value={stats.lifecycle?.activeCount || 0} 
              prefix={<ClockCircleOutlined />} 
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
