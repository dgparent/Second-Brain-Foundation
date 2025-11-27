# Libraries Folder - Analytics & BI Platforms

**Purpose**: Collection of open-source analytics and BI platforms for integration into Second Brain Foundation  
**Status**: 4 repositories cloned - Ready for integration  
**Integration Timeline**: Q4 2025 - Q1 2026

---

## Overview

This folder contains cloned repositories of four best-in-class open-source business intelligence and analytics platforms that will be integrated into Second Brain Foundation to provide enterprise-grade analytics dashboards.

**Why Multi-Platform Strategy?**  
Each platform excels at different use cases. By integrating all four, SBF can offer:
- **Superset**: Advanced BI for data analysts
- **Grafana**: Real-time metrics for DevOps and IoT  
- **Lightdash**: Self-service metrics for business users
- **Metabase**: Simple dashboards for executives

---

## Integrated Repositories

### 1. Apache Superset ✅

**Repository**: https://github.com/apache/superset  
**Clone Status**: ✅ Cloned to `libraries/superset/`  
**Language**: Python (backend), TypeScript/React (frontend)  
**License**: Apache 2.0

**Primary Use Case**: Advanced business intelligence, custom dashboards, SQL exploration

**Key Capabilities**:
- 40+ chart types
- Interactive SQL editor (SQL Lab)
- Drag-and-drop dashboard builder
- Multi-database support (40+ connectors)
- Row-Level Security for multi-tenancy
- Embedded dashboards with guest tokens

**SBF Dashboards**:
- Executive Summary (KPIs, trends)
- Entity Analytics (types, relationships, graph visualization)
- Task Metrics (completion rates, velocity, backlogs)
- Knowledge Graph Explorer

**Integration Status**: Planning → Implementation Phase 2 (Weeks 3-4)

---

### 2. Grafana ✅

**Repository**: https://github.com/grafana/grafana  
**Clone Status**: ✅ Cloned to `libraries/grafana/`  
**Language**: Go (backend), TypeScript/React (frontend)  
**License**: AGPL-3.0

**Primary Use Case**: Time-series metrics, IoT telemetry, system monitoring, alerting

**Key Capabilities**:
- Time-series visualization (line, area, gauge, stat)
- Alerting system with notifications (email, Slack, webhooks)
- Data source plugins (Prometheus, PostgreSQL, InfluxDB, etc.)
- Panel system (reusable, configurable)
- Annotations and event markers
- Auto-refresh and live dashboards

**SBF Dashboards**:
- IoT Device Telemetry (sensor readings, device status)
- System Performance (API latency, error rates, throughput)
- User Activity Timeline (entities created, tasks completed)

**Integration Status**: Planning → Implementation Phase 3 (Weeks 5-6)

---

### 3. Lightdash ✅

**Repository**: https://github.com/lightdash/lightdash  
**Clone Status**: ✅ Cloned to `libraries/lightdash/`  
**Language**: TypeScript (full-stack)  
**License**: MIT

**Primary Use Case**: dbt-based semantic layer, metrics catalog, self-service analytics

**Key Capabilities**:
- dbt integration (dimensions, measures, metrics)
- Metrics catalog (searchable business metrics)
- Visual query builder (explore interface)
- Metric lineage and dependencies
- Centralized metric definitions
- Slack integration for sharing

**SBF Dashboards**:
- AI Usage & Costs (tokens, requests, cost per use case)
- Metrics Explorer (browse all tenant metrics)
- Cost Attribution (per-tenant usage tracking)

**Integration Status**: Planning → Implementation Phase 4 (Week 7)

---

### 4. Metabase ✅

**Repository**: https://github.com/metabase/metabase  
**Clone Status**: ✅ Cloned to `libraries/metabase/`  
**Language**: Clojure (backend), TypeScript/React (frontend)  
**License**: AGPL-3.0

**Primary Use Case**: Self-service analytics for non-technical users, simple dashboards

**Key Capabilities**:
- Simple mode query builder (point-and-click, no SQL)
- SQL mode for advanced users
- Auto-generated questions (X-ray insights)
- Dashboard sharing (public links, email, Slack)
- Scheduled reports (email, Slack)
- Embedded dashboards with signed URLs

**SBF Dashboards**:
- Productivity Dashboard (tasks, entities, activity)
- Weekly Summary (automated email reports)
- AI Insights (most asked questions, suggestion acceptance rate)

**Integration Status**: Planning → Implementation Phase 5 (Week 8)

---

## Quick Reference

| Platform | Best For | Primary Users | SBF Use Cases |
|----------|----------|---------------|---------------|
| **Superset** | Advanced BI, custom dashboards | Data analysts, power users | Entity analytics, knowledge graph, task metrics |
| **Grafana** | Time-series, monitoring, IoT | DevOps, IoT operators | Device telemetry, system performance, real-time alerts |
| **Lightdash** | Semantic layer, metrics catalog | Business analysts | AI usage tracking, cost attribution, metrics exploration |
| **Metabase** | Simple self-service analytics | Executives, managers | Executive summaries, weekly reports, productivity insights |

---

## Integration Architecture

### Deployment

All four platforms deployed as Docker containers on Fly.io:
- `sbf-superset.fly.dev` (internal only)
- `sbf-grafana.fly.dev` (internal only)
- `sbf-lightdash.fly.dev` (internal only)
- `sbf-metabase.fly.dev` (internal only)

All connected to the same **Neon PostgreSQL database** with tenant-scoped views and Row-Level Security.

### API Endpoints

Unified API in `apps/api/src/routes/analytics/`:

```
GET  /analytics/dashboards                       # List available dashboards
GET  /analytics/embed/:provider/:dashboardId     # Get embed URL
```

Providers: `superset`, `grafana`, `lightdash`, `metabase`

### React Components

```tsx
// apps/web/src/components/analytics/DashboardEmbed.tsx
<DashboardEmbed provider="superset" dashboardId="executive-summary" />
<DashboardEmbed provider="grafana" dashboardId="iot-telemetry" height="600px" />
<DashboardEmbed provider="lightdash" dashboardId="ai-usage" />
<DashboardEmbed provider="metabase" dashboardId="productivity" />
```

---

## Implementation Roadmap

### ✅ Completed (November 2025)
- [x] Cloned all 4 repositories
- [x] Created integration plan document
- [x] Designed database views
- [x] Designed API architecture

### 🔄 In Progress (December 2025)
- [ ] Docker Compose setup for local development
- [ ] Analytics schema in Neon (views, RLS policies)
- [ ] Deploy to Fly.io staging

### 📋 Next Steps (January-February 2026)
- [ ] Superset integration (dashboards, embedding)
- [ ] Grafana integration (telemetry, alerting)
- [ ] Lightdash integration (metrics catalog)
- [ ] Metabase integration (simple dashboards, reports)
- [ ] React dashboard gallery in web app
- [ ] Production deployment

---

## Documentation

### Comprehensive Guides

- **[Libraries Integration Plan](../docs/LIBRARIES-INTEGRATION-PLAN.md)** - Full integration strategy and implementation details
- **[Technical Architecture](../docs/03-architecture/TECHNICAL-ARCHITECTURE-V2.md)** - System architecture including analytics layer
- **[Product Roadmap](../docs/PRODUCT-ROADMAP.md)** - Analytics integration in overall roadmap

### External Documentation

- **Superset**: https://superset.apache.org/docs
- **Grafana**: https://grafana.com/docs/grafana/latest/
- **Lightdash**: https://docs.lightdash.com/
- **Metabase**: https://www.metabase.com/docs/latest/

---

## Repository Maintenance

### Updating Libraries

```bash
# Pull latest changes for all analytics libraries
cd libraries/superset && git pull origin master
cd ../grafana && git pull origin main
cd ../lightdash && git pull origin main
cd ../metabase && git pull origin master
```

### Version Pinning (Production)

For production deployments, use pinned versions:
- **Superset**: `apache/superset:2.1.0`
- **Grafana**: `grafana/grafana:10.2.0`
- **Lightdash**: `lightdash/lightdash:0.800.0`
- **Metabase**: `metabase/metabase:v0.48.0`

---

## Success Metrics

### Technical
- Dashboard load time < 3 seconds (P95)
- Embedding API response < 200ms
- 99.9% uptime for analytics services
- Zero tenant data leakage

### Product
- 80% of Pro users view dashboards monthly
- 5+ dashboards per tenant on average
- 30% of tenants set up custom dashboards
- 50% reduction in "how do I..." support tickets

### Business
- Analytics features drive 20% upsell to Business tier
- Customer testimonials highlighting analytics value
- Competitive differentiation vs Notion/Obsidian

---

## Getting Started

1. **Read the integration plan**: [LIBRARIES-INTEGRATION-PLAN.md](../docs/LIBRARIES-INTEGRATION-PLAN.md)
2. **Review the architecture**: [TECHNICAL-ARCHITECTURE-V2.md](../docs/03-architecture/TECHNICAL-ARCHITECTURE-V2.md)
3. **Set up Docker environment**: Follow Phase 1 instructions
4. **Create analytics schema**: Run migrations in `packages/db-client/migrations/`
5. **Deploy to staging**: Use Fly.io deployment guides

---

**Last Updated**: November 24, 2025  
**Status**: Cloned and ready for integration  
**Next Milestone**: Docker Compose setup (Week 1, December 2025)  
**Owner**: Analytics Integration Team

---

## Other Libraries

**Note**: This folder also contains other repositories (n8n, Activepieces, Obsidian plugins, etc.) for future integration. See [README-COMPREHENSIVE.md](./README-COMPREHENSIVE.md) for the complete library catalog.

For now, **focus is on the 4 analytics platforms** listed above.
