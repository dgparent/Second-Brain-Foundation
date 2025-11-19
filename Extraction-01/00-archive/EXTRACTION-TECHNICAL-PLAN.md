# Extraction-01 Technical Plan
## Second Brain Foundation - Component Extraction & Refactoring

**Version:** 1.0 (Draft - Awaiting Clarifications)  
**Date:** 2025-11-14  
**Architect:** Winston  
**Status:** ⏳ Awaiting User Input

---

## Executive Summary

This document outlines the **technical approach** for extracting UI/UX components from 26 open-source libraries and refactoring them into a cohesive **Second Brain Foundation MVP application** following the architecture specified in `docs/03-architecture/`.

### Objectives

1. **Extract** reusable components from reference libraries into `Extraction-01/` workspace
2. **Refactor** components to match SBF architecture (graph-based markdown, typed relationships, privacy-first)
3. **Integrate** components into unified React + TypeScript + Electron/Tauri desktop application
4. **Validate** against PRD requirements and architecture specifications
5. **Document** extraction decisions and architectural adaptations

### Scope

**In Scope:**
- P0 MVP Components (Chat, Queue, Editor, Desktop Shell, Entity Management)
- P1 MVP Components (File Browser, Settings, Search)
- Component refactoring to SBF architecture
- Documentation of extraction process

**Out of Scope (for Extraction-01):**
- P2 Post-MVP features (Knowledge Graph visualization)
- Backend AI integration (separate phase)
- Production deployment configuration
- End-to-end testing infrastructure

---

## Critical Questions Requiring Clarification

### 1. MVP Scope Confirmation ⚠️

Based on the PRD and architecture docs, the MVP includes:
- ✅ **AEI Chat Interface** (P0 - Critical)
- ✅ **Organization Queue** (P0 - Critical)
- ✅ **Markdown Editor** (P0 - Critical)
- ✅ **Desktop Shell** (P0 - Critical)
- ✅ **Entity Management** (P0 - Critical)
- ❓ **File Browser** (P1 - Important)
- ❓ **Settings Panel** (P1 - Important)
- ❌ **Knowledge Graph** (P2 - Post-MVP)

**QUESTION 1:** Should Extraction-01 include P0 only (faster, validate core), or P0 + P1 (complete MVP)?

**Recommendation:** Start with **P0 only**, validate, then add P1 in Extraction-02 phase.

---

### 2. Technology Stack Decision ⚠️

**Desktop Framework:**
- **Option A (Recommended):** Electron - Proven, FreedomGPT/jan references, easier debugging
- **Option B:** Tauri - Lighter, more secure, but fewer library examples

**Editor Framework:**
- **Option A (Recommended):** mdx-editor (@mdxeditor/editor npm package) - Production-ready, saves weeks
- **Option B:** Tiptap - More flexible, headless, steeper learning curve

**State Management:**
- **Option A (Recommended):** Zustand - Lightweight, less boilerplate
- **Option B:** Redux Toolkit - More structured, familiar to many devs
- **Option C:** React Context + useReducer - Minimal dependencies

**QUESTION 2:** Confirm tech stack preferences, or proceed with recommendations (Electron + mdx-editor + Zustand)?

---

### 3. Backend Architecture Scope ⚠️

The extraction guide focuses on UI components, but the architecture requires:
- File system operations (read/write markdown files)
- Metadata indexing and search
- Entity extraction logic
- Lifecycle management (48-hour transitions)
- Privacy enforcement

**Backend Options:**
- **Option A:** UI-only extraction, create simple Node.js backend later
- **Option B:** Extract backend from anything-llm (Node.js + Vector DB)
- **Option C:** Extract backend from SurfSense (FastAPI/Python)
- **Option D:** Pure TypeScript custom backend (most control)

**QUESTION 3:** Should Extraction-01 include backend extraction, or focus purely on UI components?

**Recommendation:** **Option A** - Focus on UI first, lightweight Node.js backend in parallel track.

---

### 4. Extraction Approach ⚠️

**Option A - Phased Extraction (Recommended):**
- Week 1-2: P0 components only
- Validate each component works
- Week 3-4: P1 components
- Lower risk, incremental progress

**Option B - Batch Extraction:**
- Extract all P0+P1 components upfront
- Refactor everything together
- Faster if going well, riskier if issues arise

**QUESTION 4:** Phased (safer) or Batch (faster if smooth)?

**Recommendation:** **Phased** - Validate Desktop Shell + Chat first before proceeding.

---

### 5. Monorepo Structure ⚠️

**Option A - Monorepo (Recommended):**
```
Extraction-01/03-integration/sbf-app/
├── packages/
│   ├── core/          # Business logic
│   ├── ui/            # React components
│   └── desktop/       # Electron/Tauri
└── pnpm-workspace.yaml
```
Pros: Shared code, easier imports  
Cons: More complex setup

**Option B - Multi-Repo:**
```
Extraction-01/
├── sbf-core/          # Separate repo
├── sbf-ui/            # Separate repo
└── sbf-desktop/       # Separate repo
```
Pros: Clear boundaries  
Cons: Cross-repo coordination

**QUESTION 5:** Monorepo or multi-repo?

**Recommendation:** **Monorepo** - Easier for extraction phase, can split later if needed.

---

## Proposed Workspace Structure

```
Extraction-01/
├── README.md                          # Workspace overview
├── EXTRACTION-TECHNICAL-PLAN.md      # This document
├── EXTRACTION-LOG.md                 # Daily progress tracking
│
├── 00-analysis/                      # Pre-extraction decisions
│   ├── tech-stack-decisions.md       # Finalized tech choices
│   ├── component-compatibility.md    # Which libs work together
│   ├── architecture-alignment.md     # How to adapt to SBF
│   └── extraction-checklist.md       # Per-component todos
│
├── 01-extracted-raw/                 # Unmodified library code
│   ├── chat-ui/
│   │   ├── text-generation-webui/
│   │   ├── open-webui/
│   │   └── FreedomGPT/
│   ├── editor/
│   │   ├── mdx-editor/
│   │   └── tiptap/
│   ├── desktop-shell/
│   │   └── FreedomGPT/
│   ├── file-browser/
│   │   └── SurfSense/
│   ├── settings/
│   │   └── obsidian-textgenerator/
│   └── queue/
│       └── text-generation-webui/
│
├── 02-refactored/                    # SBF-adapted components
│   ├── sbf-core/                     # Core business logic
│   │   ├── src/
│   │   │   ├── entities/            # Entity management
│   │   │   ├── metadata/            # Frontmatter handling
│   │   │   ├── lifecycle/           # 48h transitions
│   │   │   ├── privacy/             # Sensitivity enforcement
│   │   │   ├── relationships/       # Typed edges
│   │   │   └── types/               # TypeScript definitions
│   │   └── package.json
│   │
│   ├── sbf-ui/                       # React UI components
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── chat/
│   │   │   │   │   ├── ChatContainer.tsx
│   │   │   │   │   ├── MessageList.tsx
│   │   │   │   │   ├── MessageBubble.tsx
│   │   │   │   │   ├── ChatInput.tsx
│   │   │   │   │   └── ConversationSidebar.tsx
│   │   │   │   ├── queue/
│   │   │   │   │   ├── QueueContainer.tsx
│   │   │   │   │   ├── QueueItem.tsx
│   │   │   │   │   └── ApprovalControls.tsx
│   │   │   │   ├── editor/
│   │   │   │   │   ├── MarkdownEditor.tsx
│   │   │   │   │   ├── FrontmatterPanel.tsx
│   │   │   │   │   └── EntityLinker.tsx
│   │   │   │   ├── entities/
│   │   │   │   │   ├── EntityDashboard.tsx
│   │   │   │   │   ├── EntityDetailView.tsx
│   │   │   │   │   └── MetadataPanel.tsx
│   │   │   │   ├── browser/
│   │   │   │   │   ├── FileTree.tsx
│   │   │   │   │   └── FolderNode.tsx
│   │   │   │   ├── settings/
│   │   │   │   │   ├── SettingsPanel.tsx
│   │   │   │   │   └── AIProviderConfig.tsx
│   │   │   │   └── common/
│   │   │   │       ├── Button.tsx
│   │   │   │       ├── Input.tsx
│   │   │   │       ├── Modal.tsx
│   │   │   │       └── SensitivityBadge.tsx
│   │   │   ├── hooks/               # Custom React hooks
│   │   │   ├── contexts/            # React Context providers
│   │   │   ├── utils/               # UI utilities
│   │   │   └── types/               # UI-specific types
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   └── sbf-desktop/                  # Electron/Tauri wrapper
│       ├── src/
│       │   ├── main/
│       │   │   ├── index.ts         # Main process
│       │   │   ├── menu.ts          # App menus
│       │   │   ├── window.ts        # Window management
│       │   │   └── ipc.ts           # IPC handlers
│       │   ├── preload/
│       │   │   └── index.ts         # Preload script
│       │   └── renderer/
│       │       └── index.html       # App entry
│       ├── package.json
│       └── electron-builder.yml     # Build config
│
├── 03-integration/                   # Assembled application
│   └── sbf-app/                      # Monorepo root
│       ├── packages/
│       │   ├── core/                # → sbf-core
│       │   ├── ui/                  # → sbf-ui
│       │   └── desktop/             # → sbf-desktop
│       ├── package.json
│       └── pnpm-workspace.yaml
│
├── 04-documentation/
│   ├── component-catalog.md         # What came from where
│   ├── refactoring-notes.md         # Architecture adaptations
│   ├── tech-decisions.md            # Why we chose X over Y
│   ├── developer-guide.md           # How to work with code
│   └── testing-plan.md              # QA approach
│
└── scripts/
    ├── extract-component.sh         # Copy from library
    ├── setup-workspace.sh           # Initialize folders
    └── validate-structure.sh        # Check completeness
```

---

## Recommended Technology Stack

### Core Stack (Conservative Approach)

| Layer | Technology | Justification |
|-------|-----------|---------------|
| **Desktop** | Electron 28+ | Proven, mature, extensive references (FreedomGPT, jan) |
| **UI** | React 18 + TypeScript 5.3+ | Industry standard, type safety, library compatibility |
| **Editor** | @mdxeditor/editor | Production-ready Lexical wrapper, saves 2-3 weeks |
| **State** | Zustand 4+ | Lightweight, minimal boilerplate, growing adoption |
| **Styling** | Tailwind CSS 3+ | Rapid UI development, utility-first |
| **Build** | Vite 5+ | Fast HMR, modern ESM, good Electron integration |
| **Testing** | Vitest + RTL | Fast, Vite-native, familiar API |
| **Package Manager** | pnpm | Fast, disk-efficient, good monorepo support |

### Backend (Minimal for MVP)

| Layer | Technology | Justification |
|-------|-----------|---------------|
| **Runtime** | Node.js 20+ | Same as Electron, TypeScript compatible |
| **File System** | Node fs + chokidar | Watch markdown files for changes |
| **Parsing** | gray-matter + remark | YAML frontmatter + markdown processing |
| **Search** | fuse.js | Lightweight fuzzy search, no database needed |
| **Validation** | zod | TypeScript schema validation |

---

## Phase-Based Extraction Plan

### Phase 0: Setup & Preparation (2-3 days)

**Objective:** Create workspace and finalize technical decisions

**Tasks:**
1. ✅ Create Extraction-01 folder structure
2. ⏳ Finalize tech stack decisions (answer questions above)
3. ⏳ Document architectural alignment strategy
4. ⏳ Create package.json templates for each package
5. ⏳ Set up development environment (ESLint, Prettier, TypeScript)

**Deliverables:**
- Complete folder structure
- `00-analysis/tech-stack-decisions.md`
- `00-analysis/architecture-alignment.md`
- Empty package scaffolds ready for code

**Estimated Time:** 2-3 days (includes decision making)

---

### Phase 1: P0 Critical Components (10-14 days)

#### Sub-Phase 1A: Desktop Shell (2-3 days)

**Goal:** Working Electron app that opens a window

**Extract From:**
- Primary: `libraries/FreedomGPT/src/main/`
- Reference: `libraries/jan/electron/`

**Components to Create:**
```
sbf-desktop/src/main/
├── index.ts              # App initialization, window creation
├── menu.ts               # Menu bar (File, Edit, View, Help)
├── window.ts             # Window management utilities
└── ipc.ts                # IPC channel setup
```

**Refactoring Tasks:**
- Remove FreedomGPT branding
- Configure SBF-specific IPC channels:
  - `file:read`, `file:write`, `file:watch`
  - `entity:create`, `entity:update`, `entity:delete`
  - `queue:get`, `queue:approve`, `queue:reject`
- Set up proper error handling
- Configure security (contextIsolation, nodeIntegration)

**Success Criteria:**
- [ ] App launches and shows window
- [ ] Menu bar functional
- [ ] IPC channels registered
- [ ] Dev tools accessible
- [ ] Builds successfully

**Estimated Time:** 2-3 days

---

#### Sub-Phase 1B: Chat Interface (4-5 days)

**Goal:** Functional chat UI with message display and input

**Extract From:**
- Visual design: `libraries/text-generation-webui/css/chat.css`
- React patterns: `libraries/open-webui/src/lib/components/chat/` (Svelte → React)
- Simple reference: `libraries/FreedomGPT/src/renderer/components/Chat/`

**Components to Create:**
```
sbf-ui/src/components/chat/
├── ChatContainer.tsx         # Main layout wrapper
├── MessageList.tsx           # Scrollable message area
├── MessageBubble.tsx         # Individual message component
│   ├── UserMessage.tsx       # User message variant
│   └── AIMessage.tsx         # AI response variant
├── ChatInput.tsx             # Input box + send button
├── ConversationSidebar.tsx   # Chat history sidebar
├── StreamingIndicator.tsx    # "AI is typing..." animation
├── MessageActions.tsx        # Copy, regenerate, edit actions
├── EntityMention.tsx         # Inline entity reference chip
└── types.ts                  # Chat-specific types
```

**SBF-Specific Features:**
- Entity mentions: `Talking about [[topic-ml-042]]`
- Privacy indicator: Show sensitivity level of conversation
- Queue integration: "Extract entities" button
- Undo/redo for AI suggestions
- Export conversation to daily note

**Success Criteria:**
- [ ] Messages display in scrollable list
- [ ] User can type and send messages
- [ ] Mock AI responses appear
- [ ] Conversation history sidebar works
- [ ] Entity mentions render as chips
- [ ] Copy/regenerate buttons functional

**Estimated Time:** 4-5 days

---

#### Sub-Phase 1C: Markdown Editor (3-4 days)

**Goal:** Edit markdown files with frontmatter support

**Approach:** Use `@mdxeditor/editor` as npm dependency

**Install:**
```bash
cd sbf-ui
npm install @mdxeditor/editor
```

**Components to Create:**
```
sbf-ui/src/components/editor/
├── MarkdownEditor.tsx        # Wrapper around MDXEditor
├── Toolbar.tsx               # Custom SBF toolbar
├── FrontmatterPanel.tsx      # Edit YAML metadata
├── EntityLinker.tsx          # Autocomplete [[entity-uid]]
├── TemplateSelector.tsx      # Load entity templates
├── SensitivityIndicator.tsx  # Show/edit sensitivity
└── types.ts
```

**SBF-Specific Features:**
- Frontmatter editing panel (collapsible)
- Entity autocomplete when typing `[[`
- Template insertion (Person, Topic, Project, etc.)
- Sensitivity badge (visual indicator)
- Relationship quick-add UI
- Preview mode toggle

**Success Criteria:**
- [ ] Editor renders markdown
- [ ] WYSIWYG editing works (bold, italic, lists)
- [ ] Frontmatter panel displays YAML
- [ ] Entity autocomplete functional
- [ ] Template loading works
- [ ] Save triggers file write

**Estimated Time:** 3-4 days

---

#### Sub-Phase 1D: Organization Queue (3-4 days)

**Goal:** Review and approve AI-suggested changes

**Extract From:**
- Queue patterns: `libraries/text-generation-webui/extensions/`
- Approval UI: `libraries/anything-llm/frontend/src/components/`
- Status indicators: `libraries/SurfSense/frontend/src/components/Processing/`

**Components to Create:**
```
sbf-ui/src/components/queue/
├── QueueContainer.tsx        # Main queue view
├── QueueItem.tsx             # Single pending item card
├── ApprovalControls.tsx      # Approve/Reject/Edit buttons
├── DiffViewer.tsx            # Show before/after changes
├── BatchActions.tsx          # Bulk approve/reject
├── ProgressIndicator.tsx     # Processing status
├── ConfidenceScore.tsx       # Display AI confidence
└── types.ts
```

**SBF-Specific Features:**
- Entity extraction suggestions
- Relationship detection review
- Filing recommendations
- Confidence score display (0.0-1.0)
- Preview changes before applying
- Batch operations (approve all >0.9 confidence)
- Undo approved changes

**Success Criteria:**
- [ ] Queue displays pending items
- [ ] Item cards show details
- [ ] Diff viewer shows changes
- [ ] Approve/reject functional
- [ ] Batch actions work
- [ ] Confidence scores display

**Estimated Time:** 3-4 days

---

#### Sub-Phase 1E: Entity Management (3-4 days)

**Goal:** View and edit entities with metadata

**Extract From:**
- Metadata UI: `libraries/trilium/src/public/app/widgets/attribute_widgets/`
- Entity detail: `libraries/trilium/src/public/app/widgets/note_detail.js`
- Templates: `libraries/foam/packages/foam-vscode/src/features/templates/`

**Components to Create:**
```
sbf-ui/src/components/entities/
├── EntityDashboard.tsx       # Grid/list view of entities
├── EntityDetailView.tsx      # Full entity view
├── MetadataPanel.tsx         # Edit frontmatter
├── RelationshipPanel.tsx     # Manage relationships
├── EntityCreator.tsx         # New entity wizard
├── TemplateSelector.tsx      # Choose template
├── LifecycleIndicator.tsx    # Show lifecycle state
├── SensitivityControls.tsx   # Privacy settings
└── types.ts
```

**SBF-Specific Features:**
- UID-based entity system
- Typed relationship editing (`[informs, target-uid]`)
- BMOM framework fields
- Privacy/sensitivity controls
- Lifecycle state management
- Entity search/filter

**Success Criteria:**
- [ ] Dashboard displays entity grid
- [ ] Detail view shows full entity
- [ ] Metadata editable
- [ ] Relationships add/remove/edit
- [ ] Templates load correctly
- [ ] Lifecycle state updates

**Estimated Time:** 3-4 days

---

### Phase 2: P1 Important Components (6-8 days)

*Details to be added after Phase 1 completion and validation*

**Components:**
1. File Browser (2 days)
2. Settings Panel (2-3 days)
3. Search & Command Palette (2-3 days)

---

### Phase 3: Integration & Refinement (5-7 days)

**Tasks:**
1. Assemble all components into monorepo
2. Set up routing and navigation
3. Implement state management (Zustand stores)
4. Connect Electron IPC to backend
5. End-to-end testing
6. Performance optimization
7. Documentation

---

## Refactoring Guidelines

### SBF Architecture Alignment

Every extracted component must be adapted to SBF architecture:

#### 1. UID System
All entity references use UID format:
```typescript
// Generic library (before)
const note = { id: '123', title: 'AI' }

// SBF (after)
const entity: Entity = {
  uid: 'topic-ai-042',
  type: 'topic',
  title: 'AI',
  // ... universal parameters
}
```

#### 2. Privacy-Aware UI
All components respect sensitivity:
```tsx
// Display privacy indicator
<SensitivityBadge 
  level={entity.sensitivity.level}
  cloudAI={entity.sensitivity.privacy.cloud_ai_allowed}
  localAI={entity.sensitivity.privacy.local_ai_allowed}
/>

// Conditional feature access
{entity.sensitivity.privacy.cloud_ai_allowed && (
  <CloudAIButton />
)}
```

#### 3. Typed Relationships
Relationships use semantic edges:
```typescript
interface Relationship {
  type: RelationType; // 'informs' | 'uses' | 'authored_by' | ...
  target: UID;        // 'project-ai-research-001'
}

// UI component
<RelationshipEditor
  relationships={entity.rel}
  onAdd={(type, target) => addRelationship(type, target)}
  onRemove={(index) => removeRelationship(index)}
/>
```

#### 4. Lifecycle Management
All entities have lifecycle state:
```typescript
interface Lifecycle {
  state: 'capture' | 'transitional' | 'permanent' | 'archived';
  review_at?: string; // ISO8601
  dissolve_at?: string; // For daily notes
}

// UI component
<LifecycleIndicator
  state={entity.lifecycle.state}
  reviewAt={entity.lifecycle.review_at}
  onStateChange={(newState) => updateLifecycle(newState)}
/>
```

#### 5. BMOM Framework
Support BMOM fields:
```typescript
interface BMOM {
  because: string;  // Why this matters
  meaning: string;  // What it represents
  outcome: string;  // Expected result
  measure: string;  // Success criteria
}

// UI component
<BMOMPanel
  bmom={entity.bmom}
  onUpdate={(field, value) => updateBMOM(field, value)}
/>
```

---

## Extraction Workflow

For each component:

### Step 1: Analyze Source
- Identify relevant files in library
- Screenshot UI for reference
- Document dependencies
- Note tech stack differences

### Step 2: Extract Raw
- Copy files to `01-extracted-raw/`
- Preserve original structure
- Document source library and path

### Step 3: Refactor
- Rewrite in SBF tech stack (React + TS)
- Adapt to SBF architecture (UIDs, privacy, etc.)
- Remove library-specific code
- Add SBF-specific features
- Place in `02-refactored/`

### Step 4: Test
- Unit tests for logic
- Visual tests for UI
- Integration tests with mock data
- Document test coverage

### Step 5: Document
- Update `04-documentation/component-catalog.md`
- Note refactoring decisions
- Document known issues / tech debt

---

## Development Standards

### Code Quality

**TypeScript:**
- Strict mode enabled
- No `any` types (use `unknown` if truly unknown)
- Proper interface/type definitions
- JSDoc comments for public APIs

**React:**
- Functional components only
- Custom hooks for logic reuse
- Props interfaces exported
- No prop drilling (use Context/Zustand)

**Testing:**
- Unit tests for business logic
- Component tests with RTL
- Integration tests for workflows
- Minimum 70% coverage

**Styling:**
- Tailwind for utilities
- CSS Modules for complex components
- Consistent spacing (4px, 8px, 16px, 24px, 32px)
- Dark mode as default, light mode support

### Git Workflow

**Branch Strategy:**
```
main                    # Stable, integrated code
├── extraction/desktop  # Desktop shell extraction
├── extraction/chat     # Chat interface extraction
├── extraction/editor   # Editor extraction
└── extraction/queue    # Queue extraction
```

**Commit Convention:**
```
extract(chat): add MessageBubble component from open-webui
refactor(chat): adapt MessageBubble to SBF UID system
test(chat): add MessageBubble component tests
docs(chat): document MessageBubble props and usage
```

---

## Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Library incompatibilities | High | Medium | Prototype integration early, choose flexible libs |
| Tech stack mismatch (Svelte→React) | Medium | High | Budget extra time for translation |
| Scope creep | High | High | Stick to P0, document P1+ for later |
| Architecture misalignment | High | Medium | Review SBF arch before each refactor |
| Performance issues | Medium | Low | Profile early, optimize critical paths |
| Timeline overrun | Medium | Medium | Phased approach allows early adjustment |

---

## Success Metrics

**Phase 1 Success:**
- [ ] Desktop app launches
- [ ] Chat UI displays and accepts input
- [ ] Editor loads and edits markdown
- [ ] Queue shows and approves items
- [ ] Entities create and display
- [ ] All components use SBF types (UID, privacy, etc.)

**Overall Extraction Success:**
- [ ] All P0 components extracted and functional
- [ ] 100% TypeScript (no JS files)
- [ ] 70%+ test coverage
- [ ] Documentation complete
- [ ] Demo-able to stakeholders
- [ ] Ready for backend integration

---

## Timeline Estimate

| Phase | Duration | Calendar Days |
|-------|----------|---------------|
| **Phase 0:** Setup | 2-3 days | Days 1-3 |
| **Phase 1A:** Desktop Shell | 2-3 days | Days 4-6 |
| **Phase 1B:** Chat Interface | 4-5 days | Days 7-11 |
| **Phase 1C:** Markdown Editor | 3-4 days | Days 12-15 |
| **Phase 1D:** Organization Queue | 3-4 days | Days 16-19 |
| **Phase 1E:** Entity Management | 3-4 days | Days 20-23 |
| **Phase 2:** P1 Components | 6-8 days | Days 24-31 |
| **Phase 3:** Integration | 5-7 days | Days 32-38 |
| **TOTAL** | **28-38 days** | **5-7 weeks** |

**Optimistic:** 4 weeks (aggressive, requires few blockers)  
**Realistic:** 5-6 weeks (includes normal issues and rework)  
**Pessimistic:** 7-8 weeks (significant technical challenges)

---

## Next Steps - REQUIRES USER INPUT ⚠️

### Immediate Actions Needed:

**Please answer these 5 critical questions:**

1. **Scope:** P0 only, or P0 + P1 in Extraction-01?
2. **Desktop:** Electron (recommended) or Tauri?
3. **Editor:** mdx-editor (recommended) or Tiptap?
4. **Backend:** UI-only extraction, or include backend layer?
5. **Approach:** Phased extraction (recommended) or batch extraction?

### Once Decisions Confirmed:

1. Create complete folder structure
2. Set up package scaffolds
3. Document tech stack in `00-analysis/`
4. Begin Phase 0 (Workspace Setup)
5. Proceed with Phase 1A (Desktop Shell)

---

**Prepared By:** Winston (Architect)  
**Framework:** Second Brain Foundation v2.0  
**Reference Docs:**
- `docs/02-product/prd.md`
- `docs/03-architecture/architecture-v2-enhanced.md`
- `docs/03-architecture/frontend-spec.md`
- `libraries/EXTRACTION-GUIDE.md`
- `libraries/README.md`

**Status:** ⏳ **Awaiting User Clarifications**  
**Ready to Execute:** Once 5 critical questions answered
