# Holistic Refactoring Plan: SBF Tech Stack Realignment

**Date:** 2025-11-24  
**Scope:** Complete architectural refactoring aligned with multi-tenant, multi-platform objectives  
**Status:** Planning Phase

---

## Executive Summary

Based on analysis of the tech stack architecture alignment document, the current SBF codebase requires significant refactoring to align with the vision of a multi-tenant, multi-platform (Web/Mobile/Voice/IoT) second brain foundation with integrated analytics dashboards.

**Current State:**
- Monolithic desktop Electron app structure
- Single-tenant architecture
- No clear separation between frontend and backend services
- Analytics libraries (Superset, Grafana, Lightdash, Metabase) not integrated
- No multi-channel support (voice, mobile, IoT)
- No vector DB or knowledge graph isolation

**Target State:**
- Multi-tenant microservices architecture on Fly.io
- Web frontend on Vercel (Next.js)
- Mobile apps (iOS/Android) with native push
- Voice integrations (Alexa/Google Home)
- IoT device support with telemetry
- Integrated analytics dashboards
- Tenant-isolated vector DB and knowledge graphs

---

## Phase 1: Foundation & Infrastructure (Weeks 1-4)

### 1.1 Repository Restructure

**Objective:** Transform from desktop-centric to multi-service monorepo

**Actions:**
```
Current Structure:
second-brain-foundation/
├─ packages/@sbf/
│  ├─ desktop/           # Electron app
│  ├─ modules/           # Feature modules
│  └─ core/              # Core engines

Target Structure:
second-brain-foundation/
├─ apps/
│  ├─ web/               # Vercel Next.js app
│  ├─ api/               # Fly.io API gateway
│  ├─ workers/           # Fly.io background workers
│  ├─ iot-core/          # IoT/MQTT service
│  ├─ auth-service/      # Multi-tenant auth
│  ├─ notif-service/     # Push notifications
│  └─ llm-orchestrator/  # Together.ai routing
│
├─ packages/
│  ├─ core-domain/       # Domain models & tenant logic
│  ├─ db-client/         # Neon Postgres + migrations
│  ├─ vector-client/     # Pinecone/Qdrant
│  ├─ ai-client/         # Together.ai wrapper
│  ├─ auth-lib/          # Shared auth utilities
│  ├─ config/            # Shared config
│  ├─ logging/           # Shared logging
│  ├─ types/             # TypeScript types
│  └─ utils/             # Generic helpers
│
├─ mobile/
│  ├─ ios/               # Swift/SwiftUI
│  └─ android/           # Kotlin
│
├─ infra/
│  ├─ fly/               # Fly.io configs
│  ├─ vercel/            # Vercel config
│  └─ neon/              # DB schema & migrations
│
└─ libraries/            # External repos for extraction
```

**Implementation Steps:**
1. Create new directory structure
2. Set up workspace configuration (pnpm/npm workspaces)
3. Configure Turborepo for build pipelines
4. Update package.json workspace paths

**Files to Create:**
- `pnpm-workspace.yaml`
- `turbo.json`
- `apps/*/package.json` templates

---

### 1.2 Database Migration to Multi-Tenant Schema

**Objective:** Migrate from single-tenant to multi-tenant Neon Postgres

**Current Schema Issues:**
- No tenant_id columns
- No Row-Level Security (RLS)
- Desktop-centric storage patterns

**New Schema Requirements:**

```sql
-- Core tenant infrastructure
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE tenant_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, user_id)
);

-- Add tenant_id to ALL existing entity tables
ALTER TABLE entities ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE tasks ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE events ADD COLUMN tenant_id UUID REFERENCES tenants(id);
-- etc. for all existing tables

-- Enable Row-Level Security
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
-- etc.

-- RLS Policies
CREATE POLICY tenant_isolation_entities ON entities
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

**Migration Strategy:**
1. Create migration scripts in `packages/db-client/migrations/`
2. Add tenant_id to all entity tables
3. Implement RLS policies
4. Create data migration scripts for existing data
5. Update all queries to include tenant_id

**Files to Create:**
- `packages/db-client/src/client.ts`
- `packages/db-client/migrations/001_multi_tenant_foundation.sql`
- `packages/db-client/migrations/002_tenant_entities.sql`
- `packages/db-client/migrations/003_security_voice_iot.sql`

---

### 1.3 Vector DB & Knowledge Graph Isolation

**Objective:** Implement per-tenant vector namespaces and knowledge graph collections

**Vector DB Strategy (Pinecone/Qdrant):**
```typescript
// packages/vector-client/src/tenant-namespaces.ts
export function getTenantNamespace(tenantId: string): string {
  return `tenant_${tenantId}`;
}

export async function createTenantIndex(tenantId: string) {
  const namespace = getTenantNamespace(tenantId);
  // Create isolated index/namespace for tenant
  await vectorClient.createNamespace(namespace);
}

export async function queryTenantVectors(
  tenantId: string,
  embedding: number[],
  topK: number = 10
) {
  const namespace = getTenantNamespace(tenantId);
  return vectorClient.query({
    namespace,
    vector: embedding,
    topK
  });
}
```

**Knowledge Graph Strategy (ArangoDB):**
```typescript
// packages/db-client/src/knowledge-graph.ts
export function getTenantCollection(tenantId: string, type: string): string {
  return `tenant_${tenantId}_${type}`;
}

export async function initTenantGraph(tenantId: string) {
  // Create tenant-specific collections
  await db.collection(`tenant_${tenantId}_entities`).create();
  await db.collection(`tenant_${tenantId}_relationships`).create();
  await db.edgeCollection(`tenant_${tenantId}_edges`).create();
}
```

**Implementation Steps:**
1. Create `packages/vector-client/` package
2. Implement tenant namespace isolation
3. Update knowledge graph to use tenant collections
4. Migrate existing data to tenant-namespaced storage
5. Update all RAG queries to include tenant context

---

### 1.4 Authentication & Authorization Infrastructure

**Objective:** Implement multi-tenant auth with JWT and role-based access control

**Auth Service Components:**

```typescript
// apps/auth-service/src/types.ts
export interface TenantContext {
  tenantId: string;
  userId: string;
  channel: 'web' | 'ios' | 'android' | 'alexa' | 'google_home' | 'iot';
  roles: string[];
  scopes: string[];
}

export interface AccessToken {
  iss: string;
  sub: string; // user_id
  tenant_id: string;
  tenants: Array<{ id: string; role: string }>;
  channel: string;
  scopes: string[];
  iat: number;
  exp: number;
}
```

**JWT Strategy:**
- RS256/ES256 public key verification
- 15-60 minute access token lifetime
- Refresh tokens stored hashed in DB
- Service-to-service tokens for internal communication

**Implementation Steps:**
1. Create `apps/auth-service/` microservice
2. Implement OAuth2/OIDC endpoints
3. Create `packages/auth-lib/` for shared utilities
4. Implement JWT generation and verification
5. Create middleware for tenant context extraction
6. Set up voice account linking tables and flows

**Files to Create:**
- `apps/auth-service/src/index.ts`
- `apps/auth-service/src/routes/oauth.ts`
- `packages/auth-lib/src/jwt.ts`
- `packages/auth-lib/src/middleware.ts`

---

## Phase 2: Service Layer Decomposition (Weeks 5-8)

### 2.1 API Gateway (Fly.io)

**Objective:** Create unified REST/GraphQL API for all clients

**Architecture:**
```typescript
// apps/api/src/index.ts
import Fastify from 'fastify';
import { authMiddleware } from '@sbf/auth-lib';
import { tenantContextMiddleware } from './middleware/tenant-context';

const server = Fastify();

// Global middleware
server.addHook('preHandler', authMiddleware);
server.addHook('preHandler', tenantContextMiddleware);

// Routes
server.register(tenantsRoutes, { prefix: '/api/tenants' });
server.register(entitiesRoutes, { prefix: '/api/entities' });
server.register(tasksRoutes, { prefix: '/api/tasks' });
server.register(ragRoutes, { prefix: '/api/rag' });
server.register(automationsRoutes, { prefix: '/api/automations' });
server.register(voiceRoutes, { prefix: '/api/voice' });
server.register(iotRoutes, { prefix: '/api/iot' });
server.register(analyticsRoutes, { prefix: '/api/analytics' });
```

**Key Features:**
- Multi-tenant routing (subdomain or path-based)
- JWT authentication
- Rate limiting per tenant
- Request/response logging
- Error handling and monitoring

**Implementation Steps:**
1. Create `apps/api/` service
2. Set up Fastify/Express framework
3. Implement auth and tenant middleware
4. Create route handlers for all entities
5. Integrate with vector DB and knowledge graph
6. Deploy to Fly.io

---

### 2.2 Background Workers Service

**Objective:** Handle long-running tasks, RAG ingestion, and scheduled jobs

**Worker Types:**
```typescript
// apps/workers/src/jobs/
- ingest-documents.ts      // RAG ingestion & chunking
- build-embeddings.ts       // Vector generation
- nightly-summaries.ts      // Automated summaries
- tenant-analytics.ts       // Dashboard data generation
- data-sync.ts              // External data sources
- notifications.ts          // Batch notifications
```

**Queue Strategy:**
- BullMQ with Redis
- Per-tenant job queues
- Priority levels for different job types
- Dead letter queues for failed jobs

**Implementation Steps:**
1. Create `apps/workers/` service
2. Set up BullMQ and Redis connection
3. Implement job handlers
4. Create scheduling system (cron)
5. Add job monitoring and retry logic
6. Deploy to Fly.io

---

### 2.3 LLM Orchestrator Service

**Objective:** Central routing and cost control for Together.ai

**Features:**
```typescript
// apps/llm-orchestrator/src/router.ts
export async function routeRequest(
  tenantContext: TenantContext,
  useCase: string,
  prompt: string,
  contextChunks: string[]
) {
  // 1. Get tenant model policy
  const policy = await getTenantModelPolicy(tenantContext.tenantId, useCase);
  
  // 2. Choose appropriate model
  const modelId = policy?.modelId || getDefaultModel(useCase);
  
  // 3. Call Together.ai
  const response = await togetherClient.chat({
    model: modelId,
    temperature: policy?.temperature ?? 0.3,
    max_tokens: policy?.maxTokens ?? 2048,
    messages: buildMessages(prompt, contextChunks)
  });
  
  // 4. Track usage for billing
  await logUsage(tenantContext, useCase, modelId, response);
  
  return response;
}
```

**Use Cases:**
- `chat` - General Q&A
- `summarize` - Document summarization
- `code` - Code generation
- `governance` - DGP/legal analysis
- `cacao_advice` - Okir domain-specific
- `vet_triage` - Haustie domain-specific

**Implementation Steps:**
1. Create `apps/llm-orchestrator/` service
2. Implement model routing logic
3. Create usage tracking tables
4. Add cost estimation and limits
5. Integrate with Together.ai
6. Deploy to Fly.io (internal network only)

---

### 2.4 IoT Core Service

**Objective:** MQTT/WebSocket server for IoT device connectivity

**Architecture:**
```typescript
// apps/iot-core/src/server.ts
import Aedes from 'aedes';
import { createServer } from 'net';
import { devicesRepo, securityEventsRepo } from '@sbf/db-client';

const broker = new Aedes();

// Device authentication
broker.authenticate = async (client, username, password, callback) => {
  const device = await authenticateDevice(username, password);
  if (device) {
    client.deviceContext = {
      tenantId: device.tenant_id,
      deviceId: device.id
    };
    callback(null, true);
  } else {
    callback(new Error('Authentication failed'), false);
  }
};

// Topic authorization
broker.authorizePublish = (client, packet, callback) => {
  const ctx = client.deviceContext;
  const expectedTopic = `tenants/${ctx.tenantId}/devices/${ctx.deviceId}/telemetry`;
  
  if (packet.topic === expectedTopic) {
    callback(null);
  } else {
    callback(new Error('Unauthorized topic'));
  }
};
```

**Implementation Steps:**
1. Create `apps/iot-core/` service
2. Set up MQTT broker (Aedes) or WebSocket server
3. Implement device authentication
4. Add topic-based authorization
5. Create telemetry ingestion pipeline
6. Deploy to Fly.io

---

### 2.5 Notification Service

**Objective:** Unified push notifications for iOS, Android, and email

**Channels:**
```typescript
// apps/notif-service/src/channels/
- apns.ts       // Apple Push Notification Service
- fcm.ts        // Firebase Cloud Messaging
- email.ts      // Email notifications
- sms.ts        // SMS (future)
```

**Implementation:**
```typescript
export async function sendNotification(job: NotificationJob) {
  const devices = await getUserDevices(job.userId, job.tenantId);
  
  for (const device of devices) {
    switch (device.channel) {
      case 'ios':
        await sendAPNS(device.apns_token, job.payload);
        break;
      case 'android':
        await sendFCM(device.fcm_token, job.payload);
        break;
    }
  }
  
  await logNotification(job);
}
```

**Implementation Steps:**
1. Create `apps/notif-service/` service
2. Set up APNs and FCM integrations
3. Create device registration endpoints
4. Implement notification templates
5. Add batch processing
6. Deploy to Fly.io

---

## Phase 3: Frontend & Client Applications (Weeks 9-12)

### 3.1 Web Application (Vercel Next.js)

**Objective:** Multi-tenant web dashboard with analytics

**Structure:**
```
apps/web/
├─ src/
│  ├─ app/                   # Next.js app router
│  │  ├─ (auth)/
│  │  │  ├─ login/
│  │  │  └─ signup/
│  │  ├─ (dashboard)/
│  │  │  ├─ [tenant]/
│  │  │  │  ├─ entities/
│  │  │  │  ├─ tasks/
│  │  │  │  ├─ automations/
│  │  │  │  ├─ analytics/      # Dashboard integration
│  │  │  │  └─ settings/
│  │  └─ api/                  # API routes (proxy to Fly.io)
│  ├─ components/
│  │  ├─ dashboard/
│  │  ├─ analytics/            # Chart components
│  │  ├─ entity-views/
│  │  └─ shared/
│  ├─ lib/
│  │  ├─ api-client.ts         # Fly.io API wrapper
│  │  └─ auth-client.ts
│  └─ hooks/
```

**Key Features:**
- Server-side rendering for SEO
- Tenant-based routing (`/[tenant]/...`)
- Real-time updates via WebSockets
- Embedded analytics dashboards (Superset/Grafana)
- Mobile-responsive design

**Implementation Steps:**
1. Create `apps/web/` Next.js app
2. Set up authentication flow
3. Build tenant selector component
4. Create entity CRUD interfaces
5. Integrate analytics dashboard embedding
6. Deploy to Vercel

---

### 3.2 Mobile Applications

**iOS (Swift/SwiftUI):**
```
mobile/ios/
├─ SBFApp/
│  ├─ Views/
│  │  ├─ Dashboard/
│  │  ├─ Entities/
│  │  ├─ Tasks/
│  │  └─ Settings/
│  ├─ Services/
│  │  ├─ APIClient.swift
│  │  ├─ AuthService.swift
│  │  └─ PushNotifications.swift
│  └─ Models/
```

**Android (Kotlin/Jetpack Compose):**
```
mobile/android/
├─ app/
│  ├─ src/main/java/org/sbf/
│  │  ├─ ui/
│  │  ├─ data/
│  │  ├─ domain/
│  │  └─ di/
```

**Shared Features:**
- Native authentication
- APNs/FCM push notifications
- Offline-first architecture
- Biometric authentication
- Share extensions for quick capture

**Implementation Steps:**
1. Create iOS and Android project structures
2. Implement API client libraries
3. Build authentication flows
4. Create core UI screens
5. Set up push notification handling
6. Submit to App Store / Play Store

---

### 3.3 Voice Integrations

**Alexa Skill:**
```typescript
// apps/api/src/routes/voice/alexa.ts
router.post('/voice/alexa', async (req, res) => {
  // 1. Verify Alexa signature
  // 2. Resolve voice_account -> tenant_id + user_id
  // 3. Check voice_capabilities
  // 4. Execute intent (call LLM orchestrator)
  // 5. Log security event
  // 6. Return Alexa response
});
```

**Google Assistant Action:**
```typescript
// apps/api/src/routes/voice/google.ts
router.post('/voice/google', async (req, res) => {
  // Similar flow to Alexa
});
```

**Intents to Support:**
- `GetDailySummaryIntent` - Voice daily summary
- `ListTasksIntent` - Read task list
- `MarkTaskDoneIntent` - Mark task complete
- `AskQuestionIntent` - RAG-based Q&A
- `RunAutomationIntent` - Trigger automation

**Implementation Steps:**
1. Create Alexa skill in Amazon Developer Console
2. Create Google Action in Actions Console
3. Implement account linking (OAuth2)
4. Create voice_accounts and voice_capabilities tables
5. Build intent handlers
6. Implement voice-optimized responses
7. Submit for certification

---

## Phase 4: Analytics Dashboard Integration (Weeks 13-16)

### 4.1 Analytics Architecture

**Objective:** Integrate Superset/Grafana/Lightdash/Metabase for tenant dashboards

**Approach:**
```typescript
// Multi-source analytics strategy
const analyticsStack = {
  superset: {
    useCase: 'Advanced BI, complex queries, custom dashboards',
    deployment: 'Docker container on Fly.io',
    integration: 'Embed via iframe + SSO'
  },
  grafana: {
    useCase: 'Time-series metrics, IoT telemetry, system monitoring',
    deployment: 'Docker container on Fly.io',
    integration: 'Embed panels via iframe'
  },
  metabase: {
    useCase: 'Simple self-service analytics, business users',
    deployment: 'Docker container on Fly.io',
    integration: 'Embed dashboards'
  },
  lightdash: {
    useCase: 'dbt-based metrics, semantic layer',
    deployment: 'Cloud or self-hosted',
    integration: 'API + iframe embedding'
  }
};
```

---

### 4.2 Database Views for Analytics

**Tenant-Scoped Views:**
```sql
-- packages/db-client/migrations/004_analytics_views.sql

-- Entity activity summary
CREATE OR REPLACE VIEW analytics.entity_activity AS
SELECT 
  tenant_id,
  entity_type,
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as count,
  COUNT(DISTINCT created_by) as unique_users
FROM entities
GROUP BY tenant_id, entity_type, DATE_TRUNC('day', created_at);

-- Task completion metrics
CREATE OR REPLACE VIEW analytics.task_metrics AS
SELECT
  tenant_id,
  status,
  priority,
  DATE_TRUNC('day', completed_at) as completion_date,
  COUNT(*) as completed_count,
  AVG(EXTRACT(EPOCH FROM (completed_at - created_at)) / 3600) as avg_hours_to_complete
FROM tasks
WHERE completed_at IS NOT NULL
GROUP BY tenant_id, status, priority, DATE_TRUNC('day', completed_at);

-- LLM usage by tenant
CREATE OR REPLACE VIEW analytics.llm_usage AS
SELECT
  tenant_id,
  use_case,
  model_id,
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as request_count,
  SUM(input_tokens) as total_input_tokens,
  SUM(output_tokens) as total_output_tokens,
  SUM(input_tokens + output_tokens) as total_tokens
FROM llm_usage
GROUP BY tenant_id, use_case, model_id, DATE_TRUNC('day', created_at);

-- RLS policies for analytics views
CREATE POLICY tenant_analytics_isolation ON analytics.entity_activity
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

---

### 4.3 Superset Deployment & Configuration

**Docker Compose:**
```yaml
# infra/fly/docker-compose.analytics.yml
version: '3.8'

services:
  superset:
    image: apache/superset:latest
    environment:
      SUPERSET_SECRET_KEY: ${SUPERSET_SECRET_KEY}
      DATABASE_URL: ${NEON_DATABASE_URL}
    ports:
      - "8088:8088"
    volumes:
      - superset_home:/app/superset_home
      
  grafana:
    image: grafana/grafana:latest
    environment:
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD}
      GF_DATABASE_URL: ${NEON_DATABASE_URL}
    ports:
      - "3000:3000"
    volumes:
      - grafana_data:/var/lib/grafana
```

**Implementation:**
```typescript
// apps/api/src/routes/analytics.ts
router.get('/analytics/superset/embed/:dashboard_id', async (req, res) => {
  const { tenantId, userId } = req.tenantContext;
  
  // Generate signed embed URL with tenant context
  const embedUrl = await generateSupersetEmbed({
    dashboardId: req.params.dashboard_id,
    tenantId,
    userId,
    filters: { tenant_id: tenantId }
  });
  
  res.json({ embedUrl });
});
```

---

### 4.4 React Dashboard Components

**Embedding Strategy:**
```typescript
// apps/web/src/components/analytics/DashboardEmbed.tsx
import { useEffect, useState } from 'react';

export function DashboardEmbed({ 
  type, 
  dashboardId 
}: { 
  type: 'superset' | 'grafana' | 'metabase';
  dashboardId: string;
}) {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchEmbedUrl() {
      const response = await apiClient.get(
        `/analytics/${type}/embed/${dashboardId}`
      );
      setEmbedUrl(response.embedUrl);
    }
    fetchEmbedUrl();
  }, [type, dashboardId]);
  
  if (!embedUrl) return <div>Loading dashboard...</div>;
  
  return (
    <iframe
      src={embedUrl}
      width="100%"
      height="800px"
      frameBorder="0"
      sandbox="allow-same-origin allow-scripts allow-forms"
    />
  );
}
```

**Pre-built Dashboard Templates:**
```typescript
// apps/web/src/lib/dashboard-templates.ts
export const dashboardTemplates = {
  overview: {
    type: 'superset',
    title: 'Tenant Overview',
    widgets: [
      { type: 'entity_count', title: 'Total Entities' },
      { type: 'task_completion', title: 'Task Completion Rate' },
      { type: 'llm_usage', title: 'AI Usage This Month' },
      { type: 'recent_activity', title: 'Recent Activity' }
    ]
  },
  tasks: {
    type: 'metabase',
    title: 'Task Analytics',
    widgets: [
      { type: 'tasks_by_status', title: 'Tasks by Status' },
      { type: 'completion_trend', title: 'Completion Trend' },
      { type: 'avg_completion_time', title: 'Avg Completion Time' }
    ]
  },
  iot_telemetry: {
    type: 'grafana',
    title: 'IoT Device Metrics',
    widgets: [
      { type: 'device_status', title: 'Device Status' },
      { type: 'telemetry_chart', title: 'Telemetry Over Time' },
      { type: 'alerts', title: 'Active Alerts' }
    ]
  }
};
```

---

## Phase 5: Module & Library Extraction (Weeks 17-20)

### 5.1 Superset Module Extraction

**Objective:** Extract dashboard creation, SQL query builder, and chart components

**Target Modules:**
```
libraries/superset/
├─ superset-frontend/src/
│  ├─ dashboard/           -> Extract to @sbf/analytics-dashboard
│  ├─ SqlLab/              -> Extract to @sbf/sql-editor
│  ├─ chart/               -> Extract to @sbf/chart-builder
│  └─ components/explore/  -> Extract to @sbf/data-explorer
```

**Extraction Plan:**
1. Identify reusable React components
2. Extract chart rendering engine
3. Adapt SQL editor for tenant-scoped queries
4. Create dashboard builder UI
5. Package as `@sbf/analytics-dashboard`

---

### 5.2 Grafana Module Extraction

**Objective:** Extract panel system and time-series visualization

**Target Modules:**
```
libraries/grafana/
├─ public/app/
│  ├─ features/dashboard/  -> Extract to @sbf/grafana-panels
│  ├─ plugins/panel/       -> Extract panel types
│  └─ features/alerting/   -> Extract alerting system
```

**Extraction Plan:**
1. Extract panel plugin architecture
2. Adapt time-series chart components
3. Create alerting rule builder
4. Package as `@sbf/time-series-dashboard`

---

### 5.3 Lightdash & Metabase Integration

**Lightdash:**
- Extract semantic layer / metrics catalog
- Adapt dbt integration if using dbt

**Metabase:**
- Extract simple query builder
- Use for non-technical user dashboards

---

## Phase 6: Deployment & DevOps (Weeks 21-22)

### 6.1 Fly.io Deployment

**Services to Deploy:**
```
fly.toml configurations:
- api.fly.toml               # API Gateway
- workers.fly.toml           # Background workers
- iot-core.fly.toml          # IoT MQTT service
- auth-service.fly.toml      # Authentication
- notif-service.fly.toml     # Notifications
- llm-orchestrator.fly.toml  # LLM routing
- superset.fly.toml          # Superset analytics
- grafana.fly.toml           # Grafana dashboards
```

**Deployment Strategy:**
1. Set up Fly.io organization and apps
2. Configure secrets and environment variables
3. Set up private networking between services
4. Configure scaling rules
5. Set up health checks and monitoring

---

### 6.2 CI/CD Pipeline

**GitHub Actions:**
```yaml
# .github/workflows/deploy-api.yml
name: Deploy API Gateway

on:
  push:
    branches: [main]
    paths:
      - 'apps/api/**'
      - 'packages/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: npm install
      - run: npm run build --workspace=apps/api
      - run: flyctl deploy --config apps/api/fly.toml
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

**Workflows Needed:**
- `web-ci.yml` - Vercel deployment
- `api-ci.yml` - API gateway
- `workers-ci.yml` - Background workers
- `iot-ci.yml` - IoT service
- `auth-ci.yml` - Auth service
- `notif-ci.yml` - Notifications
- `llm-orchestrator-ci.yml` - LLM service

---

### 6.3 Monitoring & Observability

**Stack:**
- Fly.io metrics for infrastructure
- Sentry for error tracking
- LogTail/DataDog for log aggregation
- Grafana for application metrics
- Custom tenant usage dashboards

**Implementation:**
```typescript
// packages/logging/src/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
    bindings: (bindings) => ({
      ...bindings,
      tenantId: undefined // Remove sensitive data
    })
  }
});

// Structured logging with tenant context
export function logWithContext(
  message: string,
  context: TenantContext,
  metadata?: Record<string, any>
) {
  logger.info({
    message,
    tenantId: context.tenantId,
    userId: context.userId,
    channel: context.channel,
    ...metadata
  });
}
```

---

## Phase 7: Data Migration & Cutover (Weeks 23-24)

### 7.1 Data Migration Scripts

**Existing Desktop Data → Multi-Tenant Neon:**
```typescript
// scripts/migrate-to-multi-tenant.ts

async function migrateDesktopData() {
  // 1. Create default tenant
  const tenant = await createTenant({
    slug: 'legacy-import',
    name: 'Legacy Import',
    plan: 'pro'
  });
  
  // 2. Import all entities
  const entities = await loadDesktopEntities();
  for (const entity of entities) {
    await db.entities.create({
      ...entity,
      tenant_id: tenant.id
    });
  }
  
  // 3. Rebuild knowledge graph
  await rebuildKnowledgeGraph(tenant.id);
  
  // 4. Generate embeddings
  await regenerateEmbeddings(tenant.id);
}
```

---

### 7.2 Gradual Rollout Strategy

**Week 23:**
- Deploy all services to staging
- Run integration tests
- Migrate test tenant data
- Internal dogfooding

**Week 24:**
- Deploy to production (feature-flagged)
- Migrate first production tenant
- Monitor metrics and errors
- Gradual rollout to additional tenants

---

## Success Metrics

### Technical Metrics
- [ ] 99.9% uptime for API gateway
- [ ] < 200ms P95 response time for API calls
- [ ] < 2s P95 for RAG queries
- [ ] Zero tenant data leakage incidents
- [ ] 100% test coverage for tenant isolation

### Product Metrics
- [ ] Web app loads in < 2s
- [ ] Mobile apps approved on both stores
- [ ] Voice intents respond in < 3s
- [ ] IoT devices connect in < 5s
- [ ] Analytics dashboards load in < 3s

### Business Metrics
- [ ] Support multiple paying tenants
- [ ] Accurate per-tenant usage tracking
- [ ] Automated billing integration
- [ ] Self-service tenant onboarding

---

## Risk Mitigation

### High-Priority Risks

1. **Data Migration Failures**
   - Mitigation: Extensive testing, rollback procedures, data validation scripts

2. **Tenant Isolation Breaches**
   - Mitigation: RLS policies, automated security tests, penetration testing

3. **Performance Degradation**
   - Mitigation: Load testing, caching strategy, database indexing

4. **Third-Party Service Costs**
   - Mitigation: Usage monitoring, cost alerts, fallback strategies

5. **Mobile App Rejections**
   - Mitigation: Follow platform guidelines, pre-submission review

---

## Dependencies & Prerequisites

### Infrastructure
- [ ] Neon Postgres account with appropriate plan
- [ ] Fly.io organization and billing set up
- [ ] Vercel team account
- [ ] Together.ai API key and quota
- [ ] Vector DB account (Pinecone/Qdrant)
- [ ] APNs certificates (iOS)
- [ ] FCM credentials (Android)
- [ ] Amazon Alexa Developer account
- [ ] Google Actions Developer account

### Team Skills
- [ ] Node.js/TypeScript backend development
- [ ] Next.js/React frontend development
- [ ] Swift/iOS development
- [ ] Kotlin/Android development
- [ ] DevOps (Fly.io, CI/CD)
- [ ] Database design & optimization
- [ ] Security & authentication
- [ ] Analytics & BI tools

---

## Next Immediate Actions

1. **Week 1 Tasks:**
   - [ ] Create new repository structure
   - [ ] Set up pnpm workspaces
   - [ ] Configure Turborepo
   - [ ] Create Neon Postgres database
   - [ ] Write initial migration scripts
   - [ ] Set up Fly.io organization

2. **Quick Wins:**
   - [ ] Extract existing entity manager to `packages/core-domain/`
   - [ ] Create shared types package
   - [ ] Set up centralized logging
   - [ ] Create development environment setup script

3. **Planning:**
   - [ ] Finalize vector DB choice (Pinecone vs Qdrant)
   - [ ] Design final API schema (REST vs GraphQL)
   - [ ] Create detailed UI/UX mockups for web app
   - [ ] Document mobile app feature requirements

---

## Conclusion

This refactoring plan transforms SBF from a desktop-centric single-tenant application into a modern, multi-tenant, multi-platform second brain system with:

✅ **Microservices architecture** for scalability  
✅ **Multi-tenant isolation** for security  
✅ **Cross-platform support** (Web, Mobile, Voice, IoT)  
✅ **Integrated analytics** via industry-leading BI tools  
✅ **AI orchestration** with cost control  
✅ **Production-ready infrastructure** on modern cloud platforms

**Estimated Timeline:** 24 weeks (6 months) for complete implementation  
**Team Size Recommended:** 4-6 full-time engineers  
**Budget Estimate:** $50-100K in infrastructure/tooling costs

---

**Status:** Ready for executive approval and team kickoff  
**Next Review:** Weekly progress check-ins, monthly milestone reviews
