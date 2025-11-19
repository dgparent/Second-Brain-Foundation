# AEI Integration Plan - SecondBrainFoundation

**Date:** 2025-11-13  
**Purpose:** Bridge existing SBF specifications with 2BF AEI MVP architecture  
**Status:** Planning Phase

---

## Current State Assessment

### What Exists ✅
- **Complete SBF Specifications** (v2.0)
  - 10 entity templates with BMOM framework
  - CLI scaffolding guide (39K chars) - SPECIFIED but not implemented
  - Enhanced architecture with typed relationships
  - Privacy model with granular permissions
  
- **Complete AEI Architecture** (!new folder)
  - Developer architecture & 5-stage migration plan (432KB)
  - Complete MVP backlog with 8 Epics (54 stories/tasks)
  - Full API/endpoint specifications
  - Data contracts and event taxonomy

### What's Missing ❌
- **No packages/ directory** - CLI code not implemented
- **No Python backend** - AEI Core FastAPI service not started
- **No integration layer** - SBF CLI ↔ AEI Core bridge undefined
- **No prioritization** - Two parallel roadmaps not reconciled

---

## Critical Decision Point

### Option A: Implement SBF CLI First (Incremental)
**Timeline:** 2-3 weeks  
**Effort:** 28-39 hours

**Steps:**
1. Implement SBF CLI as specified (packages/cli/)
2. Create working vault management tools
3. Test with real vaults
4. Then layer AEI backend on top

**Pros:**
- ✅ Delivers working tools quickly
- ✅ Validates SBF architecture with real usage
- ✅ Users can start organizing vaults manually
- ✅ Provides foundation for AEI integration

**Cons:**
- ⚠️ Delays AI-powered features
- ⚠️ Two-phase development cycle

---

### Option B: Build AEI MVP First (All-in)
**Timeline:** 8 weeks (per architecture doc)  
**Effort:** Full-time focus required

**Steps:**
1. Skip standalone CLI implementation
2. Build AEI Core (FastAPI) with EPIC 1 (Vault & File Infrastructure)
3. Include CLI-like functionality as API endpoints
4. Build basic UI for organization queue

**Pros:**
- ✅ Delivers AI-powered experience sooner
- ✅ Single implementation phase
- ✅ Aligns with architecture roadmap Stage 1

**Cons:**
- ⚠️ Longer wait for any working tools
- ⚠️ Higher initial complexity
- ⚠️ No fallback if AI approach needs revision

---

### Option C: Hybrid (Recommended) ⭐
**Timeline:** 4 weeks Phase 1, 6 weeks Phase 2  
**Effort:** Staged approach

**Phase 1 (Week 1-4): Core Infrastructure**
- Implement lightweight vault utilities (init, validate, uid)
- Build Python backend skeleton (FastAPI + file watcher)
- Create basic entity extraction (EPIC 2 subset)
- Test integration between CLI utils and backend

**Phase 2 (Week 5-10): MVP Completion**
- Complete remaining EPIC 1-4 stories
- Build organization queue
- Add retrieval & indexing (EPIC 3)
- Implement audit logging (EPIC 4)

**Pros:**
- ✅ Working tools in 4 weeks
- ✅ Validates integration early
- ✅ Reduces risk of architectural mismatch
- ✅ Provides checkpoints for course correction

**Cons:**
- ⚠️ Requires disciplined scope management
- ⚠️ May need to refactor Phase 1 code

---

## Recommended Path Forward: Option C (Hybrid)

### Week 1: Foundation Setup
**Goal:** Project structure + basic tooling

**Tasks:**
1. Create directory structure
   ```bash
   mkdir -p packages/cli/src/{commands,lib}
   mkdir -p packages/core/{schemas,templates}
   mkdir -p aei-backend/{api,services,models}
   mkdir -p examples/{minimal,standard}
   ```

2. Implement critical CLI utilities
   - `uid-generator.js` - UID generation
   - `validator.js` - YAML frontmatter validation
   - `vault.js` - Basic vault operations

3. Setup Python backend skeleton
   - FastAPI project structure
   - Basic `/healthz` endpoint
   - File watcher stub (Watchdog)

4. Define integration contracts
   - CLI → Backend communication (IPC? HTTP?)
   - Shared schema definitions (TypeScript + Python)

**Acceptance Criteria:**
- ✅ Can generate UIDs from CLI
- ✅ Can validate entity frontmatter
- ✅ Backend server starts and responds to health check
- ✅ CI/CD pipeline runs linting

---

### Week 2: Vault Management + File Watching
**Goal:** Working vault initialization and change detection

**Tasks:**
1. Complete CLI commands
   - `sbf init` - Create vault structure
   - `sbf validate` - Validate all files

2. Implement File Watcher (Backend)
   - Monitor vault directories
   - Debounce rapid changes
   - Emit normalized events

3. Create JSON schemas
   - All 10 entity types
   - Validation rules
   - Example fixtures

4. Test integration
   - CLI creates vault
   - Backend detects file changes
   - Events logged correctly

**Acceptance Criteria:**
- ✅ `sbf init ~/test-vault` creates working structure
- ✅ Backend detects new markdown files within 2 seconds
- ✅ 100% of entity schemas pass validation

---

### Week 3: Entity Extraction (EPIC 2 Subset)
**Goal:** Basic AI-powered entity extraction

**Tasks:**
1. Implement Structured Extractor
   - Prompt templates for entities
   - LiteLLM/LangChain integration
   - Confidence scoring

2. Setup local LLM (Ollama)
   - Install and configure
   - Test with sample notes
   - Measure extraction accuracy

3. Create extraction pipeline
   - File changed → Extract entities → Propose to queue
   - Handle extraction failures gracefully

4. Build organization queue (API only, no UI)
   - `/queue` GET endpoint
   - `/queue/{id}/apply` POST endpoint
   - In-memory queue storage

**Acceptance Criteria:**
- ✅ Extracts person/topic entities from sample notes
- ✅ Confidence scores > 0.8 for clear mentions
- ✅ Queue API returns pending suggestions
- ✅ Can apply suggestion to create entity file

---

### Week 4: Validation & Documentation
**Goal:** Stabilize foundation, document learnings

**Tasks:**
1. Integration testing
   - End-to-end workflows
   - Error handling paths
   - Performance benchmarks

2. Create examples
   - Minimal vault (3 entities)
   - Standard vault (10 entities + relationships)
   - Document extraction results

3. Write integration guide
   - How SBF CLI + AEI work together
   - Configuration options
   - Troubleshooting common issues

4. Checkpoint review
   - What worked vs what didn't
   - Adjust Phase 2 plan based on learnings

**Acceptance Criteria:**
- ✅ All integration tests pass
- ✅ Documentation complete and tested by fresh user
- ✅ Decision made on Phase 2 scope

---

### Week 5-10: MVP Completion (Phase 2)

Based on learnings from Phase 1, complete:

**Priority EPICs (from backlog):**
- EPIC 1: Complete vault templating system
- EPIC 2: Full agent orchestration (Librarian, Researcher, QA)
- EPIC 3: Hybrid retrieval (BM25 + vector)
- EPIC 4: Human-in-the-loop queue with UI

**Deferred to Later:**
- EPIC 5: Sensitivity routing (use simple rules for MVP)
- EPIC 6: MCP tools (start with 2-3 basic tools)
- EPIC 7: Full UI (CLI + basic web UI only)
- EPIC 8: Complete CI/CD (basic tests + GitHub Actions)

---

## Technical Integration Points

### 1. Shared Schema Definitions
**Problem:** TypeScript (CLI) and Python (Backend) need same schemas

**Solution:**
- Define canonical schemas as JSON Schema
- Generate TypeScript types with `json-schema-to-typescript`
- Use Pydantic in Python to validate against same schemas
- Store in `packages/core/schemas/` as source of truth

**Files:**
```
packages/core/schemas/
├── entity.base.schema.json
├── entity.person.schema.json
├── entity.topic.schema.json
... (10 entity types)
```

---

### 2. CLI ↔ Backend Communication
**Problem:** How should CLI tools interact with AEI backend?

**Option A: HTTP API**
- CLI makes REST calls to localhost:8000
- Backend must be running for CLI to work
- Easy to test, well-understood pattern

**Option B: IPC (Inter-Process Communication)**
- CLI spawns backend process
- Faster, no network overhead
- More complex error handling

**Recommendation:** Start with HTTP (Option A)
- Simpler to debug
- Allows backend to be optional (CLI works standalone)
- Can add IPC optimization later if needed

---

### 3. File Storage Strategy
**Problem:** Who owns the vault files?

**Decision:**
- **SBF CLI:** Creates and manages structure
- **AEI Backend:** Read-only access + write through queue
- **User/Obsidian:** Can edit directly, AEI detects changes

**Conflict Resolution:**
1. User edit takes precedence (human override)
2. AEI proposals go to queue for approval
3. Checksums detect unexpected modifications
4. Audit log records all changes

---

### 4. UID Generation Consistency
**Problem:** CLI and Backend must generate same UIDs

**Solution:**
- Use deterministic algorithm: `{type}-{slug}-{counter}`
- Share UID generation logic via common schema
- CLI generates UIDs offline
- Backend validates UIDs on file creation

**Example:**
```
person-john-smith-001
topic-knowledge-management-002
project-second-brain-foundation-001
```

---

## Success Metrics

### Phase 1 (Week 4 Checkpoint)
- ✅ End-to-end workflow: Create vault → Add note → Extract entity → Apply suggestion
- ✅ Entity extraction accuracy > 80% on test dataset
- ✅ File watcher detects changes within 2 seconds
- ✅ Zero data loss (all changes auditable)
- ✅ Developer can onboard in < 30 minutes

### Phase 2 (Week 10 MVP)
- ✅ Organization queue with 5+ suggestion types
- ✅ Hybrid retrieval (BM25 + vector) working
- ✅ Basic web UI for queue approval
- ✅ 3 MCP tools integrated (web.search, files.read, http.get)
- ✅ Complete test coverage (>80%)
- ✅ Documentation site live

---

## Risk Mitigation

### Risk 1: Scope Creep
**Mitigation:**
- Strict MVP definition (EPIC 1-4 only)
- Weekly checkpoints with clear go/no-go criteria
- Defer all "nice-to-have" features to post-MVP

### Risk 2: Integration Complexity
**Mitigation:**
- Build integration layer in Week 1
- Test cross-language schema validation early
- Use battle-tested tools (FastAPI, LangChain)

### Risk 3: LLM Quality Issues
**Mitigation:**
- Confidence thresholds (0.7 = review, 0.9 = auto-apply)
- Fallback to rule-based extraction
- Human-in-the-loop for all entity creation

### Risk 4: Performance at Scale
**Mitigation:**
- Test with 1000+ note vaults early
- Profile file watcher and indexing
- Add rate limiting if needed

---

## Open Questions

### Q1: CLI Distribution Strategy
- Publish to npm as `@sbf/cli`?
- Or bundle with AEI backend as single app?
- **Decision needed:** Week 1

### Q2: Default LLM Provider
- Ollama (local, privacy-first)?
- OpenAI (better quality, requires API key)?
- Both with smart fallback?
- **Decision needed:** Week 2

### Q3: UI Framework
- React (as specified in architecture)?
- Svelte (lighter weight)?
- Plain HTML + htmx (radically simple)?
- **Decision needed:** Week 5

### Q4: Packaging Strategy
- Electron (easier, larger bundle)?
- Tauri (lighter, newer)?
- Web-only MVP (defer desktop)?
- **Decision needed:** Week 8

---

## Next Immediate Actions

### Action 1: Confirm Approach ✅ NEEDED NOW
**Owner:** Derrick (2ndBrainFound)  
**Decision:** Choose Option A, B, or C (Hybrid recommended)  
**Timeline:** Before starting any implementation

### Action 2: Setup Development Environment
**Owner:** Developer  
**Tasks:**
- Install Node 20+, Python 3.11+, Ollama
- Clone repo and create branch `feature/aei-integration`
- Run `node setup.js` to scaffold directories

### Action 3: Week 1 Sprint Planning
**Owner:** PM (or Derrick)  
**Tasks:**
- Break Week 1 tasks into daily chunks
- Assign story points
- Setup daily standup time

---

## Conclusion

The **Hybrid Approach (Option C)** provides the best balance of:
- ✅ **Early Value:** Working CLI tools in 4 weeks
- ✅ **Risk Reduction:** Integration validated early
- ✅ **Flexibility:** Can adjust Phase 2 based on learnings
- ✅ **Momentum:** Checkpoints maintain forward progress

**Recommendation:** Start with Week 1 tasks immediately after confirming approach.

---

*Document created: 2025-11-13*  
*References:*
- `docs/04-implementation/2_bf_aei_developer_architecture_migration_plan_v_1.md`
- `docs/04-implementation/2BF_AEI_MVP_Backlog_Jira.csv`
- `PROJECT-STATUS.md`
- `docs/CLI-SCAFFOLDING-GUIDE.md`
