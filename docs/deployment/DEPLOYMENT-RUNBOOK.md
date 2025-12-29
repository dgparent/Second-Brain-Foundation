# SBF Deployment Runbook

**Version:** 1.0.0  
**Last Updated:** December 29, 2025  
**Owner:** DevOps Team  
**Phase:** 08 - Production Readiness  

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Deployment Procedures](#deployment-procedures)
5. [Health Checks](#health-checks)
6. [Rollback Procedures](#rollback-procedures)
7. [Troubleshooting](#troubleshooting)
8. [Incident Response](#incident-response)
9. [Monitoring & Alerts](#monitoring--alerts)
10. [Maintenance Windows](#maintenance-windows)

---

## Overview

This runbook provides step-by-step instructions for deploying and managing the Second Brain Foundation (SBF) application in production environments.

### Architecture Overview

```
                           ┌─────────────┐
                           │   Nginx     │
                           │   (SSL/LB)  │
                           └──────┬──────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
        ┌─────▼─────┐       ┌─────▼─────┐       ┌────▼────┐
        │  Web App  │       │  API      │       │ Workers │
        │  (Next.js)│       │  (FastAPI)│       │ (Python)│
        └───────────┘       └─────┬─────┘       └────┬────┘
                                  │                   │
                    ┌─────────────┼───────────────────┘
                    │             │
              ┌─────▼─────┐ ┌─────▼─────┐
              │  Redis    │ │ PostgreSQL│
              │  (Cache)  │ │ (pgvector)│
              └───────────┘ └───────────┘
```

### Service Dependencies

| Service | Depends On | Critical |
|---------|------------|----------|
| Web | API | Yes |
| API | PostgreSQL, Redis | Yes |
| Workers | PostgreSQL, Redis | No |

---

## Prerequisites

### Required Tools

```bash
# Docker and Docker Compose
docker --version    # >= 24.0
docker compose version  # >= 2.20

# Kubernetes (if using k8s)
kubectl version --client  # >= 1.28

# Database client
psql --version  # >= 14

# Redis CLI
redis-cli --version  # >= 7.0
```

### Access Requirements

| System | Access Level | Contact |
|--------|--------------|---------|
| GitHub Container Registry | Read/Write | DevOps Lead |
| Production Server SSH | sudo | SRE Team |
| AWS/Cloud Console | Admin | Cloud Team |
| Secrets Manager | Read | Security Team |

### Environment Variables

Required secrets (stored in secrets manager):

```
DATABASE_URL         # PostgreSQL connection string
JWT_SECRET           # JWT signing key (min 32 chars)
OPENAI_API_KEY       # OpenAI API key
ANTHROPIC_API_KEY    # Anthropic API key
PINECONE_API_KEY     # Pinecone vector DB key
```

---

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/org/sbf.git /opt/sbf
cd /opt/sbf
git checkout main
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env.production

# Edit with production values
nano .env.production
```

Required `.env.production` values:

```bash
# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=sbf
DB_USER=sbf_prod
DB_PASSWORD=<from-secrets-manager>

# Redis
REDIS_URL=redis://redis:6379/0

# JWT
JWT_SECRET=<from-secrets-manager>
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# AI Providers
OPENAI_API_KEY=<from-secrets-manager>
ANTHROPIC_API_KEY=<from-secrets-manager>

# Feature Flags
ENABLE_RATE_LIMITING=true
ENABLE_CACHING=true

# Logging
LOG_LEVEL=INFO
```

### 3. Pull Docker Images

```bash
# Login to registry
docker login ghcr.io -u $GITHUB_USER -p $GITHUB_TOKEN

# Pull latest images
docker compose -f docker-compose.prod.yml pull
```

---

## Deployment Procedures

### Standard Deployment

**Estimated Time:** 10-15 minutes  
**Risk Level:** Medium  
**Requires:** No downtime

#### Step 1: Pre-deployment Checks

```bash
# Check current system health
curl -s http://localhost:8000/api/v1/health/ready | jq .

# Verify database connectivity
docker compose exec postgres pg_isready -U sbf_prod

# Check disk space
df -h /var/lib/docker
```

#### Step 2: Create Backup

```bash
# Database backup
./scripts/backup-db.sh

# Store backup location
BACKUP_FILE=$(ls -t /backups/sbf-*.sql.gz | head -1)
echo "Backup created: $BACKUP_FILE"
```

#### Step 3: Pull New Images

```bash
cd /opt/sbf
git pull origin main
docker compose -f docker-compose.prod.yml pull
```

#### Step 4: Database Migrations

```bash
# Run migrations (if any)
docker compose -f docker-compose.prod.yml run --rm api \
  python -m alembic upgrade head

# Verify migration status
docker compose -f docker-compose.prod.yml run --rm api \
  python -m alembic current
```

#### Step 5: Rolling Update

```bash
# Update API with zero downtime
docker compose -f docker-compose.prod.yml up -d --no-deps --scale api=3 api
sleep 15

# Verify new containers are healthy
docker compose ps | grep api

# Scale back to desired replicas
docker compose -f docker-compose.prod.yml up -d --no-deps --scale api=2 api

# Update web frontend
docker compose -f docker-compose.prod.yml up -d --no-deps web

# Update workers
docker compose -f docker-compose.prod.yml up -d --no-deps workers
```

#### Step 6: Post-deployment Verification

```bash
# Health checks
curl -s http://localhost:8000/api/v1/health | jq .
curl -s http://localhost:8000/api/v1/health/ready | jq .

# Test critical endpoints
curl -s http://localhost:8000/api/v1/notebooks -H "Authorization: Bearer $TEST_TOKEN" | jq .

# Check logs for errors
docker compose logs --tail=100 api | grep -i error
```

#### Step 7: Cleanup

```bash
# Remove old images
docker image prune -f

# Remove unused volumes (careful!)
# docker volume prune -f
```

---

### Hotfix Deployment

**Estimated Time:** 5-10 minutes  
**Risk Level:** High  
**Use When:** Critical bug fix needed

```bash
# 1. Tag current state
docker tag ghcr.io/sbf/api:latest ghcr.io/sbf/api:rollback

# 2. Pull hotfix
docker pull ghcr.io/sbf/api:hotfix-$(git rev-parse HEAD)

# 3. Quick swap
docker compose -f docker-compose.prod.yml up -d --force-recreate api

# 4. Immediate verification
for i in {1..5}; do
  curl -s http://localhost:8000/api/v1/health && break
  sleep 2
done

# 5. If failed, rollback immediately
docker tag ghcr.io/sbf/api:rollback ghcr.io/sbf/api:latest
docker compose up -d --force-recreate api
```

---

## Health Checks

### Endpoint Reference

| Endpoint | Purpose | Expected Response |
|----------|---------|-------------------|
| `/api/v1/health` | Basic liveness | `{"status": "healthy"}` |
| `/api/v1/health/live` | Kubernetes liveness | `{"status": "alive"}` |
| `/api/v1/health/ready` | Readiness with deps | `{"status": "ready", "checks": {...}}` |

### Automated Health Check Script

```bash
#!/bin/bash
# scripts/health-check.sh

API_URL=${API_URL:-"http://localhost:8000"}

echo "Checking API health..."
HEALTH=$(curl -s -w "%{http_code}" -o /tmp/health.json "$API_URL/api/v1/health/ready")

if [ "$HEALTH" = "200" ]; then
    echo "✅ API is healthy"
    cat /tmp/health.json | jq .
else
    echo "❌ API health check failed (HTTP $HEALTH)"
    exit 1
fi

# Check individual services
echo "Checking services..."
jq -r '.checks | to_entries[] | "\(.key): \(.value)"' /tmp/health.json
```

---

## Rollback Procedures

### Immediate Rollback (Docker)

```bash
# 1. Stop current containers
docker compose -f docker-compose.prod.yml stop api web workers

# 2. Restore previous images
docker tag ghcr.io/sbf/api:previous ghcr.io/sbf/api:latest
docker tag ghcr.io/sbf/web:previous ghcr.io/sbf/web:latest

# 3. Restart services
docker compose -f docker-compose.prod.yml up -d

# 4. Verify rollback
curl -s http://localhost:8000/api/v1/health
```

### Database Rollback

```bash
# WARNING: This will cause downtime and data loss since backup

# 1. Stop all services
docker compose -f docker-compose.prod.yml stop api workers

# 2. Restore database
gunzip < /backups/sbf-YYYYMMDD-HHMMSS.sql.gz | \
  docker compose exec -T postgres psql -U sbf_prod -d sbf

# 3. Restart services
docker compose -f docker-compose.prod.yml up -d

# 4. Verify data integrity
docker compose exec postgres psql -U sbf_prod -d sbf -c "SELECT COUNT(*) FROM notebooks;"
```

### Migration Rollback

```bash
# Check current migration
docker compose run --rm api python -m alembic current

# Rollback one migration
docker compose run --rm api python -m alembic downgrade -1

# Or rollback to specific version
docker compose run --rm api python -m alembic downgrade abc123
```

---

## Troubleshooting

### Common Issues

#### API Not Starting

```bash
# Check logs
docker compose logs api --tail=100

# Common fixes:
# 1. Database not ready - wait and retry
# 2. Missing env vars - check .env.production
# 3. Port conflict - check `netstat -tlnp | grep 8000`
```

#### Database Connection Failed

```bash
# Check PostgreSQL status
docker compose exec postgres pg_isready

# Check connection string
docker compose exec api python -c "from config import settings; print(settings.database_url)"

# Test connection
docker compose exec postgres psql -U sbf_prod -d sbf -c "SELECT 1"
```

#### Redis Connection Failed

```bash
# Check Redis status
docker compose exec redis redis-cli ping

# Check memory usage
docker compose exec redis redis-cli info memory
```

#### High Memory Usage

```bash
# Check container memory
docker stats --no-stream

# If API using too much memory
docker compose restart api

# If Redis using too much memory
docker compose exec redis redis-cli FLUSHDB  # Clears cache only!
```

#### Slow API Responses

```bash
# Check for slow queries
docker compose logs api | grep "slow query"

# Check database performance
docker compose exec postgres psql -U sbf_prod -d sbf -c "
  SELECT pid, now() - pg_stat_activity.query_start AS duration, query
  FROM pg_stat_activity
  WHERE state != 'idle'
  ORDER BY duration DESC
  LIMIT 10;
"
```

---

## Incident Response

### Severity Levels

| Level | Description | Response Time | Escalation |
|-------|-------------|---------------|------------|
| SEV-1 | Complete outage | 15 min | Immediate |
| SEV-2 | Major feature broken | 1 hour | Within 2 hours |
| SEV-3 | Minor issue | 4 hours | Next business day |

### SEV-1 Response Procedure

1. **Acknowledge** - Respond in #incidents Slack channel
2. **Assess** - Run health checks, check logs
3. **Mitigate** - Rollback if necessary
4. **Communicate** - Update status page
5. **Resolve** - Apply fix, verify
6. **Review** - Schedule post-mortem

### On-Call Contacts

| Role | Primary | Secondary |
|------|---------|-----------|
| DevOps | @devops-primary | @devops-secondary |
| Backend | @backend-lead | @backend-senior |
| Database | @dba-lead | @dba-secondary |

---

## Monitoring & Alerts

### Key Metrics to Watch

| Metric | Warning | Critical |
|--------|---------|----------|
| API Response Time (P95) | > 500ms | > 1000ms |
| Error Rate | > 1% | > 5% |
| CPU Usage | > 70% | > 90% |
| Memory Usage | > 80% | > 95% |
| Database Connections | > 80 | > 100 |

### Alert Channels

- **PagerDuty** - SEV-1 incidents
- **Slack #alerts** - All alerts
- **Email** - Daily summaries

### Dashboard Links

- Grafana: https://grafana.sbf.io
- Prometheus: https://prometheus.sbf.io
- Log Aggregator: https://logs.sbf.io

---

## Maintenance Windows

### Scheduled Maintenance

- **Time:** Saturdays 02:00-04:00 UTC
- **Notification:** 48 hours in advance
- **Status Page:** https://status.sbf.io

### Pre-Maintenance Checklist

- [ ] Notify users via email
- [ ] Update status page
- [ ] Verify backup
- [ ] Prepare rollback plan
- [ ] Confirm on-call availability

### Post-Maintenance Checklist

- [ ] Verify all services healthy
- [ ] Run smoke tests
- [ ] Update status page
- [ ] Send completion notification
- [ ] Document any issues

---

## Appendix

### Useful Commands

```bash
# View all running containers
docker compose ps

# View logs for all services
docker compose logs -f

# Enter container shell
docker compose exec api /bin/bash

# View container resource usage
docker stats

# Rebuild specific service
docker compose build --no-cache api

# Force recreate containers
docker compose up -d --force-recreate
```

### File Locations

| File | Path |
|------|------|
| Docker Compose | `/opt/sbf/docker-compose.prod.yml` |
| Environment | `/opt/sbf/.env.production` |
| Backups | `/backups/` |
| Logs | `/var/log/sbf/` |
| SSL Certs | `/etc/nginx/ssl/` |

---

*This runbook is a living document. Update it as procedures change.*  
*Last reviewed: December 29, 2025*
