# Extraction-01 Integration Folder

**Path:** `Extraction-01/03-integration/`  
**Status:** 🟢 Active Development Area  
**Primary Project:** sbf-app (Second Brain Foundation Monorepo)

---

## Overview

This folder contains the **active integration** of extracted code patterns into a production-ready monorepo. All development work happens here.

**Key Project:** `sbf-app/` - Full TypeScript monorepo with Electron desktop app

---

## Contents

### sbf-app/ (Active Monorepo)
**Status:** Phase 1 Complete (Agent Foundation Ready)  
**Files:** ~19,256  
**Packages:** 4 (core, ui, desktop, server)

See detailed documentation: [sbf-app/README.md](sbf-app/README.md)

---

## Quick Start

```bash
cd 03-integration/sbf-app/
pnpm install
pnpm dev
```

Full development guide: [sbf-app/README.md](sbf-app/README.md)

---

## Integration Status

### Completed ✅
- ✅ Monorepo structure (pnpm workspaces)
- ✅ Core backend modules (@sbf/core)
- ✅ Vault filesystem operations
- ✅ Entity management system
- ✅ Electron desktop shell
- ✅ React UI components
- ✅ Agent foundation (Letta-inspired)
- ✅ LLM integration (multi-provider)
- ✅ File watcher system

### In Progress ⏳
- ⏳ Tool system (Phase 2)
- ⏳ Settings panel (Phase 4)
- ⏳ Documentation polish (Phase 4)

### Planned 🔴
- 🔴 Graph visualization (Cytoscape)
- 🔴 Vector search
- 🔴 module system
- 🔴 Desktop packaging

---

## Architecture

The sbf-app follows a clean architecture with strict separation:

```
03-integration/sbf-app/
├── packages/
│   ├── core/      TypeScript backend logic
│   ├── ui/        React components
│   ├── desktop/   Electron application
│   └── server/    API server (future)
└── Documentation  See sbf-app/README.md
```

---

## Source Integration Map

Code extracted from these libraries has been integrated into sbf-app:

| Library | Extracted To | Integration Status |
|---------|--------------|-------------------|
| Letta | core/agent/ | 60% (Phase 1 complete) |
| AnythingLLM | core/agent/llm/, core/watcher/ | 50% |
| Open-WebUI | ui/components/chat/ | 40% |
| Chokidar | core/watcher/ | 100% |
| react-markdown | ui/components/ | 100% |

Full extraction report: [../README.md](../README.md)

---

## Development Workflow

### 1. Make Changes
Work in the appropriate package directory:
- Backend logic → `packages/core/`
- UI components → `packages/ui/`
- Desktop app → `packages/desktop/`

### 2. Test Locally
```bash
pnpm --filter @sbf/core test    # Test specific package
pnpm test                        # Test all packages
```

### 3. Run in Dev Mode
```bash
pnpm dev                         # All packages
pnpm --filter @sbf/desktop dev   # Desktop app only
```

### 4. Build for Production
```bash
pnpm build
```

---

## Package Overview

### @sbf/core (Backend)
- **Purpose:** Core business logic, filesystem, entities, agent
- **Key Modules:** agent, filesystem, entities, watcher
- **LOC:** ~2,800
- **Status:** 80% complete

### @sbf/ui (Frontend)
- **Purpose:** React UI components
- **Key Components:** Chat, Queue, Entities, Editor
- **LOC:** ~1,600
- **Status:** 60% complete

### @sbf/desktop (Application)
- **Purpose:** Electron desktop application shell
- **Key Parts:** Main process, Preload, IPC
- **LOC:** ~900
- **Status:** 60% complete

### @sbf/server (API - Future)
- **Purpose:** HTTP API server for future web version
- **LOC:** ~200
- **Status:** Stub only

---

## Documentation Links

- **Main README:** [sbf-app/README.md](sbf-app/README.md)
- **Architecture:** [../../docs/03-architecture/](../../docs/03-architecture/)
- **Development Guide:** [../DEVELOPMENT.md](../DEVELOPMENT.md)
- **Agent Guide:** [../AGENT-QUICKSTART.md](../AGENT-QUICKSTART.md)
- **Status:** [../STATUS.md](../STATUS.md)

---

## Known Issues

None currently blocking. See [../STATUS.md](../STATUS.md) for roadmap.

---

## Contributing

This is the active development folder. To contribute:

1. Read [sbf-app/README.md](sbf-app/README.md) for setup
2. Follow TypeScript strict mode
3. Add tests for new features
4. Run linting before commits
5. Use conventional commit messages

---

**Created:** 2025-11-19  
**Maintained By:** Development Team  
**Status:** Active Development ✅
