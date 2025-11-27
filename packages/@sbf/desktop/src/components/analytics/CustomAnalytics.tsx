import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Progress, Spin } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  CheckCircleOutlined,
  ProjectOutlined,
  TeamOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { Line, Bar, Pie } from '@ant-design/charts';
import { analyticsApi } from '../../services/api';

interface CustomAnalyticsProps {
  tenantId: string;
  userId: string;
}

const CustomAnalytics: React.FC<CustomAnalyticsProps> = ({ tenantId, userId }) => {
  const [loading, setLoading] = useState(true);
  const [tenantSummary, setTenantSummary] = useState<any>(null);
  const [taskMetrics, setTaskMetrics] = useState<any[]>([]);
  const [projectProgress, setProjectProgress] = useState<any[]>([]);
  const [dailyTimeline, setDailyTimeline] = useState<any[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, [tenantId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [summary, tasks, projects, timeline] = await Promise.all([
        analyticsApi.getTenantSummary(tenantId),
        analyticsApi.getTaskMetrics(tenantId),
        analyticsApi.getProjectProgress(tenantId),
        analyticsApi.getDailyTimeline(tenantId, 30),
      ]);

      setTenantSummary(summary);
      setTaskMetrics(tasks);
      setProjectProgress(projects);
      setDailyTimeline(timeline);
    } catch (error) {
      console.error('Analytics loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  const taskStatusData = taskMetrics.length > 0
    ? [
        { status: 'Completed', count: taskMetrics[0].completed_tasks },
        { status: 'In Progress', count: taskMetrics[0].in_progress_tasks },
        { status: 'Todo', count: taskMetrics[0].todo_tasks },
        { status: 'Blocked', count: taskMetrics[0].blocked_tasks },
      ]
    : [];

  const timelineConfig = {
    data: dailyTimeline.map(d => ({
      date: d.activity_date,
      type: d.entity_type,
      count: d.entities_created,
    })),
    xField: 'date',
    yField: 'count',
    seriesField: 'type',
    smooth: true,
  };

  const taskCompletionConfig = {
    data: taskMetrics.map(m => ({
      week: m.week_start,
      rate: m.completion_rate,
    })),
    xField: 'week',
    yField: 'rate',
    label: {
      style: {
        fill: '#1890ff',
      },
    },
  };

  const projectColumns = [
    {
      title: 'Project Name',
      dataIndex: 'project_name',
      key: 'project_name',
    },
    {
      title: 'Status',
      dataIndex: 'project_status',
      key: 'project_status',
    },
    {
      title: 'Progress',
      dataIndex: 'progress_percentage',
      key: 'progress',
      render: (progress: number) => <Progress percent={progress || 0} />,
    },
    {
      title: 'Tasks',
      dataIndex: 'total_tasks',
      key: 'tasks',
      render: (total: number, record: any) => 
        `${record.completed_tasks || 0} / ${total || 0}`,
    },
  ];

  return (
    <div className="custom-analytics">
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Entities"
              value={tenantSummary?.total_entities || 0}
              prefix={<ProjectOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Tasks"
              value={tenantSummary?.total_tasks || 0}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Projects"
              value={tenantSummary?.total_projects || 0}
              prefix={<ProjectOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total People"
              value={tenantSummary?.total_people || 0}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={12}>
          <Card title="Activity Timeline (30 Days)">
            <Line {...timelineConfig} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Task Completion Rate">
            <Bar {...taskCompletionConfig} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={24}>
          <Card title="Project Progress">
            <Table
              dataSource={projectProgress}
              columns={projectColumns}
              rowKey="project_id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CustomAnalytics;
