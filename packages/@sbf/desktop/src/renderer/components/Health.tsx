import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, List, Tabs, Typography, Spin, Tag } from 'antd';
import { HeartOutlined, MedicineBoxOutlined, CoffeeOutlined } from '@ant-design/icons';

const { Title } = Typography;

const Health: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({
    workouts: [],
    medications: [],
    nutrition: {},
    latestWeight: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const workouts = await window.sbfAPI.fitness.getWorkouts().catch(() => []);
        const medications = await window.sbfAPI.fitness.getActiveMedications().catch(() => []);
        const nutrition = await window.sbfAPI.fitness.getDailyNutrition(new Date().toISOString().split('T')[0]).catch(() => ({ calories: 0, protein: 0 }));
        const weight = await window.sbfAPI.fitness.getLatestMetric('weight').catch(() => null);

        setData({
          workouts,
          medications,
          nutrition,
          latestWeight: weight
        });
      } catch (error) {
        console.error("Error fetching health data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Spin size="large" />;

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Health & Wellness</Title>
      
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card>
            <Statistic 
              title="Calories Today" 
              value={data.nutrition?.calories || 0} 
              prefix={<CoffeeOutlined />} 
              suffix="kcal"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic 
              title="Active Medications" 
              value={data.medications.length} 
              prefix={<MedicineBoxOutlined />} 
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic 
              title="Latest Weight" 
              value={data.latestWeight?.value || 'N/A'} 
              prefix={<HeartOutlined />} 
              suffix="kg"
            />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="1" style={{ marginTop: '24px' }}>
        <Tabs.TabPane tab="Workouts" key="1">
          <List
            dataSource={data.workouts}
            renderItem={(item: any) => (
              <List.Item>
                <List.Item.Meta
                  title={item.type}
                  description={`${new Date(item.timestamp).toLocaleDateString()} - ${item.duration} mins`}
                />
                <Tag color="blue">{item.intensity}</Tag>
              </List.Item>
            )}
            locale={{ emptyText: 'No recent workouts' }}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Medications" key="2">
          <List
            dataSource={data.medications}
            renderItem={(item: any) => (
              <List.Item>
                <List.Item.Meta
                  title={item.name}
                  description={`Dosage: ${item.dosage} - Frequency: ${item.frequency}`}
                />
                <Tag color="green">Active</Tag>
              </List.Item>
            )}
            locale={{ emptyText: 'No active medications' }}
          />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default Health;
