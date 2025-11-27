# Second Brain Foundation – AEI UI Reference Map  
**Version:** 1.0  
**Purpose:** Map each AEI interface component to an open-source UI reference worth studying, copying, or reusing.

---

## 📌 Overview

This document lists **every major UI feature** required by the **AEI (AI-Enabled Interface)** and maps it to **best-in-class open-source UI implementations**.

These references will serve as the foundation for building your `/library/ui/` folder, ensuring:

- Proven UX patterns  
- Faster development  
- Familiar UI paradigms  
- Clean inspirations for React/Tauri implementation  

---

# 🔍 AEI Feature → Open Source UI Mapping

| **AEI Feature / Component** | **Open-Source UI References** | **Why These Repos** |
|------------------------------|-------------------------------|----------------------|
| **1. AEI Chat Interface** | • Open-WebUI<br>• Jan.ai<br>• AnythingLLM | Best-in-class chat UIs, with sidebars, thread navigation, model switching |
| **2. Organization Queue** | • AnythingLLM ingestion pipeline<br>• text-generation-webui | Review/approve patterns and task queues |
| **3. Daily Notes Review** | • Logseq Daily Journal<br>• Athens Research<br>• Joplin | Excellent chronological navigation |
| **4. Entity Dashboard** | • Outline Wiki<br>• Joplin<br>• Foam | Grid/table/pane-based entity browsing |
| **5. Entity Detail View** | • Trilium Notes<br>• Tiptap / Milkdown<br>• Logseq Page View | Metadata fields + content editor |
| **6. Knowledge Graph View** | • Athens Research<br>• Logseq Graph<br>• Cytoscape.js<br>• Reagraph | High-performance graph navigation |
| **7. Relationship Explorer** | • Reagraph<br>• Sigma.js<br>• Logseq Graph | Node → relationship traversal patterns |
| **8. File Browser Panel** | • Joplin<br>• Outline<br>• VNote | Simple hierarchical navigation |
| **9. Settings & Preferences** | • text-generation-webui<br>• Open-WebUI<br>• AnythingLLM | Tabbed settings and collapsible configuration |
| **10. Sensitivity & Privacy Controls** | • Trilium Notes<br>• JanAI<br>• Open-WebUI | Privacy indicators and metadata panels |
| **11. Template Manager** | • Foam Templates<br>• Obsidian Templater (conceptually) | Template selection and insertion |
| **12. Multi-panel Workspace Layout** | • Trilium Notes<br>• Logseq panes<br>• tldraw | Draggable, resizable workspace |
| **13. Graph + Editor Split View** | • Obsidian Graph + Editor<br>• Logseq Right Sidebar | Direct graph→entity drill-down |
| **14. Search / Spotlight (Cmd+K)** | • Foam Command Palette (VS Code style)<br>• Logseq Search | Keyboard-focused global search |
| **15. Notifications & Queue Feedback** | • AnythingLLM progress UI<br>• Open-WebUI status indicators | Task-based feedback and async visuals |
| **16. AI Action Preview (Diff View)** | • GitHub Diff UI<br>• Joplin revision viewer<br>• Outline versioning | “Preview changes” before applying AI ops |
| **17. Tagging & Annotation UI** | • SilverBullet<br>• Logseq properties<br>• Tiptap tags | Lightweight tags, attributes, pills |
| **18. Canvas / Visual Notes** | • tldraw<br>• Excalidraw | Freeform knowledge layout |
| **19. Project / Task UI** | • Outline<br>• Codex | Kanban/list/task dashboards |
| **20. Entity Creation Wizard** | • Logseq new page<br>• Joplin new item<br>• AnythingLLM knowledge unit creation | Multi-step entity creation flow |

---

# 🔗 Full Repository List

Below are all repositories referenced in this document:

### **PKM / Note / Outliner Systems**
- Foam — https://github.com/foambubble/foam  
- Logseq — https://github.com/logseq/logseq  
- Athens Research — https://github.com/athensresearch/athens  
- Trilium Notes — https://github.com/zadam/trilium  
- Joplin — https://github.com/laurent22/joplin  
- VNote — https://github.com/vnotex/vnote  
- SilverBullet — https://github.com/silverbulletmd/silverbullet  

### **AI UIs & Chat Interfaces**
- Open-WebUI — https://github.com/open-webui/open-webui  
- Jan.ai — https://github.com/janhq/jan  
- AnythingLLM — https://github.com/Mintplex-Labs/anything-llm  
- text-generation-webui — https://github.com/oobabooga/text-generation-webui  

### **Markdown / Editor Frameworks**
- Milkdown — https://github.com/Milkdown/milkdown  
- Tiptap — https://github.com/ueberdosis/tiptap  
- Editor.js — https://github.com/codex-team/editor.js  

### **Graph Visualization Engines**
- Cytoscape.js — https://github.com/cytoscape/cytoscape.js  
- Reagraph — https://github.com/reaviz/reagraph  
- Sigma.js — https://github.com/jacomyal/sigma.js  
- D3.js — https://github.com/d3/d3  

### **Canvas / Visual Tools**
- tldraw — https://github.com/tldraw/tldraw  
- Excalidraw — https://github.com/excalidraw/excalidraw  

### **Notion-like UI Systems**
- Outline Wiki — https://github.com/outline/outline  
- Codex — https://github.com/appwrite/codex  

---

# 💡 Next Steps

If you want, I can immediately generate:

### ✔ `/library/ui/` directory structure  
### ✔ Separate markdown files per component (Chat, Graph, Editor, etc.)  
### ✔ A component-by-component UI extraction plan  
### ✔ React component stubs for each AEI feature  
### ✔ A design system tailored to these inspirations  

Just tell me:

**“Generate the /library/ui folder structure, then generate component stubs for the application.”** 
