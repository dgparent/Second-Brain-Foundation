import React, { useEffect, useState } from 'react';
import { Card, Table, Typography, Spin, Tag, Button, DatePicker } from 'antd';
import { SafetyCertificateOutlined, PlusOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const HACCP: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await window.sbfAPI.haccp.getLogs({}).catch(() => []);
        setLogs(data);
      } catch (error) {
        console.error("Error fetching HACCP logs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns = [
    { title: 'Timestamp', dataIndex: 'timestamp', key: 'timestamp', render: (d: string) => new Date(d).toLocaleString() },
    { title: 'Checkpoint', dataIndex: 'checkpoint', key: 'checkpoint' },
    { title: 'Value', dataIndex: 'value', key: 'value' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (status: string) => (
      <Tag color={status === 'pass' ? 'green' : 'red'}>
        {status.toUpperCase()}
      </Tag>
    )},
    { title: 'Operator', dataIndex: 'operator', key: 'operator' },
  ];

  if (loading) return <Spin size="large" />;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={2}><SafetyCertificateOutlined /> Food Safety (HACCP)</Title>
        <div>
          <RangePicker style={{ marginRight: '10px' }} />
          <Button type="primary" icon={<PlusOutlined />}>Log Entry</Button>
        </div>
      </div>
      
      <Card>
        <Table 
          dataSource={logs} 
          columns={columns} 
          rowKey="uid"
          locale={{ emptyText: 'No safety logs found' }}
        />
      </Card>
    </div>
  );
};

export default HACCP;
