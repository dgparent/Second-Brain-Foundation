# Second Brain Foundation - Monorepo

**Version:** 0.1.0 (MVP Development)  
**Architecture:** Electron + React + TypeScript  
**Package Manager:** pnpm  
**Status:** 🔨 Phase 0 - Foundation Setup

---

## 📦 Packages

### @sbf/core
**Path:** `packages/core/`  
**Description:** Core backend logic for Second Brain Foundation

**Modules:**
- `filesystem/` - Vault file operations
- `entities/` - Entity CRUD management
- `metadata/` - Frontmatter parsing
- `lifecycle/` - 48-hour lifecycle management
- `privacy/` - Sensitivity enforcement
- `relationships/` - Typed graph management
- `search/` - fuse.js indexing
- **`agent/`** - Letta-inspired agentic AI system ⭐
  - `memory/` - Core, Archival, Recall memory
  - `tools/` - Entity extraction, filing, relationships
  - `learning/` - Auto-learning from feedback
  - `llm/` - LLM integration (local + cloud)

### @sbf/ui
**Path:** `packages/ui/`  
**Description:** React UI components

**Components:**
- `chat/` - AEI Chat Interface
- `queue/` - Organization Queue
- `editor/` - Markdown Editor
- `entities/` - Entity Management
- `browser/` - File Browser
- `settings/` - Settings Panel
- `search/` - Search & Command Palette
- **`agent/`** - Agent status and memory viewer ⭐

### @sbf/desktop
**Path:** `packages/desktop/`  
**Description:** Electron desktop application

**Structure:**
- `src/main/` - Electron main process
- `src/preload/` - Preload script (IPC bridge)
- `src/renderer/` - Application entry point

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- pnpm 8+

### Installation

```bash
# Install dependencies for all packages
pnpm install

# Install dependencies for specific package
pnpm --filter @sbf/core install
```

### Development

```bash
# Run all packages in dev mode
pnpm dev

# Run specific package
pnpm --filter @sbf/desktop dev

# Build all packages
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint

# Format code
pnpm format
```

---

## 📁 Project Structure

```
sbf-app/
├── packages/
│   ├── core/              # @sbf/core
│   │   ├── src/
│   │   │   ├── agent/     # Agentic AI system
│   │   │   ├── filesystem/
│   │   │   ├── entities/
│   │   │   └── ...
│   │   └── package.json
│   │
│   ├── ui/                # @sbf/ui
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── ...
│   │   └── package.json
│   │
│   └── desktop/           # @sbf/desktop
│       ├── src/
│       │   ├── main/
│       │   ├── preload/
│       │   └── renderer/
│       └── package.json
│
├── package.json           # Root package.json
├── pnpm-workspace.yaml    # pnpm workspaces config
├── tsconfig.json          # Root TypeScript config
├── .eslintrc.js           # ESLint config
├── .prettierrc            # Prettier config
└── .gitignore
```

---

## 🛠️ Technology Stack

### Frontend
- **Desktop:** Electron 28+
- **UI:** React 18 + TypeScript 5.3+
- **Editor:** @mdxeditor/editor
- **State:** Zustand 4+
- **Styling:** Tailwind CSS 3+
- **Build:** Vite 5+

### Backend (TypeScript-Only)
- **Runtime:** Node.js 20+
- **Language:** TypeScript 5.3+
- **Agent Framework:** Custom (Letta-inspired)
- **File System:** Node.js fs + chokidar
- **Frontmatter:** gray-matter
- **Validation:** zod
- **Search:** fuse.js

### Development
- **Package Manager:** pnpm 8+
- **Linting:** ESLint
- **Formatting:** Prettier
- **Testing:** Vitest + RTL
- **Git Hooks:** husky + lint-staged

---

## 📖 Documentation

- **Architecture:** `../../docs/03-architecture/`
- **PRD:** `../../docs/02-product/prd.md`
- **Extraction Plan:** `../../EXTRACTION-TECHNICAL-PLAN.md`
- **Letta Integration:** `../../00-analysis/letta-typescript-refactoring-strategy.md`

---

## 🧪 Development Status

**Phase 0:** Foundation Setup ✅
- [x] Monorepo structure created
- [x] Package scaffolds created
- [x] TypeScript configs set up
- [x] Development tooling configured
- [x] Agent framework foundation laid
- [ ] Letta analysis (waiting for clone)
- [ ] Backend extraction start

**Next:** Phase 1 - Component Extraction

---

## 🤝 Contributing

This is a monorepo managed by pnpm workspaces. When adding new features:

1. Work in the appropriate package (`core`, `ui`, or `desktop`)
2. Follow TypeScript strict mode
3. Add tests for new functionality
4. Run `pnpm lint` and `pnpm format` before committing
5. Follow conventional commit messages

---

## 📄 License

MIT

---

**Prepared By:** Winston (Architect)  
**Date:** 2025-11-14  
**Phase:** 0 - Foundation Setup
