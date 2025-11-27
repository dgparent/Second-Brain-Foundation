import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Typography, Spin } from 'antd';
import { DollarOutlined, BankOutlined, RiseOutlined } from '@ant-design/icons';

const { Title } = Typography;

const Finance: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({
    netWorth: 0,
    portfolioValue: 0,
    accounts: [],
    transactions: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const netWorth = await window.sbfAPI.finance.getNetWorth().catch(() => ({ total: 0 }));
        const portfolio = await window.sbfAPI.finance.getPortfolioValue().catch(() => ({ totalValue: 0 }));
        const accounts = await window.sbfAPI.finance.getAccounts().catch(() => []);
        const transactions = await window.sbfAPI.finance.getTransactions().catch(() => []);

        setData({
          netWorth: netWorth?.total || 0,
          portfolioValue: portfolio?.totalValue || 0,
          accounts: accounts,
          transactions: transactions
        });
      } catch (error) {
        console.error("Error fetching finance data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns = [
    { title: 'Date', dataIndex: 'date', key: 'date', render: (text: string) => new Date(text).toLocaleDateString() },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (val: number) => `$${val.toFixed(2)}` },
    { title: 'Category', dataIndex: 'category', key: 'category' },
  ];

  if (loading) return <Spin size="large" />;

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Finance Overview</Title>
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card>
            <Statistic 
              title="Net Worth" 
              value={data.netWorth} 
              precision={2} 
              prefix={<DollarOutlined />} 
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic 
              title="Portfolio Value" 
              value={data.portfolioValue} 
              precision={2} 
              prefix={<RiseOutlined />} 
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic 
              title="Active Accounts" 
              value={data.accounts.length} 
              prefix={<BankOutlined />} 
            />
          </Card>
        </Col>
      </Row>

      <Card title="Recent Transactions" style={{ marginTop: '24px' }}>
        <Table 
          dataSource={data.transactions} 
          columns={columns} 
          rowKey="uid"
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </div>
  );
};

export default Finance;
