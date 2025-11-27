# Recovery Plan for Archived Work

**Date:** 2025-11-24  
**Purpose:** Selective recovery of valuable patterns from archived sbf/ work  
**Alignment:** Re-alignment-hybrid-sync-contract.md + NEXT-STEPS-EXECUTION-PLAN.md  

---

## Critical Insight

The previous refactor archived valuable domain logic, sync patterns, and entity types. We need to **extract patterns, not restore structure**. The local-first hybrid model requires different architecture, but the business logic is still valuable.

---

## Recovery Priority

### 🔴 CRITICAL (Recover in Phase 1)

#### 1. Memory-Engine Sync Logic
**Location:** `.archive/superseded-2025-11-24/memory-engine/sync/`

**Value:**
- Existing sync algorithms
- Conflict detection logic
- Storage synchronization patterns

**Action Plan:**
- [ ] Review `sync-manager.ts`
- [ ] Review `conflict-resolver.ts`
- [ ] Extract patterns → Apply to new `SyncConflictResolver`
- [ ] Adapt to truth-hierarchy-aware sync

**Timeline:** Phase 1.3 (Local Sync Client)

---

#### 2. Memory-Engine Storage Patterns
**Location:** `.archive/superseded-2025-11-24/memory-engine/storage/`

**Value:**
- Local storage abstractions
- File system watchers
- Indexing strategies

**Action Plan:**
- [ ] Review `local-storage.ts`
- [ ] Extract file watcher patterns
- [ ] Apply to aei-core local DB layer
- [ ] Integrate with truth-level tagging

**Timeline:** Phase 1.1 (Local Vault as Canonical)

---

#### 3. Domain Entity Types from Modules
**Location:** `.archive/superseded-2025-11-24/modules/*/src/types.ts`

**Modules to Extract (23 total):**
1. agriculture
2. analytics-dashboard
3. budgeting
4. construction-ops
5. fitness-tracking
6. healthcare
7. highlights
8. hospitality-ops
9. insurance-ops
10. learning-tracker
11. legal-ops
12. logistics-ops
13. manufacturing-ops
14. medication-tracking
15. nutrition-tracking
16. personal-tasks
17. portfolio-tracking
18. property-mgmt
19. relationship-crm
20. renewable-ops
21. restaurant-haccp
22. security-ops
23. va-dashboard

**Value:**
- Domain-specific entity schemas
- Business validation rules
- Field definitions

**Action Plan:**
- [ ] Create `packages/core-domain/src/entity-types/` folder
- [ ] Extract each module's entity definitions
- [ ] Convert to truth-hierarchy-aware entities
- [ ] Add to core domain types
- [ ] Document domain-specific fields

**Timeline:** Phase 1.2 (Truth-Aware Local DB Schema)

---

### 🟡 IMPORTANT (Recover in Phase 2-3)

#### 4. Memory-Engine Search Logic
**Location:** `.archive/superseded-2025-11-24/memory-engine/search/`

**Value:**
- Hybrid search algorithms
- Vector search patterns
- Full-text search integration

**Action Plan:**
- [ ] Review `hybrid-search.ts`
- [ ] Extract search algorithms
- [ ] Integrate into aei-core RAG system
- [ ] Make search respect truth levels

**Timeline:** Phase 3 (AI & Automations)

---

#### 5. Module Business Logic
**Location:** `.archive/superseded-2025-11-24/modules/*/src/services/`

**Value:**
- Domain-specific calculations
- Workflow logic
- Validation rules

**Action Plan:**
- [ ] Review service layer from high-value modules
- [ ] Extract reusable business logic
- [ ] Create service layer in `packages/@sbf/core/services/`
- [ ] Make services truth-level aware

**Timeline:** Phase 2 (Cloud Core & Sync API)

---

#### 6. Automation Workflow Patterns
**Location:** `.archive/superseded-2025-11-24/automation/workflows/`

**Value:**
- Workflow trigger patterns
- Action composition
- Automation templates

**Action Plan:**
- [ ] Review workflow definitions
- [ ] Document automation patterns
- [ ] Create local-first automation templates
- [ ] Implement as A2-level automations in aei-core

**Timeline:** Phase 3 (AI & Automations with Truth-Level Compliance)

---

### 🟢 NICE TO HAVE (Reference Only)

#### 7. Module UI Components
**Location:** `.archive/superseded-2025-11-24/modules/*/src/components/`

**Value:**
- Domain-specific UI patterns
- Form components
- Visualization components

**Action Plan:**
- [ ] Keep as reference for future UI work
- [ ] Extract patterns, not copy-paste
- [ ] Build new components aligned with desktop app
- [ ] Ensure components respect truth levels

**Timeline:** Phase 5+ (Developer Experience)

---

#### 8. ActivePieces/n8n Integration Patterns
**Location:** `.archive/superseded-2025-11-24/automation/activepieces-piece/`

**Value:**
- External integration patterns
- API connector patterns

**Action Plan:**
- [ ] Keep as reference only
- [ ] Not aligned with local-first model
- [ ] Consider local equivalents in future

**Timeline:** Future/Optional

---

## Extraction Strategy

### Step-by-Step Process

#### Step 1: Create Entity Type Registry
```bash
# Create entity types folder
mkdir packages/core-domain/src/entity-types

# For each archived module:
# 1. Extract entity type definitions
# 2. Add truth metadata fields
# 3. Create <domain>.entity.ts file
# 4. Export from entity-types/index.ts
```

#### Step 2: Review Sync Implementation
```bash
# Review archived sync logic
cat .archive/superseded-2025-11-24/memory-engine/sync/sync-manager.ts
cat .archive/superseded-2025-11-24/memory-engine/sync/conflict-resolver.ts

# Compare with new SyncConflictResolver
# Extract any missing patterns
# Ensure truth hierarchy rules are applied
```

#### Step 3: Extract Storage Patterns
```bash
# Review local storage implementation
cat .archive/superseded-2025-11-24/memory-engine/storage/local-storage.ts

# Apply patterns to aei-core:
# - File watching
# - Change detection
# - Local indexing
# - Cache management
```

#### Step 4: Document Business Logic
```bash
# For each module with valuable business logic:
# 1. Review service layer
# 2. Document algorithms
# 3. Extract validation rules
# 4. Create service implementations in new structure
```

---

## What NOT to Restore

### ❌ Don't Copy-Paste:
1. **Monolithic module structure** - We're using modular packages now
2. **Cloud-first assumptions** - Now local-first with cloud augmentation
3. **ActivePieces/n8n dependencies** - Local automations instead
4. **Desktop-only architecture** - Now hybrid (desktop + cloud sync)
5. **Microservices complexity** - Simpler unified API

### ✅ DO Extract:
1. **Entity schemas** - Domain knowledge is valuable
2. **Business logic** - Calculations, validations, workflows
3. **Sync patterns** - Conflict resolution, versioning
4. **Search algorithms** - Vector + full-text search
5. **Storage patterns** - File watching, indexing

---

## Integration Checklist

When recovering code:

- [ ] Add truth metadata fields to entity types
- [ ] Make services truth-level aware
- [ ] Update for local-first architecture
- [ ] Remove cloud-only dependencies
- [ ] Add vault mode support
- [ ] Implement in both TypeScript + Python where needed
- [ ] Add provenance tracking
- [ ] Support multi-channel input
- [ ] Respect user sovereignty (U1 protection)
- [ ] Document any breaking changes from original

---

## Timeline

- **Phase 1 (Weeks 1-2):** Entity types + Storage patterns + Sync logic
- **Phase 2 (Weeks 3-4):** Business logic + Search algorithms
- **Phase 3 (Weeks 5-6):** Automation patterns + AI integration
- **Phase 4+:** UI components + Optional integrations

---

## Success Criteria

✅ All domain entity types preserved and enhanced with truth metadata  
✅ Sync logic adapted to truth hierarchy  
✅ Storage patterns integrated into local-first architecture  
✅ Business logic made truth-level aware  
✅ Search algorithms respect truth levels  
✅ Automation patterns implemented as A2-level  
✅ No degradation of existing functionality  
✅ Improved user sovereignty and data ownership  

---

**Status:** Plan documented, ready for systematic recovery  
**Next Action:** Begin Phase 1 entity type extraction
