# Phase 2 Execution Checklist

**Phase:** Cloud Core & Sync API (Node + Neon)  
**Duration:** 1-2 weeks  
**Prerequisites:** ✅ Phase 0-1 Complete  
**Alignment:** re-alignment-hybrid-sync-contract.md + NEXT-STEPS-EXECUTION-PLAN.md  

---

## Phase 2.1: Fix Build System & Restore All Node Services

### Build System Repair
- [ ] Verify pnpm workspace configuration
- [ ] Fix any TypeScript compilation errors
- [ ] Ensure all packages build successfully
- [ ] Update package.json scripts if needed
- [ ] Test monorepo build with `pnpm build`

### Service Restoration
- [ ] **apps/api** - Main API server
  - [ ] Fix TypeScript errors
  - [ ] Update imports for new truth-hierarchy types
  - [ ] Ensure routes compile
  - [ ] Test startup

- [ ] **apps/auth-service** - Authentication service
  - [ ] Fix compilation issues
  - [ ] Verify auth flows work
  - [ ] Test JWT generation

- [ ] **apps/llm-orchestrator** - LLM orchestration
  - [ ] Fix imports
  - [ ] Update to use truth-level metadata
  - [ ] Ensure LLM calls work

- [ ] **apps/workers** - Background workers
  - [ ] Fix compilation
  - [ ] Verify worker tasks
  - [ ] Test job processing

- [ ] **apps/notif-service** - Notification service (if needed)
  - [ ] Fix compilation
  - [ ] Test notification delivery

### Database Migrations
- [ ] Create Neon database if not exists
- [ ] Run existing migrations
- [ ] Create new migrations for truth hierarchy fields
- [ ] Test migrations on dev database

### Verification
```bash
# Build all packages
pnpm build

# Start API server
cd apps/api
pnpm dev

# Verify health
curl http://localhost:3000/health
```

---

## Phase 2.2: Implement /sync/push Endpoint

### Database Schema Updates
- [ ] Add truth_level, origin_source, origin_chain to entities table
- [ ] Add accepted_by_user, last_modified_by_level fields
- [ ] Create sync_events table for logging
- [ ] Create sync_conflicts table for conflict tracking
- [ ] Add indexes for performance

### Migration File
```sql
-- Add to new migration file
ALTER TABLE entities
ADD COLUMN truth_level INTEGER DEFAULT 1,
ADD COLUMN origin_source VARCHAR(255),
ADD COLUMN origin_chain JSONB DEFAULT '[]'::jsonb,
ADD COLUMN accepted_by_user BOOLEAN DEFAULT true,
ADD COLUMN last_modified_by_level INTEGER DEFAULT 1;

CREATE TABLE sync_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  event_type VARCHAR(50) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB,
  item_count INTEGER,
  conflict_count INTEGER,
  error_message TEXT
);

CREATE TABLE sync_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  entity_id VARCHAR(255) NOT NULL,
  conflict_type VARCHAR(50) NOT NULL,
  local_version JSONB NOT NULL,
  remote_version JSONB NOT NULL,
  resolution VARCHAR(50),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sync_events_tenant ON sync_events(tenant_id, timestamp DESC);
CREATE INDEX idx_sync_conflicts_tenant ON sync_conflicts(tenant_id, created_at DESC);
```

### Sync Push Implementation
- [ ] Create `apps/api/src/routes/sync.ts`
- [ ] Implement POST /sync/push handler
- [ ] Parse SyncBatch from request
- [ ] Apply truth hierarchy rules
- [ ] Detect conflicts
- [ ] Store accepted items in Neon
- [ ] Return conflicts for resolution
- [ ] Log sync event

### Conflict Detection Logic
```typescript
// apps/api/src/services/sync-service.ts
import { SyncConflictResolver } from '@sbf/core-domain';

async function processPushBatch(batch: SyncBatch, tenantId: string) {
  const resolver = new SyncConflictResolver(config);
  const conflicts: SyncConflict[] = [];
  const accepted: string[] = [];
  const rejected: any[] = [];

  for (const item of batch.items) {
    // Get existing entity from Neon
    const existing = await getEntity(item.id, tenantId);

    if (existing) {
      // Check if can overwrite
      if (!canOverwrite(existing, item)) {
        conflicts.push(createConflict(existing, item));
        continue;
      }
    }

    // Accept item
    try {
      await upsertEntity(item, tenantId);
      accepted.push(item.id);
    } catch (error) {
      rejected.push({ id: item.id, reason: error.message });
    }
  }

  // Log event
  await logSyncEvent({
    tenant_id: tenantId,
    event_type: 'push_completed',
    item_count: batch.items.length,
    conflict_count: conflicts.length
  });

  return { accepted, rejected, conflicts };
}
```

### Testing
```bash
# Test push endpoint
curl -X POST http://localhost:3000/sync/push \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "tenant_id": "test-tenant",
    "batch": {
      "batch_id": "batch-123",
      "items": [...],
      "timestamp": "2025-11-24T12:00:00Z"
    },
    "device_id": "test-device"
  }'
```

---

## Phase 2.3: Implement /sync/pull Endpoint

### Pull Implementation
- [ ] Create POST /sync/pull handler
- [ ] Accept sinceVersion or sinceTimestamp
- [ ] Query Neon for changes
- [ ] Filter by tenant isolation
- [ ] Return items as SyncItems
- [ ] Include version/cursor info
- [ ] Log pull event

### Implementation
```typescript
// apps/api/src/routes/sync.ts
router.post('/pull', async (req, res) => {
  const { tenant_id, since_version, device_id, max_items = 100 } = req.body;

  // Get changes since version
  const changes = await getChangesSince(tenant_id, since_version, max_items);

  // Convert to sync items
  const items: SyncItem[] = changes.map(toSyncItem);

  // Get latest version
  const latestVersion = await getLatestVersion(tenant_id);

  // Log event
  await logSyncEvent({
    tenant_id,
    event_type: 'pull_completed',
    item_count: items.length
  });

  res.json({
    items,
    latest_version: latestVersion,
    has_more: changes.length === max_items,
    next_cursor: items.length > 0 ? items[items.length - 1].version : null
  });
});
```

### Testing
```bash
# Test pull endpoint
curl -X POST http://localhost:3000/sync/pull \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "tenant_id": "test-tenant",
    "since_version": 0,
    "device_id": "test-device",
    "max_items": 100
  }'
```

---

## Phase 2.4: Sync Event Logging

### Implementation
- [ ] Create sync event logging service
- [ ] Log all push/pull operations
- [ ] Log conflicts detected
- [ ] Log conflict resolutions
- [ ] Add metrics/observability

### Service Implementation
```typescript
// apps/api/src/services/sync-event-logger.ts
export class SyncEventLogger {
  async logEvent(event: SyncEvent): Promise<void> {
    await db.insert('sync_events', {
      id: generateId(),
      tenant_id: event.tenantId,
      event_type: event.eventType,
      timestamp: new Date(),
      metadata: event.metadata,
      item_count: event.itemCount,
      conflict_count: event.conflictCount,
      error_message: event.errorMessage
    });
  }

  async getEvents(tenantId: string, limit = 100): Promise<SyncEvent[]> {
    return await db.query('sync_events')
      .where({ tenant_id: tenantId })
      .orderBy('timestamp', 'desc')
      .limit(limit);
  }
}
```

### Monitoring Queries
```sql
-- Recent sync activity
SELECT event_type, COUNT(*), MAX(timestamp)
FROM sync_events
WHERE tenant_id = $1 AND timestamp > NOW() - INTERVAL '24 hours'
GROUP BY event_type;

-- Conflict rate
SELECT
  COUNT(*) FILTER (WHERE conflict_count > 0) * 100.0 / COUNT(*) as conflict_rate
FROM sync_events
WHERE event_type = 'push_completed' AND timestamp > NOW() - INTERVAL '7 days';
```

---

## Phase 2.5: Encryption Layer (Incremental)

### Schema Updates
- [ ] Add content_encrypted BOOLEAN field
- [ ] Add encryption_metadata JSONB field
- [ ] Add encrypted_content TEXT field

### Implementation
- [ ] Create encryption service
- [ ] Implement E2E encryption for local-first tenants
- [ ] Cloud stores encrypted blobs only
- [ ] Add key management

### Encryption Service
```typescript
// apps/api/src/services/encryption-service.ts
export class EncryptionService {
  async encryptContent(
    content: string,
    tenantId: string
  ): Promise<{ encrypted: string; metadata: any }> {
    // Use tenant's public key
    const publicKey = await getTenantPublicKey(tenantId);

    // Encrypt content
    const encrypted = await encrypt(content, publicKey);

    return {
      encrypted,
      metadata: {
        algorithm: 'AES-256-GCM',
        encrypted_at: new Date()
      }
    };
  }

  async decryptContent(
    encrypted: string,
    metadata: any,
    tenantId: string
  ): Promise<string> {
    // Use tenant's private key (only available locally)
    const privateKey = await getTenantPrivateKey(tenantId);

    // Decrypt content
    return await decrypt(encrypted, privateKey);
  }
}
```

---

## Verification Checklist

### Build System
- [ ] All packages compile without errors
- [ ] `pnpm build` succeeds
- [ ] All services start successfully
- [ ] Health checks pass

### Database
- [ ] Migrations run successfully
- [ ] Truth hierarchy fields exist
- [ ] Sync tables created
- [ ] Indexes in place

### Sync Push
- [ ] POST /sync/push accepts batches
- [ ] Truth hierarchy rules applied
- [ ] Conflicts detected correctly
- [ ] Events logged

### Sync Pull
- [ ] POST /sync/pull returns changes
- [ ] Tenant isolation enforced
- [ ] Pagination works
- [ ] Events logged

### End-to-End
- [ ] Local client can push to cloud
- [ ] Local client can pull from cloud
- [ ] Conflicts resolved correctly
- [ ] Events logged on both sides
- [ ] No data loss

---

## Testing Strategy

### Unit Tests
```typescript
// Test truth hierarchy rules
describe('SyncService', () => {
  test('U1 wins over L3', async () => {
    const local = createItem({ truthLevel: TruthLevel.USER });
    const remote = createItem({ truthLevel: TruthLevel.AI_LOCAL });
    const result = await service.resolveConflict(local, remote);
    expect(result).toBe(local);
  });

  test('Last-write-wins for U1 vs U1', async () => {
    const older = createItem({
      truthLevel: TruthLevel.USER,
      timestamp: new Date('2025-01-01')
    });
    const newer = createItem({
      truthLevel: TruthLevel.USER,
      timestamp: new Date('2025-01-02')
    });
    const result = await service.resolveConflict(older, newer);
    expect(result).toBe(newer);
  });
});
```

### Integration Tests
```typescript
// Test full sync flow
describe('Sync Flow', () => {
  test('Push and pull cycle', async () => {
    // Create local entity
    const local = await localClient.createEntity({ ... });

    // Push to cloud
    const pushResponse = await localClient.push();
    expect(pushResponse.accepted).toContain(local.id);

    // Pull from cloud on different device
    const pullResponse = await otherClient.pull();
    expect(pullResponse.items).toContainEqual(
      expect.objectContaining({ id: local.id })
    );
  });
});
```

---

## Timeline

### Week 1:
- Days 1-2: Fix build system, restore services
- Days 3-4: Implement /sync/push
- Day 5: Implement /sync/pull

### Week 2:
- Days 1-2: Implement sync event logging
- Days 3-4: Add encryption layer
- Day 5: End-to-end testing and bug fixes

---

## Success Criteria

- [x] Phase 0 complete (truth hierarchy foundation)
- [x] Phase 1 complete (local-first core)
- [ ] All Node services compile and run
- [ ] Database migrations complete
- [ ] /sync/push endpoint operational
- [ ] /sync/pull endpoint operational
- [ ] Sync events logged
- [ ] Encryption available for local-first tenants
- [ ] End-to-end sync tested
- [ ] Zero data loss
- [ ] Conflicts resolved correctly

---

**Status:** Ready to Execute Phase 2  
**Next Action:** Begin 2.1 (Fix Build System)  
**Estimated Completion:** 1-2 weeks  
