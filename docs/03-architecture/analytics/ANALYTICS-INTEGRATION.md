# Analytics Dashboard Integration

## Overview

The Second Brain Foundation now includes integrated analytics dashboards using Apache Superset and Grafana, providing powerful business intelligence capabilities for monitoring and analyzing user activities, tasks, projects, and entity relationships.

## Architecture

### Components

1. **PostgreSQL Analytics Schema** (`analytics`)
   - Materialized views for optimized query performance
   - Tenant-scoped views with row-level security
   - Automatic refresh mechanisms

2. **Apache Superset** (Port 8088)
   - Advanced data visualization
   - Custom SQL dashboards
   - Embedded dashboard support
   - Multi-tenant isolation via RLS

3. **Grafana** (Port 3000)
   - Real-time monitoring
   - Time-series analytics
   - Custom dashboard creation
   - PostgreSQL datasource integration

4. **NestJS Analytics API**
   - RESTful endpoints for analytics data
   - Tenant context management
   - Dashboard configuration storage
   - Embed token generation

5. **React Dashboard Components**
   - Superset embed integration
   - Grafana embed integration
   - Custom analytics views
   - Real-time data refresh

## Database Schema

### Materialized Views

- **tenant_activity_summary**: Aggregate statistics per tenant
- **user_activity_metrics**: User engagement and activity tracking
- **task_completion_metrics**: Task completion rates and trends
- **project_progress_metrics**: Project status and progress tracking
- **entity_relationship_metrics**: Relationship graph analytics
- **daily_activity_timeline**: Daily activity breakdown by entity type

### Tenant-Scoped Views

All views are available in tenant-scoped versions (prefixed with `my_`) that automatically filter based on the current tenant context:

```sql
-- Set tenant context
SET app.current_tenant_id = '<tenant-uuid>';

-- Query tenant-scoped view
SELECT * FROM analytics.my_tenant_activity;
```

## Setup Instructions

### 1. Database Setup

Run the analytics schema initialization:

```bash
docker-compose up -d postgres
docker exec -i sbf-postgres psql -U sbf_user -d sbf_db < scripts/init-analytics-schema.sql
```

### 2. Start Analytics Services

```bash
# Start Superset and Grafana
docker-compose up -d superset grafana

# Check service health
docker-compose ps
```

### 3. Initial Configuration

#### Superset

1. Access Superset: http://localhost:8088
2. Login with credentials:
   - Username: `admin`
   - Password: (from `SUPERSET_ADMIN_PASSWORD` env var)
3. Add PostgreSQL database connection:
   - Go to Data → Databases → + Database
   - Select PostgreSQL
   - SQLAlchemy URI: `postgresql://sbf_user:changeme@postgres:5432/sbf_db`

#### Grafana

1. Access Grafana: http://localhost:3000
2. Login with credentials:
   - Username: (from `GRAFANA_ADMIN_USER` env var)
   - Password: (from `GRAFANA_ADMIN_PASSWORD` env var)
3. PostgreSQL datasource is auto-provisioned via `config/grafana/provisioning/datasources/datasource.yml`

### 4. Create Dashboards

#### Superset Dashboards

Example SQL for tenant overview dashboard:

```sql
SELECT 
  tenant_name,
  total_entities,
  total_tasks,
  total_projects,
  total_people,
  last_activity_at
FROM analytics.my_tenant_activity;
```

#### Grafana Dashboards

Example query for task completion timeline:

```sql
SELECT 
  week_start as time,
  completed_tasks,
  in_progress_tasks,
  todo_tasks,
  completion_rate
FROM analytics.my_task_metrics
WHERE $__timeFilter(week_start)
ORDER BY week_start;
```

## API Endpoints

### Analytics Endpoints

```
GET  /analytics/tenant-summary          - Tenant activity summary
GET  /analytics/user-activity           - User activity metrics
GET  /analytics/task-metrics            - Task completion metrics
GET  /analytics/project-progress        - Project progress tracking
GET  /analytics/entity-relationships    - Entity relationship metrics
GET  /analytics/daily-timeline          - Daily activity timeline
POST /analytics/dashboard-config        - Save dashboard configuration
GET  /analytics/dashboard-config        - Get dashboard configurations
GET  /analytics/superset-embed-token    - Get Superset embed token
GET  /analytics/grafana-embed-url       - Get Grafana embed URL
POST /analytics/refresh-views           - Refresh materialized views
```

### Example Request

```bash
curl -X GET http://localhost:8000/analytics/tenant-summary \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Tenant-ID: tenant-uuid"
```

## React Components

### Integration in Desktop App

```tsx
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard';

function App() {
  return (
    <AnalyticsDashboard 
      tenantId={currentTenant.id}
      userId={currentUser.id}
    />
  );
}
```

### Available Components

- `AnalyticsDashboard`: Main dashboard container with tabs
- `SupersetDashboard`: Embedded Superset dashboards
- `GrafanaDashboard`: Embedded Grafana dashboards
- `CustomAnalytics`: Built-in React analytics views

## Multi-Tenant Isolation

### Row-Level Security (RLS)

All analytics queries are automatically scoped to the current tenant using the `app.current_tenant_id` session variable:

```typescript
// Set tenant context before querying
await pool.query(`SET app.current_tenant_id = $1`, [tenantId]);

// All subsequent queries are tenant-scoped
const results = await pool.query('SELECT * FROM analytics.my_tenant_activity');
```

### Dashboard Embedding

#### Superset

Embed tokens include tenant-specific RLS clauses:

```typescript
const token = jwt.sign({
  user: { username: userId },
  resources: [{ type: 'dashboard', id: dashboardId }],
  rls: [{ clause: `tenant_id = '${tenantId}'` }]
}, supersetSecret);
```

#### Grafana

Dashboard URLs include tenant variable:

```
http://localhost:3000/d/dashboard-uid?kiosk=true&var-tenant_id=tenant-uuid
```

## Performance Optimization

### Materialized View Refresh

Materialized views can be refreshed on-demand or scheduled:

```sql
-- Manual refresh
SELECT analytics.refresh_all_views();

-- Schedule with pg_cron (if installed)
SELECT cron.schedule('refresh-analytics', '*/15 * * * *', 
  'SELECT analytics.refresh_all_views()');
```

### Indexing

All materialized views have appropriate indexes for tenant-scoped queries. See `init-analytics-schema.sql` for details.

## Monitoring & Maintenance

### Health Check

```bash
curl http://localhost:8000/analytics/tenant-summary
```

### View Statistics

```sql
SELECT 
  schemaname, 
  matviewname, 
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||matviewname)) as size
FROM pg_matviews 
WHERE schemaname = 'analytics';
```

## Environment Variables

```env
# Superset
SUPERSET_SECRET_KEY=your-superset-secret-key
SUPERSET_ADMIN_PASSWORD=admin-password
SUPERSET_URL=http://localhost:8088

# Grafana
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=admin-password
GRAFANA_URL=http://localhost:3000

# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=sbf_db
POSTGRES_USER=sbf_user
POSTGRES_PASSWORD=changeme
```

## Dashboard Examples

### Pre-built Dashboards

1. **Tenant Overview**
   - Total entities, tasks, projects
   - Activity timeline
   - Recent updates

2. **Task Analytics**
   - Completion rates by week
   - Status distribution
   - Priority breakdown
   - Blocked tasks tracking

3. **Project Progress**
   - Project status overview
   - Progress percentages
   - Task completion per project
   - Timeline visualization

4. **User Activity**
   - Daily activity counts
   - Entity creation patterns
   - Engagement metrics
   - Activity heatmaps

## Troubleshooting

### Superset Connection Issues

```bash
# Check Superset logs
docker logs sbf-superset

# Restart Superset
docker-compose restart superset
```

### Grafana Datasource Issues

```bash
# Check Grafana logs
docker logs sbf-grafana

# Test PostgreSQL connection
docker exec sbf-grafana grafana-cli plugins list
```

### Analytics Views Not Updating

```bash
# Manually refresh views
docker exec -i sbf-postgres psql -U sbf_user -d sbf_db \
  -c "SELECT analytics.refresh_all_views();"
```

## Future Enhancements

- [ ] Metabase integration for citizen analytics
- [ ] Lightdash integration for dbt-powered metrics
- [ ] Real-time streaming analytics with WebSockets
- [ ] Predictive analytics and ML models
- [ ] Custom alert system based on metrics
- [ ] Export/import dashboard configurations
- [ ] Multi-dashboard templating
- [ ] Advanced filtering and drill-down capabilities

## Related Documentation

- [Multi-Tenant Architecture](../.temp-workspace/multi-tenant-instructions.md)
- [API Documentation](../aei-core/API-QUICKSTART.md)
- [Docker Compose Setup](../docker-compose.yml)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Superset docs: https://superset.apache.org/docs/intro
3. Review Grafana docs: https://grafana.com/docs/
4. Open an issue in the repository
