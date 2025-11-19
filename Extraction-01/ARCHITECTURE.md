# Second Brain Foundation - Technical Architecture

**Version:** 2.0 (Extraction-01 Implementation)  
**Last Updated:** 2025-11-14  
**Status:** Active Development  
**Based On:** SBF Architecture v2.0 Enhanced (`docs/03-architecture/architecture-v2-enhanced.md`)

---

## 📐 Architecture Overview

Second Brain Foundation (SBF) is built as a **local-first, privacy-aware, AI-assisted knowledge management system** with a unique **48-hour progressive organization lifecycle**.

### Core Design Principles

1. **Progressive Organization** - Zero-decision capture → AI-assisted filing → permanent storage
2. **Privacy-First** - Local storage, granular privacy controls, optional cloud sync
3. **Graph-Based Knowledge** - Entities connected through typed semantic relationships
4. **Human Override Supremacy** - User decisions always override AI suggestions
5. **Security by Design** - Path validation, atomic operations, sandboxed execution

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Desktop Application (Electron)            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐  IPC  ┌───────────────────────────┐   │
│  │   Renderer      │◄─────►│   Main Process            │   │
│  │   (React UI)    │       │   (@sbf/core)             │   │
│  └─────────────────┘       │                           │   │
│         │                   │  ┌─────────────────────┐  │   │
│         │                   │  │  Vault              │  │   │
│         │                   │  │  (Filesystem)       │  │   │
│         │                   │  └─────────────────────┘  │   │
│         │                   │  ┌─────────────────────┐  │   │
│         │                   │  │  EntityFileManager  │  │   │
│         │                   │  │  (Entity CRUD)      │  │   │
│         │                   │  └─────────────────────┘  │   │
│         │                   │  ┌─────────────────────┐  │   │
│         │                   │  │  Agent              │  │   │
│         │                   │  │  (AI Assistant)     │  │   │
│         │                   │  └─────────────────────┘  │   │
│         │                   │  ┌─────────────────────┐  │   │
│         │                   │  │  Graph              │  │   │
│         │                   │  │  (Relationships)    │  │   │
│         │                   │  └─────────────────────┘  │   │
│         │                   └───────────────────────────┘   │
│         │                                                    │
│         └──────────────────┬─────────────────────────────┘  │
│                            │                                │
│                    ┌───────▼────────┐                       │
│                    │  Local Vault   │                       │
│                    │  (Markdown)    │                       │
│                    └────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Module Structure (Monorepo)

### Package Organization

```
sbf-app/
├── packages/
│   ├── core/              # @sbf/core - Business logic
│   ├── desktop/           # @sbf/desktop - Electron shell
│   └── ui/                # @sbf/ui - Shared UI components
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.json
```

### Package Dependencies

```
@sbf/desktop
    ├── electron (runtime)
    ├── @sbf/core (business logic)
    └── @sbf/ui (shared components)

@sbf/core
    ├── gray-matter (frontmatter parsing)
    └── crypto (checksums)

@sbf/ui
    └── react (components)
```

---

## 🔧 Core Module: @sbf/core

### Filesystem - Vault Operations

**Purpose:** Secure markdown file operations with atomic writes and frontmatter parsing

**Class Hierarchy:**
```typescript
VaultCore (72 LOC)
  ↓ extends
VaultFiles (114 LOC)
  ↓ extends
Vault (92 LOC)
```

**Responsibilities:**

| Class | Responsibility | Key Methods |
|-------|---------------|-------------|
| `VaultCore` | Path validation, security, initialization | `normalizePath()`, `validatePath()` |
| `VaultFiles` | CRUD operations on files | `readFile()`, `writeFile()`, `deleteFile()` |
| `Vault` | High-level operations, frontmatter | `listFiles()`, `updateFrontmatter()`, `createFolder()` |

**Security Features:**
- ✅ Directory traversal protection
- ✅ Path normalization (consistent separators)
- ✅ Atomic writes (temp file → rename)
- ✅ SHA-256 checksums for integrity
- ✅ Error handling with clear messages

**Example Usage:**
```typescript
import { Vault } from '@sbf/core/filesystem';

const vault = new Vault('/path/to/vault');
await vault.initialize();

// Read file with frontmatter
const { content, frontmatter } = await vault.readFile('Core/topic-ml-042.md');

// Write file with frontmatter
await vault.writeFile('Capture/daily-2025-11-14.md', content, frontmatter);

// Update frontmatter only
await vault.updateFrontmatter('Core/topic-ml-042.md', { status: 'reviewed' });
```

---

### Entities - Entity Management

**Purpose:** CRUD operations for SBF entities with lifecycle management

**Implementation:**
- Single class: `EntityFileManager` (277 LOC)
- Uses Vault for filesystem operations
- Manages UID generation and folder organization

**Entity Folder Structure:**
```
vault/
├── Capture/          # Transitional items (48h lifecycle)
│   └── daily-notes/  # Daily capture files
├── Core/             # Permanent atomic notes
├── Knowledge/        # Topics, sources, learning
├── Projects/         # Active and archived projects
├── People/           # Person entities
└── Places/           # Location entities
```

**UID Pattern:**
```
Format: {type}-{slug}-{counter}

Examples:
  topic-machine-learning-042
  project-website-redesign-003
  person-john-doe-001
  place-home-office-001
  daily-2025-11-14
```

**Key Features:**
- ✅ Auto-generated unique IDs
- ✅ Slug generation from titles (URL-friendly)
- ✅ Counter auto-increment per type
- ✅ Default lifecycle states
- ✅ Default privacy settings
- ✅ Frontmatter integration

**Example Usage:**
```typescript
import { EntityFileManager } from '@sbf/core/entities';

const em = new EntityFileManager(vault);

// Create entity
const uid = await em.createEntity('topic', {
  title: 'Machine Learning Fundamentals',
  content: '# ML Basics\n\n...',
  tags: ['ai', 'learning']
});
// Returns: 'topic-machine-learning-042'

// Read entity
const entity = await em.readEntity('topic-machine-learning-042');

// Update entity
await em.updateEntity('topic-machine-learning-042', {
  content: 'Updated content...',
  tags: ['ai', 'ml', 'deep-learning']
});

// List entities by type
const topics = await em.listEntities('topic');

// Delete entity
await em.deleteEntity('topic-machine-learning-042');
```

---

### Agent - AI Assistant (Pending Letta Integration)

**Purpose:** AI-powered entity extraction, filing suggestions, and learning

**Status:** 🔴 **Interface defined, implementation pending**

**Design (Letta-based):**
```typescript
interface SBFAgent {
  // Core agent loop
  step(input: string): Promise<AgentResponse>;
  
  // Entity extraction
  extractEntities(text: string): Promise<ExtractedEntity[]>;
  
  // Filing suggestions
  suggestFiling(entity: Entity): Promise<FilingSuggestion[]>;
  
  // Learning from feedback
  learnFromApproval(suggestion: FilingSuggestion): Promise<void>;
  learnFromRejection(suggestion: FilingSuggestion, reason: string): Promise<void>;
  
  // Memory management
  memory: MemoryManager;
  
  // Tool registry
  tools: ToolRegistry;
}
```

**Integration Points:**
1. **Chat Interface** → Agent.step()
2. **Entity Extraction** → Agent.extractEntities()
3. **Organization Queue** → Agent.suggestFiling()
4. **User Feedback** → Agent.learnFrom*()

**Next Steps:**
1. Clone and analyze Letta
2. Map Letta patterns to SBF needs
3. Implement agent core loop
4. Add memory management
5. Build tool registry
6. Connect to UI

---

### Relationships - Graph (Phase 1.5)

**Purpose:** Manage typed semantic relationships between entities

**Status:** ⏳ **Interface defined, implementation deferred**

**Design:**
```typescript
interface Graph {
  // Add relationship
  addRelationship(fromUID: string, type: RelationType, toUID: string): Promise<void>;
  
  // Get relationships
  getRelationships(uid: string, filter?: RelationType): Promise<Relationship[]>;
  
  // Remove relationship
  removeRelationship(fromUID: string, type: RelationType, toUID: string): Promise<void>;
  
  // Traverse graph
  traverse(startUID: string, maxDepth: number): Promise<GraphNode[]>;
  
  // Backlinks
  getBacklinks(uid: string): Promise<Relationship[]>;
}
```

**Relationship Types (SBF v2.0):**
```yaml
# Semantic relationships
rel:
  - [informs, topic-uid-123]       # This informs that
  - [uses, process-uid-456]         # This uses that
  - [authored_by, person-uid-789]   # Authored by
  - [depends_on, project-uid-012]   # Dependency
  - [related_to, topic-uid-345]     # Generic relation
  - [refutes, topic-uid-678]        # Contradicts
  - [supports, topic-uid-901]       # Supports claim
```

**Implementation Source:** Foam graph patterns (`01-extracted-raw/entities/foam-core/`)

---

## 🖥️ Desktop Module: @sbf/desktop

### Main Process (Electron)

**Purpose:** Application lifecycle, IPC handlers, system integration

**Key Responsibilities:**
- ✅ Window creation & management
- ✅ IPC handler registration
- ✅ File system dialogs
- ✅ Menu bar integration
- ✅ App lifecycle events
- ✅ Security configuration

**Security Configuration:**
```typescript
const windowOptions = {
  webPreferences: {
    contextIsolation: true,      // ✅ Required
    sandbox: true,                // ✅ Required
    nodeIntegration: false,       // ✅ Required
    preload: path.join(__dirname, 'preload.js')
  }
};
```

**IPC Handlers:**
```typescript
// All handlers delegate to core modules
ipcMain.handle('vault:init', async (_event, vaultPath) => {
  return await vault.initialize(vaultPath);
});

ipcMain.handle('vault:read-file', async (_event, filePath) => {
  return await vault.readFile(filePath);
});

ipcMain.handle('entity:create', async (_event, type, data) => {
  return await entityManager.createEntity(type, data);
});

// ... etc
```

---

### Preload Script

**Purpose:** Secure bridge between renderer and main process

**Pattern:**
```typescript
import { contextBridge, ipcRenderer } from 'electron';

// Expose minimal, typed API
contextBridge.exposeInMainWorld('api', {
  vault: {
    init: (path: string) => ipcRenderer.invoke('vault:init', path),
    readFile: (path: string) => ipcRenderer.invoke('vault:read-file', path),
    // ... etc
  },
  entity: {
    create: (type, data) => ipcRenderer.invoke('entity:create', type, data),
    // ... etc
  }
});
```

**Security:**
- ✅ No direct Node.js access in renderer
- ✅ Typed API surface (TypeScript)
- ✅ Minimal exposure (only what's needed)
- ✅ IPC validation in handlers

---

### Renderer (React UI)

**Purpose:** User interface with modern React patterns

**Structure:**
```
renderer/
├── App.tsx                    # Main app component
├── components/
│   ├── Sidebar.tsx            # Navigation
│   └── StatusBar.tsx          # Status display
├── views/
│   ├── ChatView.tsx           # AI chat interface
│   ├── EntitiesView.tsx       # Entity management
│   ├── GraphView.tsx          # Relationship visualization
│   ├── QueueView.tsx          # Organization queue
│   └── SettingsView.tsx       # App settings
├── types/
│   └── electron.d.ts          # Window API types
└── main.tsx                   # Entry point
```

**View Routing:**
```typescript
const views = {
  chat: <ChatView />,
  entities: <EntitiesView />,
  graph: <GraphView />,
  queue: <QueueView />,
  settings: <SettingsView />
};

// Keyboard shortcuts
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey) {
      if (e.key === '1') setView('chat');
      if (e.key === '2') setView('entities');
      // ... etc
    }
  };
  window.addEventListener('keydown', handleKeyDown);
}, []);
```

---

## 🎨 UI Module: @sbf/ui

**Purpose:** Shared React components across desktop and future web

**Status:** ⏳ **Minimal components, expanding as needed**

**Planned Components:**
- EntityCard
- GraphVisualization
- MarkdownEditor
- SearchBar
- TagInput
- etc.

---

## 🔐 Security Architecture

### Threat Model

**Threats Mitigated:**
1. ✅ **Directory Traversal** - Path validation prevents access outside vault
2. ✅ **Code Injection** - contextIsolation prevents renderer script injection
3. ✅ **Data Tampering** - SHA-256 checksums detect file modifications
4. ✅ **Concurrent Writes** - Atomic operations prevent corruption

**Threats Not Yet Mitigated:**
- ⚠️ **Vault Encryption** - Files stored in plain text (planned for Phase 2)
- ⚠️ **Network Attacks** - No network features yet
- ⚠️ **Plugin Security** - No plugin system yet

### Security Patterns

**1. Path Validation (Vault)**
```typescript
private normalizePath(filepath: string): string {
  const normalized = path.normalize(filepath);
  if (normalized.includes('..')) {
    throw new Error('Path traversal detected');
  }
  return normalized;
}
```

**2. Atomic Writes**
```typescript
async writeFile(filepath: string, content: string): Promise<void> {
  const tempPath = `${filepath}.tmp`;
  await fs.writeFile(tempPath, content, 'utf8');
  await fs.rename(tempPath, filepath); // Atomic operation
}
```

**3. Electron Security**
```typescript
// Main process
const win = new BrowserWindow({
  webPreferences: {
    contextIsolation: true,    // Prevent window.require()
    sandbox: true,              // Limit system access
    nodeIntegration: false,     // No Node.js in renderer
    preload: preloadPath        // Controlled API only
  }
});
```

---

## 📊 Data Architecture

### Entity Schema (YAML Frontmatter)

**Core Fields:**
```yaml
---
# Identity
uid: topic-machine-learning-042
type: topic
title: Machine Learning Fundamentals
aliases: [ML, ML Basics]

# Lifecycle
status: permanent          # capture | transitional | permanent
state: active              # active | archived | dissolved
lifecycle_created: 2025-11-14T10:00:00Z
lifecycle_captured: 2025-11-14T10:00:00Z
lifecycle_filed: 2025-11-14T12:00:00Z

# Privacy
sensitivity:
  level: personal          # public | personal | private | sensitive
  privacy:
    cloud_ai_allowed: false
    local_ai_allowed: true
    export_allowed: true

# Metadata
tags: [ai, learning, fundamentals]
created: 2025-11-14T10:00:00Z
modified: 2025-11-14T12:30:00Z

# Relationships (Graph)
rel:
  - [informs, project-ai-chatbot-001]
  - [uses, process-ml-training-001]
  - [authored_by, person-me-001]

# Provenance
source:
  type: book
  title: "Deep Learning"
  author: "Goodfellow et al."
  confidence: 0.95
---

# Content starts here
...markdown content...
```

---

## 🔄 Data Flow

### 1. Capture Flow
```
User Types in Chat
    ↓
Daily Note Created (Capture/daily-notes/)
    ↓
Content Stored with Minimal Metadata
    ↓
48-Hour Timer Starts
```

### 2. Organization Flow
```
Agent Analyzes Capture Content
    ↓
Extract Entities (topics, projects, people, etc.)
    ↓
Suggest Filing (with confidence scores)
    ↓
Show in Organization Queue
    ↓
User Approves/Rejects/Modifies
    ↓
Move to Permanent Location
    ↓
Update Relationships (Graph)
    ↓
Agent Learns from Decision
```

### 3. Query Flow
```
User Searches/Browses
    ↓
Query Vault (filesystem scan)
    ↓
Traverse Graph (relationships)
    ↓
Return Results (sorted by relevance)
    ↓
Display in UI
```

---

## 🧩 Extension Points

### 1. Tool Registry (Agent)
```typescript
interface Tool {
  name: string;
  description: string;
  parameters: ToolParameter[];
  execute: (params: any) => Promise<any>;
}

// Example tools
tools.register({
  name: 'create_entity',
  description: 'Create a new entity in the vault',
  parameters: [/* ... */],
  execute: async (params) => {
    return await entityManager.createEntity(params.type, params.data);
  }
});
```

### 2. Custom Entity Types
```yaml
# Configuration (future)
entity_types:
  - name: recipe
    uid_pattern: recipe-{slug}-{counter}
    folder: Knowledge/Recipes
    default_status: permanent
    fields:
      - name: servings
        type: number
      - name: cook_time
        type: string
```

### 3. Relationship Types
```yaml
# Configuration (future)
relationship_types:
  - name: implements
    description: "This implements that design"
    inverse: implemented_by
    bidirectional: true
```

---

## 📈 Performance Considerations

### File System Performance
- **Strategy:** Recursive scanning with caching
- **Optimization:** Incremental indexing (Phase 2)
- **Limitation:** ~10,000 files before noticeable slowdown

### Memory Management
- **Agent Context:** Limited to last N messages (configurable)
- **Graph Traversal:** Max depth limit to prevent cycles
- **File Caching:** LRU cache for frequently accessed files (planned)

### UI Responsiveness
- **IPC Latency:** <10ms for local operations
- **Render Batching:** React concurrent features
- **Virtual Scrolling:** For large entity lists (planned)

---

## 🚀 Deployment Architecture

### Development
```
pnpm run dev
    ↓
Vite Dev Server (renderer)
    +
Electron (main + preload)
    +
TypeScript Watch Mode
```

### Production Build
```
pnpm run build
    ↓
TypeScript Compilation (all packages)
    ↓
Electron Builder
    ↓
Platform-Specific Installer (.dmg, .exe, .AppImage)
```

### Distribution (Future)
- **Auto-Updates:** Electron-builder auto-updater
- **Code Signing:** Apple Developer ID / Windows Certificate
- **Release Channels:** Stable / Beta / Nightly

---

## 🧪 Testing Strategy

### Unit Tests (Jest)
```
Core Logic:
  ✅ VaultCore (path validation)
  ✅ VaultFiles (file operations)
  ✅ Vault (high-level operations)
  ✅ EntityFileManager (CRUD)
  ⏳ Agent (after implementation)
  ⏳ Graph (after implementation)
```

### Integration Tests
```
IPC Communication:
  ⏳ Main ↔ Renderer messaging
  ⏳ Error handling
  ⏳ State synchronization
```

### End-to-End Tests (Playwright for Electron)
```
User Workflows:
  ⏳ Create entity via chat
  ⏳ Approve filing suggestion
  ⏳ Search and navigate graph
  ⏳ Export vault
```

---

## 📚 Technology Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Desktop Runtime** | Electron 27+ | Cross-platform desktop app |
| **Backend Language** | TypeScript (Node.js) | Type-safe business logic |
| **UI Framework** | React 18 | Component-based UI |
| **Build Tool** | Vite | Fast dev server & bundling |
| **Package Manager** | pnpm | Monorepo management |
| **Markdown Parser** | gray-matter | YAML frontmatter parsing |
| **Testing** | Jest (planned) | Unit & integration tests |
| **E2E Testing** | Playwright (planned) | End-to-end workflows |
| **Linting** | ESLint + Prettier | Code quality |
| **Type Checking** | TypeScript strict mode | Compile-time safety |

---

## 🔮 Future Architecture Considerations

### Phase 2 Features
- **Search Index** - Full-text search with ranking
- **Vault Encryption** - AES-256 encryption at rest
- **Plugin System** - Custom tools and entity types
- **Cloud Sync** - Optional encrypted sync to cloud

### Phase 3 Features
- **Multi-Vault** - Manage multiple vaults simultaneously
- **Collaboration** - Shared vaults with permissions
- **Mobile App** - React Native companion app
- **Web Portal** - Read-only web access

---

**Document Version:** 1.0  
**Architecture Version:** 2.0 (SBF Enhanced)  
**Implementation Status:** Phase 1 Complete (80% Core, 60% UI, 0% AI)  
**Next Milestone:** Letta Integration (Agent Implementation)

**Maintained By:** Winston (Architect Agent)  
**Last Review:** 2025-11-14
