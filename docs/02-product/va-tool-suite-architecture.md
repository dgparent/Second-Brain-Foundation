# VA Tool Suite Architecture
**Virtual Assistant Operations OS - Full Suite Design**

**Version:** 1.0  
**Date:** 2025-11-20  
**Status:** Architecture Design  
**Review Method:** BMAD Party-Mode (Multi-Agent Analysis)

---

## Executive Summary

This document defines the **VA Tool Suite** - a comprehensive, modular system that transforms Second Brain Foundation into a complete Operations OS for Virtual Assistants. The design ensures:

✅ **Modularity** - Clean separation between Memory Engine, AEI Core, and VA-specific modules  
✅ **Integration** - Seamless flow between existing SBF components and new VA features  
✅ **Extensibility** - BMAD-aligned architecture enabling future enhancements  
✅ **Privacy** - Multi-client isolation with strict security boundaries

---

## 🎭 Party-Mode Review Summary

### Agent Perspectives on VA Tool Suite

#### 🏗️ **Architect (Winston)**
**Assessment:** Strong foundation with memory-engine integration

**Key Findings:**
- VA entities extend existing SBF entity model perfectly
- Need clear boundary layer between Memory Engine and VA-specific logic
- Multi-tenant pattern requires isolation at vault adapter level
- Recommend: Service-oriented architecture with VA module as module

**Architecture Pattern:**
```
┌─────────────────────────────────────────────┐
│         VA Tool Suite (module Layer)        │
├─────────────────────────────────────────────┤
│  - va.client module                         │
│  - va.workflow module                       │
│  - va.automation module                     │
│  - va.reporting module                      │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         AEI Core (Orchestration)            │
├─────────────────────────────────────────────┤
│  - AEI_INGEST                               │
│  - AEI_CORRELATE                            │
│  - AEI_SYNTHESIZE                           │
│  - AEI_QUERY                                │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│      Memory Engine (Core Services)          │
├─────────────────────────────────────────────┤
│  - Entity storage & retrieval               │
│  - Relationship graph                       │
│  - Security/Privacy controls                │
│  - Lifecycle management                     │
└─────────────────────────────────────────────┘
```

**Critical Design Decisions:**
1. VA entities use same UID scheme: `va-client-{slug}-{counter}`
2. Client isolation via `client_uid` metadata + AEI boundary enforcement
3. Memory Engine treats VA entities as first-class citizens (no special handling)
4. AEI layer enforces multi-tenant boundaries

---

#### 📊 **Product Owner (Mary)**
**Assessment:** Clear product vision aligned with market needs

**User Stories Coverage:**
- ✅ Email → Task automation
- ✅ Meeting notes → Weekly report synthesis
- ✅ Research brief generation
- ✅ Content calendar management
- ✅ Multi-client workspace isolation

**MVP Prioritization:**
```
P0 (Must-Have v1):
- va.client, va.account_workspace, va.task, va.meeting
- Email ingestion → task creation
- Weekly report generation
- Basic SOP library

P1 (Nice-to-Have v1):
- va.content_calendar, va.content_item
- va.automation templates
- Research brief workflows

P2 (Future):
- CRM bi-directional sync
- Social media publishing
- Billing/time tracking integration
```

**Acceptance Criteria Framework:**
```yaml
epic: VA_Operations_OS
features:
  - name: Client Management
    stories:
      - As a VA, I can create a client workspace with all context in one place
      - As a VA, I can see all tasks/meetings/SOPs for a specific client
      - As a VA, I can switch between client contexts without data leakage
  
  - name: Task Automation
    stories:
      - As a VA, I can forward emails and have AEI create tasks automatically
      - As a VA, I can assign tasks to clients and track completion
      - As a VA, I can generate weekly reports with minimal manual input
  
  - name: Knowledge Management
    stories:
      - As a VA, I can create SOPs that are reusable across clients
      - As a VA, I can search for "how we do X" and find the right SOP
      - As a VA, I can version SOPs and track improvements
```

---

#### 💻 **Developer (Alex)**
**Assessment:** Implementation roadmap is clear; need module boundaries

**Technical Implementation Plan:**

**Phase 1: Core VA Entities (Week 1-2)**
```typescript
// packages/va-core/src/entities/

export interface VAClient extends BaseEntity {
  uid: string;  // va-client-{slug}-{counter}
  type: 'va.client';
  title: string;
  contact_uid: string;
  industry: string;
  time_zone: string;
  primary_channels: string[];
  tool_stack: string[];
  service_packages: string[];
  sops: string[];
  active_vas: string[];
  sensitivity: SensitivityConfig;
}

export interface VAAccountWorkspace extends BaseEntity {
  uid: string;  // va-account-{client}-{va-name}
  type: 'va.account_workspace';
  client_uid: string;
  assigned_va: string;
  roles: VARole[];
  status: 'active' | 'paused' | 'offboarding';
  current_projects: string[];
  preferred_hours_per_week: number;
  communication_rules: CommunicationRules;
}

export interface VASOP extends BaseEntity {
  uid: string;  // va-sop-{slug}-{counter}
  type: 'va.sop';
  title: string;
  category: string;
  client_specific: boolean;
  client_uid?: string;  // null for generic SOPs
  steps: SOPStep[];
  automation_uid?: string;
  sensitivity: SensitivityConfig;
}
```

**Phase 2: AEI Integration (Week 3-4)**
```python
# aei-core/services/va_workflows.py

class VAWorkflowService:
    def __init__(self, memory_engine, aei_orchestrator):
        self.memory = memory_engine
        self.aei = aei_orchestrator
    
    async def ingest_email_to_tasks(
        self, 
        client_uid: str, 
        email_content: str
    ) -> List[VATask]:
        """
        AEI_INGEST mode: Parse email → extract tasks
        Boundary: Only create tasks for specified client
        """
        # Security: Verify client_uid exists and is active
        client = await self.memory.get_entity(client_uid)
        if not client or client.type != 'va.client':
            raise ValueError(f"Invalid client: {client_uid}")
        
        # AEI ingestion with client context
        tasks = await self.aei.ingest(
            content=email_content,
            expected_type='va.task',
            context={'client_uid': client_uid},
            mode='extract_tasks'
        )
        
        # Enforce client boundary
        for task in tasks:
            task.client_uid = client_uid
            task.sensitivity.level = max(4, client.sensitivity.level)
        
        return tasks
    
    async def generate_weekly_report(
        self,
        client_uid: str,
        from_date: datetime,
        to_date: datetime
    ) -> VAReport:
        """
        AEI_SYNTHESIZE mode: Aggregate week's work → report
        """
        # Gather all entities for client in date range
        entities = await self.memory.query_entities(
            filters={
                'client_uid': client_uid,
                'created': {'gte': from_date, 'lte': to_date}
            },
            types=['va.task', 'va.meeting', 'va.research_brief']
        )
        
        # AEI synthesis
        report = await self.aei.synthesize(
            entities=entities,
            template='va_weekly_report',
            context={'client_uid': client_uid}
        )
        
        return report
```

**Phase 3: CLI Scaffolding (Week 5-6)**
```bash
# packages/cli/src/commands/va/

sbf va init --client "acme-co"
  # Creates va.client + va.account_workspace

sbf va sop create --title "Email Triage SOP" --client acme-co
  # Creates va.sop with client_uid

sbf va ingest email --client acme-co --file inbox-export.json
  # Runs AEI_INGEST → creates va.task_intake + va.task

sbf va report weekly --client acme-co --from 2025-11-14 --to 2025-11-21
  # Runs AEI_SYNTHESIZE → generates va.report
```

**Modularity Strategy:**
```
packages/
├── core/                    # Base SBF (unchanged)
├── memory-engine/           # Core entity storage (unchanged)
├── aei-core/                # AI orchestration (extend)
│   └── workflows/
│       └── va_workflows.py  # NEW: VA-specific AEI flows
├── va-core/                 # NEW: VA module module
│   ├── entities/
│   │   ├── client.ts
│   │   ├── workspace.ts
│   │   ├── task.ts
│   │   ├── sop.ts
│   │   └── report.ts
│   ├── services/
│   │   ├── client-manager.ts
│   │   ├── task-ingestion.ts
│   │   ├── report-generator.ts
│   │   └── sop-library.ts
│   └── templates/
│       └── *.md             # Entity templates
└── cli/
    └── commands/va/         # NEW: VA-specific commands
```

---

#### 🧪 **QA Engineer (Sarah)**
**Assessment:** Multi-client isolation is critical testing area

**Test Strategy:**

**1. Security Boundary Tests**
```python
# tests/test_va_security.py

async def test_client_isolation_in_aei_correlate():
    """
    CRITICAL: AEI_CORRELATE must not link entities across clients
    """
    client_a = await create_test_client('client-a')
    client_b = await create_test_client('client-b')
    
    task_a = await create_task(client_uid='client-a', content="Secret project A")
    task_b = await create_task(client_uid='client-b', content="Secret project B")
    
    # Run AEI correlation
    await aei.correlate_entity(task_a.uid)
    
    # Verify: task_a should NOT have relationships to client_b entities
    task_a_relations = await memory.get_relationships(task_a.uid)
    for rel in task_a_relations:
        target = await memory.get_entity(rel.target_uid)
        assert target.client_uid != 'client-b', \
            "SECURITY BREACH: Cross-client relationship detected"

async def test_generic_sop_can_be_reused():
    """
    Generic SOPs (no client_uid) should be reusable across clients
    """
    generic_sop = await create_sop(
        title="Email Triage SOP",
        client_specific=False,
        client_uid=None
    )
    
    # Both clients should be able to reference it
    workspace_a = await create_workspace(client_uid='client-a')
    workspace_b = await create_workspace(client_uid='client-b')
    
    await link_sop_to_workspace(workspace_a.uid, generic_sop.uid)
    await link_sop_to_workspace(workspace_b.uid, generic_sop.uid)
    
    # Verify both can access
    assert generic_sop.uid in workspace_a.sops
    assert generic_sop.uid in workspace_b.sops
```

**2. Integration Tests**
```python
# tests/integration/test_va_workflows.py

async def test_email_to_weekly_report_flow():
    """
    End-to-end: Email ingestion → tasks → weekly report
    """
    # Setup
    client = await create_test_client('acme-co')
    
    # Day 1: Ingest emails
    emails = load_test_emails('fixtures/acme-co-week1.json')
    tasks = []
    for email in emails:
        new_tasks = await va_service.ingest_email_to_tasks(
            client_uid=client.uid,
            email_content=email['body']
        )
        tasks.extend(new_tasks)
    
    assert len(tasks) >= 10, "Should extract multiple tasks from emails"
    
    # Day 7: Generate report
    report = await va_service.generate_weekly_report(
        client_uid=client.uid,
        from_date=datetime(2025, 11, 14),
        to_date=datetime(2025, 11, 21)
    )
    
    # Verify report contains task summaries
    assert report.type == 'va.report'
    assert len(report.tasks_completed) > 0
    assert len(report.tasks_pending) > 0
    assert report.client_uid == client.uid
```

**3. Performance Tests**
```python
async def test_multi_client_query_performance():
    """
    Ensure querying 1 client doesn't slow down with many clients
    """
    # Create 50 clients, each with 100 tasks
    clients = [await create_test_client(f'client-{i}') for i in range(50)]
    for client in clients:
        for j in range(100):
            await create_task(client_uid=client.uid, title=f"Task {j}")
    
    # Query single client should be fast
    start = time.time()
    tasks = await memory.query_entities(
        filters={'client_uid': clients[0].uid},
        types=['va.task']
    )
    duration = time.time() - start
    
    assert len(tasks) == 100
    assert duration < 0.5, f"Query took {duration}s (should be <0.5s)"
```

**Test Coverage Requirements:**
- Security: 100% coverage on client isolation
- Integration: All 4 VA workflows end-to-end
- Performance: <500ms for single-client queries with 50+ clients

---

#### 📝 **Product Manager (John)**
**Assessment:** Roadmap aligns with VA market needs

**Go-to-Market Strategy:**

**Target Users (v1):**
1. Solo VAs managing 3-5 clients
2. Small VA agencies (2-5 VAs)
3. Executive Assistants in hybrid remote/office roles

**Competitive Positioning:**
```
vs. Notion (Current VA Favorite):
  Them: Databases + AI blocks, but scattered info
  Us: AI-native progressive organization + SOP automation
  Win: "Your VA operations brain, not just a wiki"

vs. ClickUp/Asana (Task Management):
  Them: Task-first, no knowledge integration
  Us: Tasks + context + research + SOPs in one graph
  Win: "Every task knows its why, who, and how"

vs. Zapier/Make (Automation):
  Them: App-to-app, no memory
  Us: Workflow automation WITH knowledge retention
  Win: "Automation that learns and compounds"
```

**Revenue Model:**
```
Tier 1: Free (Solo VA, 1 client)
  - All core features
  - Local AI only
  - 1 GB storage

Tier 2: Pro ($29/mo, up to 5 clients)
  - Cloud AI integration
  - 10 GB storage
  - Advanced reporting
  - SOP library sharing

Tier 3: Agency ($99/mo, unlimited clients + VAs)
  - Multi-VA collaboration
  - Client handoff workflows
  - Custom integrations
  - 100 GB storage
```

**Success Metrics:**
- Week 4: 10 beta VAs using system for 1+ client
- Month 3: 100 active VAs, 20% weekly retention
- Month 6: 50% of users on Pro tier
- Month 12: 10 agency customers

---

#### 🎨 **UX Expert (Emma)**
**Assessment:** UI/UX patterns need client-context switching

**Key UX Flows:**

**1. Client Context Switcher**
```
┌─────────────────────────────────────┐
│  🏢 Current Client: Acme Corp      │
│  ────────────────────────────────── │
│  📧 12 Tasks Pending                │
│  📅 2 Meetings This Week            │
│  📄 3 New Research Briefs           │
│  ────────────────────────────────── │
│  Switch Client:                     │
│    • Acme Corp         [Active]     │
│    • StartupXYZ        [...]        │
│    • PersonalClient    [...]        │
│  ────────────────────────────────── │
│  ➕ Add New Client                  │
└─────────────────────────────────────┘
```

**2. Email → Task Workflow (Minimal Friction)**
```
Step 1: Forward email to: tasks@acme-co.2bf.app
Step 2: AEI processes in background
Step 3: Notification: "3 tasks created from email"
Step 4: Review queue → Approve/Edit/Reject
```

**3. Weekly Report Generation (One Click)**
```
┌─────────────────────────────────────┐
│  Generate Weekly Report             │
│  ────────────────────────────────── │
│  Client: [Acme Corp ▼]              │
│  Week:   [Nov 14-21 ▼]              │
│  ────────────────────────────────── │
│  Preview:                           │
│   ✓ 18 tasks completed              │
│   ⏳ 5 tasks in progress            │
│   📅 3 meetings attended            │
│   📊 2 research briefs delivered    │
│  ────────────────────────────────── │
│  [Generate Report]  [Download PDF]  │
└─────────────────────────────────────┘
```

**Design Principles:**
- **Context-Aware**: Always show which client you're working in
- **Zero-Decision Capture**: Email → task with no manual sorting
- **Progressive Disclosure**: Simple by default, power features on demand
- **Trust Through Transparency**: Always show what AEI did + undo option

---

#### 🔧 **Architect (Winston) - Technical Deep Dive**

**Memory Engine Integration:**

**1. Entity Storage Strategy**
```typescript
// Memory Engine: No changes needed!
// VA entities use existing storage layer

interface EntityStorage {
  create(entity: BaseEntity): Promise<string>;  // Returns UID
  get(uid: string): Promise<BaseEntity>;
  query(filters: QueryFilters): Promise<BaseEntity[]>;
  update(uid: string, delta: Partial<BaseEntity>): Promise<void>;
  delete(uid: string): Promise<void>;
}

// VA module just provides typed wrappers
class VAClientRepository {
  constructor(private storage: EntityStorage) {}
  
  async createClient(data: VAClientData): Promise<VAClient> {
    const entity = {
      ...data,
      uid: generateUID('va-client', data.slug),
      type: 'va.client',
      created: new Date(),
      sensitivity: { level: 4, ... }  // Default high security
    };
    
    await this.storage.create(entity);
    return entity as VAClient;
  }
  
  async getClientWorkspaces(clientUID: string): Promise<VAAccountWorkspace[]> {
    return this.storage.query({
      type: 'va.account_workspace',
      client_uid: clientUID
    }) as Promise<VAAccountWorkspace[]>;
  }
}
```

**2. AEI Integration Points**
```python
# aei-core/services/va_aei_bridge.py

class VAAEIBridge:
    """
    Bridge between VA workflows and core AEI services
    Enforces VA-specific rules on top of generic AEI
    """
    
    def __init__(self, aei_orchestrator, memory_engine):
        self.aei = aei_orchestrator
        self.memory = memory_engine
    
    async def ingest_with_client_context(
        self,
        content: str,
        client_uid: str,
        expected_types: List[str]
    ) -> List[BaseEntity]:
        """
        Wrapper around AEI_INGEST that enforces client boundary
        """
        # Verify client exists
        client = await self.memory.get_entity(client_uid)
        if not client:
            raise ValueError(f"Client not found: {client_uid}")
        
        # Run AEI ingestion
        entities = await self.aei.ingest(
            content=content,
            expected_types=expected_types,
            context={
                'client_uid': client_uid,
                'min_sensitivity': client.sensitivity.level
            }
        )
        
        # Post-process: Stamp all entities with client_uid
        for entity in entities:
            entity.client_uid = client_uid
            entity.sensitivity.level = max(
                entity.sensitivity.level,
                client.sensitivity.level
            )
        
        return entities
    
    async def correlate_within_client(
        self,
        entity_uid: str
    ) -> List[Relationship]:
        """
        Wrapper around AEI_CORRELATE that enforces client boundary
        """
        entity = await self.memory.get_entity(entity_uid)
        if not entity.client_uid:
            # Generic entity - allow normal correlation
            return await self.aei.correlate(entity_uid)
        
        # Client-specific entity - restrict correlation scope
        client_entities = await self.memory.query_entities(
            filters={'client_uid': entity.client_uid}
        )
        
        relationships = await self.aei.correlate(
            entity_uid=entity_uid,
            scope_uids=[e.uid for e in client_entities]
        )
        
        return relationships
```

**3. Security Model Extension**
```yaml
# Example VA client entity with security

---
uid: va-client-acme-corp-001
type: va.client
title: "Acme Corp"
contact_uid: person-jane-doe-001

# Security (inherits from SBF model)
sensitivity:
  level: 4  # Confidential (default for all client data)
  scope: internal_group
  privacy:
    cloud_ai_allowed: false  # Client data stays local by default
    local_ai_allowed: true
    export_allowed: false
  group_access:
    - va-account-acme-corp-alice  # Only Alice's workspace can access

# VA-specific metadata
industry: SaaS
time_zone: "America/New_York"
primary_channels:
  - email
  - slack
tool_stack:
  - "Google Workspace"
  - "HubSpot"
service_packages:
  - va-service-exec-support-001
sops:
  - va-sop-email-triage-generic-001  # Generic SOP
  - va-sop-acme-reporting-001         # Client-specific SOP
active_vas:
  - va-account-acme-corp-alice

# Memory Engine tracking (auto-generated)
created: 2025-11-20T10:00:00Z
updated: 2025-11-20T14:30:00Z
lifecycle:
  state: permanent
  review_at: 2026-02-20T00:00:00Z

# AEI Code (auto-computed)
aei_code: "MEM:LT | SEC:4-INT | AI:LOC | EXP:NO | VIS:RST"
---

# Acme Corp - Client Overview

## Business Context
SaaS company focused on project management tools for construction industry.

## Working Agreement
- Response SLA: 12 hours
- Daily updates: 5pm ET
- Weekly reports: Friday 3pm
```

---

## 📐 Modular Architecture Blueprint

### Layer 1: Memory Engine (Core)
**Responsibility:** Entity storage, retrieval, lifecycle, security
**Changes for VA:** ✅ **NONE** - VA entities use existing infrastructure

```typescript
// Existing Memory Engine interface
interface MemoryEngine {
  createEntity(entity: BaseEntity): Promise<string>;
  getEntity(uid: string): Promise<BaseEntity | null>;
  queryEntities(query: EntityQuery): Promise<BaseEntity[]>;
  updateEntity(uid: string, updates: Partial<BaseEntity>): Promise<void>;
  deleteEntity(uid: string): Promise<void>;
  
  createRelationship(rel: Relationship): Promise<void>;
  getRelationships(uid: string): Promise<Relationship[]>;
}
```

### Layer 2: AEI Core (Orchestration)
**Responsibility:** AI-powered ingestion, correlation, synthesis
**Changes for VA:** ➕ **ADD** VA-specific workflow modules

```typescript
// New VA workflow module (extends AEI)
class VAWorkflows {
  constructor(
    private aei: AEIOrchestrator,
    private memory: MemoryEngine
  ) {}
  
  // Email → Task workflow
  async ingestEmail(clientUID: string, email: Email): Promise<VATask[]> {
    return this.aei.ingest({
      content: email.body,
      context: { client_uid: clientUID },
      targetTypes: ['va.task', 'va.task_intake']
    });
  }
  
  // Weekly report synthesis
  async generateWeeklyReport(
    clientUID: string,
    weekStart: Date,
    weekEnd: Date
  ): Promise<VAReport> {
    const entities = await this.memory.queryEntities({
      client_uid: clientUID,
      created_gte: weekStart,
      created_lte: weekEnd
    });
    
    return this.aei.synthesize({
      entities,
      template: 'va_weekly_report',
      context: { client_uid: clientUID }
    });
  }
}
```

### Layer 3: VA Core (Domain Logic)
**Responsibility:** VA-specific business rules, multi-client management
**Changes for VA:** ➕ **NEW** - Entire layer is new

```typescript
// packages/va-core/src/

export class VAClientManager {
  constructor(
    private memory: MemoryEngine,
    private workflows: VAWorkflows
  ) {}
  
  async createClient(data: VAClientInput): Promise<VAClient> {
    // Business logic: Create client + default workspace
    const client = await this.memory.createEntity({
      ...data,
      type: 'va.client',
      sensitivity: { level: 4 }  // Default confidential
    });
    
    const workspace = await this.memory.createEntity({
      type: 'va.account_workspace',
      client_uid: client.uid,
      assigned_va: data.va_uid
    });
    
    return client;
  }
  
  async getClientDashboard(clientUID: string): Promise<ClientDashboard> {
    const [tasks, meetings, sops] = await Promise.all([
      this.memory.queryEntities({ client_uid: clientUID, type: 'va.task' }),
      this.memory.queryEntities({ client_uid: clientUID, type: 'va.meeting' }),
      this.memory.queryEntities({ client_uid: clientUID, type: 'va.sop' })
    ]);
    
    return {
      client_uid: clientUID,
      tasks_pending: tasks.filter(t => t.status !== 'completed'),
      meetings_this_week: meetings.filter(m => isThisWeek(m.date)),
      sops_available: sops
    };
  }
}
```

### Layer 4: CLI/UI (Interface)
**Responsibility:** User interaction, command execution
**Changes for VA:** ➕ **ADD** VA-specific commands and views

```bash
# CLI commands (new)
sbf va client create --name "Acme Corp" --industry SaaS
sbf va workspace init --client acme-corp --va alice
sbf va email ingest --client acme-corp --file inbox.json
sbf va report weekly --client acme-corp --output pdf
```

---

## 🔐 Security & Multi-Client Isolation

### Enforcement Layers

**Layer 1: Memory Engine (Storage)**
```typescript
// Entities have client_uid in metadata
interface VAEntity extends BaseEntity {
  client_uid?: string;  // null = generic/shared
}
```

**Layer 2: AEI (Correlation)**
```python
async def correlate_entity(entity_uid: str):
    entity = await memory.get_entity(entity_uid)
    
    if entity.client_uid:
        # Client-specific: only correlate within same client
        scope = await memory.query_entities({
            'client_uid': entity.client_uid
        })
    else:
        # Generic: can correlate with anything
        scope = await memory.query_entities()
    
    relationships = detect_relationships(entity, scope)
    return relationships
```

**Layer 3: VA Core (Business Rules)**
```typescript
class SecurityEnforcer {
  validateClientAccess(vaUID: string, clientUID: string): boolean {
    const workspace = this.memory.queryEntities({
      type: 'va.account_workspace',
      client_uid: clientUID,
      assigned_va: vaUID
    });
    
    return workspace.length > 0;
  }
  
  filterEntitiesByClient(entities: BaseEntity[], clientUID: string): BaseEntity[] {
    return entities.filter(e => 
      e.client_uid === clientUID || 
      e.client_uid === null  // Generic entities accessible by all
    );
  }
}
```

**Layer 4: UI (Display)**
```typescript
// UI always shows current client context
interface UIState {
  activeClientUID: string;
  availableClients: VAClient[];
}

// All queries filtered by active client
async function loadTasks(): Promise<VATask[]> {
  return memory.queryEntities({
    type: 'va.task',
    client_uid: uiState.activeClientUID
  });
}
```

---

## 🚀 Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
**Goal:** Core VA entities working in Memory Engine

**Deliverables:**
- [ ] VA entity type definitions (TypeScript)
- [ ] Entity templates (Markdown)
- [ ] CLI scaffolding commands (`sbf va init`)
- [ ] Unit tests for client isolation

**Integration Points:**
- Memory Engine: No changes
- AEI Core: No changes yet
- VA Core: New module created

### Phase 2: Basic Workflows (Weeks 3-4)
**Goal:** Email → Task and basic reporting

**Deliverables:**
- [ ] Email parser → va.task_intake
- [ ] AEI_INGEST integration for task extraction
- [ ] Weekly report generator (AEI_SYNTHESIZE)
- [ ] Integration tests

**Integration Points:**
- Memory Engine: Standard usage
- AEI Core: Add VA workflow module
- VA Core: Workflow orchestration

### Phase 3: SOP Library (Weeks 5-6)
**Goal:** Reusable knowledge management

**Deliverables:**
- [ ] SOP creation/editing
- [ ] Generic vs client-specific SOPs
- [ ] SOP search and recommendations
- [ ] AEI-powered SOP suggestions

**Integration Points:**
- Memory Engine: Standard usage
- AEI Core: SOP recommendation logic
- VA Core: SOP management service

### Phase 4: UI/UX (Weeks 7-8)
**Goal:** Polished user interface

**Deliverables:**
- [ ] Client switcher component
- [ ] Task queue view
- [ ] Report generation UI
- [ ] SOP library browser

**Integration Points:**
- All layers: Full stack integration

---

## 📊 Success Criteria

### Technical Metrics
- ✅ **100% client isolation** - Zero cross-client data leaks in tests
- ✅ **<500ms query performance** - Single-client queries with 50+ clients
- ✅ **Modular integration** - VA module can be disabled without breaking core SBF
- ✅ **Memory Engine unchanged** - VA uses existing infrastructure

### User Metrics
- ✅ **80% reduction** in manual task creation time
- ✅ **5min weekly report** generation (vs 30min manual)
- ✅ **90% SOP reuse** rate for generic procedures

### Architecture Quality
- ✅ **Clear boundaries** between layers
- ✅ **Plug-and-play** VA module
- ✅ **BMAD-aligned** structure for future enhancements
- ✅ **Testable** at every layer

---

## 🎯 BMAD Alignment

### Brainstorm (B)
✅ VA use cases identified and documented
✅ Agent perspectives captured via party-mode review

### Map (M)
✅ Entity model defined (11 new VA types)
✅ Workflows mapped (email→task, meeting→report, etc.)
✅ Integration points identified

### Architect (A)
✅ **This document** - Full architecture blueprint
✅ Modularity strategy defined
✅ Security model specified

### Deliver (D)
📋 Implementation roadmap (8 weeks)
📋 Test strategy defined
📋 Success metrics established

---

## 📝 Next Steps

### Immediate (Week 1)
1. **Create VA entity templates** - 11 markdown templates
2. **Implement VA Core module** - TypeScript/Python structure
3. **Add CLI scaffolding** - `sbf va` command namespace
4. **Write security tests** - Client isolation validation

### Short-term (Weeks 2-4)
1. **Email→Task workflow** - End-to-end integration
2. **Weekly report generator** - AEI_SYNTHESIZE integration
3. **Basic UI components** - Client switcher + task queue

### Medium-term (Weeks 5-8)
1. **SOP library** - Knowledge management system
2. **Content calendar** - Social media workflow
3. **Polish & testing** - Production readiness

---

## 📚 References

- [VA Use Case Instructions](../VA-usecase-instructions.md)
- [Memory Engine Spec](../../Memory-engine/Memory-instructions.md)
- [AEI Integration Plan](../04-implementation/aei-integration-plan.md)
- [Enhanced Architecture v2](../03-architecture/architecture-v2-enhanced.md)
- [BMAD Method](../../.bmad-core/data/bmad-kb.md)

---

**Reviewed by:** BMad Orchestrator (Party-Mode)  
**Agents:** Architect, PM, PO, Dev, QA, UX  
**Status:** ✅ Ready for Implementation  
**Framework:** BMAD-METHOD™
