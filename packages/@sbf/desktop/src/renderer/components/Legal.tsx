import React, { useEffect, useState } from 'react';
import { Card, Table, Typography, Spin, Tag, Button } from 'antd';
import { FileProtectOutlined, PlusOutlined } from '@ant-design/icons';

const { Title } = Typography;

const Legal: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await window.sbfAPI.legal.getCases().catch(() => []);
        setCases(data);
      } catch (error) {
        console.error("Error fetching legal cases:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns = [
    { title: 'Case Title', dataIndex: 'title', key: 'title' },
    { title: 'Type', dataIndex: 'type', key: 'type' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (status: string) => (
      <Tag color={status === 'active' ? 'blue' : status === 'closed' ? 'green' : 'orange'}>
        {status.toUpperCase()}
      </Tag>
    )},
    { title: 'Last Updated', dataIndex: 'updatedAt', key: 'updatedAt', render: (d: string) => new Date(d).toLocaleDateString() },
  ];

  if (loading) return <Spin size="large" />;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={2}><FileProtectOutlined /> Legal Operations</Title>
        <Button type="primary" icon={<PlusOutlined />}>New Case</Button>
      </div>
      
      <Card>
        <Table 
          dataSource={cases} 
          columns={columns} 
          rowKey="uid"
          locale={{ emptyText: 'No legal cases found' }}
        />
      </Card>
    </div>
  );
};

export default Legal;
