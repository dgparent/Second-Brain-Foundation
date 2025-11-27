import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, List, Typography, Spin, Tag, Button } from 'antd';
import { HomeOutlined, ToolOutlined, PlusOutlined } from '@ant-design/icons';

const { Title } = Typography;

const Property: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await window.sbfAPI.property.getProperties().catch(() => []);
        setProperties(data);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Spin size="large" />;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={2}><HomeOutlined /> Property Management</Title>
        <Button type="primary" icon={<PlusOutlined />}>Add Property</Button>
      </div>
      
      <Row gutter={[16, 16]}>
        {properties.length > 0 ? properties.map((prop: any) => (
          <Col span={8} key={prop.uid}>
            <Card 
              title={prop.name} 
              extra={<Tag color={prop.status === 'occupied' ? 'green' : 'orange'}>{prop.status}</Tag>}
              actions={[<ToolOutlined key="maintenance" />]}
            >
              <p>{prop.address}</p>
              <Statistic title="Value" value={prop.value} prefix="$" precision={0} />
            </Card>
          </Col>
        )) : (
          <Col span={24}>
            <Card>
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <HomeOutlined style={{ fontSize: '48px', color: '#ccc' }} />
                <p>No properties managed yet.</p>
              </div>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default Property;
