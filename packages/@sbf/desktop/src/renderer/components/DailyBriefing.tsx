import React, { useEffect, useState } from 'react';
import { Card, Typography, List, Tag, Button, Skeleton, Row, Col, Statistic } from 'antd';
import { 
  CheckCircleOutlined, 
  CalendarOutlined, 
  BulbOutlined, 
  RightOutlined 
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const DailyBriefing: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({
    notifications: [],
    tasks: [],
    events: []
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch real notifications
        const notifications = await window.sbfAPI.notifications.getAll().catch(() => []);
        
        // Mock tasks/events for now until those APIs are fully exposed
        const tasks = [
          { id: 1, title: 'Review Q4 Financials', status: 'pending', priority: 'high' },
          { id: 2, title: 'Weekly Sync with Team', status: 'pending', priority: 'medium' },
          { id: 3, title: 'Gym Session', status: 'completed', priority: 'low' },
        ];

        const events = [
          { id: 1, time: '10:00 AM', title: 'Deep Work Block' },
          { id: 2, time: '02:00 PM', title: 'Client Call' },
        ];

        setData({ notifications, tasks, events });
      } catch (error) {
        console.error("Failed to load briefing data", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <Skeleton active />;

  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div style={{ marginBottom: 24 }}>
      <Card 
        style={{ 
          background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)', 
          border: 'none',
          marginBottom: 24
        }}
        bodyStyle={{ padding: '32px' }}
      >
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={2} style={{ color: 'white', margin: 0 }}>Good Morning, Dave</Title>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>
              It's {date}. You have {data.tasks.filter((t: any) => t.status === 'pending').length} pending tasks.
            </Text>
          </Col>
          <Col>
            <Button size="large" ghost icon={<BulbOutlined />}>
              Start Focus Mode
            </Button>
          </Col>
        </Row>
      </Card>

      <Row gutter={24}>
        <Col span={16}>
          <Card title="Today's Agenda" extra={<Button type="link">View Calendar</Button>}>
            <List
              itemLayout="horizontal"
              dataSource={data.events}
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<CalendarOutlined style={{ fontSize: '24px', color: '#1890ff' }} />}
                    title={<Text strong>{item.time}</Text>}
                    description={item.title}
                  />
                </List.Item>
              )}
            />
          </Card>
          
          <Card title="Priority Tasks" style={{ marginTop: 24 }} extra={<Button type="link">View All</Button>}>
             <List
              itemLayout="horizontal"
              dataSource={data.tasks}
              renderItem={(item: any) => (
                <List.Item actions={[<Button type="text" icon={<CheckCircleOutlined />} />]}>
                  <List.Item.Meta
                    title={
                      <Text delete={item.status === 'completed'}>
                        {item.title}
                      </Text>
                    }
                    description={
                      <Tag color={item.priority === 'high' ? 'red' : 'blue'}>
                        {item.priority.toUpperCase()}
                      </Tag>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        
        <Col span={8}>
          <Card title="Brain Health" style={{ height: '100%' }}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic title="Memory" value={98} suffix="%" />
              </Col>
              <Col span={12}>
                <Statistic title="Sync" value="Active" valueStyle={{ color: '#3f8600' }} />
              </Col>
              <Col span={24}>
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">System is running optimally. Last backup was 2 hours ago.</Text>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DailyBriefing;
