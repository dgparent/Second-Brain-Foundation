# Analytics Dashboard Deployment Guide

## Quick Start

### 1. Environment Setup

Copy and configure environment variables:

```bash
cp .env.example .env
```

Update the following in `.env`:

```env
# Analytics Services
SUPERSET_SECRET_KEY=$(openssl rand -base64 32)
SUPERSET_ADMIN_PASSWORD=strong-password-here
GRAFANA_ADMIN_PASSWORD=strong-password-here

# Database
POSTGRES_PASSWORD=secure-db-password
```

### 2. Deploy Services

```bash
# Start all services including analytics
docker-compose up -d

# Verify services are running
docker-compose ps

# Expected output:
# sbf-postgres    - Up
# sbf-redis       - Up
# sbf-api         - Up
# sbf-superset    - Up
# sbf-grafana     - Up
```

### 3. Initialize Analytics Schema

```bash
# Wait for PostgreSQL to be ready
docker-compose exec postgres pg_isready

# Run analytics schema initialization
docker-compose exec postgres psql -U sbf_user -d sbf_db -f /docker-entrypoint-initdb.d/analytics.sql
```

### 4. Configure Superset

```bash
# Access Superset at http://localhost:8088
# Login: admin / (value from SUPERSET_ADMIN_PASSWORD)

# Add database connection via UI:
# - Navigate to: Data → Databases → + Database
# - Select: PostgreSQL
# - Display Name: SBF Analytics
# - SQLAlchemy URI: postgresql://sbf_user:${POSTGRES_PASSWORD}@postgres:5432/sbf_db
# - Test Connection and Save
```

### 5. Configure Grafana

Grafana is auto-configured via provisioning files. Access at http://localhost:3000

```bash
# Login: admin / (value from GRAFANA_ADMIN_PASSWORD)
# PostgreSQL datasource is pre-configured
```

### 6. Install Frontend Dependencies

```bash
# Install React analytics dependencies
cd packages/@sbf/desktop
npm install @ant-design/charts @ant-design/plots axios jsonwebtoken

# Or using yarn
yarn add @ant-design/charts @ant-design/plots axios jsonwebtoken
```

### 7. Install Backend Dependencies

```bash
# Install NestJS analytics dependencies
cd packages/@sbf/api
npm install pg jsonwebtoken

# Or using yarn
yarn add pg jsonwebtoken
```

## Production Deployment

### Security Hardening

1. **Generate Strong Secrets**

```bash
# Generate secrets
export SUPERSET_SECRET_KEY=$(openssl rand -base64 42)
export GRAFANA_SECRET=$(openssl rand -base64 32)
export JWT_SECRET=$(openssl rand -base64 32)
```

2. **Enable SSL/TLS**

Update `docker-compose.yml` to enable the nginx profile:

```bash
docker-compose --profile production up -d
```

Configure SSL certificates in `nginx/ssl/`:

```
nginx/
  ssl/
    cert.pem
    key.pem
```

3. **Database Security**

```sql
-- Create read-only analytics user
CREATE USER analytics_readonly WITH PASSWORD 'secure-password';
GRANT USAGE ON SCHEMA analytics TO analytics_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA analytics TO analytics_readonly;
GRANT SELECT ON ALL MATERIALIZED VIEWS IN SCHEMA analytics TO analytics_readonly;
```

### High Availability Setup

#### PostgreSQL Replication

```yaml
# docker-compose.override.yml
services:
  postgres-replica:
    image: ankane/pgvector:latest
    environment:
      POSTGRES_REPLICATION_MODE: slave
      POSTGRES_MASTER_HOST: postgres
      POSTGRES_MASTER_PORT: 5432
      POSTGRES_USER: replicator
      POSTGRES_PASSWORD: replication-password
```

#### Redis Cluster

```yaml
services:
  redis-sentinel:
    image: redis:7-alpine
    command: redis-sentinel /etc/redis/sentinel.conf
```

### Scaling

#### Horizontal Scaling

```bash
# Scale API instances
docker-compose up -d --scale api=3

# Load balance with nginx
# Update nginx/nginx.conf with upstream configuration
```

#### Materialized View Refresh

Schedule automatic refresh:

```sql
-- Install pg_cron extension
CREATE EXTENSION pg_cron;

-- Schedule refresh every 15 minutes
SELECT cron.schedule(
  'refresh-analytics',
  '*/15 * * * *',
  'SELECT analytics.refresh_all_views()'
);
```

### Monitoring

#### Prometheus Metrics

Add Prometheus exporter for Grafana:

```yaml
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./config/prometheus:/etc/prometheus
      - prometheus_data:/prometheus
```

#### Logging

Centralized logging with ELK stack:

```yaml
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    
  logstash:
    image: docker.elastic.co/logstash/logstash:8.11.0
    
  kibana:
    image: docker.elastic.co/kibana/kibana:8.11.0
```

## Database Migration

### From Existing System

```sql
-- Export existing data
pg_dump -U sbf_user -d sbf_db -t tenants -t entities -f backup.sql

-- Import to new system
psql -U sbf_user -d sbf_db -f backup.sql

-- Initialize analytics
psql -U sbf_user -d sbf_db -f scripts/init-analytics-schema.sql

-- Refresh views
psql -U sbf_user -d sbf_db -c "SELECT analytics.refresh_all_views();"
```

### Zero-Downtime Migration

```bash
# 1. Deploy new version alongside old
docker-compose -f docker-compose.new.yml up -d

# 2. Sync data using logical replication
# Configure in PostgreSQL

# 3. Switch traffic to new version
# Update load balancer configuration

# 4. Decommission old version
docker-compose -f docker-compose.old.yml down
```

## Backup & Recovery

### Automated Backups

```bash
# Create backup script
cat > scripts/backup-analytics.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=/backups/analytics
DATE=$(date +%Y%m%d_%H%M%S)

# Backup PostgreSQL
docker exec sbf-postgres pg_dump -U sbf_user sbf_db > \
  $BACKUP_DIR/sbf_db_$DATE.sql

# Backup Superset metadata
docker exec sbf-superset superset export-dashboards > \
  $BACKUP_DIR/superset_dashboards_$DATE.json

# Backup Grafana dashboards
docker exec sbf-grafana grafana-cli admin export-all > \
  $BACKUP_DIR/grafana_dashboards_$DATE.json
EOF

chmod +x scripts/backup-analytics.sh

# Schedule with cron
crontab -e
# Add: 0 2 * * * /path/to/scripts/backup-analytics.sh
```

### Recovery

```bash
# Restore PostgreSQL
docker exec -i sbf-postgres psql -U sbf_user sbf_db < backup.sql

# Restore Superset
docker exec -i sbf-superset superset import-dashboards -f /tmp/dashboards.json

# Restore Grafana
docker exec -i sbf-grafana grafana-cli admin import-all -f /tmp/dashboards.json
```

## Performance Tuning

### PostgreSQL Optimization

```sql
-- Analyze tables
ANALYZE analytics.tenant_activity_summary;

-- Update statistics
VACUUM ANALYZE;

-- Configure autovacuum
ALTER SYSTEM SET autovacuum = on;
ALTER SYSTEM SET autovacuum_vacuum_scale_factor = 0.1;
```

### Redis Caching

Implement caching layer:

```typescript
import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL
});

// Cache analytics results
async function getCachedAnalytics(key: string, fetcher: () => Promise<any>) {
  const cached = await redisClient.get(key);
  if (cached) return JSON.parse(cached);
  
  const data = await fetcher();
  await redisClient.setEx(key, 300, JSON.stringify(data)); // 5 min TTL
  return data;
}
```

## Troubleshooting

### Common Issues

1. **Superset won't start**
   ```bash
   docker logs sbf-superset
   # Check for migration issues
   docker exec sbf-superset superset db upgrade
   ```

2. **Grafana datasource connection failed**
   ```bash
   # Test connection from Grafana container
   docker exec sbf-grafana psql -h postgres -U sbf_user -d sbf_db
   ```

3. **Analytics views are empty**
   ```bash
   # Check if base tables have data
   docker exec sbf-postgres psql -U sbf_user -d sbf_db \
     -c "SELECT COUNT(*) FROM entities;"
   
   # Refresh views
   docker exec sbf-postgres psql -U sbf_user -d sbf_db \
     -c "SELECT analytics.refresh_all_views();"
   ```

4. **High memory usage**
   ```bash
   # Limit container resources
   docker update --memory="2g" --memory-swap="3g" sbf-superset
   ```

### Debug Mode

Enable debug logging:

```env
# .env
LOG_LEVEL=DEBUG
SUPERSET_LOG_LEVEL=DEBUG
GF_LOG_LEVEL=debug
```

## Health Checks

```bash
# Check all services
docker-compose ps

# API health
curl http://localhost:8000/healthz

# Superset health
curl http://localhost:8088/health

# Grafana health
curl http://localhost:3000/api/health

# Database health
docker exec sbf-postgres pg_isready -U sbf_user
```

## Maintenance

### Regular Tasks

1. **Weekly**: Refresh materialized views
2. **Monthly**: Vacuum and analyze database
3. **Quarterly**: Review and optimize dashboard queries
4. **Annually**: Audit user access and permissions

### Update Procedure

```bash
# 1. Backup everything
./scripts/backup-analytics.sh

# 2. Pull latest images
docker-compose pull

# 3. Stop services
docker-compose down

# 4. Start with new images
docker-compose up -d

# 5. Run migrations if needed
docker exec sbf-api npm run migration:run

# 6. Verify services
docker-compose ps
```

## Support Resources

- [Analytics Integration Guide](./ANALYTICS-INTEGRATION.md)
- [Superset Documentation](https://superset.apache.org/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [PostgreSQL Performance](https://www.postgresql.org/docs/current/performance-tips.html)
