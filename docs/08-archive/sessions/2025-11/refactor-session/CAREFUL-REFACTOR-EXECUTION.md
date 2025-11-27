# Careful & Aligned Refactor Execution Plan

**Date:** 2025-11-24  
**Status:** 🎯 ALIGNED TO LOCAL-FIRST HYBRID  
**Grounding Documents:**
- `re-alignment-hybrid-sync-contract.md`
- `NEXT-STEPS-EXECUTION-PLAN.md`
- `CORRECTIVE-REFACTOR-PLAN.md`
- `ARCHIVED-WORK-REVIEW.md`

---

## Executive Summary

After reviewing the previous refactor direction and the archived work, I now have a clear understanding:

### What Was Good ✅:
1. **Multi-tenant architecture** - Keep this
2. **Cloud API for sync** - Keep this
3. **Truth hierarchy concept** - Enhance this
4. **Package modularization** - Keep this

### What Went Wrong ❌:
1. **Cloud-first instead of local-first**
2. **Archived valuable vault/sync code**
3. **Removed domain-specific entity types**
4. **Over-complicated with too many services**
5. **Ignored desktop app as primary interface**

### The Corrected Vision:
**Local-first Python (aei-core) + Desktop App (primary) + Cloud Node API (secondary/sync)**

---

## Phase 0: Foundation Correction (Immediate - 2 Days)

### 0.1 Create Truth Hierarchy Package ✅

**Location:** `packages/@sbf/truth-hierarchy/`

**Files to create:**
```typescript
// packages/@sbf/truth-hierarchy/src/constants.ts
export enum TruthLevel {
  USER = 1,           // U1 - User-authored content
  AUTOMATION = 2,     // A2 - Automated workflows
  AI_LOCAL = 3,       // L3 - Local AI (Ollama)
  AI_LOCAL_NETWORK = 4, // LN4 - Local network AI
  AI_CLOUD = 5        // C5 - Cloud AI (Together.ai)
}

export const TRUTH_LABELS = {
  [TruthLevel.USER]: 'User',
  [TruthLevel.AUTOMATION]: 'Automation',
  [TruthLevel.AI_LOCAL]: 'AI Local',
  [TruthLevel.AI_LOCAL_NETWORK]: 'AI Local Network',
  [TruthLevel.AI_CLOUD]: 'AI Cloud'
};
```

```typescript
// packages/@sbf/truth-hierarchy/src/comparator.ts
import { TruthLevel } from './constants';

export function isHigherTruth(a: TruthLevel, b: TruthLevel): boolean {
  return a < b; // Lower number = higher truth
}

export function canOverwrite(
  incomingLevel: TruthLevel,
  existingLevel: TruthLevel
): boolean {
  // Only higher or equal truth can overwrite
  return incomingLevel <= existingLevel;
}
```

```typescript
// packages/@sbf/truth-hierarchy/src/upgrader.ts
export interface OriginChainEntry {
  from_level: TruthLevel;
  to_level: TruthLevel;
  timestamp: string;
  action: 'user_accepted' | 'automation_triggered' | 'ai_generated';
  source: string; // e.g., 'user:desktop', 'ai-local:ollama', 'ai-cloud:together'
}

export interface EntityWithTruth {
  id: string;
  truth_level: TruthLevel;
  origin_source: string;
  origin_chain: OriginChainEntry[];
  accepted_by_user: boolean;
}

export function upgradeToUserTruth(entity: EntityWithTruth): EntityWithTruth {
  const newEntry: OriginChainEntry = {
    from_level: entity.truth_level,
    to_level: TruthLevel.USER,
    timestamp: new Date().toISOString(),
    action: 'user_accepted',
    source: entity.origin_source
  };

  return {
    ...entity,
    truth_level: TruthLevel.USER,
    origin_chain: [...entity.origin_chain, newEntry],
    accepted_by_user: true
  };
}
```

**Package.json:**
```json
{
  "name": "@sbf/truth-hierarchy",
  "version": "0.1.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "jest"
  },
  "dependencies": {},
  "devDependencies": {
    "typescript": "^5.3.0"
  }
}
```

---

### 0.2 Create Sync Protocol Package ✅

**Location:** `packages/@sbf/sync-protocol/`

**Files to create:**
```typescript
// packages/@sbf/sync-protocol/src/types.ts
import { TruthLevel } from '@sbf/truth-hierarchy';

export interface SyncItem {
  id: string;
  tenant_id: string;
  entity_type: string;
  content: string;
  truth_level: TruthLevel;
  origin_source: string;
  origin_chain: any[];
  version: number;
  created_at: string;
  updated_at: string;
  deleted: boolean;
}

export interface SyncRequest {
  tenant_id: string;
  items: SyncItem[];
  since_version?: number;
}

export interface SyncResponse {
  accepted: SyncItem[];
  rejected: SyncItem[];
  conflicts: ConflictResult[];
  latest_version: number;
}

export interface ConflictResult {
  item_id: string;
  action: 'accept_incoming' | 'reject_incoming' | 'merge_required';
  reason: string;
  local_item?: SyncItem;
  remote_item?: SyncItem;
}
```

```typescript
// packages/@sbf/sync-protocol/src/resolver.ts
import { TruthLevel, isHigherTruth } from '@sbf/truth-hierarchy';
import { SyncItem, ConflictResult } from './types';

export function resolveSyncConflict(
  local: SyncItem,
  remote: SyncItem
): ConflictResult {
  // Rule 1: U1 always wins over lower levels
  if (local.truth_level === TruthLevel.USER && remote.truth_level > TruthLevel.USER) {
    return {
      item_id: local.id,
      action: 'reject_incoming',
      reason: 'Local U1 cannot be overwritten by lower truth levels',
      local_item: local,
      remote_item: remote
    };
  }

  // Rule 2: If both U1, last-write-wins
  if (local.truth_level === TruthLevel.USER && remote.truth_level === TruthLevel.USER) {
    const localTime = new Date(local.updated_at).getTime();
    const remoteTime = new Date(remote.updated_at).getTime();

    if (remoteTime > localTime) {
      return {
        item_id: local.id,
        action: 'accept_incoming',
        reason: 'U1 vs U1: Remote is newer',
        local_item: local,
        remote_item: remote
      };
    } else {
      return {
        item_id: local.id,
        action: 'reject_incoming',
        reason: 'U1 vs U1: Local is newer',
        local_item: local,
        remote_item: remote
      };
    }
  }

  // Rule 3: Higher truth level wins
  if (isHigherTruth(remote.truth_level, local.truth_level)) {
    return {
      item_id: local.id,
      action: 'accept_incoming',
      reason: 'Remote has higher truth level',
      local_item: local,
      remote_item: remote
    };
  }

  // Rule 4: Same or lower truth level - last write wins
  const localTime = new Date(local.updated_at).getTime();
  const remoteTime = new Date(remote.updated_at).getTime();

  if (remoteTime > localTime) {
    return {
      item_id: local.id,
      action: 'accept_incoming',
      reason: 'Same truth level: Remote is newer',
      local_item: local,
      remote_item: remote
    };
  } else {
    return {
      item_id: local.id,
      action: 'reject_incoming',
      reason: 'Same truth level: Local is newer',
      local_item: local,
      remote_item: remote
    };
  }
}
```

---

### 0.3 Create Vault Client Package ✅

**Location:** `packages/@sbf/vault-client/`

**Recovery from archive:**
Extract and adapt from `.archive/superseded-2025-11-24/memory-engine/storage/src/VaultAdapter.ts`

**Files to create:**
```typescript
// packages/@sbf/vault-client/src/VaultAdapter.ts
// Adapted from archived code
import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';
import { TruthLevel } from '@sbf/truth-hierarchy';

export interface VaultEntity {
  id: string;
  vault_path: string;
  title: string;
  content: string;
  truth_level: TruthLevel;
  origin_source: string;
  origin_chain: any[];
  created_at: string;
  updated_at: string;
  frontmatter: Record<string, any>;
}

export class VaultAdapter {
  constructor(private vaultRoot: string) {
    if (!fs.existsSync(vaultRoot)) {
      throw new Error(`Vault root does not exist: ${vaultRoot}`);
    }
  }

  /**
   * Scan entire vault and return all entities
   */
  scanVault(): VaultEntity[] {
    const entities: VaultEntity[] = [];
    this.walkDirectory(this.vaultRoot, entities);
    return entities;
  }

  /**
   * Load a single entity by relative vault path
   */
  loadEntity(relativePath: string): VaultEntity | null {
    const fullPath = path.join(this.vaultRoot, relativePath);
    
    if (!fs.existsSync(fullPath) || !fullPath.toLowerCase().endsWith('.md')) {
      return null;
    }

    return this.parseMarkdownFile(fullPath, relativePath);
  }

  /**
   * Save entity to vault (create or update)
   */
  saveEntity(entity: Partial<VaultEntity> & { vault_path: string; content: string }): void {
    const fullPath = path.join(this.vaultRoot, entity.vault_path);
    const dir = path.dirname(fullPath);

    // Ensure directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Build frontmatter with truth hierarchy
    const frontmatter = {
      id: entity.id,
      title: entity.title,
      truth_level: entity.truth_level || TruthLevel.USER,
      origin_source: entity.origin_source || 'user:vault',
      created_at: entity.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...(entity.frontmatter || {})
    };

    // Write file with frontmatter
    const content = matter.stringify(entity.content, frontmatter);
    fs.writeFileSync(fullPath, content, 'utf8');
  }

  /**
   * Delete entity from vault
   */
  deleteEntity(relativePath: string): boolean {
    const fullPath = path.join(this.vaultRoot, relativePath);
    
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
    
    return false;
  }

  private walkDirectory(dir: string, entities: VaultEntity[]): void {
    const entries = fs.readdirSync(dir);

    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const relativePath = path.relative(this.vaultRoot, fullPath).replace(/\\/g, '/');

      if (fs.statSync(fullPath).isDirectory()) {
        // Skip hidden/system directories
        if (!entry.startsWith('.')) {
          this.walkDirectory(fullPath, entities);
        }
      } else if (entry.toLowerCase().endsWith('.md')) {
        const entity = this.parseMarkdownFile(fullPath, relativePath);
        if (entity) {
          entities.push(entity);
        }
      }
    }
  }

  private parseMarkdownFile(fullPath: string, relativePath: string): VaultEntity | null {
    try {
      const fileContent = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContent);

      return {
        id: data.id || this.generateId(relativePath),
        vault_path: relativePath,
        title: data.title || path.basename(relativePath, '.md'),
        content,
        truth_level: data.truth_level || TruthLevel.USER, // Vault files are U1 by default
        origin_source: data.origin_source || 'user:vault',
        origin_chain: data.origin_chain || [],
        created_at: data.created_at || fs.statSync(fullPath).birthtime.toISOString(),
        updated_at: data.updated_at || fs.statSync(fullPath).mtime.toISOString(),
        frontmatter: data
      };
    } catch (error) {
      console.error(`Error parsing ${fullPath}:`, error);
      return null;
    }
  }

  private generateId(relativePath: string): string {
    return relativePath.replace(/\\/g, '/').replace(/\.md$/, '');
  }
}
```

```typescript
// packages/@sbf/vault-client/src/VaultWatcher.ts
import chokidar from 'chokidar';
import { EventEmitter } from 'events';
import { VaultAdapter } from './VaultAdapter';

export interface VaultChangeEvent {
  type: 'add' | 'change' | 'unlink';
  path: string;
  entity?: any;
}

export class VaultWatcher extends EventEmitter {
  private watcher: chokidar.FSWatcher | null = null;
  private adapter: VaultAdapter;

  constructor(vaultRoot: string) {
    super();
    this.adapter = new VaultAdapter(vaultRoot);
  }

  start(): void {
    this.watcher = chokidar.watch('**/*.md', {
      cwd: this.adapter['vaultRoot'],
      ignoreInitial: false,
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true
    });

    this.watcher
      .on('add', (path) => this.handleFileChange('add', path))
      .on('change', (path) => this.handleFileChange('change', path))
      .on('unlink', (path) => this.handleFileChange('unlink', path));
  }

  stop(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  }

  private handleFileChange(type: 'add' | 'change' | 'unlink', path: string): void {
    if (type === 'unlink') {
      this.emit('change', { type, path });
    } else {
      const entity = this.adapter.loadEntity(path);
      this.emit('change', { type, path, entity });
    }
  }
}
```

---

### 0.4 Update AEI-Core with Truth Hierarchy ✅

**Location:** `aei-core/db/models.py`

**Add truth hierarchy fields:**
```python
# aei-core/db/models.py

from sqlalchemy import Column, String, Integer, DateTime, JSON, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Entity(Base):
    __tablename__ = 'entities'
    
    id = Column(String, primary_key=True)
    tenant_id = Column(String, nullable=False, index=True)
    entity_type = Column(String, nullable=False)
    
    # Content
    title = Column(String)
    content = Column(Text)
    vault_path = Column(String)  # Relative path in vault
    
    # Truth Hierarchy (NEW)
    truth_level = Column(Integer, nullable=False, default=1)  # 1=U1, 2=A2, 3=L3, 4=LN4, 5=C5
    origin_source = Column(String, nullable=False, default='user:vault')
    origin_chain = Column(JSON, default=list)  # Provenance trail
    accepted_by_user = Column(Boolean, default=False)
    
    # Sync
    version = Column(Integer, default=1)
    synced_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted = Column(Boolean, default=False)
    
    def __repr__(self):
        return f"<Entity {self.id} (truth_level={self.truth_level})>"
```

**Create truth manager service:**
```python
# aei-core/services/truth_manager.py

from typing import Optional
from db.models import Entity
from db.database import get_db

class TruthLevel:
    USER = 1
    AUTOMATION = 2
    AI_LOCAL = 3
    AI_LOCAL_NETWORK = 4
    AI_CLOUD = 5

def upgrade_to_user_truth(entity_id: str, db_session) -> Optional[Entity]:
    """Upgrade a suggestion (L3/C5) to U1 after user acceptance"""
    entity = db_session.query(Entity).filter(Entity.id == entity_id).first()
    
    if not entity:
        return None
    
    # Add to origin chain
    origin_entry = {
        'from_level': entity.truth_level,
        'to_level': TruthLevel.USER,
        'timestamp': datetime.utcnow().isoformat(),
        'action': 'user_accepted',
        'source': entity.origin_source
    }
    
    # Update entity
    entity.truth_level = TruthLevel.USER
    entity.accepted_by_user = True
    if entity.origin_chain is None:
        entity.origin_chain = []
    entity.origin_chain.append(origin_entry)
    entity.updated_at = datetime.utcnow()
    
    db_session.commit()
    return entity

def is_higher_truth(level_a: int, level_b: int) -> bool:
    """Check if level_a has higher truth than level_b"""
    return level_a < level_b  # Lower number = higher truth
```

---

### 0.5 Add Sync API Endpoints to Cloud API ✅

**Location:** `apps/api/src/routes/sync.ts`

```typescript
// apps/api/src/routes/sync.ts
import { Router } from 'express';
import { SyncItem, SyncRequest, SyncResponse } from '@sbf/sync-protocol';
import { resolveSyncConflict } from '@sbf/sync-protocol';
import { db } from '../db';

const router = Router();

/**
 * POST /sync/push
 * Receive sync items from local client
 */
router.post('/push', async (req, res) => {
  const { tenantId, userId } = req.tenantContext;
  const { items, since_version } = req.body as SyncRequest;

  const accepted: SyncItem[] = [];
  const rejected: SyncItem[] = [];
  const conflicts: any[] = [];

  for (const item of items) {
    // Verify tenant ownership
    if (item.tenant_id !== tenantId) {
      rejected.push(item);
      continue;
    }

    // Find existing entity
    const existing = await db.entities.findOne({
      tenant_id: tenantId,
      id: item.id
    });

    if (!existing) {
      // New item, insert
      await db.entities.insert(item);
      accepted.push(item);
    } else {
      // Conflict resolution
      const result = resolveSyncConflict(existing, item);

      if (result.action === 'accept_incoming') {
        await db.entities.update(existing.id, item);
        accepted.push(item);
      } else if (result.action === 'reject_incoming') {
        rejected.push(item);
        conflicts.push(result);
      }
    }
  }

  res.json({
    accepted,
    rejected,
    conflicts,
    latest_version: await db.getLatestVersion(tenantId)
  } as SyncResponse);
});

/**
 * GET /sync/pull
 * Send cloud changes to local client
 */
router.get('/pull', async (req, res) => {
  const { tenantId } = req.tenantContext;
  const sinceVersion = parseInt(req.query.since_version as string) || 0;

  // Get all items updated since version
  const items = await db.entities.findMany({
    tenant_id: tenantId,
    version: { $gt: sinceVersion }
  });

  // For local-first tenants, only send suggestions (C5/A2) as drafts
  const itemsWithSuggestionFlag = items.map(item => ({
    ...item,
    is_suggestion: item.truth_level >= 2 // Mark A2/L3/C5 as suggestions
  }));

  res.json({
    items: itemsWithSuggestionFlag,
    latest_version: await db.getLatestVersion(tenantId)
  });
});

export default router;
```

---

## Phase 1: Desktop App Restoration (Week 1-2)

### 1.1 Restore Desktop App Structure

**Review existing:** `packages/@sbf/desktop/`

**Enhance with:**
1. Vault browser component
2. Approval queue for L3/C5 suggestions
3. Sync status indicator
4. Truth level badges

**Key files to create:**
```
packages/@sbf/desktop/
├── src/
│   ├── main/
│   │   ├── index.ts                  # Electron main process
│   │   ├── vault-manager.ts          # Vault file operations
│   │   ├── local-db.ts               # SQLite local DB
│   │   ├── sync-service.ts           # Background sync
│   │   └── tray-menu.ts              # System tray
│   ├── renderer/
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── VaultBrowser/         # Browse vault files
│   │   │   ├── ApprovalQueue/        # Review L3/C5 suggestions
│   │   │   ├── SyncStatus/           # Sync indicator
│   │   │   ├── TruthBadge/           # Show U1/A2/L3/C5
│   │   │   └── EntityView/           # View/edit entities
│   │   └── hooks/
│   │       ├── useVault.ts
│   │       ├── useSync.ts
│   │       └── useSuggestions.ts
│   └── shared/
│       └── types.ts
└── package.json
```

---

### 1.2 Integrate Vault Client

Connect desktop app to `@sbf/vault-client`:

```typescript
// packages/@sbf/desktop/src/main/vault-manager.ts
import { VaultAdapter, VaultWatcher } from '@sbf/vault-client';
import { db } from './local-db';
import { TruthLevel } from '@sbf/truth-hierarchy';

export class VaultManager {
  private adapter: VaultAdapter;
  private watcher: VaultWatcher;

  constructor(vaultPath: string) {
    this.adapter = new VaultAdapter(vaultPath);
    this.watcher = new VaultWatcher(vaultPath);

    // Handle vault changes
    this.watcher.on('change', async (event) => {
      if (event.type === 'unlink') {
        await db.markEntityDeleted(event.path);
      } else if (event.entity) {
        // Store in local DB with truth_level = U1
        await db.upsertEntity({
          ...event.entity,
          truth_level: TruthLevel.USER,
          origin_source: 'user:vault'
        });
      }
    });
  }

  start(): void {
    this.watcher.start();
  }

  stop(): void {
    this.watcher.stop();
  }

  async scanVault(): Promise<void> {
    const entities = this.adapter.scanVault();
    for (const entity of entities) {
      await db.upsertEntity(entity);
    }
  }
}
```

---

### 1.3 Build Approval Queue UI

```tsx
// packages/@sbf/desktop/src/renderer/components/ApprovalQueue/index.tsx
import React, { useEffect, useState } from 'react';
import { TruthBadge } from '../TruthBadge';

interface Suggestion {
  id: string;
  title: string;
  content: string;
  truth_level: number;
  origin_source: string;
  created_at: string;
}

export function ApprovalQueue() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    // Load L3/C5 suggestions from local DB
    const items = await window.api.getSuggestions();
    setSuggestions(items);
  };

  const handleApprove = async (id: string) => {
    await window.api.acceptSuggestion(id);
    setSuggestions(prev => prev.filter(s => s.id !== id));
  };

  const handleReject = async (id: string) => {
    await window.api.rejectSuggestion(id);
    setSuggestions(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="approval-queue">
      <h2>AI Suggestions Pending Your Review</h2>
      <p className="hint">These are suggestions from AI. Review and accept to add to your vault.</p>
      
      {suggestions.length === 0 ? (
        <p>No pending suggestions.</p>
      ) : (
        <div className="suggestions-list">
          {suggestions.map(suggestion => (
            <div key={suggestion.id} className="suggestion-card">
              <div className="suggestion-header">
                <h3>{suggestion.title}</h3>
                <TruthBadge level={suggestion.truth_level} />
              </div>
              <div className="suggestion-content">
                <pre>{suggestion.content}</pre>
              </div>
              <div className="suggestion-actions">
                <button onClick={() => handleApprove(suggestion.id)} className="btn-approve">
                  ✓ Accept & Add to Vault
                </button>
                <button onClick={() => handleReject(suggestion.id)} className="btn-reject">
                  ✗ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Phase 2: AEI-Core Local-First Enhancements (Week 2-3)

### 2.1 Implement Vault Watcher Service

```python
# aei-core/services/vault_watcher.py

from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import os
from services.entity_extractor import extract_entities_from_file
from db.database import get_db
from services.truth_manager import TruthLevel

class VaultEventHandler(FileSystemEventHandler):
    def __init__(self, vault_root: str):
        self.vault_root = vault_root
        
    def on_modified(self, event):
        if not event.is_directory and event.src_path.endswith('.md'):
            self.process_file(event.src_path)
    
    def on_created(self, event):
        if not event.is_directory and event.src_path.endswith('.md'):
            self.process_file(event.src_path)
    
    def process_file(self, filepath: str):
        """Extract entities and store with truth_level=U1"""
        relative_path = os.path.relpath(filepath, self.vault_root)
        
        db = next(get_db())
        entities = extract_entities_from_file(filepath)
        
        for entity in entities:
            entity.truth_level = TruthLevel.USER
            entity.origin_source = 'user:vault'
            entity.vault_path = relative_path
            db.merge(entity)
        
        db.commit()

class VaultWatcher:
    def __init__(self, vault_root: str):
        self.vault_root = vault_root
        self.observer = Observer()
        self.event_handler = VaultEventHandler(vault_root)
        
    def start(self):
        self.observer.schedule(self.event_handler, self.vault_root, recursive=True)
        self.observer.start()
        
    def stop(self):
        self.observer.stop()
        self.observer.join()
```

---

### 2.2 Implement Sync Client

```python
# aei-core/services/sync_client.py

import httpx
from typing import List, Optional
from db.models import Entity
from db.database import get_db
from services.truth_manager import TruthLevel
import os

CLOUD_API_URL = os.getenv('CLOUD_API_URL', 'https://api.secondbrain.foundation')

class SyncClient:
    def __init__(self, tenant_id: str, api_token: str):
        self.tenant_id = tenant_id
        self.api_token = api_token
        self.headers = {
            'Authorization': f'Bearer {api_token}',
            'X-Tenant-ID': tenant_id
        }
    
    async def push_to_cloud(self) -> dict:
        """Push U1/A2/L3 entities to cloud"""
        db = next(get_db())
        
        # Get entities that need syncing
        entities = db.query(Entity).filter(
            Entity.tenant_id == self.tenant_id,
            Entity.synced_at == None  # Not synced yet
        ).all()
        
        items = [self._entity_to_sync_item(e) for e in entities]
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f'{CLOUD_API_URL}/sync/push',
                headers=self.headers,
                json={'items': items}
            )
            
            result = response.json()
            
            # Mark accepted items as synced
            for item in result.get('accepted', []):
                entity = db.query(Entity).filter(Entity.id == item['id']).first()
                if entity:
                    entity.synced_at = datetime.utcnow()
            
            db.commit()
            return result
    
    async def pull_from_cloud(self, since_version: int = 0) -> List[Entity]:
        """Pull cloud changes (as suggestions for local-first)"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f'{CLOUD_API_URL}/sync/pull',
                headers=self.headers,
                params={'since_version': since_version}
            )
            
            result = response.json()
            items = result.get('items', [])
            
            db = next(get_db())
            
            for item in items:
                # Cloud suggestions (C5) are stored as pending approval
                if item.get('is_suggestion', False):
                    # Store as suggestion, don't overwrite U1
                    existing = db.query(Entity).filter(Entity.id == item['id']).first()
                    
                    if not existing or existing.truth_level >= TruthLevel.AUTOMATION:
                        # No local U1, safe to add as suggestion
                        entity = Entity(**item)
                        db.merge(entity)
            
            db.commit()
            return items
    
    def _entity_to_sync_item(self, entity: Entity) -> dict:
        return {
            'id': entity.id,
            'tenant_id': entity.tenant_id,
            'entity_type': entity.entity_type,
            'content': entity.content,
            'truth_level': entity.truth_level,
            'origin_source': entity.origin_source,
            'origin_chain': entity.origin_chain or [],
            'version': entity.version,
            'created_at': entity.created_at.isoformat(),
            'updated_at': entity.updated_at.isoformat(),
            'deleted': entity.deleted
        }
```

---

## Summary & Next Steps

### What I've Created:

1. ✅ **CORRECTIVE-REFACTOR-PLAN.md** - Overall corrective architecture
2. ✅ **ARCHIVED-WORK-REVIEW.md** - Analysis of what was archived
3. ✅ **CAREFUL-REFACTOR-EXECUTION.md** (this file) - Detailed execution steps

### What to Execute (Priority Order):

#### **Immediate (This Week):**
1. Create `packages/@sbf/truth-hierarchy/`
2. Create `packages/@sbf/sync-protocol/`
3. Create `packages/@sbf/vault-client/` (adapted from archive)
4. Update `aei-core/db/models.py` with truth fields
5. Create truth manager service in aei-core

#### **Next Week:**
6. Restore/enhance desktop app with approval queue
7. Implement vault watcher in aei-core
8. Build sync client in aei-core
9. Add sync endpoints to cloud API
10. Test local-first workflow end-to-end

#### **Following Weeks:**
11. Multi-channel support (web, mobile)
12. Analytics integration
13. Voice/IoT (future)

---

## Validation Checklist

Before proceeding, validate alignment:

- ✅ Local vault is canonical for local-first tenants
- ✅ Desktop app is primary interface
- ✅ Truth hierarchy (U1 > A2 > L3 > C5) implemented
- ✅ Cloud cannot overwrite U1 without user approval
- ✅ Sync protocol respects truth levels
- ✅ Archived valuable code patterns preserved
- ✅ Domain entity types will be recovered
- ✅ Hybrid model: local-first + cloud-augmented

---

**Status:** Ready for careful, aligned execution  
**Risk:** Low (following grounding documents)  
**Timeline:** 4-6 weeks to full local-first + cloud hybrid  
**Next Action:** Execute Phase 0 package creation
