# Technical Architecture - Second Brain Foundation v2.0

**Version:** 2.0  
**Date:** November 24, 2025  
**Status:** Multi-Tenant Production Architecture  
**Architect**: Technical Team

---

## Architecture Overview

Second Brain Foundation is a **multi-tenant, multi-platform AI-augmented knowledge management platform** built on modern cloud-native principles with a hybrid local-first/cloud-augmented data model.

### Core Architectural Principles

1. **Multi-Tenancy First**: Complete data isolation via Row-Level Security (RLS)
2. **Privacy by Design**: Truth hierarchy ensures user data sovereignty
3. **Microservices**: Independent, scalable services on Fly.io
4. **API-First**: All functionality exposed via RESTful/GraphQL APIs
5. **Cloud-Native**: Serverless frontend (Vercel), containerized backend (Fly.io)
6. **Observability**: Comprehensive logging, monitoring, and tracing

---

## High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐  ┌──────┐  ┌─────────┐  ┌───────┐  ┌────────┐  │
│  │  Web App │  │  iOS │  │ Android │  │ Alexa │  │  IoT   │  │
│  │ (Next.js)│  │(Swift)  │(Kotlin) │  │(Skill)│  │(MQTT)  │  │
│  └────┬─────┘  └──┬───┘  └────┬────┘  └───┬───┘  └───┬────┘  │
│       │           │           │           │          │        │
└───────┼───────────┼───────────┼───────────┼──────────┼────────┘
        │           │           │           │          │
        │           └───────────┴───────────┴──────────┘
        │                       │
        └───────────────────────┘
                    │
┌───────────────────┴─────────────────────────────────────────────┐
│                       API GATEWAY LAYER                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │          API Gateway (Fly.io - Fastify/Express)           │ │
│  │  • JWT Authentication                                     │ │
│  │  • Tenant Context Extraction (from subdomain or header)   │ │
│  │  • Rate Limiting (per-tenant, per-endpoint)               │ │
│  │  • Request/Response Logging                               │ │
│  │  • Error Handling & Monitoring                            │ │
│  └───────────────────────┬───────────────────────────────────┘ │
│                          │                                     │
└──────────────────────────┼─────────────────────────────────────┘
                           │
┌──────────────────────────┴─────────────────────────────────────┐
│                      SERVICE LAYER                             │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Auth       │  │   Entity     │  │    Task      │        │
│  │   Service    │  │   Manager    │  │  Management  │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │     RAG      │  │   LLM        │  │  Automation  │        │
│  │    Engine    │  │ Orchestrator │  │    Engine    │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │  Background  │  │     IoT      │  │Notification  │        │
│  │   Workers    │  │     Core     │  │   Service    │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                │
└────────────────────────┬───────────────────────────────────────┘
                         │
┌────────────────────────┴───────────────────────────────────────┐
│                       DATA LAYER                               │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │  PostgreSQL  │  │  Vector DB   │  │  Knowledge   │        │
│  │   (Neon)     │  │  (Pinecone/  │  │    Graph     │        │
│  │              │  │   Qdrant)    │  │  (ArangoDB)  │        │
│  │  • Tenants   │  │  • Embeddings│  │  • Entities  │        │
│  │  • Entities  │  │  • Tenant    │  │  • Relations │        │
│  │  • Tasks     │  │    Namespaces│  │  • Per-tenant│        │
│  │  • Users     │  │              │  │    Collections│        │
│  │  • RLS       │  │              │  │              │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │    Redis     │  │  Analytics   │  │    Object    │        │
│  │   (Cache +   │  │  Dashboards  │  │   Storage    │        │
│  │   Queues)    │  │  (Superset/  │  │   (S3/R2)    │        │
│  │              │  │   Grafana)   │  │              │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Web App** | Next.js 14+ (App Router) | Server-side rendering, SEO, performance |
| **UI Framework** | React 18+ | Component-based architecture |
| **Styling** | Tailwind CSS | Utility-first styling |
| **State Management** | Zustand / React Query | Client state + server state caching |
| **Charts** | Recharts / D3.js | Data visualization |
| **Forms** | React Hook Form + Zod | Form handling and validation |
| **iOS App** | SwiftUI | Native iOS application |
| **Android App** | Jetpack Compose (Kotlin) | Native Android application |
| **Deployment** | Vercel | Edge network, serverless functions |

### Backend

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **API Gateway** | Fastify (Node.js) | High-performance HTTP server |
| **Language** | TypeScript 5.9+ | Type safety, modern JavaScript |
| **Runtime** | Node.js 20+ | Server-side JavaScript |
| **Authentication** | JWT (RS256) | Token-based auth |
| **Deployment** | Fly.io | Global microservices platform |
| **Container** | Docker | Containerization |
| **Build** | Turborepo | Monorepo build orchestration |

### Data Layer

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Primary Database** | PostgreSQL 15+ (Neon) | Relational data, multi-tenant |
| **Vector Database** | Pinecone / Qdrant | Semantic search, embeddings |
| **Knowledge Graph** | ArangoDB | Entity relationships |
| **Cache** | Redis (Upstash) | Session cache, rate limiting |
| **Message Queue** | BullMQ + Redis | Background jobs |
| **Object Storage** | Cloudflare R2 / AWS S3 | File uploads, media |
| **Analytics** | Apache Superset, Grafana, Metabase, Lightdash | Business intelligence |

### AI/ML

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **LLM Provider** | Together.ai (primary) | Cloud-based inference |
| **Local AI** | Ollama / LM Studio | On-device inference |
| **Embeddings** | OpenAI text-embedding-3 | Vector generation |
| **RAG Framework** | LangChain / LlamaIndex | Retrieval-augmented generation |
| **Model Routing** | Custom orchestrator | Cost-optimized model selection |

### Infrastructure

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Hosting** | Fly.io (backend), Vercel (frontend) | Global deployment |
| **CI/CD** | GitHub Actions | Automated testing and deployment |
| **Monitoring** | Sentry (errors), Grafana (metrics) | Observability |
| **Logging** | Pino (structured logs), LogTail | Log aggregation |
| **Secrets** | Fly.io Secrets, Vercel Env Vars | Secret management |

---

## Database Schema (PostgreSQL)

### Core Tables

```sql
-- Tenant management
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free', -- free, pro, team, business, enterprise
  vault_mode TEXT DEFAULT 'local_first', -- local_first, cloud_first
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Users (can belong to multiple tenants)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tenant memberships
CREATE TABLE tenant_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- owner, admin, member
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, user_id)
);

-- Entities (core knowledge objects)
CREATE TABLE entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL, -- task, person, project, event, place, note
  title TEXT NOT NULL,
  content TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Truth hierarchy fields
  truth_level INTEGER DEFAULT 1, -- 1=User, 2=Automation, 3=AI_Local, 4=AI_Local_Network, 5=AI_Cloud
  origin_source TEXT, -- user:web, user:mobile, automation:id, ai-local:model, ai-cloud:provider
  origin_chain JSONB DEFAULT '[]', -- Provenance trail
  accepted_by_user BOOLEAN DEFAULT true,
  last_modified_by_level INTEGER DEFAULT 1,
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Row-Level Security
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON entities
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Tasks (specialized entity)
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  entity_id UUID REFERENCES entities(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo', -- todo, in_progress, completed, cancelled
  priority TEXT DEFAULT 'medium', -- low, medium, high, urgent
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  assigned_to UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tasks
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- People (contacts, relationships)
CREATE TABLE people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  entity_id UUID REFERENCES entities(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  organization TEXT,
  role TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE people ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON people
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  entity_id UUID REFERENCES entities(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'planning', -- planning, active, on_hold, completed, cancelled
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON projects
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  entity_id UUID REFERENCES entities(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  location TEXT,
  attendees JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON events
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Places
CREATE TABLE places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  entity_id UUID REFERENCES entities(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  address TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  place_type TEXT, -- home, work, favorite, etc.
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE places ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON places
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Daily logs (aggregated daily activity)
CREATE TABLE daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  log_date DATE NOT NULL,
  content TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, user_id, log_date)
);

ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON daily_logs
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- LLM usage tracking
CREATE TABLE llm_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  use_case TEXT NOT NULL, -- chat, summarize, code, etc.
  model_id TEXT NOT NULL,
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  response_time_ms INTEGER,
  cost_usd NUMERIC(10, 6),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- IoT devices
CREATE TABLE iot_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  device_name TEXT NOT NULL,
  device_type TEXT, -- sensor, actuator, gateway
  mqtt_client_id TEXT UNIQUE,
  auth_token_hash TEXT,
  capabilities JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE iot_devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON iot_devices
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- IoT telemetry (time-series data)
CREATE TABLE iot_telemetry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  device_id UUID NOT NULL REFERENCES iot_devices(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_entities_tenant_type ON entities(tenant_id, entity_type);
CREATE INDEX idx_entities_created ON entities(created_at DESC);
CREATE INDEX idx_tasks_tenant_status ON tasks(tenant_id, status);
CREATE INDEX idx_llm_usage_tenant_date ON llm_usage(tenant_id, DATE(created_at));
CREATE INDEX idx_iot_telemetry_device_time ON iot_telemetry(device_id, timestamp DESC);
```

---

## API Design

### RESTful API Endpoints

**Base URL**: `https://api.sbf.app` (Fly.io)

#### Authentication

```
POST   /auth/signup
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
GET    /auth/me
```

#### Tenants

```
GET    /tenants                    # List user's tenants
POST   /tenants                    # Create new tenant
GET    /tenants/:tenantId          # Get tenant details
PATCH  /tenants/:tenantId          # Update tenant
DELETE /tenants/:tenantId          # Delete tenant

GET    /tenants/:tenantId/members  # List members
POST   /tenants/:tenantId/members  # Invite member
DELETE /tenants/:tenantId/members/:userId  # Remove member
```

#### Entities

```
GET    /entities                   # List entities (filtered by type, date, etc.)
POST   /entities                   # Create entity
GET    /entities/:entityId         # Get entity
PATCH  /entities/:entityId         # Update entity
DELETE /entities/:entityId         # Delete entity
GET    /entities/:entityId/relationships  # Get related entities
```

#### Tasks

```
GET    /tasks                      # List tasks
POST   /tasks                      # Create task
GET    /tasks/:taskId              # Get task
PATCH  /tasks/:taskId              # Update task
DELETE /tasks/:taskId              # Delete task
POST   /tasks/:taskId/complete     # Mark complete
```

#### People, Projects, Events, Places, Daily

Similar CRUD patterns for each entity type.

#### RAG & AI

```
POST   /rag/query                  # Ask question (RAG-powered)
POST   /ai/summarize               # Summarize document
POST   /ai/extract                 # Extract entities from text
GET    /ai/models                  # List available models
```

#### Analytics

```
GET    /analytics/dashboards       # List dashboards
GET    /analytics/embed/:provider/:dashboardId  # Get embed URL
```

### Request/Response Format

**Request Headers**:
```
Authorization: Bearer <JWT_TOKEN>
X-Tenant-ID: <tenant_uuid>  (optional, can be derived from JWT)
Content-Type: application/json
```

**Standard Response**:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2025-11-24T12:00:00Z",
    "request_id": "req_abc123"
  }
}
```

**Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required",
    "details": {
      "field": "title",
      "reason": "missing"
    }
  },
  "meta": {
    "timestamp": "2025-11-24T12:00:00Z",
    "request_id": "req_abc123"
  }
}
```

---

## Truth Hierarchy System

### Levels

1. **U1 (User)**: Highest authority - content created/edited by user directly
2. **A2 (Automation)**: System-generated structured data (scheduled tasks, integrations)
3. **L3 (AI Local)**: On-device AI suggestions (local LLM outputs)
4. **LN4 (AI Local Network)**: Local network AI (home server LLM)
5. **C5 (AI Cloud)**: Cloud AI suggestions (Together.ai, OpenAI, etc.)

### Rules

- **Higher truth always wins**: U1 > A2 > L3 > LN4 > C5
- **AI cannot overwrite user**: L3/LN4/C5 cannot modify U1 entities without user acceptance
- **Upgrades only**: Accepting AI suggestion promotes to U1
- **Audit trail**: `origin_chain` tracks all modifications and truth level changes

### Implementation

```typescript
// packages/@sbf/core/entity-manager/src/truth-hierarchy.ts
export enum TruthLevel {
  USER = 1,
  AUTOMATION = 2,
  AI_LOCAL = 3,
  AI_LOCAL_NETWORK = 4,
  AI_CLOUD = 5
}

export function canOverwrite(
  existingLevel: TruthLevel,
  newLevel: TruthLevel
): boolean {
  return newLevel <= existingLevel;
}

export function upgradeToUserTruth(entity: Entity): Entity {
  return {
    ...entity,
    truth_level: TruthLevel.USER,
    accepted_by_user: true,
    last_modified_by_level: TruthLevel.USER,
    origin_chain: [
      ...entity.origin_chain,
      {
        timestamp: new Date(),
        from_level: entity.truth_level,
        to_level: TruthLevel.USER,
        action: 'user_accepted'
      }
    ]
  };
}
```

---

## Security Architecture

### Authentication Flow

1. User submits credentials to `/auth/login`
2. Backend validates against `users` table
3. Generate JWT with claims: `{ sub: user_id, tenants: [...], iat, exp }`
4. Sign with RS256 private key
5. Return access token (15 min expiry) + refresh token (30 days)
6. Client includes token in `Authorization: Bearer <token>` header

### Tenant Isolation

**Per-Request Tenant Context**:
```typescript
// Middleware extracts tenant from JWT or header
app.use(async (req, res, next) => {
  const { userId, tenants } = req.jwtPayload;
  const tenantId = req.headers['x-tenant-id'] || tenants[0].id;
  
  // Validate user has access to tenant
  if (!tenants.find(t => t.id === tenantId)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  // Set PostgreSQL session variable for RLS
  await db.query(`SET app.current_tenant_id = '${tenantId}'`);
  
  req.tenantContext = { tenantId, userId };
  next();
});
```

**Database-Level Isolation**:
- All tenant tables have `tenant_id` column
- RLS policies enforce `tenant_id = current_setting('app.current_tenant_id')`
- Automatic filtering at database level (no application logic needed)

### Authorization (RBAC)

**Roles**:
- `owner`: Full control, billing, delete tenant
- `admin`: Manage members, settings
- `member`: Read/write data

**Permission Checks**:
```typescript
function requireRole(role: 'owner' | 'admin' | 'member') {
  return async (req, res, next) => {
    const { tenantId, userId } = req.tenantContext;
    const membership = await db.tenant_memberships.findOne({
      where: { tenant_id: tenantId, user_id: userId }
    });
    
    if (!membership || !hasRole(membership.role, role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
}

// Usage
app.delete('/tenants/:tenantId', requireRole('owner'), async (req, res) => {
  // Only owners can delete tenants
});
```

---

## Deployment Architecture

### Fly.io Services

**API Gateway** (`apps/api/fly.toml`)
- Regions: ord, lhr, syd (multi-region)
- Instances: 2-10 (auto-scaling)
- Resources: shared-cpu-1x, 512MB RAM

**Background Workers** (`apps/workers/fly.toml`)
- Regions: ord (primary)
- Instances: 1-5 (auto-scaling)
- Resources: shared-cpu-2x, 1GB RAM

**IoT Core** (`apps/iot-core/fly.toml`)
- Regions: ord, syd
- Instances: 2 (persistent connections)
- Resources: shared-cpu-1x, 512MB RAM

**Auth Service** (`apps/auth-service/fly.toml`)
- Internal network only
- Instances: 2
- Resources: shared-cpu-1x, 256MB RAM

**LLM Orchestrator** (`apps/llm-orchestrator/fly.toml`)
- Regions: ord, lhr
- Instances: 2 (auto-scaling)
- Resources: shared-cpu-2x, 1GB RAM
- Purpose: AI model routing and context management

### Vercel Deployment

**Web App** (`apps/web/vercel.json`)
- Framework: Next.js 14+
- Regions: Global edge network
- Serverless functions for API routes
- Environment variables for API URLs

---

## Monitoring & Observability

### Metrics (Grafana)

- API response times (P50, P95, P99)
- Database query performance
- LLM request latency
- Error rates by endpoint
- Active connections (WebSocket, MQTT)
- Tenant usage statistics

### Logging (Pino + LogTail)

Structured JSON logs with:
- Request ID (correlation)
- Tenant ID
- User ID
- Timestamp
- Log level
- Message
- Metadata (error stack, etc.)

### Error Tracking (Sentry)

- JavaScript errors (frontend)
- Uncaught exceptions (backend)
- Performance monitoring
- Release tracking

### Alerts

- API error rate > 1%
- Database connection pool exhausted
- LLM cost spike (>$100/hour)
- Disk space < 10% free
- High memory usage (>90%)

---

## Scalability Considerations

### Horizontal Scaling

- **API Gateway**: Auto-scale based on CPU/memory
- **Workers**: Queue-based scaling (more jobs → more workers)
- **Database**: Read replicas for analytics queries
- **Vector DB**: Sharding by tenant ID

### Caching Strategy

- **Redis**: Session cache, rate limit counters, frequently accessed data
- **CDN**: Static assets, public pages
- **Application-level**: Entity caches with TTL

### Database Optimization

- Indexes on frequently queried columns
- Materialized views for analytics
- Partitioning by tenant_id (future)
- Connection pooling (PgBouncer)

---

## Next Steps for Architecture

1. **Q4 2025**: Finalize analytics integration, deploy to staging
2. **Q1 2026**: Launch Next.js web app, performance testing
3. **Q2 2026**: Mobile apps, push notifications infrastructure
4. **Q3 2026**: Voice integrations, IoT core deployment
5. **Q4 2026**: LLM orchestrator, cost optimization

---

**Document Owner**: Architecture Team  
**Last Updated**: 2025-11-24  
**Status**: Living document - updated as architecture evolves
