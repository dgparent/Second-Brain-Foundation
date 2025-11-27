# Analytics Dashboard - Quick Reference

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# PowerShell (Windows)
.\scripts\setup-analytics.ps1

# Bash (Linux/Mac)
chmod +x scripts/setup-analytics.sh
./scripts/setup-analytics.sh
```

### Option 2: Manual Setup

```bash
# 1. Start services
docker-compose up -d postgres redis superset grafana api

# 2. Wait for PostgreSQL
docker-compose exec postgres pg_isready

# 3. Initialize analytics schema
Get-Content .\scripts\init-analytics-schema.sql | docker-compose exec -T postgres psql -U sbf_user -d sbf_db
```

## 🔑 Access URLs

| Service | URL | Default Credentials |
|---------|-----|-------------------|
| Superset | http://localhost:8088 | admin / (SUPERSET_ADMIN_PASSWORD) |
| Grafana | http://localhost:3000 | admin / (GRAFANA_ADMIN_PASSWORD) |
| API | http://localhost:8000 | Bearer token required |

## 📊 API Endpoints

```bash
# Base URL: http://localhost:8000/analytics

GET  /tenant-summary              # Tenant overview
GET  /user-activity               # User metrics
GET  /task-metrics                # Task analytics
GET  /project-progress            # Project tracking
GET  /entity-relationships        # Relationship metrics
GET  /daily-timeline              # Activity timeline
POST /dashboard-config            # Save dashboard
GET  /dashboard-config            # Get dashboards
GET  /superset-embed-token        # Superset token
GET  /grafana-embed-url           # Grafana URL
POST /refresh-views               # Refresh data
```

### Example Request

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -H "X-Tenant-ID: tenant-uuid" \
     http://localhost:8000/analytics/tenant-summary
```

## 🗄️ Database Views

### Materialized Views (Fast Queries)
- `analytics.tenant_activity_summary`
- `analytics.user_activity_metrics`
- `analytics.task_completion_metrics`
- `analytics.project_progress_metrics`
- `analytics.entity_relationship_metrics`
- `analytics.daily_activity_timeline`

### Tenant-Scoped Views (Auto-Filtered)
- `analytics.my_tenant_activity`
- `analytics.my_user_activity`
- `analytics.my_task_metrics`
- `analytics.my_project_metrics`
- `analytics.my_entity_relationships`
- `analytics.my_daily_timeline`

## 🔄 Refresh Data

```sql
-- Refresh all analytics views
SELECT analytics.refresh_all_views();
```

Or via API:
```bash
curl -X POST http://localhost:8000/analytics/refresh-views
```

## 🧪 Testing

### 1. Check Services

```bash
docker-compose ps
```

All should show "Up" status.

### 2. Test Database

```bash
docker-compose exec postgres psql -U sbf_user -d sbf_db -c "SELECT COUNT(*) FROM analytics.tenant_activity_summary;"
```

### 3. Test API

```bash
curl http://localhost:8000/healthz
```

### 4. Test Superset

```bash
curl http://localhost:8088/health
```

### 5. Test Grafana

```bash
curl http://localhost:3000/api/health
```

## 🎨 Creating Dashboards

### Superset Quick Start

1. Login to http://localhost:8088
2. Add Database:
   - Data → Databases → + Database
   - Select: PostgreSQL
   - URI: `postgresql://sbf_user:PASSWORD@postgres:5432/sbf_db`
3. Create Dataset:
   - Data → Datasets → + Dataset
   - Select: `analytics.my_tenant_activity`
4. Create Chart:
   - Charts → + Chart
   - Choose visualization type
   - Configure metrics and filters

### Grafana Quick Start

1. Login to http://localhost:3000
2. Create Dashboard:
   - Dashboards → New Dashboard → Add Visualization
   - Select: SBF PostgreSQL datasource
3. Add Panel:
   - Query:
     ```sql
     SELECT 
       week_start as time,
       completed_tasks,
       in_progress_tasks
     FROM analytics.my_task_metrics
     WHERE $__timeFilter(week_start)
     ORDER BY week_start
     ```
4. Set Variables:
   - Dashboard Settings → Variables → Add Variable
   - Name: `tenant_id`
   - Query: `SELECT id, name FROM tenants`

## 🔧 Troubleshooting

### Services won't start

```bash
# Check logs
docker-compose logs superset
docker-compose logs grafana

# Restart services
docker-compose restart superset grafana
```

### Analytics views are empty

```bash
# Check if base tables have data
docker-compose exec postgres psql -U sbf_user -d sbf_db -c "SELECT COUNT(*) FROM entities;"

# Refresh views manually
docker-compose exec postgres psql -U sbf_user -d sbf_db -c "SELECT analytics.refresh_all_views();"
```

### Can't connect to database from Superset/Grafana

```bash
# Test connection from container
docker-compose exec superset psql -h postgres -U sbf_user -d sbf_db
docker-compose exec grafana psql -h postgres -U sbf_user -d sbf_db
```

### Permission denied errors

```bash
# Grant necessary permissions
docker-compose exec postgres psql -U sbf_user -d sbf_db -c "GRANT USAGE ON SCHEMA analytics TO sbf_user; GRANT SELECT ON ALL TABLES IN SCHEMA analytics TO sbf_user;"
```

## 📦 Dependencies

### Backend (NestJS)
```bash
cd packages/@sbf/api
npm install pg jsonwebtoken
```

### Frontend (React)
```bash
cd packages/@sbf/desktop
npm install @ant-design/charts @ant-design/plots axios
```

## 🔐 Security

### Multi-Tenant Isolation

All queries are automatically scoped to the current tenant:

```typescript
// Set tenant context
await pool.query(`SET app.current_tenant_id = $1`, [tenantId]);

// All queries are now tenant-scoped
const results = await pool.query('SELECT * FROM analytics.my_tenant_activity');
```

### Superset RLS

Embed tokens include tenant clauses:

```javascript
{
  rls: [{ clause: `tenant_id = '${tenantId}'` }]
}
```

## 📈 Performance

### Materialized View Refresh

Recommended schedules:
- **Real-time apps**: Every 5-15 minutes
- **Standard apps**: Every 30-60 minutes
- **Low-frequency**: Hourly or daily

### Caching

Results are cached in Redis for 5 minutes by default.

## 📚 Documentation

- [Full Integration Guide](../docs/ANALYTICS-INTEGRATION.md)
- [Deployment Guide](../docs/ANALYTICS-DEPLOYMENT.md)
- [Phase 2 Summary](../.temp-workspace/PHASE-2-SUMMARY.md)

## 🆘 Getting Help

1. Check logs: `docker-compose logs -f [service]`
2. Review documentation in `docs/`
3. Test endpoints with curl or Postman
4. Check database views directly with psql

## 🎯 Next Steps

After setup:
1. ✅ Create sample dashboards in Superset
2. ✅ Configure Grafana visualizations
3. ✅ Integrate dashboard components in React app
4. ✅ Set up automated view refresh
5. ✅ Configure alerts and notifications
6. ✅ Add custom metrics and KPIs
7. ✅ Export/share dashboards with team

---

**Need More Help?**
- Superset Docs: https://superset.apache.org/docs/
- Grafana Docs: https://grafana.com/docs/
- PostgreSQL Docs: https://www.postgresql.org/docs/
