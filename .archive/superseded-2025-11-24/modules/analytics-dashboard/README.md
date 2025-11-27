# @sbf/modules/analytics-dashboard

**Power BI-like Analytics & Visualization Module for SBF**

## Overview

The Analytics Dashboard module provides comprehensive business intelligence and data visualization capabilities for Second Brain Foundation. It integrates with industry-leading open-source BI tools to deliver insights across all SBF modules.

## Features

- 📊 **Interactive Dashboards** - Real-time, customizable dashboards
- 📈 **Rich Visualizations** - 50+ chart types and visualization options
- 🔍 **Self-Service Analytics** - No-code and SQL-based querying
- 🎯 **Module Integration** - Pre-built dashboards for all SBF modules
- 🔐 **Multi-Tenant Support** - Row-level security and data isolation
- 🔔 **Alerts & Notifications** - Proactive monitoring and notifications
- 📱 **Mobile Responsive** - Access dashboards on any device
- 🎨 **Custom Visualizations** - SBF-specific chart types

## Technology Stack

### Primary BI Platform: Apache Superset
- **Enterprise-grade** BI with semantic layer
- **50+ chart types** for diverse visualization needs
- **Row-level security** for multi-tenant isolation
- **Embedding support** for seamless integration
- **SQL Lab** for advanced analytics

### Real-Time Monitoring: Grafana
- **Time-series focused** monitoring
- **Alerting system** for proactive notifications
- **Plugin architecture** for extensibility
- **Real-time updates** for live dashboards

### User-Friendly BI: Metabase
- **Simple interface** for non-technical users
- **Embedding SDK** for native React integration
- **Scheduled reports** for automated insights
- **Quick setup** with minimal configuration

### Developer-Friendly: Lightdash
- **TypeScript-first** architecture
- **Metrics as code** for version control
- **dbt integration** for data modeling
- **CI/CD workflows** for analytics

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SBF Desktop App                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │          Analytics Dashboard Module                   │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │ Dashboard   │  │   Metrics   │  │   Alerts    │  │  │
│  │  │  Selector   │  │   Service   │  │   Service   │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   BI Platform Layer                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Superset │  │ Grafana  │  │ Metabase │  │Lightdash │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Analytics Database Layer                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  PostgreSQL with Analytics Views (Tenant-Scoped)     │  │
│  │  ┌─────────┐  ┌──────────┐  ┌────────────────────┐  │  │
│  │  │  Tasks  │  │  Health  │  │     Finances       │  │  │
│  │  │  Views  │  │  Views   │  │     Views          │  │  │
│  │  └─────────┘  └──────────┘  └────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Module Structure

```
analytics-dashboard/
├── src/
│   ├── components/          # React components
│   │   ├── DashboardGrid.tsx
│   │   ├── ChartWidget.tsx
│   │   ├── MetricCard.tsx
│   │   └── DashboardSelector.tsx
│   ├── services/            # Integration services
│   │   ├── SupersetService.ts
│   │   ├── GrafanaService.ts
│   │   ├── MetabaseService.ts
│   │   └── MetricsService.ts
│   ├── hooks/               # React hooks
│   │   ├── useDashboard.ts
│   │   ├── useMetrics.ts
│   │   └── useChartData.ts
│   ├── types/               # TypeScript types
│   │   ├── Dashboard.ts
│   │   ├── Metric.ts
│   │   ├── Chart.ts
│   │   └── Alert.ts
│   ├── config/              # Configuration
│   │   └── analytics.config.ts
│   └── index.ts             # Module entry point
├── dashboards/              # Dashboard templates
│   ├── templates/
│   │   ├── personal-overview.json
│   │   ├── task-tracker.json
│   │   ├── health-dashboard.json
│   │   ├── financial-summary.json
│   │   └── va-business.json
│   └── custom/              # User custom dashboards
├── metrics/                 # Metrics definitions
│   ├── definitions/
│   │   ├── tasks.yaml
│   │   ├── health.yaml
│   │   ├── finance.yaml
│   │   └── common.yaml
│   └── aggregations/
├── sql/                     # SQL queries and views
│   ├── views/
│   │   ├── analytics_tasks.sql
│   │   ├── analytics_health.sql
│   │   └── analytics_finance.sql
│   └── materialized_views/
│       └── daily_metrics.sql
└── README.md
```

## Installation

```bash
# Install dependencies
npm install

# Build the module
npm run build

# Run tests
npm test
```

## Usage

### Basic Dashboard Integration

```typescript
import { AnalyticsDashboard, DashboardType } from '@sbf/modules/analytics-dashboard';

// Display a pre-built dashboard
<AnalyticsDashboard
  type={DashboardType.PERSONAL_OVERVIEW}
  tenantId={user.tenantId}
  userId={user.id}
/>
```

### Custom Dashboard Creation

```typescript
import { useDashboard } from '@sbf/modules/analytics-dashboard';

const MyCustomDashboard = () => {
  const { createDashboard, addWidget } = useDashboard();
  
  const dashboard = createDashboard({
    name: "My Custom Dashboard",
    layout: "grid"
  });
  
  addWidget(dashboard, {
    type: "chart",
    chartType: "line",
    dataSource: "tasks",
    metric: "completion_rate"
  });
  
  return <DashboardView dashboard={dashboard} />;
};
```

### Metrics Retrieval

```typescript
import { useMetrics } from '@sbf/modules/analytics-dashboard';

const MetricsDisplay = () => {
  const { getMetrics } = useMetrics();
  
  const taskMetrics = await getMetrics({
    module: "tasks",
    dateRange: "last_30_days",
    metrics: ["completion_rate", "overdue_count"]
  });
  
  return <MetricCards data={taskMetrics} />;
};
```

## Pre-Built Dashboards

### 1. Personal Overview
Comprehensive view across all modules with key KPIs.

**Metrics:**
- Tasks completion rate
- Health score
- Budget status
- Learning progress
- Recent interactions

### 2. Task Tracker
Deep dive into task management and productivity.

**Metrics:**
- Daily/weekly/monthly completion
- Task priority distribution
- Overdue tasks
- Average completion time
- Tasks by project

### 3. Health Dashboard
Monitor fitness, nutrition, and wellness metrics.

**Metrics:**
- Daily active minutes
- Calorie intake vs. target
- Weight trend
- Sleep hours
- Medication adherence

### 4. Financial Summary
Track budgets, expenses, and portfolio performance.

**Metrics:**
- Budget vs. actual spending
- Spending by category
- Income vs. expenses
- Portfolio value
- Net worth trend

### 5. VA Business Dashboard
Monitor virtual assistant business performance.

**Metrics:**
- Active clients
- Revenue this month
- Hours logged
- Invoice status
- Project pipeline

## Configuration

### Analytics Configuration

```typescript
// config/analytics.config.ts
export const analyticsConfig = {
  superset: {
    url: process.env.SUPERSET_URL || 'http://localhost:8088',
    apiKey: process.env.SUPERSET_API_KEY,
    embedding: {
      enabled: true,
      domains: ['localhost', 'app.sbf.local']
    }
  },
  grafana: {
    url: process.env.GRAFANA_URL || 'http://localhost:3000',
    apiKey: process.env.GRAFANA_API_KEY
  },
  metabase: {
    url: process.env.METABASE_URL || 'http://localhost:3000',
    apiKey: process.env.METABASE_API_KEY
  },
  database: {
    analyticsSchema: 'analytics',
    refreshInterval: 3600 // 1 hour
  }
};
```

## Multi-Tenant Support

All dashboards automatically filter data by tenant ID:

```typescript
// Row-level security applied automatically
const dashboard = await getDashboard({
  dashboardId: 'personal-overview',
  tenantId: currentUser.tenantId // Enforced in queries
});
```

## Performance Optimization

- **Materialized Views** - Pre-aggregated metrics refresh hourly
- **Query Caching** - Redis-based caching for 5 minutes
- **Lazy Loading** - Dashboards load widgets on demand
- **Data Sampling** - Large datasets use intelligent sampling

## Security

- **Row-Level Security (RLS)** - Database-level tenant isolation
- **JWT Authentication** - Secure embedding with tokens
- **API Key Management** - Encrypted storage of API keys
- **Audit Logging** - All dashboard access logged

## API Reference

### Dashboard Service

```typescript
interface DashboardService {
  getDashboard(id: string, tenantId: string): Promise<Dashboard>;
  createDashboard(config: DashboardConfig): Promise<Dashboard>;
  updateDashboard(id: string, updates: Partial<Dashboard>): Promise<Dashboard>;
  deleteDashboard(id: string): Promise<void>;
  listDashboards(tenantId: string): Promise<Dashboard[]>;
}
```

### Metrics Service

```typescript
interface MetricsService {
  getMetrics(query: MetricsQuery): Promise<MetricData[]>;
  defineMetric(metric: MetricDefinition): Promise<void>;
  getMetricDefinitions(module: string): Promise<MetricDefinition[]>;
  calculateMetric(metric: string, context: MetricContext): Promise<number>;
}
```

## Development

### Running Locally

```bash
# Start Superset
docker-compose up superset

# Start Grafana
docker-compose up grafana

# Run development server
npm run dev
```

### Adding New Dashboards

1. Create dashboard template in `dashboards/templates/`
2. Define required metrics in `metrics/definitions/`
3. Add SQL views if needed in `sql/views/`
4. Register dashboard in module configuration
5. Add tests

### Adding Custom Visualizations

1. Create chart component in `src/components/charts/`
2. Register with chart registry
3. Add to Superset as custom viz plugin
4. Document usage

## Roadmap

### Phase 1: Foundation (Complete)
- ✅ Module structure
- ✅ Basic dashboard integration
- ✅ Superset deployment

### Phase 2: Core Features (In Progress)
- 🔄 Pre-built dashboard templates
- 🔄 Metrics definitions
- 🔄 Embedding in desktop app

### Phase 3: Advanced Features (Planned)
- ⏳ Natural language queries
- ⏳ Custom visualizations
- ⏳ Mobile app support
- ⏳ Export/reporting

### Phase 4: AI-Powered (Future)
- 📋 Auto-generated insights
- 📋 Anomaly detection
- 📋 Predictive analytics
- 📋 Smart recommendations

## Contributing

See [CONTRIBUTING.md](../../../../CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](../../../../LICENSE) for details.

## Related Documentation

- [Implementation Plan](../../../../libraries/DASHBOARD-ANALYTICS-PLAN.md)
- [Superset Documentation](https://superset.apache.org/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Metabase Documentation](https://www.metabase.com/docs/)
- [SBF Multi-Tenant Guide](.bmad-core/workspace/MULTI-TENANT-INSTRUCTIONS.md)

## Support

For questions or issues:
- GitHub Issues: https://github.com/SecondBrainFoundation/sbf/issues
- Documentation: https://docs.sbf.foundation
- Community Slack: https://sbf.slack.com

---

**Last Updated:** 2025-11-24  
**Status:** In Development  
**Maintainer:** SBF Core Team
