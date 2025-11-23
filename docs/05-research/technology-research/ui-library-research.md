# UI Library Research - Open Source Knowledge Management & AI Chat Interfaces

**Date:** 2025-11-14  
**Status:** Research Complete  
**Purpose:** Identify best open-source UI components for Second Brain Foundation MVP

---

## Research Criteria

**Looking for:**
- Obsidian-like markdown editing experience
- Knowledge management UI patterns
- AI chat interfaces
- React/TypeScript codebases
- Clean, modern design
- High-quality code (stars >500)
- Active maintenance

---

## Top Recommendations

### Tier 1: Must Review (10K+ stars)

#### 1. **text-generation-webui** ⭐ 45.4K
**Repository:** https://github.com/oobabooga/text-generation-webui  
**Language:** Python (Gradio UI)  
**Why Important:** The definitive Web UI for local AI with powerful features and easy setup

**Key Features:**
- Multiple UI modes (chat, default, notebook)
- Model loading/unloading
- Parameter controls
- Extension system
- Character/persona support
- Beautiful modern chat interface

**Components to Extract:**
- Chat interface design
- Parameter controls UI
- Model switcher component
- Extension management UI

**Clone Command:**
```bash
git clone https://github.com/oobabooga/text-generation-webui.git libraries/text-generation-webui
```

---

#### 2. **obsidian-releases** ⭐ 13.4K
**Repository:** https://github.com/obsidianmd/obsidian-releases  
**Language:** TypeScript  
**Why Important:** Community modules and theme repository

**Key Features:**
- Theme showcase
- module discovery
- Release management
- Community standards

**Components to Extract:**
- Theme structure
- module architecture patterns
- Community contribution workflow

**Clone Command:**
```bash
git clone https://github.com/obsidianmd/obsidian-releases.git libraries/obsidian-releases
```

---

#### 3. **SurfSense** ⭐ 10.6K
**Repository:** https://github.com/MODSetter/SurfSense  
**Language:** Python + Next.js  
**Why Important:** Open source alternative to NotebookLM and Perplexity

**Key Features:**
- Search engine integration
- Slack, Linear, Jira, ClickUp, Notion connectors
- YouTube, GitHub, Discord integration
- RAG-based chat interface
- Modern React UI with Aceternity UI

**Tech Stack:**
- Next.js 15
- FastAPI
- LangChain/LangGraph
- Aceternity UI components

**Components to Extract:**
- Chat interface with sources
- Document viewer
- Search results UI
- Integration cards

**Clone Command:**
```bash
git clone https://github.com/MODSetter/SurfSense.git libraries/SurfSense
```

---

### Tier 2: Highly Relevant (2K-10K stars)

#### 4. **obsidian-excalidraw-module** ⭐ 5.7K
**Repository:** https://github.com/zsviczian/obsidian-excalidraw-module  
**Language:** TypeScript  
**Why Important:** Visual/diagram editing in knowledge management

**Key Features:**
- Drawing canvas integration
- Rich editing capabilities
- module architecture example
- Modal/dialog patterns

**Components to Extract:**
- Canvas UI patterns
- Tool panels
- Settings modal design

**Clone Command:**
```bash
git clone https://github.com/zsviczian/obsidian-excalidraw-module.git libraries/obsidian-excalidraw
```

---

#### 5. **podcastfy** ⭐ 5.6K
**Repository:** https://github.com/souzatharsis/podcastfy  
**Language:** Python  
**Why Important:** NotebookLM alternative - transforms content to audio conversations

**Key Features:**
- Multi-modal content processing
- Audio generation
- GenAI integration (Gemini, OpenAI, ElevenLabs)

**Components to Extract:**
- Content processing UI
- Audio player
- Progress indicators

**Clone Command:**
```bash
git clone https://github.com/souzatharsis/podcastfy.git libraries/podcastfy
```

---

#### 6. **Templater** ⭐ 4.3K
**Repository:** https://github.com/SilentVoid13/Templater  
**Language:** TypeScript  
**Why Important:** Template system for Obsidian

**Key Features:**
- Dynamic templates
- User scripts
- Custom commands
- Template picker UI

**Components to Extract:**
- Template selector
- Command palette pattern
- Settings UI

**Clone Command:**
```bash
git clone https://github.com/SilentVoid13/Templater.git libraries/Templater
```

---

#### 7. **obsidian-sample-module** ⭐ 3.5K
**Repository:** https://github.com/obsidianmd/obsidian-sample-module  
**Language:** TypeScript  
**Why Important:** Official module template - best practices

**Key Features:**
- Build configuration
- Development patterns
- module API examples
- TypeScript setup

**Components to Extract:**
- module architecture
- Build system
- TypeScript config

**Clone Command:**
```bash
git clone https://github.com/obsidianmd/obsidian-sample-module.git libraries/obsidian-sample-module
```

---

#### 8. **mdx-editor** ⭐ 3.0K
**Repository:** https://github.com/mdx-editor/editor  
**Language:** TypeScript (React)  
**Why Important:** Rich text editor for markdown (Lexical-based)

**Key Features:**
- WYSIWYG markdown editing
- Lexical framework
- React components
- Extensible architecture

**Components to Extract:**
- Editor component
- Toolbar design
- module system

**Clone Command:**
```bash
git clone https://github.com/mdx-editor/editor.git libraries/mdx-editor
```

---

#### 9. **rich-markdown-editor** ⭐ 2.9K
**Repository:** https://github.com/outline/rich-markdown-editor  
**Language:** TypeScript (React + Prosemirror)  
**Why Important:** Powers Outline - production-ready markdown editor

**Key Features:**
- Prosemirror-based
- WYSIWYG
- Slash commands
- React components

**Status:** Archived (but still valuable reference)

**Components to Extract:**
- Slash command UI
- Inline toolbar
- Block components

**Clone Command:**
```bash
git clone https://github.com/outline/rich-markdown-editor.git libraries/rich-markdown-editor
```

---

#### 10. **FreedomGPT** ⭐ 2.7K
**Repository:** https://github.com/ohmplatform/FreedomGPT  
**Language:** TypeScript (React + Electron)  
**Why Important:** Offline/private LLM chat interface

**Key Features:**
- Electron + React
- Local LLM execution
- Chat-based interface
- Cross-platform desktop app

**Components to Extract:**
- Chat message components
- Electron architecture
- Local model integration

**Clone Command:**
```bash
git clone https://github.com/ohmplatform/FreedomGPT.git libraries/FreedomGPT
```

---

### Tier 3: Specialized Components (500-2K stars)

#### 11. **react-md-editor** ⭐ 2.7K
**Repository:** https://github.com/uiwjs/react-md-editor  
**Language:** TypeScript  
**Why Important:** Simple markdown editor with preview

**Key Features:**
- Split-pane design
- Live preview
- Toolbar
- TypeScript

**Components to Extract:**
- Split editor/preview
- Toolbar components

**Clone Command:**
```bash
git clone https://github.com/uiwjs/react-md-editor.git libraries/react-md-editor
```

---

#### 12. **obsidian-day-planner** ⭐ 2.5K
**Repository:** https://github.com/ivan-lednev/obsidian-day-planner  
**Language:** TypeScript  
**Why Important:** Calendar/timeline UI for notes

**Key Features:**
- Day planning interface
- Timeline view
- Task management
- Clean UI

**Components to Extract:**
- Timeline component
- Task list UI
- Calendar integration

**Clone Command:**
```bash
git clone https://github.com/obsidian-day-planner.git libraries/obsidian-day-planner
```

---

#### 13. **mcp-obsidian** ⭐ 2.4K
**Repository:** https://github.com/MarkusPfundstein/mcp-obsidian  
**Language:** Python  
**Why Important:** MCP server for Obsidian (API integration)

**Key Features:**
- REST API integration
- MCP protocol
- Obsidian automation

**Components to Extract:**
- API integration patterns
- MCP implementation

**Clone Command:**
```bash
git clone https://github.com/MarkusPfundstein/mcp-obsidian.git libraries/mcp-obsidian
```

---

#### 14. **alltalk_tts** ⭐ 2.1K
**Repository:** https://github.com/erew123/alltalk_tts  
**Language:** HTML/Python  
**Why Important:** TTS for text-generation-webui

**Key Features:**
- Audio generation
- Voice synthesis
- Settings page
- Low VRAM support

**Components to Extract:**
- Audio player UI
- Voice settings panel

**Clone Command:**
```bash
git clone https://github.com/erew123/alltalk_tts.git libraries/alltalk_tts
```

---

#### 15. **obsidian-calendar-module** ⭐ 2.0K
**Repository:** https://github.com/liamcain/obsidian-calendar-module  
**Language:** TypeScript  
**Why Important:** Calendar widget for daily notes

**Key Features:**
- Calendar view
- Daily note navigation
- Date picker

**Components to Extract:**
- Calendar component
- Date navigation

**Clone Command:**
```bash
git clone https://github.com/liamcain/obsidian-calendar-module.git libraries/obsidian-calendar
```

---

#### 16. **obsidian-textgenerator-module** ⭐ 1.8K
**Repository:** https://github.com/nhaouari/obsidian-textgenerator-module  
**Language:** TypeScript  
**Why Important:** AI text generation in Obsidian

**Key Features:**
- Multiple AI providers (OpenAI, Anthropic, Google, local)
- Text generation UI
- Template system
- Provider configuration

**Components to Extract:**
- AI provider selector
- Generation settings
- Template UI

**Clone Command:**
```bash
git clone https://github.com/nhaouari/obsidian-textgenerator-module.git libraries/obsidian-textgenerator
```

---

#### 17. **obsidian-style-settings** ⭐ 1.8K
**Repository:** https://github.com/mgmeyers/obsidian-style-settings  
**Language:** TypeScript  
**Why Important:** Dynamic CSS variable UI

**Key Features:**
- CSS variable controls
- Theme customization
- Settings UI patterns

**Components to Extract:**
- Settings panel design
- Color pickers
- Variable controls

**Clone Command:**
```bash
git clone https://github.com/mgmeyers/obsidian-style-settings.git libraries/obsidian-style-settings
```

---

#### 18. **notebookllama** ⭐ 1.6K
**Repository:** https://github.com/run-llama/notebookllama  
**Language:** Python  
**Why Important:** Open-source NotebookLM alternative with LlamaCloud

**Key Features:**
- LlamaIndex integration
- Document Q&A
- RAG architecture

**Components to Extract:**
- Document upload UI
- Chat interface
- Source citation display

**Clone Command:**
```bash
git clone https://github.com/run-llama/notebookllama.git libraries/notebookllama
```

---

#### 19. **obsidian-linter** ⭐ 1.7K
**Repository:** https://github.com/platers/obsidian-linter  
**Language:** TypeScript  
**Why Important:** Note formatting and linting

**Key Features:**
- Configurable rules
- Format on save
- Extensible architecture

**Components to Extract:**
- Rule configuration UI
- Linting feedback display

**Clone Command:**
```bash
git clone https://github.com/platers/obsidian-linter.git libraries/obsidian-linter
```

---

#### 20. **obsidian-annotator** ⭐ 1.7K
**Repository:** https://github.com/elias-sundqvist/obsidian-annotator  
**Language:** JavaScript  
**Why Important:** PDF/EPUB reader with annotations

**Key Features:**
- PDF viewer
- EPUB reader
- Annotation system
- Highlight management

**Components to Extract:**
- PDF viewer component
- Annotation sidebar
- Highlight UI

**Clone Command:**
```bash
git clone https://github.com/elias-sundqvist/obsidian-annotator.git libraries/obsidian-annotator
```

---

## UI Pattern Analysis

### Chat Interface Patterns

**Best Examples:**
1. **text-generation-webui** - Full-featured chat with history
2. **FreedomGPT** - Clean minimal chat
3. **SurfSense** - RAG chat with sources

**Key Components Needed:**
- Message bubbles (user vs AI)
- Typing indicators
- Code block rendering
- Citation/source display
- Message actions (copy, regenerate)
- Conversation history sidebar

---

### Markdown Editor Patterns

**Best Examples:**
1. **mdx-editor** - Modern Lexical-based
2. **rich-markdown-editor** - Prosemirror WYSIWYG
3. **react-md-editor** - Split view

**Key Components Needed:**
- Toolbar (formatting, insert)
- Split pane (edit/preview)
- Syntax highlighting
- Auto-complete
- Slash commands
- Image upload/paste

---

### Knowledge Graph/Entity Patterns

**Best Examples:**
1. **obsidian-sample-module** - module architecture
2. **Templater** - Entity templates
3. **obsidian-day-planner** - Entity views

**Key Components Needed:**
- Entity card/preview
- Relationship viewer
- Graph visualization
- Timeline view
- Tag/metadata editor

---

### Settings/Configuration Patterns

**Best Examples:**
1. **obsidian-style-settings** - Dynamic CSS vars
2. **obsidian-textgenerator** - Provider config
3. **text-generation-webui** - Parameter controls

**Key Components Needed:**
- Tab navigation
- Form controls (toggle, slider, select)
- Preset management
- Import/export config
- Reset to defaults

---

## Recommended Cloning Plan

### Phase 1: Essential (Clone First)
```bash
# Create libraries directory
mkdir -p C:/!Projects/SecondBrainFoundation/libraries

cd C:/!Projects/SecondBrainFoundation/libraries

# Tier 1 - Must have
git clone https://github.com/oobabooga/text-generation-webui.git
git clone https://github.com/MODSetter/SurfSense.git
git clone https://github.com/mdx-editor/editor.git mdx-editor

# Tier 2 - Chat & AI
git clone https://github.com/ohmplatform/FreedomGPT.git
git clone https://github.com/nhaouari/obsidian-textgenerator-module.git

# Tier 2 - Editor
git clone https://github.com/outline/rich-markdown-editor.git
git clone https://github.com/uiwjs/react-md-editor.git
```

### Phase 2: Obsidian Ecosystem (For Reference)
```bash
cd C:/!Projects/SecondBrainFoundation/libraries

# Obsidian architecture
git clone https://github.com/obsidianmd/obsidian-sample-module.git
git clone https://github.com/obsidianmd/obsidian-releases.git

# Obsidian UI patterns
git clone https://github.com/mgmeyers/obsidian-style-settings.git
git clone https://github.com/ivan-lednev/obsidian-day-planner.git
git clone https://github.com/liamcain/obsidian-calendar-module.git
```

### Phase 3: Advanced Components (Optional)
```bash
cd C:/!Projects/SecondBrainFoundation/libraries

# Specialized
git clone https://github.com/zsviczian/obsidian-excalidraw-module.git
git clone https://github.com/elias-sundqvist/obsidian-annotator.git
git clone https://github.com/run-llama/notebookllama.git
git clone https://github.com/souzatharsis/podcastfy.git
```

---

## Component Extraction Strategy

### From text-generation-webui
```
Extract:
/frontend/
  - Chat interface components
  - Parameter controls
  - Model selector
  - Character/persona UI

Adapt for:
- AEI chat interface
- Organization queue UI
- Settings panels
```

### From SurfSense
```
Extract:
/frontend/src/components/
  - SearchResults.tsx
  - ChatInterface.tsx
  - DocumentViewer.tsx
  - SourceCitations.tsx

Adapt for:
- RAG chat with sources
- Document preview
- Entity cards
```

### From mdx-editor/rich-markdown-editor
```
Extract:
- Editor component
- Toolbar
- Slash command system
- Block components

Adapt for:
- Daily note editing
- Entity creation forms
- Quick capture interface
```

### From Obsidian modules
```
Extract:
- Settings UI patterns
- Modal/dialog components
- Sidebar layouts
- Calendar/date pickers
- Graph visualization

Adapt for:
- AEI settings
- Entity metadata editor
- Timeline view
- Relationship graph
```

---

## Tech Stack Alignment

### Current Plan
- **Frontend:** React + TypeScript
- **Build:** Vite
- **Desktop:** Electron or Tauri

### Library Compatibility

**Highly Compatible (React + TS):**
- ✅ mdx-editor (React + Lexical)
- ✅ rich-markdown-editor (React + Prosemirror)
- ✅ react-md-editor (React)
- ✅ FreedomGPT (React + Electron)
- ✅ All Obsidian modules (TypeScript)

**Need Adaptation (Python/Gradio):**
- ⚠️ text-generation-webui (Gradio → React conversion needed)
- ⚠️ SurfSense (Next.js → can extract components)
- ⚠️ podcastfy (Python → backend only)

**Reference Only:**
- 📚 Obsidian modules (architecture patterns, not direct code reuse)

---

## UI Design Inspiration

### Color Schemes
- **text-generation-webui:** Dark theme with accent colors
- **Obsidian:** Purple/dark with customizable themes
- **SurfSense:** Modern dark mode with gradients

### Layout Patterns
- **Three-pane:** Sidebar + Main + Inspector (Obsidian-like)
- **Chat-focused:** Sidebar + Chat (text-generation-webui)
- **Dashboard:** Cards + Widgets (SurfSense)

**Recommendation:** Obsidian-like three-pane with chat overlay

---

## Next Steps

### 1. Clone Essential Repos (This Session)
```bash
# Run Phase 1 cloning script
cd C:/!Projects/SecondBrainFoundation
./scripts/clone-ui-libraries.sh
```

### 2. Analyze Components (Next Session)
- Extract reusable React components
- Document API patterns
- Screenshot UI patterns
- Create component library plan

### 3. Build UI Component Library
- Create `/aei-ui/src/lib/` folder
- Port best components
- Adapt to our tech stack
- Document usage

### 4. Design System
- Extract color schemes
- Typography styles
- Spacing/layout patterns
- Animation/transitions

---

## Resources

### Documentation
- [Obsidian module API](https://docs.obsidian.md/)
- [Lexical Editor](https://lexical.dev/)
- [Prosemirror](https://prosemirror.net/)
- [Gradio](https://gradio.app/docs/)

### UI Frameworks Used
- **Aceternity UI** - SurfSense
- **Tailwind CSS** - Most React projects
- **Radix UI** - Common in modern React apps
- **shadcn/ui** - Modern component library

### Component Libraries to Consider
- **shadcn/ui** - For base components
- **Radix UI** - For accessibility
- **Framer Motion** - For animations
- **React Flow** - For knowledge graph

---

## Summary

**Total Repositories Identified:** 20  
**Highly Relevant:** 10  
**Reference:** 10  

**Top 3 for Immediate Cloning:**
1. **text-generation-webui** - Chat UI patterns
2. **SurfSense** - RAG + modern React
3. **mdx-editor** - Markdown editing

**Estimated Code Reuse:** 30-40% of UI components  
**Effort Saved:** 2-3 weeks of UI development

---

**Compiled by:** John (PM Agent)  
**Research Date:** 2025-11-14  
**Status:** Ready for cloning phase
