# Quick Reference: Refactored Code Structure

**Status:** Foundation Complete, Build System Needs Fix
**Last Updated:** 2025-11-20

---

## 📁 New Package Structure (Created)

```
packages/@sbf/
├── shared/                          ✅ COMPLETE
│   ├── src/
│   │   ├── types/
│   │   │   ├── entity.ts           - Entity type system
│   │   │   ├── lifecycle.ts        - 48-hour lifecycle types
│   │   │   ├── relationship.ts     - Semantic graph types
│   │   │   ├── privacy.ts          - Context-aware privacy
│   │   │   ├── module.ts           - module system interfaces
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── uid.ts              - UID generation
│   │   │   ├── validation.ts       - Entity validation
│   │   │   ├── date.ts             - Date/time helpers
│   │   │   └── index.ts
│   │   ├── constants/
│   │   │   └── index.ts            - System constants
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
│
├── core/
│   └── module-system/               ✅ COMPLETE
│       ├── src/
│       │   ├── PluginRegistry.ts   - module registration & management
│       │   ├── PluginManager.ts    - Hook execution engine
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── core/
│   ├── entity-manager/              ⏳ NEXT
│   ├── lifecycle-engine/            ⏳ NEXT
│   └── knowledge-graph/             ⏳ NEXT
│
├── memory-engine/                   📅 WEEK 3-4
├── aei/                             📅 WEEK 3-4
├── automation/                      📅 WEEK 5-6
├── modules/                         📅 WEEK 7-10
├── integrations/                    📅 WEEK 7-8
├── cli/                             📅 WEEK 11
├── desktop/                         📅 WEEK 11-12
└── api/                             📅 WEEK 13-14
```

---

## 🎯 What Each Package Does

### @sbf/shared (✅ COMPLETE)
**Purpose:** Core types, utilities, and constants shared across all packages

**Exports:**
- `Entity` - Core entity type with metadata
- `EntityType` - Union type of all entity types
- `LifecycleState` - capture | transitional | permanent | archived
- `Relationship` - Typed relationship edges
- `SBFPlugin` - module interface
- `generateUID()` - UID generation utility
- `validateEntity()` - Entity validation
- `now()`, `futureDate()`, etc. - Date utilities

**Usage:**
```typescript
import { Entity, generateUID, validateEntity } from '@sbf/shared';

const entity: Entity = {
  uid: generateUID('topic', 'Machine Learning', 1),
  type: 'topic',
  title: 'Machine Learning',
  // ...
};

const { valid, errors } = validateEntity(entity);
```

### @sbf/core/module-system (✅ COMPLETE)
**Purpose:** module registration, lifecycle management, and hook execution

**Exports:**
- `PluginRegistry` - Manage module registration/enablement
- `PluginManager` - Execute lifecycle hooks

**Usage:**
```typescript
import { PluginRegistry, PluginManager } from '@sbf/core/module-system';
import { SBFPlugin } from '@sbf/shared';

const registry = new PluginRegistry();
const manager = new PluginManager(registry);

const myPlugin: SBFPlugin = {
  id: 'my-module',
  name: 'My module',
  version: '1.0.0',
  capabilities: { providesEntities: true },
  hooks: {
    onEntityCreate: async (entity) => {
      console.log('Entity created:', entity.uid);
      return entity;
    },
  },
};

await registry.register(myPlugin);
await registry.enable('my-module');

// Hook execution
const createdEntity = await manager.onEntityCreate(entity);
```

### @sbf/core/entity-manager (⏳ NEXT)
**Purpose:** CRUD operations for entities with validation and hooks

**Planned Exports:**
- `EntityManager` - Main entity CRUD interface
- `createEntity()` - Create with validation
- `getEntity()` - Retrieve by UID
- `updateEntity()` - Update with hooks
- `deleteEntity()` - Delete with hooks
- `queryEntities()` - Search and filter

### @sbf/core/lifecycle-engine (⏳ NEXT)
**Purpose:** Automatic lifecycle transitions (48-hour rule)

**Planned Exports:**
- `LifecycleEngine` - Main lifecycle automation
- `scheduleTransition()` - Schedule state change
- `transitionEntity()` - Execute transition
- `preventDissolve()` - Human override

### @sbf/core/knowledge-graph (⏳ NEXT)
**Purpose:** Graph database operations for relationships

**Planned Exports:**
- `GraphDatabase` - Graph storage abstraction
- `addRelationship()` - Create relationship edge
- `getRelationships()` - Query relationships
- `traverseGraph()` - Graph traversal
- `findPaths()` - Path finding between nodes

---

## 🔧 Key Type Definitions

### Entity
```typescript
interface Entity {
  uid: string;                        // Format: {type}-{slug}-{counter}
  type: EntityType;
  title: string;
  aliases?: string[];
  created: string;                    // ISO8601
  updated: string;                    // ISO8601
  lifecycle: {
    state: 'capture' | 'transitional' | 'permanent' | 'archived';
    review_at?: string;
    dissolve_at?: string;
  };
  sensitivity: {
    level: 'public' | 'personal' | 'confidential' | 'secret';
    privacy: {
      cloud_ai_allowed: boolean;
      local_ai_allowed: boolean;
      export_allowed: boolean;
    };
  };
  rel?: Array<[string, string]>;      // [relationship_type, target_uid]
  provenance?: Provenance;
  bmom?: BMOM;
  content?: string;
  metadata?: Record<string, any>;
}
```

### SBFPlugin
```typescript
interface SBFPlugin {
  id: string;
  name: string;
  version: string;
  domain?: string;                    // 'va', 'healthcare', etc.
  capabilities: PluginCapabilities;
  hooks: PluginHooks;
  entityTypes?: EntityTemplate[];
  routes?: PluginRoute[];
  dashboardComponents?: DashboardComponent[];
}
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `HOLISTIC-REFACTOR-PLAN.md` | Complete 14-week refactor roadmap |
| `REFACTOR-PROGRESS.md` | Living progress tracker |
| `REFACTOR-SESSION-SUMMARY.md` | Today's accomplishments & insights |
| `README-QUICK-REFERENCE.md` | This file - quick lookup |

---

## 🚀 Next Steps

### Immediate (Tomorrow)
1. Fix build system (consider switching to pnpm)
2. Verify TypeScript compilation works
3. Create @sbf/core/entity-manager package

### This Week
1. Implement EntityManager with CRUD
2. Implement LifecycleEngine with 48h automation
3. Implement KnowledgeGraph with in-memory store
4. Write tests for all core packages

---

## 🎯 Import Examples

### Using Shared Types
```typescript
// In any package
import {
  Entity,
  EntityType,
  Relationship,
  LifecycleState,
  SBFPlugin,
} from '@sbf/shared';
```

### Using Utilities
```typescript
import {
  generateUID,
  validateEntity,
  now,
  futureDate,
} from '@sbf/shared';
```

### Using module System
```typescript
import { PluginRegistry, PluginManager } from '@sbf/core/module-system';
```

---

## 🔍 Finding Things

| I want to... | Look in... |
|--------------|------------|
| Add a new entity type | `@sbf/shared/src/types/entity.ts` |
| Add a new relationship type | `@sbf/shared/src/types/relationship.ts` |
| Modify lifecycle rules | `@sbf/shared/src/types/lifecycle.ts` |
| Create a module | `@sbf/shared/src/types/module.ts` for interface |
| Register a module | `@sbf/core/module-system/src/PluginRegistry.ts` |
| Execute module hooks | `@sbf/core/module-system/src/PluginManager.ts` |
| Validate an entity | `@sbf/shared/src/utils/validation.ts` |
| Generate UIDs | `@sbf/shared/src/utils/uid.ts` |

---

## ✅ What's Working

1. **Type System** - Comprehensive, well-documented types
2. **module Architecture** - Registry and hook execution complete
3. **Utilities** - UID generation, validation, date helpers
4. **Documentation** - Extensive planning and reference docs

## 🚧 What Needs Fixing

1. **Build System** - npm workspaces not installing TypeScript correctly
2. **Compilation** - Can't build packages yet (blocked by #1)
3. **Testing** - No tests written yet (waiting for successful builds)

## 🎉 What's Next

1. Unblock builds (evaluate pnpm)
2. Implement EntityManager
3. Implement LifecycleEngine
4. Write comprehensive tests
5. Begin Memory Engine migration

---

**Quick Start Command (once builds work):**
```bash
cd C:\!Projects\SecondBrainFoundation
npm install
npm run build
npm test
```

**Current Workaround:**
Need to fix workspace configuration or switch to pnpm.

---

**Last Updated:** 2025-11-20
**Status:** Foundation Complete, Build Blocked
