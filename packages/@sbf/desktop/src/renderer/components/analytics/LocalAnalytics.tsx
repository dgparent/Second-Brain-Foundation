import React, { useEffect, useRef, useState } from 'react';
import { Chart, registerables, ChartConfiguration } from 'chart.js';
import { Card, Row, Col, Spin, Empty } from 'antd';

// Register Chart.js components
Chart.register(...registerables);

interface AnalyticsData {
  entityTrend: { dates: string[]; counts: number[] };
  typeDistribution: { types: string[]; counts: number[] };
  lifecycleDistribution: { states: string[]; counts: number[] };
  privacyDistribution: { levels: string[]; counts: number[] };
}

const LocalAnalytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);
  
  const trendChartRef = useRef<HTMLCanvasElement>(null);
  const typeChartRef = useRef<HTMLCanvasElement>(null);
  const lifecycleChartRef = useRef<HTMLCanvasElement>(null);
  const privacyChartRef = useRef<HTMLCanvasElement>(null);

  const chartsRef = useRef<Map<string, Chart>>(new Map());

  useEffect(() => {
    loadData();
    return () => {
      chartsRef.current.forEach(chart => chart.destroy());
      chartsRef.current.clear();
    };
  }, []);

  useEffect(() => {
    if (data && !loading) {
      renderCharts();
    }
  }, [data, loading]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load entities
      const entities = await window.sbfAPI.entities.getAll();
      
      // Calculate entity creation trend (last 30 days)
      const entityTrend = calculateEntityTrend(entities);
      
      // Calculate type distribution
      const typeDistribution = calculateTypeDistribution(entities);
      
      // Load lifecycle stats
      const lifecycleStats = await window.sbfAPI.lifecycle.getStats();
      const lifecycleDistribution = {
        states: ['Active', 'Stale', 'Archived', 'Dissolved'],
        counts: [
          lifecycleStats.activeEntities || 0,
          lifecycleStats.staleEntities || 0,
          lifecycleStats.archivedEntities || 0,
          lifecycleStats.dissolvedEntities || 0
        ]
      };

      // Load privacy stats
      const privacyStats = await window.sbfAPI.privacy.getStats();
      const privacyDistribution = {
        levels: ['Public', 'Personal', 'Private', 'Confidential'],
        counts: [
          privacyStats.publicEntities || 0,
          privacyStats.personalEntities || 0,
          privacyStats.privateEntities || 0,
          privacyStats.confidentialEntities || 0
        ]
      };

      setData({
        entityTrend,
        typeDistribution,
        lifecycleDistribution,
        privacyDistribution
      });
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateEntityTrend = (entities: any[]): { dates: string[]; counts: number[] } => {
    const dates: string[] = [];
    const counts: number[] = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dates.push(dateStr);

      const count = entities.filter((e: any) => {
        const created = new Date(e.created_at).toISOString().split('T')[0];
        return created === dateStr;
      }).length;
      counts.push(count);
    }

    return { dates, counts };
  };

  const calculateTypeDistribution = (entities: any[]): { types: string[]; counts: number[] } => {
    const typeCounts = new Map<string, number>();

    entities.forEach((entity: any) => {
      const type = entity.type || 'unknown';
      typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
    });

    const types = Array.from(typeCounts.keys());
    const counts = types.map(type => typeCounts.get(type) || 0);

    return { types, counts };
  };

  const renderCharts = () => {
    // Destroy existing charts
    chartsRef.current.forEach(chart => chart.destroy());
    chartsRef.current.clear();

    if (!data) return;

    // Entity Trend Chart
    if (trendChartRef.current) {
      const config: ChartConfiguration = {
        type: 'line',
        data: {
          labels: data.entityTrend.dates.map(d => {
            const date = new Date(d);
            return `${date.getMonth() + 1}/${date.getDate()}`;
          }),
          datasets: [{
            label: 'Entities Created',
            data: data.entityTrend.counts,
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 3,
            pointHoverRadius: 5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: true },
            tooltip: { mode: 'index', intersect: false }
          },
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1 } }
          }
        }
      };
      chartsRef.current.set('trend', new Chart(trendChartRef.current, config));
    }

    // Type Distribution Chart
    if (typeChartRef.current) {
      const config: ChartConfiguration = {
        type: 'pie',
        data: {
          labels: data.typeDistribution.types,
          datasets: [{
            data: data.typeDistribution.counts,
            backgroundColor: generateColors(data.typeDistribution.types.length),
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'right' }
          }
        }
      };
      chartsRef.current.set('type', new Chart(typeChartRef.current, config));
    }

    // Lifecycle Chart
    if (lifecycleChartRef.current) {
      const config: ChartConfiguration = {
        type: 'bar',
        data: {
          labels: data.lifecycleDistribution.states,
          datasets: [{
            label: 'Entities',
            data: data.lifecycleDistribution.counts,
            backgroundColor: ['#4CAF50', '#FF9800', '#2196F3', '#F44336'],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1 } }
          }
        }
      };
      chartsRef.current.set('lifecycle', new Chart(lifecycleChartRef.current, config));
    }

    // Privacy Chart
    if (privacyChartRef.current) {
      const config: ChartConfiguration = {
        type: 'doughnut',
        data: {
          labels: data.privacyDistribution.levels,
          datasets: [{
            data: data.privacyDistribution.counts,
            backgroundColor: ['#9E9E9E', '#2196F3', '#FF9800', '#F44336'],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'right' } }
        }
      };
      chartsRef.current.set('privacy', new Chart(privacyChartRef.current, config));
    }
  };

  const generateColors = (count: number): string[] => {
    const baseColors = [
      '#4CAF50', '#2196F3', '#FF9800', '#E91E63', 
      '#9C27B0', '#00BCD4', '#FFEB3B', '#795548'
    ];
    const colors: string[] = [];
    for (let i = 0; i < count; i++) {
      colors.push(baseColors[i % baseColors.length]);
    }
    return colors;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <Spin size="large" tip="Loading analytics..." />
      </div>
    );
  }

  if (!data) {
    return <Empty description="No analytics data available" />;
  }

  return (
    <div className="local-analytics">
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Entity Creation Trend (30 Days)">
            <div style={{ height: '300px' }}>
              <canvas ref={trendChartRef} />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Entity Type Distribution">
            <div style={{ height: '300px' }}>
              <canvas ref={typeChartRef} />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Lifecycle State Distribution">
            <div style={{ height: '300px' }}>
              <canvas ref={lifecycleChartRef} />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Privacy Level Distribution">
            <div style={{ height: '300px' }}>
              <canvas ref={privacyChartRef} />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LocalAnalytics;
