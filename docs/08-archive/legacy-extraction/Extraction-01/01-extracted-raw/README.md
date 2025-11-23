# Extracted Raw Code - Library Extractions

**Path:** `Extraction-01/01-extracted-raw/`  
**Purpose:** Raw code patterns extracted from open-source libraries  
**Extraction Date:** 2025-11-13 to 2025-11-14  
**Total Files:** 204  
**Methodology:** YOLO extraction (rapid pattern capture)

---

## Overview

This folder contains **raw, unmodified code** extracted from 8 major open-source libraries that align with Second Brain Foundation architecture patterns. The code here is **reference material** used to inform the production implementation in `03-integration/sbf-app/`.

⚠️ **Important:** Code in this folder is NOT production-ready. It is extracted "as-is" for pattern reference.

---

## Extraction Methodology

### YOLO Extraction Process
1. **Identify Pattern:** Find relevant code in library repository
2. **Extract File:** Copy entire file preserving structure
3. **Organize:** Place in category folder (agents, backend, ui, etc.)
4. **Document:** Note library source in extraction reports
5. **Analyze:** Review patterns before integration

Full methodology: [../YOLO-EXTRACTION-FINAL-REPORT.md](../YOLO-EXTRACTION-FINAL-REPORT.md)

---

## Folder Structure

```
01-extracted-raw/
├── agents/         Agent architecture patterns (Letta)
├── backend/        Backend services (AnythingLLM, Letta)
├── chat-ui/        Chat interface patterns (Open-WebUI)
├── desktop/        Desktop app patterns (various)
├── desktop-shell/  Electron patterns (multiple sources)
├── editor/         Markdown editor patterns
├── entities/       Entity management patterns
├── file-browser/   File browser UI patterns
├── queue/          Queue management patterns
├── settings/       Settings UI patterns
└── ui/             Generic UI components
```

---

## Library-to-Folder Mapping

### agents/ (Letta)
**Source:** [letta-ai/letta](https://github.com/letta-ai/letta)  
**Extracted:** Agent core, memory system, tool patterns  
**Files:** ~40  
**Status:** Analyzed → Integrated into `03-integration/sbf-app/packages/core/agent/`

**Key Patterns:**
- BaseAgent class
- Block-based memory (Core, Archival, Recall)
- Tool calling and execution
- Agent state persistence

**Extraction Report:** [../00-analysis/LETTA-ANALYSIS.md](../00-analysis/LETTA-ANALYSIS.md)

---

### backend/ (AnythingLLM, Letta)
**Sources:**
- [Mintplex-Labs/anything-llm](https://github.com/Mintplex-Labs/anything-llm)
- [letta-ai/letta](https://github.com/letta-ai/letta)

**Extracted:** File operations, queue patterns, Ollama client  
**Files:** ~35  
**Status:** Partially integrated

**Key Patterns:**
- File watcher with debouncing
- Organization queue
- Ollama LLM client
- Document processing

---

### chat-ui/ (Open-WebUI)
**Source:** [open-webui/open-webui](https://github.com/open-webui/open-webui)  
**Extracted:** Chat interface Svelte components  
**Files:** ~45  
**Status:** Adapted to React in `03-integration/sbf-app/packages/ui/`

**Key Patterns:**
- Message rendering
- Streaming responses
- Artifact display
- Input controls

---

### desktop/ & desktop-shell/ (Multiple)
**Sources:** Various Electron applications  
**Extracted:** Electron main process, IPC patterns  
**Files:** ~25  
**Status:** Integrated into `03-integration/sbf-app/packages/desktop/`

**Key Patterns:**
- Secure IPC handlers
- Context isolation
- File system access
- Window management

---

### editor/ (TipTap, MDX-Editor)
**Sources:**
- [ueberdosis/tiptap](https://github.com/ueberdosis/tiptap)
- [mdx-editor/mdx-editor](https://github.com/mdx-editor/mdx-editor)

**Extracted:** Markdown editor patterns  
**Files:** ~15  
**Status:** Not yet integrated (planned Phase 3.3)

**Key Patterns:**
- Rich text editing
- Markdown parsing
- Toolbar components
- Extension system

---

### entities/ (Athens, Logseq, Trilium)
**Sources:**
- [athensresearch/athens](https://github.com/athensresearch/athens)
- [logseq/logseq](https://github.com/logseq/logseq)
- [zadam/trilium](https://github.com/zadam/trilium)

**Extracted:** Entity management patterns  
**Files:** ~20  
**Status:** Integrated into `03-integration/sbf-app/packages/core/entities/`

**Key Patterns:**
- Entity CRUD operations
- Block-based structure
- Relationship management
- Frontmatter metadata

---

### file-browser/ (SilverBullet, Trilium)
**Sources:**
- [silverbulletmd/silverbullet](https://github.com/silverbulletmd/silverbullet)
- [zadam/trilium](https://github.com/zadam/trilium)

**Extracted:** File tree UI patterns  
**Files:** ~10  
**Status:** Not yet integrated (planned Phase 3)

---

### queue/ (AnythingLLM)
**Source:** [Mintplex-Labs/anything-llm](https://github.com/Mintplex-Labs/anything-llm)  
**Extracted:** Organization queue patterns  
**Files:** ~8  
**Status:** Integrated into `03-integration/sbf-app/packages/core/watcher/`

---

### settings/ (Open-WebUI, AnythingLLM)
**Sources:**
- [open-webui/open-webui](https://github.com/open-webui/open-webui)
- [Mintplex-Labs/anything-llm](https://github.com/Mintplex-Labs/anything-llm)

**Extracted:** Settings panel patterns  
**Files:** ~6  
**Status:** Not yet integrated (planned Phase 4)

---

### ui/ (Various)
**Sources:** Multiple React/Svelte libraries  
**Extracted:** Generic UI components  
**Files:** ~15  
**Status:** Partially integrated

---

## Extraction Statistics

| Category | Files | Primary Library | Integration % |
|----------|-------|-----------------|---------------|
| agents | 40 | Letta | 60% |
| backend | 35 | AnythingLLM, Letta | 50% |
| chat-ui | 45 | Open-WebUI | 40% |
| desktop | 15 | Various | 60% |
| desktop-shell | 10 | Various | 60% |
| editor | 15 | TipTap, MDX-Editor | 0% |
| entities | 20 | Athens, Logseq | 70% |
| file-browser | 10 | SilverBullet | 0% |
| queue | 8 | AnythingLLM | 100% |
| settings | 6 | Open-WebUI | 0% |
| ui | 15 | Various | 30% |
| **Total** | **204** | **8 libraries** | **~45%** |

---

## Known Limitations

### Language Mismatches
- **Letta:** Python → TypeScript conversion required
- **Open-WebUI:** Svelte → React adaptation needed
- **AnythingLLM:** Node.js (compatible, minimal changes)

### Incomplete Extractions
- ❌ Graph visualization (Cytoscape) - not yet extracted
- ❌ Vector search - pattern identified but not extracted
- ❌ module system - deferred to future phases

### Version Information
All extractions were performed against library HEAD as of **2025-11-13**. See individual library repositories for current versions.

---

## Integration Workflow

### How Extracted Code Becomes Production Code

1. **Extract** (this folder) → Raw code copied from libraries
2. **Analyze** (`00-analysis/`) → Pattern analysis and architecture review
3. **Refactor** (skipped) → Originally planned, folder empty
4. **Integrate** (`03-integration/sbf-app/`) → Production implementation

The refactoring step was merged directly into integration for velocity.

---

## Usage Guidelines

### For Developers
- **Reference Only:** Do not import directly from this folder
- **Pattern Study:** Use as reference for implementation ideas
- **License Check:** Verify MIT/Apache compatibility before use
- **Attribution:** Credit original libraries in production code

### For Integration
1. Review extracted pattern in this folder
2. Check analysis in `00-analysis/`
3. Implement adapted version in `03-integration/sbf-app/`
4. Add tests and documentation
5. Credit source library

---

## Next Steps

### High Priority (Phase 2-3)
- [ ] Extract Cytoscape graph patterns
- [ ] Extract D3.js visualization patterns
- [ ] Complete editor integration (TipTap or MDX-Editor)
- [ ] Extract vector search patterns

### Medium Priority (Phase 4+)
- [ ] module system patterns (Obsidian, Logseq)
- [ ] Sync/collaboration patterns
- [ ] Mobile app patterns

---

## Related Documentation

- **Extraction Report:** [../YOLO-EXTRACTION-FINAL-REPORT.md](../YOLO-EXTRACTION-FINAL-REPORT.md)
- **Library Analysis:** [../00-analysis/](../00-analysis/)
- **Integration Status:** [../STATUS.md](../STATUS.md)
- **Architecture:** [../../docs/03-architecture/](../../docs/03-architecture/)

---

## Source Libraries

Full list of libraries and their licenses:

1. **Letta** - Apache 2.0 - Agent framework
2. **AnythingLLM** - MIT - Document chat
3. **Open-WebUI** - MIT - Chat interface
4. **Athens** - EPL 2.0 - Knowledge graph
5. **Logseq** - AGPL 3.0 - Outliner/graph
6. **Trilium** - AGPL 3.0 - Hierarchical notes
7. **SilverBullet** - MIT - Markdown wiki
8. **TipTap** - MIT - Rich text editor

See [../../libraries/](../../libraries/) for cloned repositories.

---

**Extraction Date:** 2025-11-13 to 2025-11-14  
**Extracted By:** Winston (Architect) + Extraction Team  
**Methodology:** YOLO Extraction  
**Status:** Complete (initial extraction), Ongoing (new patterns as needed)
