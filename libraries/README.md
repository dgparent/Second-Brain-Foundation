# Libraries Folder - Quick Reference Index

**Location:** `C:\!Projects\SecondBrainFoundation\libraries\`  
**Purpose:** Open-source UI reference code for Second Brain Foundation MVP  
**Last Updated:** 2025-11-14

---

## 📁 Folder Structure

```
libraries/
├── EXTRACTION-GUIDE.md              ⭐ START HERE - Complete extraction instructions
├── README.md                        📖 This file - Quick navigation
│
├── text-generation-webui/           🔵 P0 - Chat UI & Queue patterns
├── SurfSense/                       🔵 P0 - RAG UI & File Browser
├── mdx-editor/                      🔵 P0 - Markdown Editor
├── FreedomGPT/                      🔵 P0 - Desktop Shell (Electron)
├── obsidian-textgenerator/          🟢 P1 - Settings UI
├── rich-markdown-editor/            🟢 P1 - Editor patterns (reference)
├── react-md-editor/                 🟡 P2 - Simple editor (backup)
│
├── anything-llm/                    🔵 P0 - AI chat & document ingestion UI
├── open-webui/                      🔵 P0 - Modern chat interface
├── jan/                             🔵 P0 - Local AI chat UI
├── logseq/                          🟢 P1 - PKM & daily notes patterns
├── athens/                          🟢 P1 - Graph-based outliner
├── trilium/                         🟢 P1 - Hierarchical notes & metadata
├── foam/                            🟢 P1 - VS Code PKM patterns
├── silverbullet/                    🟢 P1 - Markdown workspace
├── vnote/                           🟢 P1 - Note-taking UI
│
├── tiptap/                          🔵 P0 - Headless editor framework
├── milkdown/                        🔵 P0 - Plugin-based markdown editor
├── editorjs/                        🟢 P1 - Block-style editor
│
├── reagraph/                        🟡 P2 - 3D/2D graph visualization
├── cytoscape/                       🟡 P2 - Graph visualization engine
├── sigmajs/                         🟡 P2 - Graph rendering library
├── d3/                              🟡 P2 - Data visualization
│
├── tldraw/                          🟡 P2 - Canvas & visual tools
├── excalidraw/                      🟡 P2 - Whiteboard & diagrams
│
└── obsidian-textgenerator-plugin/   📦 Variant/duplicate reference
```

---

## 🎯 Quick Navigation by Module

### Need Chat UI?
**Go to:** `text-generation-webui/` + `FreedomGPT/`  
**Extract:** Chat components, message bubbles, streaming  
**Guide:** [EXTRACTION-GUIDE.md → Section 1](./EXTRACTION-GUIDE.md#1-aei-chat-interface-p0---critical)

### Need Markdown Editor?
**Go to:** `mdx-editor/` + `rich-markdown-editor/`  
**Extract:** Editor components, toolbar, plugins  
**Guide:** [EXTRACTION-GUIDE.md → Section 3](./EXTRACTION-GUIDE.md#3-markdown-editor-p0---critical)

### Need Settings Panel?
**Go to:** `obsidian-textgenerator/`  
**Extract:** Settings tabs, forms, AI config  
**Guide:** [EXTRACTION-GUIDE.md → Section 4](./EXTRACTION-GUIDE.md#4-settings--configuration-p1)

### Need File Browser?
**Go to:** `SurfSense/`  
**Extract:** Sidebar, folder tree, navigation  
**Guide:** [EXTRACTION-GUIDE.md → Section 5](./EXTRACTION-GUIDE.md#5-file-browser--navigation-p1)

### Need Desktop App Setup?
**Go to:** `FreedomGPT/`  
**Extract:** Electron config, main process, window management  
**Guide:** [EXTRACTION-GUIDE.md → Section 6](./EXTRACTION-GUIDE.md#6-desktop-application-shell-p0)

---

## 📚 Library Details

### 1. text-generation-webui ⭐ 45.4K

**Tech:** Python + Gradio  
**Use For:** Chat UI, parameter controls, extension patterns  
**Priority:** P0 (Critical)

**Key Folders:**
```
text-generation-webui/
├── gradio/                  → Chat interface logic
├── css/                     → Styles to port
├── js/                      → WebSocket patterns
├── extensions/              → Queue/processing UI
└── docs/                    → Usage guides
```

**Extract For:**
- AEI Chat Interface
- Organization Queue
- Settings panels

**Notes:**
- Gradio UI - copy patterns, not code
- Screenshot UI, recreate in React
- Great CSS to port

---

### 2. SurfSense ⭐ 10.6K

**Tech:** Next.js + FastAPI  
**Use For:** RAG chat, file browser, modern React patterns  
**Priority:** P0 (Critical)

**Key Folders:**
```
SurfSense/
├── frontend/src/components/ → React components (reusable!)
│   ├── Chat/               → RAG chat with sources
│   ├── Sidebar/            → Navigation
│   ├── FileExplorer/       → File tree
│   └── SearchResults/      → Search UI
└── docs/                   → Setup guides
```

**Extract For:**
- Chat with source citations
- File browser
- Document preview
- Modern UI patterns

**Notes:**
- Next.js → React (easy port)
- Great component structure
- Aceternity UI styles

---

### 3. mdx-editor ⭐ 3.0K

**Tech:** React + Lexical  
**Use For:** Markdown editing  
**Priority:** P0 (Critical)

**Key Folders:**
```
mdx-editor/
├── src/
│   ├── MDXEditor.tsx       → Main component
│   ├── plugins/            → Lexical plugins
│   ├── toolbar/            → Toolbar UI
│   └── utils/              → Markdown helpers
└── docs/                   → Feature docs
```

**Extract For:**
- Daily note editor
- Entity editing
- Markdown WYSIWYG

**Notes:**
- Use as npm package (`@mdxeditor/editor`)
- Excellent documentation
- Front-matter support built-in

**Read First:** `mdx-editor/docs/getting-started.md`

---

### 4. FreedomGPT ⭐ 2.7K

**Tech:** React + Electron  
**Use For:** Desktop app setup, clean chat UI  
**Priority:** P0 (Critical)

**Key Folders:**
```
FreedomGPT/
├── src/
│   ├── main/               → Electron main process
│   │   └── electron/       → Window management
│   └── renderer/           → React UI
│       ├── components/Chat/
│       └── components/Sidebar/
└── electron-builder.json   → Build config
```

**Extract For:**
- Desktop shell
- Electron setup
- Clean React chat components
- Window management

**Notes:**
- Direct React code reuse possible
- Good Electron patterns
- Simple, clean UI

---

### 5. obsidian-textgenerator ⭐ 1.8K

**Tech:** TypeScript (Obsidian plugin)  
**Use For:** Settings UI, AI provider config  
**Priority:** P1 (Important)

**Key Folders:**
```
obsidian-textgenerator/
├── src/
│   ├── settings/           → Settings UI ⭐
│   │   ├── SettingTab.ts
│   │   └── components/
│   ├── ui/                 → Modal patterns
│   └── providers/          → AI provider logic
└── recipes.md              → Usage examples
```

**Extract For:**
- Settings panel
- AI provider configuration
- Tab navigation
- Form controls

**Notes:**
- Remove Obsidian API dependencies
- Great settings structure
- Provider patterns useful

---

### 6. rich-markdown-editor ⭐ 2.9K

**Tech:** React + Prosemirror  
**Use For:** Slash commands, inline toolbar (reference)  
**Priority:** P1 (Reference only)

**Key Folders:**
```
rich-markdown-editor/
├── src/
│   ├── components/         → Prosemirror components
│   ├── commands/           → Slash commands ⭐
│   └── lib/                → Utilities
└── README.md
```

**Extract For:**
- Slash command patterns
- Inline toolbar inspiration
- Block component ideas

**Notes:**
- **ARCHIVED** repo (still valuable)
- Prosemirror is complex - use patterns, not code
- Reference only - use mdx-editor for actual implementation

---

### 7. react-md-editor ⭐ 2.7K

**Tech:** React  
**Use For:** Simple split-view editor (backup option)  
**Priority:** P2 (Backup/Reference)

**Key Folders:**
```
react-md-editor/
├── src/
│   ├── Editor.tsx          → Simple editor
│   └── components/         → Basic toolbar
└── core/                   → Core logic
```

**Extract For:**
- Fallback simple editor
- Split-pane patterns

**Notes:**
- Use only if mdx-editor too complex
- Very simple, limited features
- Good for MVP fallback

---

## 🎯 Extraction Priority

### This Week (P0 - Critical)
1. **FreedomGPT** (Day 1) - Desktop shell
2. **text-generation-webui** (Day 2-3) - Chat UI
3. **mdx-editor** (Day 4-5) - Editor
4. **text-generation-webui** (Day 6-7) - Organization queue

### Next Week (P1 - Important)
5. **obsidian-textgenerator** (Day 8-9) - Settings
6. **SurfSense** (Day 10-11) - File browser
7. Polish & integration

### Later (P2 - Enhancement)
8. **rich-markdown-editor** - Slash commands
9. **react-md-editor** - If needed as fallback

---

## 📖 Key Documentation Files

**Must Read Before Extraction:**

1. **`EXTRACTION-GUIDE.md`** ⭐⭐⭐
   - Complete module mapping
   - Step-by-step extraction
   - Priority roadmap

2. **`mdx-editor/docs/getting-started.md`**
   - How to use editor
   - Plugin system
   - Configuration

3. **`text-generation-webui/docs/README.md`**
   - UI modes explained
   - Extension system
   - Features overview

4. **`FreedomGPT/Readme.md`**
   - Setup instructions
   - Architecture overview

5. **`SurfSense/README.md`**
   - Installation
   - Component structure
   - API integration

---

## 🔧 Setup Commands

### Install mdx-editor (Direct Use)
```bash
cd aei-ui
npm install @mdxeditor/editor
```

### Run text-generation-webui (Local Testing)
```bash
cd libraries/text-generation-webui
python server.py
# Visit http://localhost:7860 to see UI
```

### Run SurfSense (Local Testing)
```bash
cd libraries/SurfSense
npm install
npm run dev
# Visit http://localhost:3000
```

### Build FreedomGPT (Desktop Testing)
```bash
cd libraries/FreedomGPT
npm install
npm run dev
# Electron app launches
```

---

## ⚠️ Important Notes

### Copyright & Licensing

**All libraries are open-source:**
- text-generation-webui: AGPL-3.0
- SurfSense: MIT
- mdx-editor: MIT
- FreedomGPT: MIT
- obsidian-textgenerator: MIT
- rich-markdown-editor: BSD-3-Clause
- react-md-editor: MIT

**Safe to use** for reference, learning, and extraction patterns.  
**Always credit** original authors in our code comments.

### Adaptation Strategy

**DO:**
- ✅ Study UI patterns
- ✅ Screenshot interfaces
- ✅ Extract CSS/styles
- ✅ Learn component structure
- ✅ Rewrite in our tech stack

**DON'T:**
- ❌ Copy code verbatim without understanding
- ❌ Include unnecessary dependencies
- ❌ Violate license terms
- ❌ Claim UI designs as original

---

## 🚀 Getting Started

**First Time Here?**

1. **Read:** `EXTRACTION-GUIDE.md` (complete instructions)
2. **Review:** This README for quick navigation
3. **Browse:** Each library's README for context
4. **Start:** Day 1 extraction (FreedomGPT desktop shell)

**Need Help Finding Something?**

Use the "Quick Navigation by Module" section above or search this file for keywords.

---

## 📊 Statistics

**Total Libraries:** 26  
**Total Stars:** ~200,000+  
**Total Size:** ~2-3GB  
**Cloned:** 2025-11-14  
**Ready for:** Component extraction

### Libraries by Category
- **AI Chat Interfaces:** 4 (text-generation-webui, anything-llm, open-webui, jan, FreedomGPT)
- **PKM/Note Systems:** 7 (logseq, athens, trilium, foam, silverbullet, vnote, SurfSense)
- **Markdown Editors:** 5 (mdx-editor, tiptap, milkdown, rich-markdown-editor, react-md-editor, editorjs)
- **Graph Visualization:** 4 (reagraph, cytoscape, sigmajs, d3)
- **Canvas/Visual Tools:** 2 (tldraw, excalidraw)
- **Configuration:** 2 (obsidian-textgenerator, obsidian-textgenerator-plugin)

---

## 📦 Complete Library Index

### AI Chat & LLM Interfaces
- **text-generation-webui** - Gradio-based LLM UI (AGPL-3.0) ⭐ 45.4K
- **anything-llm** - Full-stack RAG & document chat (MIT) ⭐ 28.7K
- **open-webui** - Extensible AI interface (MIT) ⭐ 52.3K
- **jan** - Local AI client (AGPL-3.0) ⭐ 24.8K
- **FreedomGPT** - Electron-based chat UI (MIT) ⭐ 2.7K

### PKM & Knowledge Management
- **logseq** - Local-first outliner (AGPL-3.0) ⭐ 33.9K
- **athens** - Graph-based knowledge graph (EPL-1.0) ⭐ 6.4K
- **trilium** - Hierarchical notes (AGPL-3.0) ⭐ 28.1K
- **foam** - VS Code PKM (MIT) ⭐ 15.8K
- **silverbullet** - Markdown workspace (MIT) ⭐ 2.5K
- **vnote** - Note-taking (MIT) ⭐ 12.0K
- **SurfSense** - AI-powered PKM (MIT) ⭐ 10.6K

### Markdown Editors
- **mdx-editor** - Lexical-based MDX editor (MIT) ⭐ 3.0K
- **tiptap** - Headless editor framework (MIT) ⭐ 29.2K
- **milkdown** - Plugin-driven editor (MIT) ⭐ 9.0K
- **rich-markdown-editor** - Prosemirror editor (BSD-3) ⭐ 2.9K [ARCHIVED]
- **react-md-editor** - Simple markdown editor (MIT) ⭐ 2.7K
- **editorjs** - Block-style editor (Apache-2.0) ⭐ 28.8K

### Graph Visualization
- **reagraph** - 3D/2D graph (Apache-2.0) ⭐ 2.0K
- **cytoscape** - Graph theory library (MIT) ⭐ 10.2K
- **sigmajs** - Graph visualization (MIT) ⭐ 11.4K
- **d3** - Data visualization (ISC) ⭐ 109.2K

### Canvas & Visual Tools
- **tldraw** - Infinite canvas (Apache-2.0) ⭐ 37.1K
- **excalidraw** - Virtual whiteboard (MIT) ⭐ 88.9K

### Configuration & Settings
- **obsidian-textgenerator** - AI text generation plugin (MIT) ⭐ 1.8K
- **obsidian-textgenerator-plugin** - Variant reference

---

## 🔗 Related Documentation

- **UI Research:** `docs/05-research/technology-research/ui-library-research.md`
- **Summary:** `docs/05-research/technology-research/ui-libraries-summary.md`
- **ChatGPT Analysis:** `docs/libraries-building-result-from-chatgpt.md`
- **This Guide:** `libraries/EXTRACTION-GUIDE.md` ⭐

---

**Need assistance?** Refer to [EXTRACTION-GUIDE.md](./EXTRACTION-GUIDE.md) for detailed instructions.

**Ready to build?** Start with Day 1 (FreedomGPT Desktop Shell)! 🚀
