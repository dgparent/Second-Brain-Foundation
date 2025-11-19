# Backend Extraction Analysis

**Date:** 2025-11-14  
**Analyst:** Winston (Architect)  
**Status:** Analysis Complete - Recommendation Provided

---

## Executive Summary

Analyzed backend capabilities across libraries to determine optimal backend extraction strategy for Second Brain Foundation MVP.

**Recommendation:** **Hybrid Approach** - Extract file system operations from anything-llm, build custom TypeScript backend for SBF-specific features.

---

## Backend Requirements (from Architecture)

Based on `docs/03-architecture/architecture-v2-enhanced.md`, the backend must support:

### Core Operations
1. **File System Management**
   - Read/write markdown files with YAML frontmatter
   - Watch file changes (file system monitoring)
   - Folder structure enforcement (Daily/, People/, Places/, etc.)

2. **Metadata Management**
   - Parse YAML frontmatter (gray-matter)
   - Validate entity schemas (zod validation)
   - Generate UIDs (`{type}-{slug}-{counter}`)
   - Checksum calculation (SHA-256)

3. **Lifecycle Management**
   - 48-hour daily note transitions (capture → transitional)
   - `dissolve_at` timestamp enforcement
   - Human override tracking (`override.prevent_dissolve`)

4. **Privacy Enforcement**
   - Sensitivity level checking
   - Permission enforcement (cloud_ai_allowed, local_ai_allowed)
   - Audit trail for access

5. **Entity Operations**
   - Entity creation with templates
   - Relationship management (typed edges)
   - BMOM framework support
   - Provenance tracking

6. **Search & Indexing**
   - Full-text search across markdown
   - Entity lookup by UID
   - Relationship traversal
   - Tag-based queries

---

## Library Backend Analysis

### 1. anything-llm (Node.js Backend) ✅ EXCELLENT MATCH

**Path:** `libraries/anything-llm/server/`

**Technology Stack:**
- Node.js + Express
- Prisma ORM (SQLite/PostgreSQL)
- Vector DB integration (ChromaDB, Pinecone, etc.)
- Document processing pipeline

**Relevant Capabilities:**
```
server/
├── endpoints/          # REST API endpoints
│   ├── document.js     # Document CRUD operations
│   ├── workspace.js    # Workspace management
│   └── system.js       # System settings
├── models/             # Data models
│   ├── documents.js    # Document metadata
│   └── workspace.js    # Workspace structure
├── utils/
│   ├── files/          # File system operations ⭐
│   ├── vectorDb/       # Vector database (optional for SBF)
│   └── tokenizer.js    # Text processing
└── prisma/
    └── schema.prisma   # Database schema
```

**What to Extract:**
- ✅ File system operations (`utils/files/`)
- ✅ Document metadata handling
- ✅ Workspace folder structure patterns
- ✅ API endpoint structure
- ❌ Vector DB (not needed for MVP)
- ❌ Embedding generation (Phase 2)

**Adaptation Required:**
- Replace Prisma models with markdown frontmatter
- Adapt workspace → vault concepts
- Add UID generation logic
- Add lifecycle management
- Add privacy enforcement

**Extraction Effort:** Medium (3-5 days)

---

### 2. SurfSense (FastAPI Backend) ❌ PYTHON - SKIP

**Path:** `libraries/SurfSense/` - **NO backend/ folder found**

**Technology Stack:**
- FastAPI (Python)
- Vector DB (appears to be backend-heavy)
- RAG implementation

**Decision:** Skip - Python backend doesn't align with TypeScript stack, and no clear backend folder found.

---

### 3. text-generation-webui (Python Backend) ❌ PYTHON - SKIP

**Path:** `libraries/text-generation-webui/`

**Technology Stack:**
- Python (Gradio framework)
- Model loading and inference
- Extension system

**Relevant Capabilities:**
- Extension system architecture (interesting patterns)
- Model management
- Session handling

**Decision:** Skip for backend - Python-based, too tightly coupled to LLM inference. Extract UI patterns only.

---

## Recommended Backend Strategy

### Hybrid Approach: Extract + Custom Build

**Phase 1: Extract File Operations from anything-llm (Week 1)**

Extract and adapt:
```
anything-llm/server/utils/files/
├── documentProcessor.js    → Adapt to markdown processor
├── documentsLoader.js      → Adapt to entity loader
└── fileSystem.js           → Adapt to vault file system

anything-llm/server/models/
├── documents.js            → Adapt to entity.ts (TypeScript)
└── workspace.js            → Adapt to vault.ts
```

**Phase 2: Build Custom SBF Backend (Week 2-3)**

Create custom TypeScript backend:
```
sbf-core/src/
├── filesystem/
│   ├── vault.ts            # Vault file operations
│   ├── watcher.ts          # File change monitoring (chokidar)
│   └── structure.ts        # Folder structure enforcement
├── entities/
│   ├── entity-manager.ts   # Entity CRUD
│   ├── uid-generator.ts    # UID creation logic
│   ├── template-loader.ts  # Load entity templates
│   └── validator.ts        # Schema validation (zod)
├── metadata/
│   ├── frontmatter.ts      # YAML parsing (gray-matter)
│   ├── checksum.ts         # SHA-256 integrity
│   └── parser.ts           # Markdown parsing (remark)
├── lifecycle/
│   ├── lifecycle-engine.ts # 48-hour transitions
│   ├── scheduler.ts        # Cron-like scheduling
│   └── override.ts         # Human override logic
├── privacy/
│   ├── privacy-controller.ts # Permission enforcement
│   ├── sensitivity.ts      # Level checking
│   └── audit.ts            # Access logging
├── relationships/
│   ├── graph.ts            # Typed relationship graph
│   ├── traversal.ts        # Relationship queries
│   └── validator.ts        # Relationship type checking
├── search/
│   ├── indexer.ts          # Search index (fuse.js)
│   ├── query.ts            # Search API
│   └── filters.ts          # Search filters
└── types/
    ├── entity.ts           # Entity TypeScript types
    ├── vault.ts            # Vault types
    └── relationship.ts     # Relationship types
```

---

## Technology Stack (Backend)

| Layer | Technology | Justification |
|-------|-----------|---------------|
| **Runtime** | Node.js 20+ | Same as Electron, TypeScript compatible |
| **Language** | TypeScript 5.3+ | Type safety, unified with frontend |
| **File System** | Node.js `fs` + `chokidar` | Native file ops + change watching |
| **Frontmatter** | `gray-matter` | Industry standard YAML parser |
| **Markdown** | `remark` + `remark-parse` | Extensible markdown processing |
| **Validation** | `zod` | TypeScript schema validation |
| **Search** | `fuse.js` | Lightweight fuzzy search |
| **Scheduling** | `node-cron` | Lifecycle scheduling (48-hour transitions) |
| **Hashing** | `crypto` (native Node.js) | SHA-256 checksums |
| **Logging** | `winston` or `pino` | Structured logging |

**Optional (Phase 2):**
- Vector DB: ChromaDB or Pinecone (if AI features needed)
- Database: SQLite via better-sqlite3 (if metadata caching needed)

---

## Extraction Plan

### Week 1: Backend Foundation

**Day 1-2: Extract anything-llm File Operations**
- Copy `server/utils/files/` to `01-extracted-raw/backend/anything-llm/`
- Document file operations and patterns
- Identify reusable code vs. SBF-specific needs

**Day 3-4: Create sbf-core Package Scaffold**
- Set up TypeScript project
- Install core dependencies (gray-matter, chokidar, zod, fuse.js)
- Create folder structure
- Define core types (`types/entity.ts`, `types/vault.ts`)

**Day 5: Implement File System Layer**
- `filesystem/vault.ts` - Read/write markdown files
- `filesystem/watcher.ts` - Monitor file changes
- `filesystem/structure.ts` - Enforce folder structure

### Week 2: Core Backend Logic

**Day 6-7: Metadata Management**
- `metadata/frontmatter.ts` - Parse YAML
- `metadata/checksum.ts` - Calculate SHA-256
- `metadata/parser.ts` - Markdown parsing

**Day 8-9: Entity Management**
- `entities/entity-manager.ts` - CRUD operations
- `entities/uid-generator.ts` - UID generation (`{type}-{slug}-{counter}`)
- `entities/template-loader.ts` - Load templates from `templates/` folder

**Day 10: Validation**
- `entities/validator.ts` - Zod schemas for each entity type
- Validate frontmatter against schemas

### Week 3: Advanced Features

**Day 11-12: Lifecycle Management**
- `lifecycle/lifecycle-engine.ts` - State transitions
- `lifecycle/scheduler.ts` - 48-hour automation
- `lifecycle/override.ts` - Human override handling

**Day 13-14: Privacy & Relationships**
- `privacy/privacy-controller.ts` - Permission enforcement
- `relationships/graph.ts` - Typed edge management

**Day 15: Search & Integration**
- `search/indexer.ts` - Build search index
- Integration with Electron IPC

---

## Decision Matrix

| Option | Pros | Cons | Effort | Recommendation |
|--------|------|------|--------|----------------|
| **A: UI-Only** | Faster UI development | Backend built from scratch later | Low (0 weeks) | ❌ Delays backend |
| **B: Extract anything-llm** | Node.js, good file ops | Prisma dependency, heavy refactor | High (2-3 weeks) | ⚠️ Too heavy |
| **C: Extract SurfSense** | Good RAG patterns | Python, no backend folder | N/A | ❌ Wrong stack |
| **D: Custom TypeScript** | Full control, SBF-aligned | Build from scratch | Medium (2-3 weeks) | ⚠️ Time-intensive |
| **E: Hybrid (Extract + Custom)** | Best of both worlds | Requires coordination | Medium (2-3 weeks) | ✅ **RECOMMENDED** |

---

## Final Recommendation

### Hybrid Approach (Option E)

**Extract file system patterns from anything-llm** (saves 1 week) + **Build custom TypeScript backend** (full SBF alignment).

**Timeline:**
- Week 1: Extract anything-llm file ops + scaffold sbf-core
- Week 2: Implement core backend (metadata, entities, validation)
- Week 3: Lifecycle, privacy, search

**Total:** 2-3 weeks (in parallel with UI extraction)

**Backend Scope:**
```yaml
extract:
  - File system operations (anything-llm)
  - Document processing patterns (anything-llm)
  - API endpoint structure (anything-llm)

custom_build:
  - UID generation logic
  - Entity template system
  - Lifecycle management (48-hour)
  - Privacy enforcement
  - Typed relationships
  - BMOM framework support
  - Zod validation schemas
  - Search indexing (fuse.js)
```

---

## Integration with UI Extraction

Backend development can happen **in parallel** with UI extraction:

| Timeline | UI Track | Backend Track |
|----------|----------|---------------|
| **Week 1** | Desktop Shell + Chat UI | Extract anything-llm + scaffold sbf-core |
| **Week 2** | Markdown Editor + Queue | Core backend (metadata, entities) |
| **Week 3** | Entity Management | Lifecycle + Privacy + Search |
| **Week 4** | P1 Components | Integration with Electron IPC |
| **Week 5-6** | Integration & Testing | Testing & Documentation |

**No blocking dependencies** - UI can use mock data until backend ready.

---

## Success Criteria

**Backend Complete When:**
- [ ] Vault can be initialized (create folder structure)
- [ ] Markdown files can be read/written with frontmatter
- [ ] UIDs generated correctly (`{type}-{slug}-{counter}`)
- [ ] Entity templates loaded and validated
- [ ] 48-hour lifecycle transitions working
- [ ] Privacy permissions enforced
- [ ] Relationships stored and traversed
- [ ] Search returns correct results
- [ ] Electron IPC integration functional

---

## Next Steps

1. ✅ Decision recorded: **Hybrid Approach (Extract anything-llm + Custom TypeScript Backend)**
2. ⏳ Begin Phase 0: Extract anything-llm file operations
3. ⏳ Set up sbf-core package scaffold
4. ⏳ Implement core backend in parallel with UI extraction

---

**Prepared By:** Winston (Architect)  
**Decision:** Hybrid Backend Strategy (Extract + Custom)  
**Timeline:** 2-3 weeks (parallel with UI)  
**Status:** ✅ Ready to Proceed
