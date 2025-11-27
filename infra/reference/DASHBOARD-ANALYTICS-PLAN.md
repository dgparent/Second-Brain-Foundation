# Smart Dashboard & Analytics Implementation Plan

**Project:** Power BI-like Analytics Dashboard for Second Brain Foundation  
**Date:** 2025-11-24  
**Status:** Planning Phase

---

## Executive Summary

Implement a comprehensive analytics and visualization platform for SBF that enables users to create smart, personalized dashboards for continuous monitoring of their activities across all modules (personal tasks, health tracking, finances, projects, etc.).

**Key Objectives:**
- Enable self-service analytics for all SBF data
- Provide interactive, real-time dashboards
- Support both no-code and SQL-based query building
- Multi-tenant architecture integration
- Seamless integration with existing SBF modules

---

## Technology Stack Analysis

### Available Libraries

#### 1. **Apache Superset** ⭐ Primary Choice
**Repository:** https://github.com/apache/superset  
**License:** Apache 2.0  
**Language:** Python + React  
**Stars:** ~65K+

**Core Capabilities:**
- ✅ Enterprise-ready BI platform
- ✅ Rich visualization library (50+ chart types)
- ✅ SQL Lab for advanced querying
- ✅ No-code chart builder
- ✅ Dashboard builder with filters
- ✅ Semantic layer for metrics/dimensions
- ✅ Row-level security (RLS) - CRITICAL for multi-tenant
- ✅ Caching layer
- ✅ API for programmatic access
- ✅ Embedding support

**SBF Integration Value:**
- **Multi-tenant ready** with RLS
- **Comprehensive API** for SBF integration
- **Semantic layer** aligns with SBF entity model
- **Embedding** in Electron desktop app
- **SQL + No-code** supports all user skill levels

---

#### 2. **Grafana**
**Repository:** https://github.com/grafana/grafana  
**License:** AGPL-3.0  
**Language:** Go + TypeScript  
**Stars:** ~65K+

**Core Capabilities:**
- ✅ Time-series focused monitoring
- ✅ Real-time dashboards
- ✅ Alerting system
- ✅ Plugin architecture
- ✅ Multi-data source support
- ✅ Template variables
- ✅ Dashboard sharing

**SBF Integration Value:**
- **Real-time monitoring** for task/project progress
- **Alerts** for goals, deadlines, health metrics
- **Time-series analysis** for trends
- **Plugin system** for SBF-specific visualizations

**Use Cases:**
- Real-time task completion tracking
- Health metrics monitoring (fitness, nutrition)
- Financial portfolio tracking
- Project velocity dashboards

---

#### 3. **Metabase**
**Repository:** https://github.com/metabase/metabase  
**License:** AGPL-3.0  
**Language:** Clojure + React  
**Stars:** ~40K+

**Core Capabilities:**
- ✅ Simple, user-friendly interface
- ✅ Query builder (no SQL required)
- ✅ SQL editor for power users
- ✅ Dashboard subscriptions (email/Slack)
- ✅ Alerts
- ✅ Embedding SDK
- ✅ Models for data abstraction

**SBF Integration Value:**
- **Easiest for non-technical users**
- **Embedding SDK** for React components
- **Models** map to SBF entities
- **Subscriptions** for automated reporting

**Use Cases:**
- Simple KPI dashboards for users
- Scheduled reports (weekly summaries)
- Embedded analytics in module views
- Question-based exploration

---

#### 4. **Lightdash**
**Repository:** https://github.com/lightdash/lightdash  
**License:** MIT  
**Language:** TypeScript  
**Stars:** ~4K+

**Core Capabilities:**
- ✅ dbt-native (metrics-as-code)
- ✅ Self-service BI
- ✅ Version control for analytics
- ✅ Preview environments
- ✅ Lineage tracking
- ✅ TypeScript-based

**SBF Integration Value:**
- **TypeScript alignment** with SBF codebase
- **Metrics-as-code** approach
- **Version control** for analytics content
- **Developer-friendly**

**Use Cases:**
- Developer analytics workflows
- Metrics versioning
- CI/CD for analytics

---

## Recommended Architecture

### Phase 1: Foundation (Weeks 1-4)

#### 1.1 Database Integration Layer
**Objective:** Connect analytics tools to SBF PostgreSQL database

**Tasks:**
- [ ] Set up read-only analytics database user
- [ ] Create analytics views for all SBF entities
- [ ] Implement tenant-scoped views (WHERE tenantId = current_tenant)
- [ ] Create materialized views for common aggregations
- [ ] Set up refresh schedules for materialized views

**Deliverables:**
- Analytics schema with tenant-scoped views
- Connection strings for each analytics tool
- Documentation on view structure

---

#### 1.2 Superset Deployment & Configuration
**Objective:** Deploy and configure Superset as primary BI platform

**Tasks:**
- [ ] Deploy Superset (Docker container)
- [ ] Configure Superset database connection to SBF PostgreSQL
- [ ] Set up authentication integration with SBF (JWT/OAuth)
- [ ] Configure row-level security for multi-tenant isolation
- [ ] Create base datasets for all SBF entities
- [ ] Define semantic layer (metrics, dimensions)

**Deliverables:**
- Running Superset instance
- Authenticated access for SBF users
- Base datasets configured
- RLS rules enforced

---

#### 1.3 Grafana Deployment (Time-Series)
**Objective:** Deploy Grafana for real-time monitoring

**Tasks:**
- [ ] Deploy Grafana (Docker container)
- [ ] Configure PostgreSQL data source
- [ ] Create time-series queries for key metrics
- [ ] Build starter dashboards (tasks, health, finance)
- [ ] Set up alerting rules
- [ ] Configure user authentication

**Deliverables:**
- Running Grafana instance
- 5-10 pre-built monitoring dashboards
- Alert configurations

---

### Phase 2: Semantic Layer & Metrics (Weeks 5-8)

#### 2.1 Define SBF Metrics Framework
**Objective:** Create standardized metrics across all modules

**Module-Specific Metrics:**

**Personal Tasks:**
- Tasks completed per day/week/month
- Task completion rate
- Overdue task count
- Average task duration
- Task priority distribution

**Health Tracking:**
- Daily active minutes
- Calorie intake vs. target
- Weight trend
- Medication adherence rate
- Sleep hours

**Financial Tracking:**
- Budget variance
- Spending by category
- Portfolio performance
- Income vs. expenses
- Net worth trend

**Learning Tracker:**
- Learning hours per week
- Courses completed
- Skills acquired
- Resource completion rate

**Relationship CRM:**
- Interactions per week
- Last contact date
- Network growth rate
- Event attendance

**VA Dashboard:**
- Clients served
- Revenue by service
- Hours logged
- Invoice status

**Tasks:**
- [ ] Define metrics YAML schema
- [ ] Implement metrics for each framework
- [ ] Create calculated metrics (ratios, trends, forecasts)
- [ ] Document metric definitions
- [ ] Build metrics API endpoint

**Deliverables:**
- Metrics registry (YAML/JSON)
- API for metric retrieval
- Documentation

---

#### 2.2 Pre-Built Dashboard Templates
**Objective:** Create starter dashboards for each module

**Dashboard Types:**
1. **Personal Overview** - Cross-module KPIs
2. **Module-Specific** - Deep dive per framework
3. **Goal Tracking** - Progress toward objectives
4. **Trend Analysis** - Historical patterns
5. **Comparative** - Benchmarking and comparisons

**Tasks:**
- [ ] Design dashboard layouts (Figma/wireframes)
- [ ] Build dashboards in Superset
- [ ] Create Grafana monitoring boards
- [ ] Export dashboard templates
- [ ] Enable one-click installation for users

**Deliverables:**
- 15-20 pre-built dashboard templates
- Installation scripts
- User guide

---

### Phase 3: Embedding & Integration (Weeks 9-12)

#### 3.1 Embedded Analytics in SBF Desktop App
**Objective:** Display dashboards within SBF Electron app

**Approach 1: iFrame Embedding**
- Embed Superset dashboards via iframe
- Handle authentication via JWT
- SSO integration

**Approach 2: React Components (Metabase SDK)**
- Use Metabase Embedded Analytics SDK
- Native React components
- Custom styling to match SBF design

**Tasks:**
- [ ] Implement JWT authentication for embedding
- [ ] Create iframe wrapper component
- [ ] Add dashboard selector to desktop app
- [ ] Implement dashboard state persistence
- [ ] Add full-screen mode
- [ ] Cache dashboard data for offline access

**Deliverables:**
- Dashboard view in SBF desktop app
- Dashboard marketplace/selector
- Authentication flow

---

#### 3.2 Smart Dashboard Recommendations
**Objective:** AI-powered dashboard suggestions based on user activity

**Approach:**
- Analyze user's active modules
- Track frequently viewed data
- Recommend relevant dashboards
- Auto-generate custom dashboards

**Tasks:**
- [ ] Build activity tracking service
- [ ] Implement recommendation algorithm
- [ ] Create "Suggested for You" dashboard feed
- [ ] Add dashboard personalization
- [ ] Enable dashboard sharing

**Deliverables:**
- Recommendation engine
- Personalized dashboard feed
- Sharing functionality

---

### Phase 4: Advanced Features (Weeks 13-16)

#### 4.1 Custom Visualization Components
**Objective:** Build SBF-specific visualizations

**Custom Charts:**
- **Knowledge Graph Viewer** - Interactive entity relationships
- **Goal Progress Ring** - Circular progress indicators
- **Timeline View** - Event/task timeline
- **Heatmap Calendar** - Activity patterns
- **Network Graph** - Relationship visualization

**Tasks:**
- [ ] Build custom chart plugins for Superset
- [ ] Create Grafana panel plugins
- [ ] Implement D3.js visualizations
- [ ] Package as reusable components
- [ ] Add to SBF component library

**Deliverables:**
- 5-10 custom visualization types
- Plugin packages
- Documentation

---

#### 4.2 Natural Language Query Interface
**Objective:** Enable "ask questions" in plain English

**Approach:**
- Integrate with SBF AEI (AI-Enabled Interface)
- Convert natural language to SQL
- Generate visualizations automatically
- Save queries as reports

**Example Queries:**
- "Show my task completion rate this month"
- "How much did I spend on groceries last week?"
- "What's my average sleep time?"
- "Who haven't I contacted in 30 days?"

**Tasks:**
- [ ] Build NLQ parser using AEI
- [ ] Map questions to SQL templates
- [ ] Implement auto-chart generation
- [ ] Add voice input support
- [ ] Create query history

**Deliverables:**
- NLQ API endpoint
- Chat interface for analytics
- Voice command support

---

#### 4.3 Alerts & Notifications
**Objective:** Proactive monitoring and notifications

**Alert Types:**
- **Threshold Alerts** - "Budget exceeded by 10%"
- **Anomaly Detection** - "Unusual spending pattern detected"
- **Goal Reminders** - "2 days until deadline"
- **Trend Alerts** - "Weight trending upward"

**Delivery Channels:**
- Desktop notifications
- Email
- Slack
- SMS (optional)

**Tasks:**
- [ ] Configure Grafana alerting
- [ ] Build custom alert rules engine
- [ ] Integrate with notification service
- [ ] Add alert management UI
- [ ] Implement alert history

**Deliverables:**
- Alert rules engine
- Notification system
- Alert management interface

---

### Phase 5: Mobile & Export (Weeks 17-20)

#### 5.1 Mobile-Responsive Dashboards
**Objective:** Access dashboards on mobile devices

**Tasks:**
- [ ] Optimize dashboard layouts for mobile
- [ ] Build progressive web app (PWA)
- [ ] Add touch gestures
- [ ] Implement offline caching
- [ ] Create mobile-specific widgets

**Deliverables:**
- Mobile-optimized dashboards
- PWA for mobile access

---

#### 5.2 Export & Reporting
**Objective:** Export dashboards and generate reports

**Export Formats:**
- PDF reports
- Excel spreadsheets
- CSV data exports
- PNG/SVG images
- PowerPoint slides

**Tasks:**
- [ ] Implement PDF generation
- [ ] Add scheduled report delivery
- [ ] Create report templates
- [ ] Build export API
- [ ] Add batch export

**Deliverables:**
- Export functionality
- Scheduled reports
- Report templates

---

## Technical Implementation Details

### Database Schema for Analytics

```sql
-- Analytics-specific views

-- Tenant-scoped entity views
CREATE VIEW analytics.vw_tasks AS
SELECT 
    t.*,
    t.tenantId,
    u.name as assigneeName,
    p.name as projectName
FROM tasks t
LEFT JOIN users u ON t.assigneeId = u.id
LEFT JOIN projects p ON t.projectId = p.id
WHERE t.tenantId = current_setting('app.current_tenant')::uuid;

-- Aggregated metrics views
CREATE MATERIALIZED VIEW analytics.mv_daily_task_metrics AS
SELECT
    tenantId,
    DATE(completedAt) as date,
    COUNT(*) as tasks_completed,
    AVG(EXTRACT(EPOCH FROM (completedAt - createdAt))/3600) as avg_completion_hours
FROM tasks
WHERE completedAt IS NOT NULL
GROUP BY tenantId, DATE(completedAt);

-- Refresh schedule
CREATE INDEX idx_daily_metrics_tenant ON analytics.mv_daily_task_metrics(tenantId, date);
```

---

### Superset Configuration

```yaml
# superset_config.py

# Row-level security
ROW_LEVEL_SECURITY_ENABLED = True

# JWT authentication
ENABLE_PROXY_FIX = True
JWT_SECRET_KEY = os.environ.get('SBF_JWT_SECRET')

# Database connection
SQLALCHEMY_DATABASE_URI = os.environ.get('SBF_ANALYTICS_DB_URI')

# Embedding
ENABLE_EMBEDDED_SUPERSET = True
EMBEDDED_SUPERSET_DOMAINS = ['localhost', 'app.sbf.local']

# Caching
CACHE_CONFIG = {
    'CACHE_TYPE': 'redis',
    'CACHE_REDIS_URL': os.environ.get('REDIS_URL')
}
```

---

### SBF Desktop Integration

```typescript
// packages/@sbf/desktop/src/views/Analytics.tsx

import React from 'react';
import { useAuth } from '../hooks/useAuth';

export const AnalyticsView: React.FC = () => {
  const { user, getJWT } = useAuth();
  const [dashboardUrl, setDashboardUrl] = useState<string>('');

  useEffect(() => {
    // Generate embedded dashboard URL with JWT
    const jwt = getJWT();
    const url = `http://localhost:8088/superset/dashboard/1/?standalone=true&jwt=${jwt}`;
    setDashboardUrl(url);
  }, []);

  return (
    <div className="analytics-container">
      <iframe
        src={dashboardUrl}
        width="100%"
        height="100%"
        frameBorder="0"
        sandbox="allow-same-origin allow-scripts"
      />
    </div>
  );
};
```

---

### Metrics API

```typescript
// packages/@sbf/api/src/routes/metrics.ts

import { Router } from 'express';
import { requireTenant } from '../middleware/tenancy';

const router = Router();

router.get('/metrics/:module', requireTenant, async (req, res) => {
  const { module } = req.params;
  const { tenantId } = req.tenant;
  
  const metrics = await MetricsService.getModuleMetrics({
    module,
    tenantId,
    dateRange: req.query.dateRange
  });
  
  res.json(metrics);
});

export default router;
```

---

## Module-Specific Dashboard Examples

### 1. Personal Tasks Dashboard

**Metrics:**
- Tasks completed today/week/month
- Completion rate %
- Overdue tasks count
- Average completion time
- Tasks by priority
- Tasks by project

**Visualizations:**
- Line chart: Task completion trend
- Donut chart: Tasks by status
- Bar chart: Tasks by project
- KPI cards: Key numbers
- Calendar heatmap: Activity pattern

---

### 2. Health Tracking Dashboard

**Metrics:**
- Daily active minutes
- Calories consumed vs. target
- Weight trend
- Sleep hours
- Medication adherence

**Visualizations:**
- Line chart: Weight over time
- Bar chart: Daily calories
- Progress bar: Activity goal
- Calendar: Workout days
- Table: Medication schedule

---

### 3. Financial Dashboard

**Metrics:**
- Budget vs. actual spending
- Spending by category
- Income vs. expenses
- Portfolio value
- Net worth trend

**Visualizations:**
- Waterfall chart: Budget variance
- Pie chart: Spending breakdown
- Area chart: Net worth over time
- KPI cards: Key financial metrics
- Table: Recent transactions

---

### 4. VA Dashboard (Business)

**Metrics:**
- Active clients
- Revenue this month
- Hours logged
- Invoice status
- Project completion rate

**Visualizations:**
- Bar chart: Revenue by client
- Line chart: Hours logged trend
- Funnel chart: Project pipeline
- Table: Pending invoices
- KPI cards: Business metrics

---

## Recommended Module Structure

```
packages/@sbf/modules/analytics-dashboard/
├── src/
│   ├── components/
│   │   ├── DashboardGrid.tsx
│   │   ├── ChartWidget.tsx
│   │   ├── MetricCard.tsx
│   │   └── DashboardSelector.tsx
│   ├── services/
│   │   ├── SupersetService.ts
│   │   ├── GrafanaService.ts
│   │   └── MetricsService.ts
│   ├── hooks/
│   │   ├── useDashboard.ts
│   │   ├── useMetrics.ts
│   │   └── useChartData.ts
│   ├── types/
│   │   ├── Dashboard.ts
│   │   ├── Metric.ts
│   │   └── Chart.ts
│   └── index.ts
├── dashboards/
│   ├── templates/
│   │   ├── personal-overview.json
│   │   ├── task-tracker.json
│   │   ├── health-dashboard.json
│   │   └── financial-summary.json
│   └── custom/
├── metrics/
│   ├── definitions/
│   │   ├── tasks.yaml
│   │   ├── health.yaml
│   │   └── finance.yaml
│   └── aggregations/
└── README.md
```

---

## Integration with Existing SBF Modules

### Multi-Tenant Support

All dashboards must respect tenant isolation:

```typescript
// Apply tenant filter to all queries
const getDashboardData = async (dashboardId: string, tenantId: string) => {
  const filters = {
    tenantId: tenantId, // Always inject tenant filter
    ...userFilters
  };
  
  return await SupersetService.getData(dashboardId, filters);
};
```

### Entity Integration

Dashboards should link back to entity detail views:

```typescript
// Click handler for chart data points
const onChartClick = (dataPoint: any) => {
  const entityType = dataPoint.entityType; // 'task', 'transaction', etc.
  const entityId = dataPoint.id;
  
  navigate(`/${entityType}/${entityId}`);
};
```

---

## Deployment Strategy

### Docker Compose Configuration

```yaml
version: '3.8'

services:
  superset:
    image: apache/superset:latest
    environment:
      - SUPERSET_SECRET_KEY=${SUPERSET_SECRET_KEY}
      - DATABASE_URL=${SBF_DB_URL}
    ports:
      - "8088:8088"
    volumes:
      - ./superset_config.py:/app/superset_config.py
    depends_on:
      - postgres
      - redis

  grafana:
    image: grafana/grafana:latest
    environment:
      - GF_DATABASE_URL=${SBF_DB_URL}
      - GF_AUTH_JWT_ENABLED=true
    ports:
      - "3000:3000"
    volumes:
      - ./grafana/provisioning:/etc/grafana/provisioning

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=sbf
      - POSTGRES_USER=sbf
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

---

## Success Metrics

### KPIs for Analytics Module

1. **Adoption Rate:** % of users creating/viewing dashboards
2. **Dashboard Usage:** Average dashboards viewed per user/day
3. **Query Performance:** Average query response time < 2s
4. **User Satisfaction:** NPS score > 50
5. **Self-Service Rate:** % of insights discovered without support

---

## Risks & Mitigation

### Risk 1: Performance with Large Datasets
**Mitigation:** 
- Implement materialized views
- Add Redis caching layer
- Use query result caching
- Limit time range for queries

### Risk 2: Multi-Tenant Data Leakage
**Mitigation:**
- Enforce RLS at database level
- Add application-level tenant checks
- Audit all queries for tenant isolation
- Regular security testing

### Risk 3: User Complexity
**Mitigation:**
- Provide pre-built dashboards
- Add guided tours
- Include video tutorials
- Offer dashboard templates

### Risk 4: Maintenance Overhead
**Mitigation:**
- Use managed services where possible
- Automate dashboard deployment
- Version control all configurations
- Document extensively

---

## Next Steps

### Immediate Actions (This Week)

1. **Set up development environment**
   - Deploy Superset locally
   - Deploy Grafana locally
   - Connect to SBF database

2. **Create proof-of-concept**
   - Build one dashboard for Tasks module
   - Embed in desktop app
   - Demo to stakeholders

3. **Design metrics schema**
   - Define 20-30 core metrics
   - Create YAML schema
   - Document calculations

4. **Technical spike**
   - Test embedding approaches
   - Validate multi-tenant RLS
   - Measure query performance

### Week 2-4 Priorities

- Complete Phase 1 (Database Integration + Superset Setup)
- Build 3-5 starter dashboards
- Implement authentication/embedding
- Create user documentation

---

## Resources & References

### Official Documentation
- Superset: https://superset.apache.org/docs/intro
- Grafana: https://grafana.com/docs/
- Metabase: https://www.metabase.com/docs/
- Lightdash: https://docs.lightdash.com/

### SBF References
- Multi-tenant architecture: `.bmad-core/workspace/MULTI-TENANT-INSTRUCTIONS.md`
- Entity schemas: `packages/@sbf/shared/src/types/`
- API endpoints: `aei-core/api/`
- Desktop app: `packages/@sbf/desktop/`

### Community Examples
- Superset examples: https://github.com/apache/superset/tree/master/superset-frontend/plugins
- Grafana dashboards: https://grafana.com/grafana/dashboards/
- Metabase community: https://www.metabase.com/community/

---

## Conclusion

This implementation plan provides a comprehensive roadmap for building a Power BI-like analytics platform for SBF. By leveraging Apache Superset as the primary BI tool, complemented by Grafana for real-time monitoring, we can deliver a robust, multi-tenant analytics solution that empowers users to gain insights from their data across all SBF modules.

**Estimated Timeline:** 20 weeks (5 months)  
**Team Size:** 2-3 developers  
**Priority:** High - Core feature for SBF v2.0

---

**Last Updated:** 2025-11-24  
**Next Review:** 2025-12-01
