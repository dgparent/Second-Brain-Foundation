# 🔨 Extraction-01 Refactoring Plan

**Date:** 2025-11-14  
**Phase:** Code Cleanup & Streamlining  
**Status:** Planning  

---

## 📊 Current State Analysis

### Code Structure Overview
```
Extraction-01/
├── 00-analysis/          # Analysis documents
├── 01-extracted-raw/     # Raw extractions from libraries
├── 02-refactored/        # Empty (abandoned approach)
├── 03-integration/       # Active development (sbf-app)
├── 04-documentation/     # Documentation (sparse)
└── scripts/              # Build scripts
```

### Issues Identified

#### 1. **Module Bloat** 🔴
- **Problem:** Many stub interfaces with minimal/no implementation
- **Files:**
  - `entity-manager.ts` - Only interface definition (13 LOC)
  - `agent.ts` - Stub with TODOs (89 LOC, 70% unimplemented)
  - `lifecycle-engine.ts` - Likely stub (needs review)
  - `privacy-controller.ts` - Likely stub (needs review)
  - `graph.ts` - Needs review
  - `indexer.ts` - Needs review

#### 2. **Documentation Sprawl** 🟡
- **Problem:** 12+ markdown files with overlapping/outdated info
- **Files:**
  ```
  DECISIONS.md
  DESKTOP-SHELL-COMPLETE.md
  EXTRACTION-COMPLETE-FINAL.md
  EXTRACTION-TECHNICAL-PLAN.md
  MODULE-EXTRACTION-PROGRESS.md
  NEXT-STEPS-IMPLEMENTATION.md
  PHASE-0-DAY1-SUMMARY.md
  PHASE-0-LOG.md
  PHASE-0-PROGRESS.md
  SETUP-COMPLETE.md
  UPDATED-PLAN-WITH-LETTA.md
  YOLO-EXTRACTION-FINAL-REPORT.md
  ```

#### 3. **Duplicate Patterns** 🟡
- **Problem:** IPC handlers in both main process and stubs in core
- **Example:** Vault operations duplicated in:
  - `packages/core/src/filesystem/vault.ts` (complete implementation)
  - `packages/desktop/src/main/index.ts` (IPC handlers with fs operations)

#### 4. **Missing Letta Integration** 🔴
- **Problem:** Letta not yet cloned/analyzed despite being "pivotal"
- **Impact:** Agent architecture incomplete

#### 5. **Folder Structure Confusion** 🟡
- **Problem:** 02-refactored/ is empty, 03-integration/ is active
- **Suggests:** Abandoned refactoring attempt

---

## 🎯 Refactoring Objectives

### Primary Goals
1. **Consolidate Modules** - Remove stubs, keep only working code
2. **Clean Documentation** - One source of truth per topic
3. **Simplify Classes** - Break large classes into focused units
4. **Align with Architecture** - Match docs/03-architecture specs
5. **Prepare for Letta** - Clear path for agent integration

### Success Metrics
- ✅ <50% of current files (remove stubs)
- ✅ <5 documentation files (consolidate)
- ✅ No class >300 LOC (split large classes)
- ✅ 100% working code (no TODOs in core)
- ✅ Letta integration ready

---

## 🔧 Refactoring Strategy

### Phase 1: Code Audit & Cleanup (2-3 hours)

#### 1.1 Identify What Works ✅
**Action:** Review each file, categorize as:
- ✅ **Complete** - Fully implemented, tested
- ⚠️ **Partial** - Has working code + TODOs
- ❌ **Stub** - Interface only, no implementation

**Files to Review:**
```typescript
// Core Package
src/filesystem/vault.ts          // Expected: ✅ (250 LOC, complete from YOLO)
src/entities/entity-manager.ts   // Expected: ❌ (interface only)
src/agent/agent.ts               // Expected: ⚠️ (partial)
src/lifecycle/lifecycle-engine.ts // Expected: ❌ (likely stub)
src/privacy/privacy-controller.ts // Expected: ❌ (likely stub)
src/relationships/graph.ts       // Expected: ⚠️ (needs review)
src/search/indexer.ts            // Expected: ⚠️ (needs review)
src/metadata/frontmatter.ts      // Expected: ⚠️ (needs review)

// Desktop Package
src/main/index.ts                // Expected: ✅ (Electron setup complete)
src/preload/index.ts             // Expected: ⚠️ (needs review)
src/renderer/App.tsx             // Expected: ✅ (basic routing)
src/renderer/views/*             // Expected: ❌ (likely stubs)
src/renderer/components/*        // Expected: ❌ (likely stubs)
```

#### 1.2 Remove Stub Files 🗑️
**Criteria for Removal:**
- Interface-only files with no implementation
- Files that are <30 LOC and all comments/TODOs
- Duplicate implementations (keep best one)

**Action Plan:**
1. Move stubs to `04-documentation/removed-stubs/` with notes
2. Update index.ts exports to remove references
3. Document removal reasons in REFACTORING-LOG.md

#### 1.3 Consolidate Implementations 🔀
**Problem:** Vault operations in multiple places
**Solution:**
```typescript
// KEEP: packages/core/src/filesystem/vault.ts
//   - Complete implementation
//   - Security patterns
//   - Atomic writes

// REFACTOR: packages/desktop/src/main/index.ts
//   - IPC handlers should CALL vault.ts, not reimplement
//   - Remove fs operations, delegate to Vault class
```

**New Pattern:**
```typescript
// main/index.ts (after refactor)
import { Vault } from '@sbf/core';

let vault: Vault | null = null;

ipcMain.handle('vault:init', async (_event, vaultPath: string) => {
  vault = new Vault(vaultPath);
  await vault.initialize();
});

ipcMain.handle('vault:read-file', async (_event, filePath: string) => {
  if (!vault) throw new Error('Vault not initialized');
  return await vault.readFile(filePath);
});
```

---

### Phase 2: Class Decomposition (2-3 hours)

#### 2.1 Vault.ts Splitting 🔪
**Current:** 249 LOC, monolithic
**Target:** 3 focused classes

**New Structure:**
```typescript
// vault-core.ts (100 LOC)
export class VaultCore {
  constructor(vaultPath: string);
  initialize(): Promise<void>;
  normalizePath(path: string): string;
  isWithin(parent: string, child: string): boolean;
}

// vault-files.ts (80 LOC)
export class VaultFiles extends VaultCore {
  readFile(path: string): Promise<FileContent>;
  writeFile(path: string, fm: object, content: string): Promise<void>;
  deleteFile(path: string): Promise<void>;
  exists(path: string): Promise<boolean>;
}

// vault-operations.ts (70 LOC)
export class Vault extends VaultFiles {
  listFiles(folder: string): Promise<VaultEntry>;
  createFolder(folder: string): Promise<void>;
  updateFrontmatter(path: string, updates: object): Promise<void>;
  getChecksum(path: string): Promise<string>;
}
```

**Benefits:**
- Easier testing (mock VaultCore for tests)
- Clear separation of concerns
- Future extensibility (add VaultSearch, VaultWatch, etc.)

#### 2.2 Agent.ts Refactoring 🤖
**Current:** Monolithic stub (89 LOC, mostly TODO)
**Issue:** Letta not yet analyzed

**Action:** 
1. **DO NOT IMPLEMENT** - Wait for Letta analysis
2. **Prepare Interface:**
```typescript
// agent/agent-interface.ts
export interface IAgent {
  step(message: string): Promise<AgentResponse>;
  extractEntities(notePath: string): Promise<EntitySuggestion[]>;
  suggestFiling(notePath: string): Promise<FilingSuggestion>;
  learnFromFeedback(feedback: Feedback): Promise<void>;
}

// agent/agent.ts (minimal stub)
export class SBFAgent implements IAgent {
  // TODO: Implement after Letta analysis
  async step(message: string): Promise<AgentResponse> {
    throw new Error('Agent not implemented - awaiting Letta integration');
  }
}
```

#### 2.3 Entity Manager Implementation 📦
**Current:** Interface only (13 LOC)
**Target:** Working implementation

**Based on Architecture Docs:**
```typescript
// entities/entity-file-manager.ts (NEW)
export class EntityFileManager {
  constructor(private vault: Vault) {}
  
  async create(entity: Entity): Promise<string> {
    const uid = this.generateUID(entity.type, entity.title);
    const filePath = this.getFilePath(entity.type, uid);
    await this.vault.writeFile(filePath, entity, '');
    return uid;
  }
  
  async read(uid: string): Promise<Entity | null> {
    const filePath = this.findFileByUID(uid);
    const content = await this.vault.readFile(filePath);
    return content?.frontmatter as Entity;
  }
  
  // ... update, delete, list
  
  private generateUID(type: string, title: string): string {
    const slug = this.slugify(title);
    const counter = this.getNextCounter(type, slug);
    return `${type}-${slug}-${counter.toString().padStart(3, '0')}`;
  }
}
```

---

### Phase 3: Documentation Consolidation (1-2 hours)

#### 3.1 Consolidation Map 📋

**NEW STRUCTURE:**
```
Extraction-01/
├── README.md                    # Overview, quick start
├── ARCHITECTURE.md              # Technical design (from docs/03-architecture)
├── IMPLEMENTATION-STATUS.md     # What's done, what's next
├── REFACTORING-LOG.md           # This cleanup session log
└── archive/
    ├── PHASE-0-*.md            # Historical phase 0 docs
    ├── EXTRACTION-*.md         # Historical extraction docs
    └── DECISIONS.md            # Old decisions
```

**CONSOLIDATION ACTIONS:**

1. **Create ARCHITECTURE.md**
   - Source: `docs/03-architecture/architecture-v2-enhanced.md`
   - Add: Extraction-specific decisions from DECISIONS.md
   - Add: Module structure from current codebase

2. **Create IMPLEMENTATION-STATUS.md**
   - Merge: YOLO-EXTRACTION-FINAL-REPORT.md (what's extracted)
   - Merge: MODULE-EXTRACTION-PROGRESS.md (progress tracking)
   - Merge: PHASE-0-PROGRESS.md (phase status)
   - Add: Current refactoring state

3. **Archive Old Docs**
   - Move all PHASE-0-*.md to archive/
   - Move all EXTRACTION-*.md to archive/
   - Keep as reference, not active

4. **Update README.md**
   - Current state
   - How to build/run
   - Architecture reference
   - Implementation status reference

#### 3.2 Code Documentation 📝

**Add JSDoc to All Public APIs:**
```typescript
/**
 * VaultCore - Base vault operations
 * 
 * Provides:
 * - Path normalization (security)
 * - Directory traversal protection
 * - Vault initialization
 * 
 * @example
 * ```typescript
 * const vault = new Vault('/path/to/vault');
 * await vault.initialize();
 * const file = await vault.readFile('note.md');
 * ```
 */
export class VaultCore {
  /**
   * Initialize vault directory
   * Creates directory if it doesn't exist
   * 
   * @throws {Error} If path is invalid or inaccessible
   */
  async initialize(): Promise<void> {
    // ...
  }
}
```

---

### Phase 4: Letta Integration Prep (1-2 hours)

#### 4.1 Clone & Analyze Letta 📥
**Actions:**
1. Clone Letta to `libraries/letta/`
2. Create analysis document: `00-analysis/LETTA-ANALYSIS.md`
3. Identify patterns for:
   - Agent architecture
   - Memory management
   - Tool/function calling
   - Learning mechanisms

#### 4.2 Design Agent Architecture 🏗️
**Based on Letta Patterns:**
```typescript
// agent/core/agent-core.ts
export class AgentCore {
  private coreMemory: CoreMemory;
  private archivalMemory: ArchivalMemory;
  private toolRegistry: ToolRegistry;
  
  async step(message: string): Promise<AgentResponse> {
    // 1. Build context
    const context = await this.buildContext(message);
    
    // 2. LLM call
    const response = await this.llm.generate(context);
    
    // 3. Parse tool calls
    const toolCalls = this.parseToolCalls(response);
    
    // 4. Execute tools
    const toolResults = await this.executTools(toolCalls);
    
    // 5. Update memories
    await this.updateMemories(message, response, toolResults);
    
    return response;
  }
}

// agent/memory/core-memory.ts
export class CoreMemory {
  persona: string;
  preferences: Record<string, any>;
  
  update(key: string, value: any): void;
  recall(key: string): any;
}

// agent/memory/archival-memory.ts
export class ArchivalMemory {
  async store(memory: Memory): Promise<void>;
  async search(query: string): Promise<Memory[]>;
}

// agent/tools/tool-registry.ts
export class ToolRegistry {
  private tools: Map<string, Tool>;
  
  register(tool: Tool): void;
  execute(name: string, args: any): Promise<any>;
}
```

#### 4.3 Define Integration Points 🔌
**Where Letta Connects:**
```typescript
// Chat Interface → Agent
ChatView.tsx → AgentCore.step(userMessage)

// Entity Extraction → Agent
EntityManager → AgentCore.extractEntities(notePath)

// Filing Suggestions → Agent
OrganizationQueue → AgentCore.suggestFiling(notePath)

// Learning Loop → Agent
UserApproval → AgentCore.learnFromFeedback(feedback)
```

---

### Phase 5: Testing & Validation (2-3 hours)

#### 5.1 Unit Tests for Core 🧪
**Priority Test Targets:**
```typescript
// vault.test.ts
describe('VaultCore', () => {
  it('prevents directory traversal attacks');
  it('normalizes paths correctly');
  it('creates vault directory if missing');
});

describe('VaultFiles', () => {
  it('reads markdown with frontmatter');
  it('writes files atomically (temp + rename)');
  it('updates frontmatter without losing content');
  it('calculates checksums correctly');
});

describe('VaultOperations', () => {
  it('lists files recursively');
  it('creates nested folders');
  it('skips hidden files');
});
```

#### 5.2 Integration Tests 🔗
**Desktop ↔ Core Integration:**
```typescript
// ipc.test.ts
describe('IPC Handlers', () => {
  it('initializes vault via IPC');
  it('reads file via IPC');
  it('writes file via IPC');
  it('handles errors gracefully');
});
```

#### 5.3 Build & Run Validation ✅
**Checklist:**
```bash
# 1. Clean build
pnpm clean
pnpm install
pnpm build

# 2. Type checking
pnpm typecheck

# 3. Linting
pnpm lint

# 4. Tests
pnpm test

# 5. Desktop app
pnpm dev:desktop  # Should launch without errors
```

---

## 📦 Deliverables

### Code Deliverables
1. ✅ Refactored Core Package
   - VaultCore, VaultFiles, Vault (split)
   - EntityFileManager (implemented)
   - FrontmatterParser (extracted)
   - Remove all stubs

2. ✅ Refactored Desktop Package
   - IPC handlers using Vault class
   - Remove duplicate fs operations
   - Clean view components

3. ✅ Letta Integration
   - Letta cloned and analyzed
   - Agent architecture designed
   - Integration points defined

### Documentation Deliverables
1. ✅ README.md (project overview)
2. ✅ ARCHITECTURE.md (technical design)
3. ✅ IMPLEMENTATION-STATUS.md (current state)
4. ✅ REFACTORING-LOG.md (this session log)
5. ✅ 00-analysis/LETTA-ANALYSIS.md (Letta patterns)

### Test Deliverables
1. ✅ Unit tests for Vault classes
2. ✅ Integration tests for IPC
3. ✅ Build validation passing

---

## 🚀 Execution Plan

### Day 1: Audit & Cleanup (3-4 hours)
- [ ] Phase 1.1: Code audit (1h)
- [ ] Phase 1.2: Remove stubs (1h)
- [ ] Phase 1.3: Consolidate implementations (1h)
- [ ] Phase 3.1: Documentation consolidation (1h)

### Day 2: Refactoring & Letta (4-5 hours)
- [ ] Phase 2.1: Split Vault class (1.5h)
- [ ] Phase 2.3: Implement EntityFileManager (1.5h)
- [ ] Phase 4.1: Clone & analyze Letta (1h)
- [ ] Phase 4.2: Design agent architecture (1h)

### Day 3: Testing & Validation (3-4 hours)
- [ ] Phase 5.1: Unit tests (2h)
- [ ] Phase 5.2: Integration tests (1h)
- [ ] Phase 5.3: Build validation (1h)

**Total Estimated Time:** 10-13 hours over 3 days

---

## ⚠️ Risks & Mitigations

### Risk 1: Breaking Changes
**Mitigation:** 
- Keep old code in archive/ until tests pass
- Git commits after each phase
- Rollback plan documented

### Risk 2: Letta Complexity
**Mitigation:**
- Start with minimal Letta integration
- Phased adoption (not all-or-nothing)
- Keep stub agent working during transition

### Risk 3: Time Overruns
**Mitigation:**
- Each phase is independently valuable
- Can pause after any phase
- Prioritize Phase 1 (cleanup) if time-limited

---

## 🎯 Success Criteria

### Must Have ✅
- [x] All stub files removed or implemented
- [ ] Vault class split into focused units
- [ ] EntityFileManager working
- [ ] IPC handlers using Vault class
- [ ] Documentation consolidated to <5 files
- [ ] Build passes without errors

### Should Have ⚠️
- [ ] Letta cloned and analyzed
- [ ] Agent architecture designed
- [ ] Unit tests for Vault
- [ ] Integration tests for IPC

### Nice to Have 🌟
- [ ] Full test coverage
- [ ] Performance benchmarks
- [ ] Migration guide for future refactors

---

**Prepared By:** Winston (Architect)  
**Date:** 2025-11-14  
**Status:** Ready for Execution  
**Next Step:** Begin Phase 1.1 - Code Audit
