# Corrective Refactor Plan: Re-Aligning to Local-First Hybrid

**Date:** 2025-11-24  
**Status:** 🚨 CORRECTIVE ACTION REQUIRED  
**Reason:** Previous refactor went cloud-first microservices, violating local-first principles

---

## What Went Wrong

### Problems with Previous Refactor:

1. **❌ Cloud-First Architecture**
   - Created microservices assuming cloud is primary
   - Made local vault secondary/optional
   - Violated user sovereignty principles

2. **❌ Archived Critical Components**
   - Removed `@sbf/automation/` (had local workflow capabilities)
   - Removed `@sbf/modules/` (had domain-specific local logic)
   - Removed `@sbf/memory-engine/` (had local knowledge graph)

3. **❌ No Truth Hierarchy**
   - No `truth_level` fields
   - No `origin_source` tracking
   - No upgrade mechanisms from AI → User truth

4. **❌ Desktop App Neglected**
   - Minimal focus on local vault interaction
   - No clear local DB strategy
   - Missing file watcher integration

5. **❌ Over-Engineered Services**
   - Created 7 separate microservices
   - Increased complexity unnecessarily
   - Made local-first harder to achieve

---

## Corrective Architecture: Local-First, Cloud-Augmented Hybrid

### Core Principles (from re-alignment-hybrid-sync-contract.md):

1. **User (U1) is Highest Truth**
   - Local vault files are canonical for local-first tenants
   - Cloud cannot overwrite U1 without user acceptance

2. **Local-First by Default**
   - Desktop app reads/writes local vault
   - Local DB + filesystem is primary
   - Cloud is for sync, backup, and AI suggestions

3. **Truth Hierarchy**
   ```
   U1 (User) > A2 (Automation) > L3 (AI Local) > LN4 (AI Local Network) > C5 (AI Cloud)
   ```

4. **Hybrid Sync Contract**
   - Local pushes U1/A2/L3 to cloud
   - Cloud suggests C5/LN4/L4 as drafts
   - User approval upgrades suggestions to U1

---

## Corrected Architecture

### Component Structure:

```
second-brain-foundation/
├── aei-core/                    # LOCAL-FIRST Python Backend
│   ├── db/                      # Local SQLite/PostgreSQL
│   ├── services/
│   │   ├── vault_watcher.py     # Monitor local vault files
│   │   ├── entity_extractor.py  # Extract entities from vault
│   │   ├── local_ai.py          # Ollama integration (L3)
│   │   ├── sync_client.py       # Push/pull to cloud
│   │   └── truth_manager.py     # Truth-level enforcement
│   ├── agents/
│   │   ├── librarian.py         # Local organization (L3)
│   │   ├── researcher.py        # Local research (L3)
│   │   └── qa.py                # Local QA (L3)
│   └── api/
│       ├── vault.py             # Vault CRUD (U1)
│       ├── queue.py             # Approval queue (L3→U1)
│       ├── sync.py              # Sync endpoints
│       └── ask.py               # Local RAG
│
├── apps/
│   ├── desktop/                 # Electron/Tauri App (PRIMARY INTERFACE)
│   │   ├── src/
│   │   │   ├── main/            # Electron main process
│   │   │   │   ├── vault-manager.ts
│   │   │   │   ├── local-db.ts
│   │   │   │   └── sync-service.ts
│   │   │   ├── renderer/        # React UI
│   │   │   │   ├── components/
│   │   │   │   │   ├── VaultBrowser/
│   │   │   │   │   ├── ApprovalQueue/   # L3→U1 suggestions
│   │   │   │   │   ├── SyncStatus/
│   │   │   │   │   └── TruthIndicator/  # Show U1/A2/L3/C5
│   │   │   │   └── pages/
│   │   │   └── shared/
│   │   └── package.json
│   │
│   ├── api/                     # Cloud API (SECONDARY/AUGMENTATION)
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   │   ├── sync.ts      # POST /sync/push, GET /sync/pull
│   │   │   │   ├── tenants.ts   # Tenant management
│   │   │   │   ├── suggestions.ts # Cloud AI suggestions (C5)
│   │   │   │   └── analytics.ts # Dashboard data
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── tenant-context.ts
│   │   │   │   └── truth-enforcer.ts  # Prevent C5 → U1 overwrites
│   │   │   └── services/
│   │   │       ├── sync-resolver.ts    # Conflict resolution
│   │   │       └── cloud-ai.ts         # Together.ai (C5)
│   │   └── package.json
│   │
│   ├── web/                     # Optional Web Interface
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   └── [tenant]/
│   │   │   │       ├── vault/           # Read-only vault view
│   │   │   │       ├── suggestions/     # Review C5 suggestions
│   │   │   │       └── analytics/
│   │   │   └── components/
│   │   └── package.json
│   │
│   ├── workers/                 # Background Jobs (Cloud)
│   │   ├── src/
│   │   │   ├── jobs/
│   │   │   │   ├── generate-suggestions.ts  # C5 suggestions
│   │   │   │   ├── build-embeddings.ts
│   │   │   │   └── nightly-summaries.ts
│   │   │   └── queue.ts
│   │   └── package.json
│   │
│   └── mobile/                  # Optional Mobile (Future)
│       └── (Similar to desktop but mobile-optimized)
│
├── packages/
│   ├── @sbf/
│   │   ├── truth-hierarchy/     # NEW: Truth-level logic
│   │   │   ├── constants.ts     # U1, A2, L3, LN4, C5
│   │   │   ├── comparator.ts    # is_higher_truth(a, b)
│   │   │   ├── upgrader.ts      # upgrade_to_user_truth()
│   │   │   └── validator.ts     # Enforce hierarchy rules
│   │   │
│   │   ├── sync-protocol/       # NEW: Sync contract implementation
│   │   │   ├── types.ts         # SyncItem, ConflictResult
│   │   │   ├── client.ts        # Local → Cloud sync
│   │   │   ├── server.ts        # Cloud → Local sync
│   │   │   └── resolver.ts      # Conflict resolution
│   │   │
│   │   ├── local-db/            # NEW: Local database (replaces db-client)
│   │   │   ├── sqlite.ts        # SQLite for desktop
│   │   │   ├── schema.ts        # Tables with truth_level
│   │   │   └── migrations/
│   │   │
│   │   ├── vault-client/        # NEW: Vault file operations
│   │   │   ├── reader.ts
│   │   │   ├── writer.ts
│   │   │   ├── watcher.ts
│   │   │   └── parser.ts        # Markdown parsing
│   │   │
│   │   ├── core-domain/         # KEEP: Entity models
│   │   ├── ai-client/           # KEEP: LLM wrappers
│   │   ├── vector-client/       # KEEP: Vector DB
│   │   └── auth-lib/            # KEEP: Auth utilities
│   │
│   └── (cloud packages stay minimal)
│
└── libraries/                   # Analytics libs (reference only)
    ├── superset/
    ├── grafana/
    ├── lightdash/
    └── metabase/
```

---

## Key Changes from Previous Refactor

### 1. Desktop App is Primary (Not Web)

**Before:**
- Web app on Vercel was primary interface
- Desktop was afterthought

**After:**
- Desktop app is main interface for local-first users
- Web app is optional read-only or for cloud-first tenants
- Desktop has full vault access

---

### 2. Local Database with Truth Levels

**Add to aei-core/db/models.py:**
```python
from sqlalchemy import Column, String, Integer, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Entity(Base):
    __tablename__ = 'entities'
    
    id = Column(String, primary_key=True)
    tenant_id = Column(String, nullable=False)
    content = Column(String)
    
    # Truth hierarchy fields
    truth_level = Column(Integer, nullable=False, default=1)  # 1=U1, 2=A2, 3=L3, 4=LN4, 5=C5
    origin_source = Column(String, nullable=False)  # 'user:desktop', 'ai-local:ollama', 'ai-cloud:together'
    origin_chain = Column(JSON, default=list)  # Provenance trail
    accepted_by_user = Column(Boolean, default=False)
    last_modified_by_level = Column(Integer)
    
    created_at = Column(DateTime)
    updated_at = Column(DateTime)
```

---

### 3. Sync Protocol Implementation

**Local → Cloud (Push):**
```typescript
// packages/@sbf/sync-protocol/client.ts

export interface SyncItem {
  id: string;
  entity_type: string;
  content: string;
  truth_level: number;
  origin_source: string;
  origin_chain: string[];
  version: number;
  updated_at: string;
}

export async function pushToCloud(
  tenantId: string,
  items: SyncItem[]
): Promise<SyncResult> {
  const response = await fetch(`${CLOUD_API}/sync/push`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'X-Tenant-ID': tenantId
    },
    body: JSON.stringify({ items })
  });
  
  return response.json();
}
```

**Cloud → Local (Pull):**
```typescript
export async function pullFromCloud(
  tenantId: string,
  sinceVersion: number
): Promise<SyncItem[]> {
  const response = await fetch(
    `${CLOUD_API}/sync/pull?since=${sinceVersion}`,
    {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'X-Tenant-ID': tenantId
      }
    }
  );
  
  const { items } = await response.json();
  
  // Filter: only accept C5/A2 as suggestions, not as overwrites
  return items.map(item => ({
    ...item,
    is_suggestion: item.truth_level >= 2  // A2, L3, C5 are suggestions
  }));
}
```

---

### 4. Approval Queue in Desktop App

**Desktop UI Component:**
```tsx
// apps/desktop/src/renderer/components/ApprovalQueue/index.tsx

export function ApprovalQueue() {
  const [suggestions, setSuggestions] = useState([]);
  
  useEffect(() => {
    // Load L3/C5 suggestions from local DB
    const loadSuggestions = async () => {
      const items = await window.api.getSuggestions();
      setSuggestions(items);
    };
    loadSuggestions();
  }, []);
  
  const handleApprove = async (id: string) => {
    // Upgrade truth_level to U1
    await window.api.acceptSuggestion(id);
    
    // Remove from queue
    setSuggestions(prev => prev.filter(s => s.id !== id));
  };
  
  const handleReject = async (id: string) => {
    await window.api.rejectSuggestion(id);
    setSuggestions(prev => prev.filter(s => s.id !== id));
  };
  
  return (
    <div className="approval-queue">
      <h2>Suggestions Pending Approval</h2>
      {suggestions.map(suggestion => (
        <SuggestionCard
          key={suggestion.id}
          suggestion={suggestion}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      ))}
    </div>
  );
}
```

---

### 5. Truth Indicator in UI

Show users what level of truth each piece of content has:

```tsx
export function TruthBadge({ level }: { level: number }) {
  const badges = {
    1: { label: 'User', color: 'green', icon: '👤' },
    2: { label: 'Automation', color: 'blue', icon: '⚙️' },
    3: { label: 'AI Local', color: 'purple', icon: '🤖' },
    4: { label: 'AI Network', color: 'orange', icon: '🌐' },
    5: { label: 'AI Cloud', color: 'gray', icon: '☁️' }
  };
  
  const badge = badges[level];
  
  return (
    <span className={`truth-badge truth-${level}`}>
      {badge.icon} {badge.label}
    </span>
  );
}
```

---

## Migration Strategy from Previous Refactor

### Step 1: Preserve What Works

**Keep:**
- `apps/api/` (Cloud API)
- `apps/workers/` (Background jobs)
- `packages/core-domain/`
- `packages/vector-client/`
- `packages/ai-client/`
- `packages/auth-lib/`

**Remove/Refactor:**
- `apps/iot-core/` → Merge into main API (simpler)
- `apps/notif-service/` → Merge into workers
- `apps/llm-orchestrator/` → Merge into API or workers
- `apps/auth-service/` → Merge into API

---

### Step 2: Restore & Enhance Desktop App

**From `.archive/superseded-2025-11-24/`:**

1. Review `memory-engine/` → Extract local knowledge graph logic
2. Review `modules/` → Extract domain-specific entity types
3. Review `automation/` → Extract local workflow patterns

**Don't restore as-is**, but extract useful patterns.

---

### Step 3: Add Truth Hierarchy Support

1. **Database Schema Updates:**
   - Add `truth_level`, `origin_source`, `origin_chain` to all entity tables
   - Add `accepted_by_user` boolean
   - Create indexes on `truth_level`

2. **Create Truth Hierarchy Package:**
   ```bash
   mkdir -p packages/@sbf/truth-hierarchy
   # Implement truth-level constants, comparisons, upgrades
   ```

3. **Create Sync Protocol Package:**
   ```bash
   mkdir -p packages/@sbf/sync-protocol
   # Implement push/pull with conflict resolution
   ```

---

### Step 4: Enhance AEI-Core for Local-First

**aei-core enhancements:**

1. **Vault Watcher:**
   ```python
   # aei-core/services/vault_watcher.py
   from watchdog.observers import Observer
   from watchdog.events import FileSystemEventHandler
   
   class VaultWatcher(FileSystemEventHandler):
       def on_modified(self, event):
           if event.src_path.endswith('.md'):
               # Extract entities from file
               # Mark as truth_level=1 (User)
               # Store in local DB
               pass
   ```

2. **Truth Manager:**
   ```python
   # aei-core/services/truth_manager.py
   
   def upgrade_to_user_truth(entity_id: str):
       """Upgrade suggestion (L3/C5) to U1 after user acceptance"""
       entity = db.get_entity(entity_id)
       entity.truth_level = 1
       entity.accepted_by_user = True
       entity.origin_chain.append({
           'from_level': entity.truth_level,
           'to_level': 1,
           'timestamp': datetime.now(),
           'action': 'user_accepted'
       })
       db.update(entity)
   ```

3. **Sync Client:**
   ```python
   # aei-core/services/sync_client.py
   
   async def push_to_cloud(tenant_id: str):
       """Push U1/A2/L3 to cloud"""
       local_items = db.get_items_to_sync(tenant_id)
       
       response = await http_client.post(
           f'{CLOUD_API}/sync/push',
           json={'items': [item.to_sync_item() for item in local_items]}
       )
       
       return response.json()
   ```

---

### Step 5: Update Cloud API for Truth Hierarchy

**apps/api/src/routes/sync.ts:**

```typescript
router.post('/sync/push', async (req, res) => {
  const { tenantId, userId } = req.tenantContext;
  const { items } = req.body;
  
  for (const item of items) {
    const existing = await db.entities.findOne({
      tenant_id: tenantId,
      id: item.id
    });
    
    if (!existing) {
      // New item, insert
      await db.entities.insert({ ...item, tenant_id: tenantId });
    } else {
      // Conflict resolution
      const result = resolveTruthConflict(existing, item);
      
      if (result.action === 'accept_incoming') {
        await db.entities.update(existing.id, item);
      } else if (result.action === 'reject_incoming') {
        // Log conflict, keep existing
        await logSyncConflict(tenantId, existing, item);
      } else if (result.action === 'merge') {
        // Store both, let user decide
        await storeSuggestion(tenantId, item);
      }
    }
  }
  
  res.json({ status: 'success', conflicts: [] });
});
```

**Truth Conflict Resolver:**
```typescript
function resolveTruthConflict(
  existing: Entity,
  incoming: Entity
): ConflictResult {
  // Rule 1: U1 always wins over lower levels
  if (existing.truth_level === 1 && incoming.truth_level > 1) {
    return { action: 'reject_incoming', reason: 'U1 > A2/L3/C5' };
  }
  
  // Rule 2: If both U1, last-write-wins
  if (existing.truth_level === 1 && incoming.truth_level === 1) {
    if (incoming.updated_at > existing.updated_at) {
      return { action: 'accept_incoming', reason: 'U1 vs U1: newer wins' };
    } else {
      return { action: 'reject_incoming', reason: 'U1 vs U1: older' };
    }
  }
  
  // Rule 3: Higher truth levels win
  if (incoming.truth_level < existing.truth_level) {
    return { action: 'accept_incoming', reason: 'Higher truth level' };
  }
  
  return { action: 'reject_incoming', reason: 'Lower or equal truth level' };
}
```

---

## Implementation Phases

### Phase 0: Immediate Corrections (Week 1)

✅ **Actions:**
1. Create truth hierarchy package
2. Create sync protocol package
3. Add truth_level fields to schemas
4. Document corrective architecture
5. Update README files

---

### Phase 1: Local-First Foundation (Weeks 2-4)

**Focus: Get desktop app working with local vault**

1. **Desktop App Setup:**
   - Restore/rebuild Electron/Tauri app
   - Implement vault file watcher
   - Create local SQLite database
   - Build approval queue UI

2. **AEI-Core Enhancements:**
   - Implement vault watcher
   - Add truth_level to all DB operations
   - Create local AI integration (Ollama)
   - Build sync client (push only initially)

3. **Testing:**
   - User edits file → Marked as U1
   - Local AI suggests → Marked as L3
   - User accepts L3 → Upgrades to U1

---

### Phase 2: Cloud Sync Integration (Weeks 5-6)

**Focus: Bi-directional sync with truth enforcement**

1. **Cloud API Updates:**
   - Implement `/sync/push` with conflict resolution
   - Implement `/sync/pull` returning suggestions
   - Add truth-level middleware

2. **Desktop Sync:**
   - Background sync service
   - Sync status indicator
   - Conflict notification UI

3. **Testing:**
   - Local U1 → Cloud (accepted)
   - Cloud C5 → Local (as suggestion)
   - Conflict scenarios

---

### Phase 3: Multi-Channel Support (Weeks 7-10)

**Focus: Add web, mobile, voice (optional)**

1. **Web App (Optional):**
   - Read-only vault view
   - Suggestion approval interface
   - Analytics dashboards

2. **Mobile (Future):**
   - Lightweight vault access
   - Quick capture (marked as U1)
   - Push notifications for suggestions

3. **Voice (Future):**
   - Query vault via Alexa/Google
   - Suggestions marked as C5

---

### Phase 4: Analytics Integration (Weeks 11-12)

**Focus: Dashboard embedding**

1. **Database Views:**
   - Create analytics schema
   - Build tenant-scoped views

2. **Superset/Grafana:**
   - Deploy containers
   - Create default dashboards
   - Implement embedding

---

## Success Criteria

### Must Have:
- ✅ Desktop app reads/writes local vault
- ✅ All entities have truth_level
- ✅ Local AI (Ollama) produces L3 suggestions
- ✅ User approval upgrades L3 → U1
- ✅ Cloud API respects truth hierarchy
- ✅ Sync works bi-directionally without data loss

### Should Have:
- ✅ Web app provides read-only vault access
- ✅ Conflict resolution UI
- ✅ Analytics dashboards

### Nice to Have:
- Mobile apps
- Voice integrations
- IoT support

---

## Immediate Next Actions

### Today (2025-11-24):
1. ✅ Create this corrective plan
2. 📝 Create truth-hierarchy package stub
3. 📝 Create sync-protocol package stub
4. 📝 Add truth_level to aei-core models
5. 📝 Document changes in README

### This Week:
1. Restore desktop app structure
2. Implement vault watcher in aei-core
3. Build approval queue UI
4. Test local-first workflow

---

## Rollback Plan (If Needed)

If corrective refactor fails:
1. Archive current state to `.archive/corrective-attempt-2025-11-24/`
2. Restore from `.archive/superseded-2025-11-24/`
3. Start fresh with simpler architecture

---

**Status:** Ready for corrective implementation  
**Risk Level:** Medium (architectural pivot)  
**Timeline:** 12 weeks to full local-first + cloud hybrid  
**Team:** Requires desktop (Electron/Tauri) + Python (AEI) expertise
