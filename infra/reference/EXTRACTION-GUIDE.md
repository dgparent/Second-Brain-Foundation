# Library Component Extraction & Categorization Guide
## Second Brain Foundation - UI Development Reference

**Version:** 1.0  
**Created:** 2025-11-14  
**Analyst:** Mary (Business Analyst)  
**Status:** Active Reference  
**Purpose:** Categorize and map library components to application modules with extraction priorities

---

## 📋 Executive Summary

This document provides **actionable categorization** of the cloned open-source libraries, mapping them to specific Second Brain Foundation application components. Each mapping includes:

- **What to extract** (specific files/folders)
- **Where it maps** (which AEI module)
- **Priority level** (P0-P3)
- **Complexity** (Easy/Medium/Hard)
- **Estimated effort** (hours/days)

---

## 🎯 Application Module Breakdown

### AEI Core Modules (from Architecture)

```
Second Brain Foundation/
├── 1. AEI Chat Interface          (MVP - P0)
├── 2. Organization Queue          (MVP - P0)
├── 3. Entity Management          (MVP - P0)
├── 4. File Browser               (MVP - P1)
├── 5. Knowledge Graph Viewer     (Post-MVP - P2)
├── 6. Settings & Configuration   (MVP - P1)
├── 7. Search & Navigation        (MVP - P1)
└── 8. Desktop Shell              (MVP - P0)
```

---

## 📚 Library → Application Mapping Matrix

### Priority Key
- **P0** = MVP Critical (Week 1-4)
- **P1** = MVP Important (Week 5-6)
- **P2** = Post-MVP (Week 7-8)
- **P3** = Future Enhancement

---

## 1. AEI Chat Interface (P0 - CRITICAL)

### Goal
Build AI chat interface with conversation history, message threading, and streaming responses.

### Library Mapping

#### 🔵 text-generation-webui (PRIMARY)
**Path:** `libraries/text-generation-webui/`

**Extract From:**
```
/gradio/
  - chat.py                    → Chat UI logic
  - chat_style.py              → Message styling
/css/
  - chat.css                   → Chat styles
  - main.css                   → Base theme
/js/
  - main.js                    → WebSocket handling
  - show_controls.js           → UI controls
```

**Map To:**
```
aei-ui/src/components/chat/
  - ChatContainer.tsx          (from chat.py patterns)
  - MessageBubble.tsx          (from chat_style.py)
  - ChatInput.tsx              (from main.js)
  - ConversationSidebar.tsx    (from sidebar patterns)
  - StreamingIndicator.tsx     (from WebSocket logic)
```

**Priority:** P0  
**Complexity:** Medium  
**Effort:** 2-3 days  
**Tech Adaptation:** Gradio/Python → React/TypeScript

**Key Features to Extract:**
- ✅ Message bubbles (user vs AI)
- ✅ Code block rendering
- ✅ Streaming response animation
- ✅ Copy/regenerate buttons
- ✅ Conversation history sidebar
- ✅ Character/persona switching

---

#### 🔵 FreedomGPT (SECONDARY)
**Path:** `libraries/FreedomGPT/`

**Extract From:**
```
/src/
  - renderer/
    - components/Chat/         → React chat components
    - components/Sidebar/      → Navigation
  - main/
    - electron/               → Desktop integration
```

**Map To:**
```
aei-ui/src/components/chat/
  - MessageList.tsx            (cleaner React patterns)
  - InputBox.tsx               (from FreedomGPT/Chat)
aei-desktop/
  - main.ts                    (Electron setup)
```

**Priority:** P0  
**Complexity:** Easy  
**Effort:** 1 day  
**Tech Adaptation:** Direct React reuse (with adaptation)

**Key Features to Extract:**
- ✅ Clean React chat component
- ✅ Electron desktop wrapper
- ✅ Local model integration patterns
- ✅ Simple sidebar navigation

---

#### 🟢 SurfSense (TERTIARY - RAG Patterns)
**Path:** `libraries/SurfSense/`

**Extract From:**
```
/frontend/src/components/
  - Chat/                      → RAG chat with sources
  - SearchResults/             → Source citations
```

**Map To:**
```
aei-ui/src/components/chat/
  - SourceCitation.tsx         (for entity references)
  - DocumentPreview.tsx        (inline previews)
```

**Priority:** P1  
**Complexity:** Medium  
**Effort:** 1-2 days  
**Tech Adaptation:** Next.js → React (extract components)

**Key Features to Extract:**
- ✅ Source citation display
- ✅ Document preview cards
- ✅ Search result UI
- ✅ RAG answer formatting

---

### Extraction Checklist: Chat Interface

- [ ] Create `/aei-ui/src/components/chat/` folder
- [ ] Extract message bubble styles from text-generation-webui
- [ ] Port React chat components from FreedomGPT
- [ ] Adapt WebSocket streaming from text-generation-webui/main.js
- [ ] Add source citation component from SurfSense
- [ ] Implement conversation history sidebar
- [ ] Add markdown/code rendering
- [ ] Create typing indicator
- [ ] Build regenerate/copy actions
- [ ] Test with mock data

**Estimated Total:** 4-5 days

---

## 2. Organization Queue (P0 - CRITICAL)

### Goal
Build approval queue UI for reviewing AI-suggested entity extractions and file operations.

### Library Mapping

#### 🔵 text-generation-webui (PRIMARY - Queue Patterns)
**Path:** `libraries/text-generation-webui/`

**Extract From:**
```
/extensions/
  - superboogav2/              → Document processing UI
  - Training_PRO/              → Task queue patterns
/gradio/
  - extensions.py              → Extension management UI
```

**Map To:**
```
aei-ui/src/components/queue/
  - QueueContainer.tsx         (task list)
  - QueueItem.tsx              (individual approval)
  - ApprovalControls.tsx       (approve/reject/edit)
  - DiffViewer.tsx             (show changes)
```

**Priority:** P0  
**Complexity:** Medium  
**Effort:** 2-3 days

**Key Features to Extract:**
- ✅ Task list/queue UI
- ✅ Item review patterns
- ✅ Batch operations
- ✅ Progress indicators

---

#### 🟢 SurfSense (SECONDARY - Processing UI)
**Path:** `libraries/SurfSense/`

**Extract From:**
```
/frontend/src/components/
  - Processing/                → Document ingestion UI
  - Status/                    → Progress feedback
```

**Map To:**
```
aei-ui/src/components/queue/
  - ProcessingStatus.tsx
  - ProgressIndicator.tsx
```

**Priority:** P0  
**Complexity:** Easy  
**Effort:** 1 day

---

### Extraction Checklist: Organization Queue

- [ ] Create `/aei-ui/src/components/queue/` folder
- [ ] Extract task queue UI from text-generation-webui extensions
- [ ] Port processing status from SurfSense
- [ ] Build approval controls (approve/reject/edit)
- [ ] Add diff viewer for entity changes
- [ ] Implement batch approval
- [ ] Add undo functionality
- [ ] Create progress indicators
- [ ] Test with mock entities

**Estimated Total:** 3-4 days

---

## 3. Markdown Editor (P0 - CRITICAL)

### Goal
Build markdown editor for daily notes and entity editing with live preview.

### Library Mapping

#### 🔵 mdx-editor (PRIMARY)
**Path:** `libraries/mdx-editor/`

**Extract From:**
```
/src/
  - MDXEditor.tsx              → Main editor component
  - plugins/                   → Lexical plugins
  - toolbar/                   → Toolbar components
  - utils/                     → Markdown utilities
/docs/                         → Usage examples
```

**Map To:**
```
aei-ui/src/components/editor/
  - MarkdownEditor.tsx         (wrap MDXEditor)
  - Toolbar.tsx                (custom toolbar)
  - PluginConfig.ts            (Lexical setup)
```

**Priority:** P0  
**Complexity:** Medium (Lexical learning curve)  
**Effort:** 2-3 days

**Key Features to Extract:**
- ✅ Lexical-based editor
- ✅ Live preview
- ✅ Toolbar with formatting
- ✅ Code blocks
- ✅ Tables
- ✅ Images
- ✅ Front-matter support

---

#### 🟢 rich-markdown-editor (SECONDARY - Reference)
**Path:** `libraries/rich-markdown-editor/`

**Extract From:**
```
/src/
  - components/               → Prosemirror components
  - commands/                 → Slash commands
```

**Map To:**
```
aei-ui/src/components/editor/
  - SlashCommands.tsx         (command palette)
  - InlineToolbar.tsx         (floating toolbar)
```

**Priority:** P1  
**Complexity:** Hard (Prosemirror complex)  
**Effort:** 2 days (for slash commands only)

**Key Features to Extract:**
- ✅ Slash command system
- ✅ Inline toolbar
- ✅ Block selection

---

#### 🟢 react-md-editor (TERTIARY - Simple Alternative)
**Path:** `libraries/react-md-editor/`

**Extract From:**
```
/src/
  - Editor.tsx                → Simple split-pane editor
  - components/               → Basic toolbar
```

**Map To:**
```
aei-ui/src/components/editor/
  - SplitView.tsx             (fallback simple editor)
```

**Priority:** P2 (backup option)  
**Complexity:** Easy  
**Effort:** 1 day

---

### Extraction Checklist: Markdown Editor

- [ ] Create `/aei-ui/src/components/editor/` folder
- [ ] Install @mdxeditor/editor package
- [ ] Extract Lexical configuration from mdx-editor
- [ ] Build custom toolbar
- [ ] Add front-matter support
- [ ] Implement slash commands (from rich-markdown-editor)
- [ ] Add image upload
- [ ] Add table support
- [ ] Create live preview toggle
- [ ] Test with sample markdown

**Estimated Total:** 3-4 days

---

## 4. Settings & Configuration (P1)

### Goal
Build settings panel for AI provider config, privacy settings, and app preferences.

### Library Mapping

#### 🔵 obsidian-textgenerator (PRIMARY)
**Path:** `libraries/obsidian-textgenerator/`

**Extract From:**
```
/src/
  - settings/
    - SettingTab.ts           → Settings UI structure
    - components/             → Provider config UI
  - ui/                       → Modal patterns
```

**Map To:**
```
aei-ui/src/components/settings/
  - SettingsPanel.tsx
  - AIProviderConfig.tsx
  - PrivacySettings.tsx
  - TabNavigation.tsx
```

**Priority:** P1  
**Complexity:** Easy  
**Effort:** 1-2 days

**Key Features to Extract:**
- ✅ Tabbed settings layout
- ✅ AI provider configuration
- ✅ Form controls (toggle, select, input)
- ✅ Preset management
- ✅ Import/export settings

---

#### 🟢 text-generation-webui (SECONDARY - Parameters UI)
**Path:** `libraries/text-generation-webui/`

**Extract From:**
```
/gradio/
  - settings.py               → Settings management
/docs/
  - 03 - Parameters Tab.md    → UI patterns
```

**Map To:**
```
aei-ui/src/components/settings/
  - ParameterControls.tsx     (sliders, toggles)
```

**Priority:** P1  
**Complexity:** Easy  
**Effort:** 1 day

---

### Extraction Checklist: Settings

- [ ] Create `/aei-ui/src/components/settings/` folder
- [ ] Extract tab navigation from obsidian-textgenerator
- [ ] Port AI provider config UI
- [ ] Build privacy settings panel
- [ ] Add parameter sliders/controls from text-generation-webui
- [ ] Implement preset management
- [ ] Add import/export functionality
- [ ] Create reset to defaults
- [ ] Test settings persistence

**Estimated Total:** 2-3 days

---

## 5. File Browser & Navigation (P1)

### Goal
Build hierarchical file browser for vault navigation.

### Library Mapping

#### 🔵 SurfSense (PRIMARY - Modern UI)
**Path:** `libraries/SurfSense/`

**Extract From:**
```
/frontend/src/components/
  - Sidebar/                  → Folder tree
  - FileExplorer/             → File navigation
```

**Map To:**
```
aei-ui/src/components/browser/
  - FileTree.tsx
  - FolderNode.tsx
  - FileItem.tsx
```

**Priority:** P1  
**Complexity:** Easy  
**Effort:** 1-2 days

**Key Features to Extract:**
- ✅ Collapsible folder tree
- ✅ File icons
- ✅ Search/filter
- ✅ Context menu

---

### Extraction Checklist: File Browser

- [ ] Create `/aei-ui/src/components/browser/` folder
- [ ] Extract tree component from SurfSense
- [ ] Add file icons
- [ ] Implement folder collapse/expand
- [ ] Add search/filter
- [ ] Create context menu (right-click)
- [ ] Add drag-and-drop (optional)
- [ ] Test with mock file structure

**Estimated Total:** 1-2 days

---

## 6. Desktop Application Shell (P0)

### Goal
Package as Electron/Tauri desktop app with proper window management.

### Library Mapping

#### 🔵 FreedomGPT (PRIMARY - Electron)
**Path:** `libraries/FreedomGPT/`

**Extract From:**
```
/src/main/
  - index.ts                  → Electron main process
  - menu.ts                   → App menus
  - window.ts                 → Window management
/electron-builder.json        → Build config
```

**Map To:**
```
aei-desktop/
  - main.ts
  - preload.ts
  - menu.ts
  - window.ts
electron-builder.yml
```

**Priority:** P0  
**Complexity:** Easy (if using Electron)  
**Effort:** 1 day

**Key Features to Extract:**
- ✅ Electron setup
- ✅ Window management
- ✅ System tray
- ✅ Auto-updater
- ✅ App menus

---

### Extraction Checklist: Desktop Shell

- [ ] Create `/aei-desktop/` folder
- [ ] Extract Electron config from FreedomGPT
- [ ] Set up main process
- [ ] Configure preload script
- [ ] Add window management
- [ ] Create app menus
- [ ] Set up build pipeline
- [ ] Test packaging (Windows/Mac/Linux)

**Estimated Total:** 1-2 days

---

## 7. Knowledge Graph Viewer (P2 - POST-MVP)

### Goal
Interactive graph visualization of entity relationships.

### Library Mapping

#### 🟡 Additional Libraries Needed
**NOT IN CURRENT CLONED SET**

**Recommend Cloning:**
```bash
# Phase 2 - Graph visualization
git clone https://github.com/reaviz/reagraph.git libraries/reagraph
git clone https://github.com/cytoscape/cytoscape.js.git libraries/cytoscape
```

**Extract From:**
```
/reagraph/src/
  - Graph.tsx                 → 3D/2D graph component
  - layout/                   → Layout algorithms
```

**Map To:**
```
aei-ui/src/components/graph/
  - GraphViewer.tsx
  - NodeRenderer.tsx
  - EdgeRenderer.tsx
```

**Priority:** P2  
**Complexity:** Hard  
**Effort:** 3-5 days

---

## 8. Search & Command Palette (P1)

### Goal
Global search and keyboard-driven command palette (Cmd+K).

### Library Mapping

#### 🟡 Additional Libraries Needed
**Recommend Using:** `cmdk` package (not in current set)

**Extract Patterns From:**
```
obsidian-textgenerator/src/ui/
  - CommandPalette patterns
```

**Map To:**
```
aei-ui/src/components/search/
  - CommandPalette.tsx        (using cmdk library)
  - SearchResults.tsx
  - GlobalSearch.tsx
```

**Priority:** P1  
**Complexity:** Medium  
**Effort:** 2 days

---

## 📊 Summary Matrix: Library → Module Mapping

| Module | Primary Library | Secondary Library | Priority | Effort | Status |
|--------|----------------|-------------------|----------|--------|--------|
| **Chat Interface** | text-generation-webui | FreedomGPT, SurfSense | P0 | 4-5d | ⏳ Ready |
| **Organization Queue** | text-generation-webui | SurfSense | P0 | 3-4d | ⏳ Ready |
| **Markdown Editor** | mdx-editor | rich-markdown-editor | P0 | 3-4d | ⏳ Ready |
| **Settings** | obsidian-textgenerator | text-generation-webui | P1 | 2-3d | ⏳ Ready |
| **File Browser** | SurfSense | - | P1 | 1-2d | ⏳ Ready |
| **Desktop Shell** | FreedomGPT | - | P0 | 1-2d | ⏳ Ready |
| **Knowledge Graph** | (Phase 2) reagraph | cytoscape | P2 | 3-5d | ❌ Need clone |
| **Command Palette** | (Use cmdk pkg) | obsidian patterns | P1 | 2d | ⚠️ No lib yet |

---

## 🎯 Extraction Priority Roadmap

### Week 1: P0 Critical Components (Days 1-5)
```
Day 1-2:  Desktop Shell (FreedomGPT)
Day 2-3:  Chat Interface (text-generation-webui + FreedomGPT)
Day 4-5:  Markdown Editor (mdx-editor)
```

### Week 2: P0 Completion (Days 6-10)
```
Day 6-7:  Organization Queue (text-generation-webui)
Day 8-9:  Integration testing
Day 10:   Polish & bug fixes
```

### Week 3: P1 Important Features (Days 11-15)
```
Day 11-12: Settings Panel (obsidian-textgenerator)
Day 13-14: File Browser (SurfSense)
Day 15:    Command Palette (cmdk + patterns)
```

### Week 4: P2 & Polish (Days 16-20)
```
Day 16-18: Knowledge Graph (Phase 2 libs)
Day 19-20: Final integration & testing
```

---

## 🔧 Technical Adaptation Guide

### Python/Gradio → React/TypeScript

**text-generation-webui** uses Gradio (Python). Here's how to adapt:

**Before (Gradio):**
```python
# chat.py
def create_chat_interface():
    with gr.Column():
        chatbot = gr.Chatbot()
        msg = gr.Textbox()
```

**After (React):**
```typescript
// ChatContainer.tsx
export const ChatContainer: React.FC = () => {
  return (
    <div className="chat-container">
      <MessageList messages={messages} />
      <ChatInput onSend={handleSend} />
    </div>
  );
};
```

**Strategy:**
1. **Don't copy code** - copy UI patterns, layouts, CSS
2. **Screenshot the UI** - recreate visually
3. **Extract CSS** - port styles to Tailwind/CSS modules
4. **Rewrite logic** - use React hooks instead of Python

---

### Next.js → React

**SurfSense** uses Next.js. Adaptation is easier:

**Strategy:**
1. **Extract components** - most are pure React
2. **Remove Next.js specifics** - no `getServerSideProps`, `next/link`, etc.
3. **Adapt routing** - use React Router instead
4. **Keep component logic** - most will work as-is

---

### Obsidian Plugin → Standalone React

**obsidian-textgenerator** is an Obsidian plugin:

**Strategy:**
1. **Extract UI patterns** - settings tabs, modals
2. **Remove Obsidian API** - no `this.app`, `Plugin`, etc.
3. **Adapt state management** - use React Context/Zustand
4. **Keep component structure** - UI layouts transfer well

---

## 📋 Component Extraction Workflow

### Step-by-Step Process

**For Each Component:**

1. **📷 Screenshot the UI**
   - Capture in light/dark mode
   - Note animations/interactions
   - Document keyboard shortcuts

2. **📁 Identify Source Files**
   - Find component files
   - Locate related CSS/styles
   - Check for dependencies

3. **📝 Document API/Props**
   ```typescript
   // What props does it need?
   interface ChatMessageProps {
     content: string;
     role: 'user' | 'assistant';
     timestamp: Date;
     onCopy?: () => void;
   }
   ```

4. **🎨 Extract Styles**
   - Copy CSS classes
   - Convert to Tailwind (optional)
   - Note color variables

5. **⚛️ Rewrite in React**
   - Create component file
   - Implement UI structure
   - Add props/state
   - Apply styles

6. **🧪 Test with Mock Data**
   - Create fixtures
   - Test all states
   - Check responsiveness

7. **📚 Document Component**
   - Add to Storybook
   - Write usage docs
   - Note any quirks

---

## 🎨 Design System Extraction

### Color Schemes

**From text-generation-webui:**
```css
/* Extract from /css/main.css */
--background-primary: #1a1a1a;
--background-secondary: #2d2d2d;
--text-primary: #ffffff;
--text-secondary: #a0a0a0;
--accent-primary: #7c3aed;
--accent-secondary: #a78bfa;
```

**From SurfSense:**
```css
/* Modern gradients */
--gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--gradient-accent: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
```

### Typography

**From mdx-editor:**
```css
--font-family-sans: 'Inter', system-ui, sans-serif;
--font-family-mono: 'Fira Code', 'Courier New', monospace;
--font-size-xs: 0.75rem;
--font-size-sm: 0.875rem;
--font-size-base: 1rem;
--font-size-lg: 1.125rem;
--font-size-xl: 1.25rem;
```

### Spacing

**From FreedomGPT:**
```css
--spacing-xs: 0.25rem;
--spacing-sm: 0.5rem;
--spacing-md: 1rem;
--spacing-lg: 1.5rem;
--spacing-xl: 2rem;
```

---

## 🚀 Quick Start Extraction Guide

### Immediate Actions (This Week)

1. **Create Base Folders**
```bash
mkdir -p aei-ui/src/components/{chat,queue,editor,settings,browser,search,common}
mkdir -p aei-ui/src/lib
mkdir -p aei-ui/src/hooks
mkdir -p aei-desktop
```

2. **Extract Chat UI (Day 1-2)**
```bash
# Screenshot text-generation-webui chat interface
# Copy CSS from libraries/text-generation-webui/css/chat.css
# Copy React patterns from libraries/FreedomGPT/src/renderer/components/Chat
# Create aei-ui/src/components/chat/ChatContainer.tsx
```

3. **Extract Editor (Day 3-4)**
```bash
# Review libraries/mdx-editor/docs/getting-started.md
# Install @mdxeditor/editor
# Create wrapper: aei-ui/src/components/editor/MarkdownEditor.tsx
# Add front-matter plugin
```

4. **Extract Settings (Day 5)**
```bash
# Review libraries/obsidian-textgenerator/src/settings/
# Screenshot settings UI
# Create aei-ui/src/components/settings/SettingsPanel.tsx
# Port tab navigation
```

---

## 📚 Additional Resources

### Documentation to Review

**Before Extraction:**
1. `libraries/mdx-editor/docs/getting-started.md`
2. `libraries/text-generation-webui/docs/README.md`
3. `libraries/FreedomGPT/Readme.md`
4. `libraries/SurfSense/README.md`

### Tools Needed

**Development:**
- Storybook (component development)
- React DevTools (debugging)
- Figma/Sketch (if designing first)

**Build:**
- Vite (bundler)
- Electron Builder / Tauri CLI (desktop packaging)
- TypeScript (type checking)

---

## ✅ Success Criteria

**Component is "Extracted" when:**
- ✅ Screenshot matches reference UI
- ✅ Component props documented
- ✅ Styles match (light + dark mode)
- ✅ Interactive features work
- ✅ Storybook entry created
- ✅ Tests pass with mock data
- ✅ Code reviewed for quality
- ✅ Usage documented

---

## 🔄 Next Steps

### Immediate (This Session)
1. Review this categorization
2. Prioritize any changes
3. Begin Day 1 extraction (Desktop Shell)

### This Week
1. Extract P0 components (Chat, Editor, Queue, Desktop)
2. Create Storybook entries
3. Build component library structure

### Next Week
1. Extract P1 components (Settings, Browser, Search)
2. Integration testing
3. Begin backend integration

---

**Categorized by:** Mary (Business Analyst)  
**Framework:** BMAD-METHOD™  
**Date:** 2025-11-14  
**Status:** Ready for extraction phase

**Next Action:** Begin extraction with Desktop Shell (FreedomGPT) - Day 1

---

## 📦 Appendix: Complete Library Catalog

### Additional Libraries Available (Not in Primary Extraction Plan)

The following libraries have been cloned and are available for reference but not included in the primary MVP extraction roadmap. They provide valuable patterns and can be consulted as needed.

#### PKM & Knowledge Systems

##### 1. **logseq** ⭐ 33.9K
**Path:** `libraries/logseq/`  
**Tech:** Clojure/ClojureScript + React  
**License:** AGPL-3.0

**Valuable For:**
- Daily journal UI patterns
- Block-based editing
- Graph view implementation
- Bi-directional linking
- Query system UI

**Extract If Needed:**
```
./src/main/frontend/components/
  - journal.cljs              → Daily notes UI
  - block.cljs                → Block editing
  - right_sidebar.cljs        → Sidebar patterns
```

**Complexity:** Hard (ClojureScript → React/TypeScript)  
**Priority:** P2 (Reference for graph view)

---

##### 2. **athens** ⭐ 6.4K
**Path:** `libraries/athens/`  
**Tech:** Clojure/ClojureScript  
**License:** EPL-1.0

**Valuable For:**
- Graph database UI patterns
- Real-time collaboration concepts
- Outliner structure
- Knowledge graph navigation

**Extract If Needed:**
```
./src/cljs/athens/views/
  - pages.cljs                → Page view patterns
  - graph.cljs                → Graph visualization
  - blocks.cljs               → Block components
```

**Complexity:** Hard (ClojureScript)  
**Priority:** P2 (Reference only)

---

##### 3. **trilium** ⭐ 28.1K
**Path:** `libraries/trilium/`  
**Tech:** Node.js + Express + jQuery  
**License:** AGPL-3.0

**Valuable For:**
- Tree navigation UI
- Note metadata panels
- Attribute/property system
- Multi-pane layouts
- Advanced search UI

**Extract If Needed:**
```
./src/public/app/widgets/
  - note_tree.js              → Tree navigation
  - note_detail.js            → Entity detail view
  - attribute_widgets/        → Metadata UI
  - search/                   → Search interface
```

**Complexity:** Medium (jQuery → React)  
**Priority:** P1 (Good metadata patterns)

---

##### 4. **foam** ⭐ 15.8K
**Path:** `libraries/foam/`  
**Tech:** TypeScript (VS Code extension)  
**License:** MIT

**Valuable For:**
- VS Code integration patterns
- Graph view concepts
- Backlink UI
- Template system
- Daily notes automation

**Extract If Needed:**
```
./packages/foam-vscode/src/
  - features/graphs/          → Graph visualization
  - features/backlinks/       → Backlink panel
  - features/templates/       → Template system
```

**Complexity:** Medium (VS Code API → standalone)  
**Priority:** P2 (Template concepts useful)

---

##### 5. **silverbullet** ⭐ 2.5K
**Path:** `libraries/silverbullet/`  
**Tech:** TypeScript + Svelte  
**License:** MIT

**Valuable For:**
- Clean markdown workspace
- Plugin architecture
- Command palette
- Metadata extraction
- Live preview

**Extract If Needed:**
```
./web/
  - components/               → Svelte components
  - syscalls/                 → System integration
./plug-api/                   → Plugin patterns
```

**Complexity:** Medium (Svelte → React)  
**Priority:** P2

---

##### 6. **vnote** ⭐ 12.0K
**Path:** `libraries/vnote/`  
**Tech:** C++ + Qt  
**License:** MIT

**Valuable For:**
- Desktop app patterns (reference)
- File browser UI
- Markdown rendering
- Note organization

**Extract If Needed:**
- UI patterns only (screenshots)
- Not code (C++/Qt not applicable)

**Complexity:** N/A (visual reference only)  
**Priority:** P3

---

#### Additional Editor Frameworks

##### 7. **tiptap** ⭐ 29.2K
**Path:** `libraries/tiptap/`  
**Tech:** TypeScript + Prosemirror  
**License:** MIT

**Valuable For:**
- Headless editor framework
- Extension system
- Collaboration features
- Custom nodes/marks
- Slash commands

**Extract If Needed:**
```
./packages/core/src/
  - Editor.ts                 → Core editor
  - Extension.ts              → Plugin system
./packages/extension-*/       → Various extensions
./packages/react/             → React bindings
```

**Complexity:** Medium (Prosemirror learning curve)  
**Priority:** P1 (Alternative to mdx-editor)

**Notes:** Could replace mdx-editor if more flexibility needed

---

##### 8. **milkdown** ⭐ 9.0K
**Path:** `libraries/milkdown/`  
**Tech:** TypeScript + Prosemirror  
**License:** MIT

**Valuable For:**
- Plugin-driven architecture
- Markdown WYSIWYG
- Theme system
- Collaborative editing
- Math/diagram support

**Extract If Needed:**
```
./packages/core/src/
  - editor/                   → Core editor
  - plugin/                   → Plugin system
./packages/react/             → React integration
./packages/theme-*/           → Theming
```

**Complexity:** Medium-Hard  
**Priority:** P1 (Alternative editor option)

**Notes:** More modular than mdx-editor, harder setup

---

##### 9. **editorjs** ⭐ 28.8K
**Path:** `libraries/editorjs/`  
**Tech:** JavaScript  
**License:** Apache-2.0

**Valuable For:**
- Block-style editing (Notion-like)
- Plugin ecosystem
- JSON output
- Clean API
- Tool system

**Extract If Needed:**
```
./src/
  - components/               → Block components
  - components/modules/       → Editor modules
  - components/tools/         → Editing tools
```

**Complexity:** Easy-Medium  
**Priority:** P2 (Different paradigm - blocks vs markdown)

**Notes:** Good for Notion-like UX if desired

---

#### Graph Visualization Libraries

##### 10. **reagraph** ⭐ 2.0K
**Path:** `libraries/reagraph/`  
**Tech:** React + WebGL  
**License:** Apache-2.0

**Valuable For:**
- 3D/2D graph visualization
- Force-directed layouts
- Interactive graph
- Modern React patterns
- Performance optimization

**Extract If Needed:**
```
./src/
  - Graph.tsx                 → Main component
  - layout/                   → Layout algorithms
  - symbols/                  → Node/edge rendering
```

**Complexity:** Medium  
**Priority:** P2 (Post-MVP graph view)  
**Effort:** 3-4 days

**Notes:** Primary choice for knowledge graph visualization

---

##### 11. **cytoscape** ⭐ 10.2K
**Path:** `libraries/cytoscape/`  
**Tech:** JavaScript  
**License:** MIT

**Valuable For:**
- Graph theory operations
- Layout algorithms
- Extensible architecture
- Performance with large graphs
- Mobile support

**Extract If Needed:**
```
./src/
  - core/                     → Core graph operations
  - extensions/               → Layout extensions
./documentation/             → API docs
```

**Complexity:** Medium-Hard  
**Priority:** P2 (Alternative graph lib)  
**Effort:** 4-5 days

**Notes:** More low-level than reagraph, more powerful

---

##### 12. **sigmajs** ⭐ 11.4K
**Path:** `libraries/sigmajs/`  
**Tech:** JavaScript + WebGL  
**License:** MIT

**Valuable For:**
- High-performance rendering
- Large graph handling
- Custom renderers
- Interactive exploration

**Extract If Needed:**
```
./src/
  - core/                     → Core rendering
  - rendering/                → WebGL renderers
./packages/sigma/             → Main package
```

**Complexity:** Medium  
**Priority:** P2 (Alternative to reagraph)  
**Effort:** 3-4 days

---

##### 13. **d3** ⭐ 109.2K
**Path:** `libraries/d3/`  
**Tech:** JavaScript  
**License:** ISC

**Valuable For:**
- Data visualization primitives
- Custom visualizations
- Force simulations
- Hierarchical layouts
- Transitions/animations

**Extract If Needed:**
```
./src/
  - d3-force/                 → Force layouts (for graphs)
  - d3-hierarchy/             → Tree layouts
  - d3-selection/             → DOM manipulation
```

**Complexity:** Hard (low-level)  
**Priority:** P2 (Building block for custom viz)  
**Effort:** Variable (depends on use)

**Notes:** Not a graph library, but can build one with it

---

#### Canvas & Visual Tools

##### 14. **tldraw** ⭐ 37.1K
**Path:** `libraries/tldraw/`  
**Tech:** TypeScript + React  
**License:** Apache-2.0

**Valuable For:**
- Infinite canvas
- Shape drawing
- Real-time collaboration
- Visual thinking space
- Freeform layouts

**Extract If Needed:**
```
./packages/tldraw/src/
  - lib/                      → Core library
  - lib/shapes/               → Shape definitions
  - lib/editor/               → Editor state
./packages/editor/            → Editor core
```

**Complexity:** Hard (complex state management)  
**Priority:** P3 (Future feature - canvas mode)  
**Effort:** 5+ days

**Notes:** For visual knowledge organization

---

##### 15. **excalidraw** ⭐ 88.9K
**Path:** `libraries/excalidraw/`  
**Tech:** TypeScript + React  
**License:** MIT

**Valuable For:**
- Hand-drawn style diagrams
- Whiteboard UI
- Collaboration features
- Export functionality
- Simple drawing tools

**Extract If Needed:**
```
./src/
  - components/               → UI components
  - element/                  → Element types
  - actions/                  → Drawing actions
```

**Complexity:** Hard  
**Priority:** P3 (Future feature - diagram mode)  
**Effort:** 5+ days

**Notes:** Lighter than tldraw, focused on diagrams

---

### Usage Strategy for Additional Libraries

#### When to Consult These Libraries

1. **During MVP (P0-P1):**
   - Focus only on documented libraries in main extraction plan
   - Reference tiptap/milkdown if mdx-editor insufficient
   - Check trilium for metadata UI patterns

2. **Post-MVP (P2):**
   - Integrate reagraph for knowledge graph
   - Explore logseq/foam for advanced PKM features
   - Consider silverbullet plugin patterns

3. **Future Enhancements (P3):**
   - tldraw/excalidraw for visual knowledge
   - editorjs for block-based editing
   - Advanced collaboration from tiptap/milkdown

#### Quick Reference Matrix

| Need | Primary | Secondary | Tertiary |
|------|---------|-----------|----------|
| **Chat UI** | text-gen-webui | open-webui | anything-llm |
| **Editor** | mdx-editor | tiptap | milkdown |
| **Graph View** | reagraph | cytoscape | sigmajs |
| **PKM Patterns** | logseq | trilium | foam |
| **Metadata UI** | trilium | obsidian-gen | silverbullet |
| **Canvas** | tldraw | excalidraw | - |
| **Block Editor** | editorjs | - | - |

---

### Library Compatibility Notes

**Clojure/ClojureScript Libraries (Athens, Logseq):**
- Cannot directly port code
- Use for UI pattern inspiration
- Screenshot interfaces for reference
- Extract UX concepts, not implementation

**Qt/C++ Libraries (VNote):**
- Visual reference only
- Good for desktop app UX patterns
- Not for code extraction

**Svelte Libraries (Open-WebUI, SilverBullet):**
- Components need React conversion
- Logic often portable
- Easier than Clojure/Qt adaptation

**Pure React Libraries (Tiptap, Reagraph, Excalidraw):**
- Direct code reuse possible (with adaptation)
- Best candidates for extraction
- Check peer dependencies carefully

---

## 🎯 Updated Complete Extraction Roadmap

### Phase 1: MVP Core (Weeks 1-3)
**From Primary Libraries:**
- text-generation-webui (Chat)
- FreedomGPT (Desktop Shell)
- mdx-editor (Editor)
- SurfSense (File Browser)
- obsidian-textgenerator (Settings)

### Phase 2: Enhanced Features (Week 4-5)
**From Additional Libraries:**
- **tiptap** or **milkdown** (Enhanced editor if needed)
- **trilium** (Metadata UI patterns)
- **open-webui** (Advanced chat features)
- **anything-llm** (Workspace concepts)

### Phase 3: Advanced Visualization (Week 6-7)
**From Graph Libraries:**
- **reagraph** (Primary graph view)
- **cytoscape** or **sigmajs** (If reagraph insufficient)
- **d3** (Custom visualizations)

### Phase 4: Future Enhancements (Week 8+)
**From Specialized Libraries:**
- **logseq** patterns (Block editing, journals)
- **tldraw** or **excalidraw** (Visual workspace)
- **foam** (Template automation)
- **editorjs** (If block-based editing desired)

---

**Document Updated:** 2025-11-14  
**Total Libraries Cataloged:** 26  
**Ready for Extraction:** ✅  
**All Dependencies Documented:** ✅
