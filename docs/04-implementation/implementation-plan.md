# Option B: AEI MVP Implementation Plan
**Full AI-Powered Experience from Day 1**

**Date:** 2025-11-13  
**Timeline:** 8 weeks  
**Approach:** Build complete AEI Core with integrated CLI functionality  
**Status:** ✅ APPROVED - Ready to begin

---

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [8-Week Sprint Breakdown](#8-week-sprint-breakdown)
  - [Week 1: Foundation & Infrastructure](#week-1-foundation--infrastructure-epic-1-start)
  - [Week 2: File Watching & Entity Extraction](#week-2-file-watching--entity-extraction-epic-1-complete-epic-2-start)
  - [Week 3: Organization Queue & Agent Orchestrator](#week-3-organization-queue--agent-orchestrator-epic-2-complete-epic-4-start)
  - [Week 4: Retrieval & Indexing](#week-4-retrieval--indexing-epic-3-complete)
  - [Week 5: Frontend Development](#week-5-frontend-development-epic-5-start)
  - [Week 6: Privacy & Audit](#week-6-privacy--audit-epic-4-complete-epic-5-start)
  - [Week 7: Tooling & Desktop App](#week-7-tooling--desktop-app-epic-6-start-epic-7-complete)
  - [Week 8: Testing, Polish & Launch Prep](#week-8-testing-polish--launch-prep-epic-8)
- [Success Criteria](#success-criteria)
- [Risk Mitigation](#risk-mitigation)
- [Team Roles](#team-roles)
- [Key Files Reference](#key-files-reference)

---

## Overview

Skip standalone CLI implementation and build the complete AEI MVP as specified in the architecture document. All 8 EPICs from the backlog, focused on delivering a working AI-augmented knowledge management system.

---

## Project Structure

```
SecondBrainFoundation/
├── aei-core/                    # Python FastAPI Backend
│   ├── api/                     # REST/WebSocket endpoints
│   ├── agents/                  # Librarian, Researcher, QA
│   ├── services/                # Business logic
│   │   ├── watcher.py          # File watcher
│   │   ├── extractor.py        # Entity extraction
│   │   ├── indexer.py          # Embeddings & vector DB
│   │   ├── retriever.py        # Hybrid search
│   │   ├── orchestrator.py     # Agent coordination
│   │   └── queue.py            # Approval queue
│   ├── flows/                   # Prefect workflows (optional)
│   │   ├── lifecycle.py        # 48hr lifecycle flow
│   │   ├── extraction.py       # Entity extraction flow
│   │   └── maintenance.py      # Relationship maintenance
│   ├── webhooks/                # Webhook handlers (n8n integration)
│   ├── models/                  # Pydantic schemas
│   ├── db/                      # Database migrations
│   ├── tests/                   # Pytest suite
│   └── main.py                  # FastAPI app
├── aei-ui/                      # React Frontend
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Chat, Queue, Graph, Settings
│   │   ├── hooks/              # Custom hooks
│   │   └── lib/                # API client, utils
│   └── package.json
├── vault/                       # Default vault structure
│   ├── Daily/
│   ├── People/
│   ├── Places/
│   ├── Topics/
│   ├── Projects/
│   └── Transitional/
├── templates/                   # Entity templates (existing)
├── docs/                        # Documentation (existing)
└── scripts/                     # Setup & deployment scripts
```

---

## 8-Week Sprint Breakdown

### Week 1: Foundation & Infrastructure (EPIC 1 Start)
**Goal:** Project setup, vault infrastructure, basic API skeleton

**Tasks:**
1. **Project Setup** (Day 1-2)
   - Create directory structure
   - Setup Python virtual environment
   - Initialize FastAPI project with poetry/pip
   - Setup React project with Vite
   - Configure ESLint, Prettier, Black, mypy
   - Initialize Git branch: `feature/aei-mvp`

2. **Database & Schema Design** (Day 2-3)
   - Choose DB: SQLite (dev) → PostgreSQL (prod)
   - Create Pydantic models for all 10 entity types
   - Design queue table schema
   - Design audit log schema
   - Setup Alembic migrations

3. **Vault Infrastructure** (Day 3-4)
   - Implement vault initialization
   - Create folder structure generator
   - Generate entity templates from existing `/templates/`
   - UID generator module (deterministic)
   - YAML frontmatter validator

4. **API Skeleton** (Day 4-5)
   - FastAPI app with CORS, error handling
   - Health check endpoints (`/healthz`, `/readyz`)
   - Basic routing structure for all endpoints
   - WebSocket connection handler (stub)
   - API documentation (automatic via FastAPI)

**Deliverables:**
- ✅ FastAPI server starts on localhost:8000
- ✅ Can initialize vault structure via API
- ✅ Database migrations run successfully
- ✅ React dev server runs on localhost:5173
- ✅ Swagger docs accessible at /docs

---

### Week 2: File Watching & Entity Extraction (EPIC 1 Complete, EPIC 2 Start)
**Goal:** Real-time vault monitoring and entity extraction

**Tasks:**
1. **File Watcher** (Day 1-2)
   - Integrate Watchdog library
   - Monitor vault directories (Daily, People, etc.)
   - Debounce rapid changes (500ms window)
   - Emit normalized events to event bus
   - Handle file create/modify/delete/move

2. **Structured Extractor** (Day 2-4)
   - Design prompt templates for entity extraction
   - Integrate LiteLLM for provider abstraction
   - Implement confidence scoring (0.0-1.0)
   - Extract entities: Person, Topic, Project, Place
   - Extract relationships with typed links
   - Schema validation on extraction output

3. **Provider Router (Basic)** (Day 4-5)
   - Implement local-first routing logic
   - Integrate Ollama for local LLMs
   - Fallback to cloud (OpenAI) if configured
   - Model selection based on task type
   - Token usage tracking

**Deliverables:**
- ✅ File changes detected within 2 seconds
- ✅ Entity extraction from daily notes works
- ✅ Confidence scores calculated correctly
- ✅ Can use both Ollama and OpenAI
- ✅ Events logged to database

---

### Week 3: Organization Queue & Agent Orchestrator (EPIC 2 Complete, EPIC 4 Start)
**Goal:** Human-in-the-loop approvals and agent coordination

**Tasks:**
1. **Organization Queue** (Day 1-3)
   - Queue CRUD API endpoints
   - Suggestion types: entity.create, entity.update, relation.add
   - Diff generation (before/after preview)
   - Apply/reject/defer actions
   - Undo mechanism with rollback
   - Queue persistence to database

2. **Agent Orchestrator** (Day 3-5)
   - LangGraph integration for agent workflows
   - Implement Librarian agent (organization)
   - Implement Researcher agent (information gathering)
   - Implement QA agent (quality checks)
   - Agent state management
   - Retry logic and error handling

**Deliverables:**
- ✅ GET /queue returns pending suggestions
- ✅ POST /queue/{id}/apply creates entity files
- ✅ Diff preview shows exact changes
- ✅ Librarian agent extracts entities from notes
- ✅ Orchestrator coordinates multi-agent tasks

---

### Week 4: Retrieval & Indexing (EPIC 3 Complete)
**Goal:** Hybrid search and semantic retrieval

**Tasks:**
1. **Vector Database** (Day 1-2)
   - Integrate ChromaDB (embedded mode)
   - Create collections: notes, entities
   - Implement embedding generation (OpenAI/local)
   - Upsert operations on file changes
   - Collection management (create/delete/rebuild)

2. **Keyword Search** (Day 2-3)
   - Integrate Tantivy for BM25 search
   - Index markdown content and metadata
   - Build search query parser
   - Implement filters (type, sensitivity, date range)

3. **Hybrid Retriever** (Day 3-4)
   - Combine vector + keyword results
   - Reciprocal rank fusion (RRF)
   - Implement local re-ranker (bge-small)
   - Top-k selection with diversity
   - Metadata enrichment on results

4. **Rebuild Command** (Day 4-5)
   - CLI command to reindex entire vault
   - Progress tracking and logging
   - Batch processing for large vaults
   - Validation of index integrity

**Deliverables:**
- ✅ POST /ask returns RAG responses with citations
- ✅ Hybrid search outperforms vector-only by 15%+
- ✅ Re-ranker improves top-3 precision
- ✅ Rebuild completes 1000 notes in < 5 minutes
- ✅ Vector DB persists correctly

---

### Week 5: Frontend UI (EPIC 7 Start)
**Goal:** Basic React UI for chat, queue, and graph

**Tasks:**
1. **UI Setup & Layout** (Day 1)
   - Setup Tailwind CSS
   - Create app shell with navigation
   - Dark mode theme
   - Responsive layout

2. **Chat View** (Day 1-2)
   - Message input component
   - Streaming response handler
   - Citation display
   - Conversation history
   - WebSocket integration

3. **Queue View** (Day 2-3)
   - Suggestion card components
   - Diff viewer (syntax highlighted)
   - Approve/Reject buttons
   - Filters (type, confidence, date)
   - Pagination

4. **Graph View** (Day 4)
   - D3.js force-directed graph
   - Node types with icons
   - Edge types with colors
   - Click to view details
   - Zoom and pan

5. **Settings View** (Day 5)
   - Vault path configuration
   - LLM provider settings
   - Privacy/sensitivity rules
   - API key management

**Deliverables:**
- ✅ Chat interface sends queries and displays responses
- ✅ Queue view shows pending suggestions with diffs
- ✅ Graph view renders entity relationships
- ✅ Settings persist to config file
- ✅ UI responsive on desktop

---

### Week 6: Privacy & Audit (EPIC 4 Complete, EPIC 5 Start)
**Goal:** Sensitivity controls and audit logging

**Tasks:**
1. **Sensitivity Rules** (Day 1-2)
   - Parse sensitivity field from frontmatter
   - Implement no-cloud policy enforcement
   - Sensitivity inheritance (file → entity)
   - Warning UI for violations
   - Override mechanism with justification

2. **Provider Router (Enhanced)** (Day 2-3)
   - Full routing policy engine
   - Sensitivity-based model selection
   - Cost/latency heuristics
   - Rate limiting per provider
   - Fallback chains

3. **Audit Logger** (Day 3-4)
   - Immutable audit trail to database
   - Log all AI actions (extract, suggest, apply)
   - Log user approvals/rejections
   - Redact sensitive data in logs
   - Provenance tracking (who, what, when, why)

4. **Audit API & UI** (Day 4-5)
   - GET /audit endpoint with filters
   - Audit viewer component in UI
   - Timeline visualization
   - Export audit logs (JSON/CSV)

**Deliverables:**
- ✅ Confidential notes never sent to cloud
- ✅ Provider router respects sensitivity settings
- ✅ All AI actions logged with timestamps
- ✅ Audit view shows complete history
- ✅ No secrets in audit logs (verified)

---

### Week 7: Tooling & Desktop App (EPIC 6 Start, EPIC 7 Complete)
**Goal:** MCP tools and desktop packaging

**Tasks:**
1. **MCP Tool Integration** (Day 1-2)
   - Design tool registry schema
   - Implement 3 basic tools:
     - `web.search` (SerpAPI/DuckDuckGo)
     - `files.read` (local file access)
     - `http.get` (REST API calls)
   - Tool invocation from agents
   - Error handling and timeouts

2. **Automation Layer** (Day 2-3)
   - Implement APScheduler (embedded) for MVP
   - Core workflows:
     - 48-hour lifecycle check (runs every 6 hours)
     - Daily backup to git
     - Weekly statistics generation
   - Optional: Prefect integration (for observability)
   - Optional: n8n plugin support (webhook endpoints)
   - Example webhook workflows:
     - entity.created → Slack notification
     - low_confidence → Manual review
     - stale_48h → Trigger lifecycle flow
   - Event schema documentation

3. **Desktop App** (Day 3-5)
   - Choose: Electron vs Tauri (recommend Tauri)
   - Package backend + frontend together
   - Auto-start FastAPI on app launch
   - System tray integration
   - Auto-update mechanism (basic)
   - Installer for Windows/Mac/Linux

**Deliverables:**
- ✅ Agents can call web.search and get results
- ✅ APScheduler runs lifecycle checks every 6 hours
- ✅ Webhook endpoints ready for optional n8n plugin
- ✅ Desktop app runs on Windows/Mac
- ✅ Backend starts automatically with UI
- ✅ Installable packages (.exe, .dmg, .AppImage)

---

### Week 8: Testing, Polish & Launch Prep (EPIC 8)
**Goal:** Production-ready MVP

**Tasks:**
1. **Testing** (Day 1-3)
   - Unit tests: 80%+ coverage (pytest)
   - Integration tests: End-to-end workflows
   - Performance tests: 1000+ note vaults
   - UI tests: Critical user flows (Playwright)
   - Regression tests: Entity extraction accuracy

2. **CI/CD** (Day 3-4)
   - GitHub Actions workflow
   - Automated testing on PR
   - Build desktop artifacts
   - Release automation
   - Docker image (optional)

3. **Documentation** (Day 4-5)
   - Installation guide (all platforms)
   - Configuration reference
   - API documentation
   - Troubleshooting guide
   - Video walkthrough (5 min)

4. **Polish & Bug Fixes** (Day 5)
   - Address high-priority bugs
   - Performance optimizations
   - UX improvements from feedback
   - Accessibility fixes (WCAG basics)

**Deliverables:**
- ✅ All tests pass on CI
- ✅ Installation tested on clean machines
- ✅ Documentation complete and accurate
- ✅ No critical bugs remaining
- ✅ Ready for public beta release

---

## Technology Stack (Final)

### Backend (Python 3.11+)
- **Framework:** FastAPI (async, type hints, auto docs)
- **Database:** SQLite (dev) / PostgreSQL (prod)
- **ORM:** SQLAlchemy + Alembic migrations
- **LLM:** LiteLLM (unified interface)
- **Agents:** LangGraph (agent orchestration)
- **Vector DB:** ChromaDB (embedded)
- **Keyword Search:** Tantivy (Rust-based, Python bindings)
- **File Watching:** Watchdog
- **Task Queue:** asyncio (in-process for MVP)
- **Testing:** pytest, pytest-asyncio

### Frontend (React 18+)
- **Build Tool:** Vite
- **Language:** TypeScript
- **State:** Zustand (lightweight)
- **Server State:** TanStack Query
- **Styling:** Tailwind CSS
- **Graph Viz:** D3.js
- **WebSocket:** native WebSocket API
- **Testing:** Vitest, Playwright

### Desktop (Tauri 2.0)
- **Reason:** Lighter than Electron, Rust-based
- **Bundle Size:** ~10MB (vs 200MB+ for Electron)
- **Auto-update:** Built-in updater
- **Installers:** MSI (Windows), DMG (Mac), AppImage (Linux)

### Local LLMs (Ollama)
- **Models:** llama2, mistral, codellama
- **Embeddings:** nomic-embed-text
- **Re-ranker:** bge-reranker-base (local)

### Cloud LLMs (Optional)
- **OpenAI:** GPT-4o for complex reasoning
- **Anthropic:** Claude 3.5 Sonnet (via LiteLLM)

---

## Key Implementation Decisions

### 1. Database Choice: PostgreSQL (with pgvector)
**Rationale:**
- Single database for relational + vector data
- Better than ChromaDB for production scale
- Familiar SQL interface
- Excellent Python support

**Migration Path:**
- Week 1: SQLite for rapid iteration
- Week 4: Add pgvector extension option
- Post-MVP: Default to PostgreSQL

---

### 2. Agent Framework: LangGraph (not LangChain Agents)
**Rationale:**
- More explicit control flow
- Better debugging and observability
- Easier to test deterministically
- Aligns with architecture recommendation

---

### 3. Desktop: Tauri (not Electron)
**Rationale:**
- 95% smaller bundle size
- Better performance (Rust core)
- More secure by default
- Growing ecosystem

**Trade-off:**
- Slightly newer, less mature
- Requires Rust toolchain for development

---

### 4. Frontend: Server-Sent Events (SSE) instead of WebSocket
**Revised Decision:**
- SSE for token streaming (simpler)
- WebSocket for bidirectional events
- Fallback to polling if needed

---

### 5. Testing Strategy: Pyramid Model
- **Many:** Unit tests (80%+ coverage)
- **Some:** Integration tests (critical paths)
- **Few:** E2E tests (happy path only)
- **Minimal:** Manual QA (UI polish)

---

## Success Metrics (Week 8 Targets)

### Functionality
- ✅ Entity extraction accuracy > 80% on test dataset (100 notes)
- ✅ Relationship detection recall > 70%
- ✅ File watcher latency < 2 seconds (p95)
- ✅ RAG response time < 5 seconds with citations
- ✅ Queue approval workflow < 10 clicks end-to-end

### Performance
- ✅ Handles 1000-note vault without slowdown
- ✅ Initial indexing: 100 notes/minute
- ✅ Memory usage < 500MB (backend)
- ✅ Desktop app startup < 5 seconds

### Quality
- ✅ Zero data loss scenarios (all changes auditable)
- ✅ No crashes during 8-hour usage session
- ✅ Passes accessibility scan (aXe)
- ✅ Works offline (local LLM mode)

### Usability
- ✅ Fresh install to first query < 10 minutes
- ✅ Developer can contribute in < 30 minutes
- ✅ Documentation rated 4+/5 by beta testers

---

## Risk Management

### Risk 1: LLM Quality/Cost
**Impact:** High  
**Probability:** Medium

**Mitigation:**
- Confidence thresholds (require human review for < 0.8)
- Local models as default (no API costs)
- Prompt engineering iteration cycles
- Fallback to rule-based extraction

---

### Risk 2: Desktop Packaging Complexity
**Impact:** Medium  
**Probability:** Medium

**Mitigation:**
- Prototype Tauri in Week 1 (validate early)
- Use official Tauri templates
- Test on all platforms weekly
- Have Electron as fallback plan

---

### Risk 3: Scope Creep
**Impact:** High  
**Probability:** High

**Mitigation:**
- Strict Epic 1-8 scope (no extras)
- Daily standup to identify scope drift
- "Defer to v2" tag for nice-to-haves
- Weekly checkpoint reviews

---

### Risk 4: Performance at Scale
**Impact:** Medium  
**Probability:** Low

**Mitigation:**
- Test with 1000-note vault from Week 4
- Profile regularly (py-spy, React DevTools)
- Implement pagination/lazy-loading early
- Add performance tests to CI

---

## Daily Standup Format

**What did I complete yesterday?**
**What will I work on today?**
**Any blockers?**
**Scope risks?** (anything not in Epic 1-8)

---

## Week-End Checkpoint Format

**Completed:**
**Deferred:**
**Blockers:**
**Next week priorities:**
**Scope adjustment needed?** (yes/no + rationale)

---

## Definition of Done (DoD)

✅ Code passes all tests (unit + integration)
✅ Code reviewed (self-review minimum)
✅ Documentation updated (if public API changed)
✅ No console errors/warnings
✅ Tested on 2+ platforms (if UI change)
✅ Meets acceptance criteria from Epic backlog

---

## Immediate Next Steps (TODAY)

### Step 1: Environment Setup (30 min)
```bash
# Install dependencies
python --version  # Verify 3.11+
node --version    # Verify 20+

# Install Ollama (local LLM)
# Windows: Download from ollama.ai
# Mac: brew install ollama
# Linux: curl -sSL https://ollama.ai/install.sh | sh

# Pull models
ollama pull llama2
ollama pull nomic-embed-text

# Clone and branch
cd C:\!Projects\SecondBrainFoundation
git checkout -b feature/aei-mvp
```

### Step 2: Project Scaffolding (1 hour)
```bash
# Backend setup
mkdir -p aei-core/{api,agents,services,models,db,tests}
cd aei-core
python -m venv venv
.\venv\Scripts\activate  # Windows
pip install fastapi uvicorn sqlalchemy alembic chromadb langchain langraph litellm watchdog pydantic pytest

# Frontend setup
cd ..
npm create vite@latest aei-ui -- --template react-ts
cd aei-ui
npm install zustand @tanstack/react-query tailwindcss d3 axios

# Initialize configs
# (I'll generate these files next)
```

### Step 3: Create Foundational Files (2 hours)
I'll create:
- `aei-core/main.py` (FastAPI app)
- `aei-core/models/entity.py` (Pydantic schemas)
- `aei-core/api/vault.py` (vault endpoints)
- `aei-ui/src/App.tsx` (React shell)
- `docker-compose.yml` (optional dev services)
- `.github/workflows/ci.yml` (GitHub Actions)

---

## Questions Before We Begin

1. **LLM Provider:** Start with Ollama only, or add OpenAI from Week 1?
   - Recommend: Ollama only (can add OpenAI Week 2)

2. **Database:** SQLite for all 8 weeks, or switch to PostgreSQL in Week 4?
   - Recommend: SQLite until Week 4, then migrate

3. **Desktop Priority:** Must ship desktop in Week 8, or can be web-only MVP?
   - Recommend: Desktop in Week 7-8 (critical for local-first promise)

4. **UI Framework:** React confirmed, or open to Svelte/solid?
   - Recommend: Stick with React (team familiarity)

---

## Ready to Start?

Reply **"START"** and I'll immediately:
1. Create directory structure
2. Generate initial Python files (FastAPI skeleton)
3. Setup React project
4. Create Week 1 Day 1 task checklist

Let's build this! 🚀
