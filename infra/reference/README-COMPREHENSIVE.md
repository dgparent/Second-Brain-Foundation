# Second Brain Foundation - Libraries Collection

**Location:** `C:\!Projects\SecondBrainFoundation\libraries\`  
**Purpose:** Curated open-source repositories for SBF ecosystem enhancement  
**Last Updated:** 2025-11-24

---

> **Documentation Structure:**
> - **This file:** Comprehensive catalog of all libraries with SBF integration strategies
> - **`EXTRACTION-GUIDE.md`:** UI component extraction guidance for MVP development
> - **`README.md.backup`:** Original quick reference (if needed)

---

## 📚 Table of Contents

- [Overview](#overview)
- [Workflow Automation](#-workflow-automation)
- [Knowledge Management & Note-Taking](#-knowledge-management--note-taking)
- [AI & Machine Learning](#-ai--machine-learning)
- [Data Visualization](#-data-visualization)
- [Business Intelligence & Analytics](#-business-intelligence--analytics)
- [Communication & Collaboration](#-communication--collaboration)
- [Scheduling & Calendar](#-scheduling--calendar)
- [CRM & Customer Support](#-crm--customer-support)
- [Text Editors & Content](#-text-editors--content)
- [Low-Code Platforms](#-low-code-platforms)
- [Domain-Specific Operations Frameworks](#-domain-specific-operations-frameworks)
- [Integration Strategy](#-integration-strategy)
- [UI Extraction Quick Reference](#-ui-extraction-quick-reference)
- [Library Statistics](#-library-statistics)

---

## Overview

This directory contains **45 carefully curated repositories** that provide essential functionality for the Second Brain Foundation (SBF) ecosystem. Each library has been selected for its alignment with SBF's core objectives:

- **AI-Augmented Knowledge Management** - RAG, semantic search, entity extraction
- **Workflow Automation** - Cross-module orchestration and third-party integration
- **Data Visualization** - Knowledge graphs, dashboards, analytics
- **Enterprise Productivity** - CRM, scheduling, communication, project management
- **Developer Experience** - UI components, editors, low-code tools

**Repository Types:**
- **31 External Open-Source Libraries** - Third-party projects cloned as git submodules
- **10 Custom SBF Frameworks** - Industry-specific operations modules
- **4 Documentation Backups** - Offline reference materials

---

## 🔄 Workflow Automation

### Activepieces
**Repository:** https://github.com/activepieces/activepieces  
**License:** MIT | **Language:** TypeScript | **Stars:** ~10K+

Open-source no-code business automation tool, alternative to Zapier.

**Modules of Interest:**
- 🔌 **400+ Pre-built Integrations** - Connect to popular services without code
- 🎯 **Visual Flow Builder** - Drag-and-drop workflow creation
- 🔐 **Self-hostable** - Deploy on your own infrastructure
- 🚀 **Custom Pieces** - Extend with custom TypeScript integrations
- 📊 **Workflow Analytics** - Monitor execution and performance
- 🔄 **Branching & Loops** - Complex conditional logic support

**SBF Integration Value:**
- Powers VA Dashboard automation workflows
- Enables module-to-module communication
- Automates cross-framework data synchronization
- Integrates external services with SBF modules

---

### n8n
**Repository:** https://github.com/n8n-io/n8n  
**License:** Sustainable Use License | **Language:** TypeScript | **Stars:** ~50K+

Fair-code licensed workflow automation platform with visual programming.

**Modules of Interest:**
- 🔗 **350+ Node Integrations** - APIs, databases, and services
- 🎨 **Visual Workflow Editor** - Intuitive node-based design
- 💾 **Data Persistence** - Store workflow state between executions
- 🔒 **Self-hosted** - Full control over data and execution
- 🧪 **JavaScript Code Nodes** - Custom logic with full programming power
- ⏰ **Scheduling & Webhooks** - Trigger workflows on events or schedules
- 🔄 **Error Handling** - Retry logic and error workflows

**SBF Integration Value:**
- Complex workflow orchestration across modules
- Data transformation pipelines
- Event-driven architecture support
- Third-party integration hub

---

### Huginn
**Repository:** https://github.com/huginn/huginn  
**License:** MIT | **Language:** Ruby | **Stars:** ~44K+

System for building agents that perform automated tasks online.

**Modules of Interest:**
- 🤖 **Autonomous Agents** - Self-running background tasks
- 📡 **Web Scraping** - Extract data from websites
- 📧 **Email & Notifications** - Automated alerts and messages
- 🔍 **RSS & Feed Monitoring** - Track content changes
- 📊 **Data Aggregation** - Collect and synthesize information
- 🔗 **API Integrations** - Connect to third-party services

**SBF Integration Value:**
- Automated data collection for Knowledge Graph
- Content monitoring and ingestion
- Background research assistant functionality
- RSS feed integration for Learning Tracker

---

## 📝 Knowledge Management & Note-Taking

### Logseq
**Repository:** https://github.com/logseq/logseq  
**License:** AGPL-3.0 | **Language:** Clojure/ClojureScript | **Stars:** ~33K+

Privacy-first, open-source knowledge base with graph view and outliner.

**Modules of Interest:**
- 📊 **Graph Database** - Linked knowledge representation
- 📖 **Block-based Outliner** - Hierarchical note organization
- 🔗 **Bidirectional Links** - Automatic relationship tracking
- 📋 **Task Management** - TODO with deadline tracking
- 📑 **PDF Annotation** - Highlight and annotate documents
- 🔌 **Plugin System** - Extensible with community plugins
- 📱 **Local-first** - Markdown files with Git sync

**SBF Integration Value:**
- Knowledge Graph synchronization
- Block-based entity linking
- Learning resource annotation
- Task management integration

---

### Trilium Notes
**Repository:** https://github.com/zadam/trilium  
**License:** AGPL-3.0 | **Language:** JavaScript | **Stars:** ~28K+

Hierarchical note-taking application with focus on building knowledge bases.

**Modules of Interest:**
- 🌳 **Tree Structure** - Hierarchical organization with cloning
- 📝 **Rich Text & Code Notes** - Multiple note types
- 🔐 **Note Encryption** - Built-in security for sensitive data
- 🔗 **Relations & Attributes** - Custom metadata and linking
- 📊 **Scripting API** - Automate with JavaScript
- 🗺️ **Relation Maps** - Visualize note relationships
- 📱 **Web Clipper** - Save content from browser

**SBF Integration Value:**
- Hierarchical knowledge representation
- Scriptable automation for note processing
- Entity attribute enrichment
- Web research capture

---

### SilverBullet
**Repository:** https://github.com/silverbulletmd/silverbullet  
**License:** MIT | **Language:** TypeScript | **Stars:** ~2.5K+

Markdown-based extensible note-taking application.

**Modules of Interest:**
- 📝 **Markdown-native** - Plain text files with powerful editing
- 🔌 **Pluggable Architecture** - Custom functionality via plugs
- 🔍 **Full-text Search** - Fast note discovery
- 📊 **Dataview-style Queries** - Query notes as database
- 🔗 **Wiki-links** - Internal note linking
- 📱 **Progressive Web App** - Works offline

**SBF Integration Value:**
- Markdown entity storage patterns
- Query-based data retrieval
- Plugin architecture inspiration
- Offline-first knowledge access

---

### Athens
**Repository:** https://github.com/athensresearch/athens  
**License:** EPL-1.0 | **Language:** Clojure/ClojureScript | **Stars:** ~6.4K+

**Note:** No longer actively maintained, but valuable for reference.

Open-source knowledge graph for research and note-taking.

**Modules of Interest:**
- 🔗 **Graph Database** - Networked thought representation
- 📖 **Block References** - Transclusion and reuse
- 🌐 **Real-time Collaboration** - Multi-user editing
- 📊 **Query Language** - Datalog-based queries

**SBF Integration Value:**
- Graph database architecture patterns
- Block-based linking concepts
- Collaborative knowledge building

---

## 🤖 AI & Machine Learning

### AnythingLLM
**Repository:** https://github.com/Mintplex-Labs/anything-llm  
**License:** MIT | **Language:** JavaScript | **Stars:** ~28K+

All-in-one AI application for document chat with LLM integration.

**Modules of Interest:**
- 💬 **Document Chat** - RAG-based conversations with documents
- 🔌 **Multi-LLM Support** - OpenAI, Anthropic, local models
- 📁 **Multi-document** - Chat across document collections
- 🧠 **Vector Database** - Semantic search and retrieval
- 🎨 **Custom Embeddings** - Multiple embedding providers
- 👥 **Multi-user** - Role-based access control
- 🔒 **Privacy-focused** - Self-hosted option

**SBF Integration Value:**
- RAG capabilities for Knowledge Graph
- Document Q&A for Learning modules
- AI-powered entity extraction
- Semantic search across notes

---

### Letta (formerly MemGPT)
**Repository:** https://github.com/cpacker/MemGPT  
**License:** Apache-2.0 | **Language:** Python | **Stars:** ~12K+

LLM with long-term memory and self-editing memory.

**Modules of Interest:**
- 🧠 **Persistent Memory** - Long-term context retention
- 📝 **Memory Editing** - Self-managed memory updates
- 💾 **External Context** - Connect to databases and documents
- 🔄 **Memory Tiers** - Working vs archival memory
- 🎯 **Agentic Behavior** - Goal-oriented interactions

**SBF Integration Value:**
- Memory Engine architecture inspiration
- Long-term AI assistant context
- Personalized AI interaction patterns
- Context-aware recommendations

---

### FreedomGPT
**Repository:** https://github.com/ohmplatform/FreedomGPT  
**License:** GPL-3.0 | **Language:** Python | **Stars:** ~2.7K+

Private, offline LLM application for desktop.

**Modules of Interest:**
- 🔒 **100% Private** - Local execution, no data sharing
- 💻 **Desktop App** - Electron-based interface
- 🤖 **Local Models** - Run LLMs on your machine
- 📱 **Cross-platform** - Windows, Mac, Linux

**SBF Integration Value:**
- Privacy-first AI implementation
- Offline AI capabilities
- Local model integration patterns
- Desktop app architecture reference

---

### Open WebUI
**Repository:** https://github.com/open-webui/open-webui  
**License:** MIT | **Language:** Python/Svelte | **Stars:** ~52K+

Self-hosted WebUI for LLMs with extensive features.

**Modules of Interest:**
- 🎨 **Modern UI** - ChatGPT-like interface
- 🔌 **Multi-backend** - Ollama, OpenAI API compatible
- 📁 **Document Support** - Chat with PDFs, images
- 🧩 **Function Calling** - Custom tools and extensions
- 👥 **Multi-user** - User management and auth
- 🔍 **RAG Pipeline** - Document embedding and retrieval

**SBF Integration Value:**
- LLM interface for AEI module
- Multi-modal document processing
- RAG implementation reference
- User management patterns

---

### Obsidian Text Generator
**Repository:** https://github.com/nhaouari/obsidian-textgenerator-plugin  
**License:** MIT | **Language:** TypeScript | **Stars:** ~1.8K+

AI text generation plugin for Obsidian.

**Modules of Interest:**
- ✍️ **Context-aware Generation** - Generate from note context
- 🔗 **Template System** - Customizable prompts
- 🎯 **Multi-provider** - OpenAI, local models
- 📝 **In-place Generation** - Generate within notes

**SBF Integration Value:**
- AI writing assistance patterns
- Context-aware content generation
- Template-based AI interactions

---

### SurfSense
**Repository:** https://github.com/CEREBRUS-MAXIMUS/Surfsense  
**License:** MIT | **Language:** TypeScript | **Stars:** ~10.6K+

AI research agent connected to personal knowledge base and external sources.

**Modules of Interest:**
- 🔍 **Multi-source Search** - Search engines, Slack, Linear, Jira, etc.
- 📚 **Knowledge Integration** - Personal KB + external sources
- 🤖 **Research Agent** - AI-powered information gathering
- 🔗 **Tool Integrations** - Notion, Gmail, GitHub, Discord, etc.
- 📊 **Unified Interface** - Single query across all sources

**SBF Integration Value:**
- Research assistant capabilities
- Multi-source data aggregation
- AI-powered knowledge discovery
- Integration patterns for external tools

---

## 📊 Data Visualization

### D3.js
**Repository:** https://github.com/d3/d3  
**License:** ISC | **Language:** JavaScript | **Stars:** ~109K+

Data-Driven Documents - powerful visualization library.

**Modules of Interest:**
- 📈 **Custom Visualizations** - Build any chart type
- 🎨 **SVG Manipulation** - Fine-grained control
- 🔄 **Data Binding** - Join data to DOM elements
- ⚡ **Transitions** - Smooth animations
- 🗺️ **Geographic Data** - Maps and projections
- 📊 **Hierarchical Layouts** - Trees, clusters, treemaps

**SBF Integration Value:**
- Knowledge Graph visualization
- Financial chart rendering
- Custom dashboard widgets
- Health metrics visualization

---

### Cytoscape.js
**Repository:** https://github.com/cytoscape/cytoscape.js  
**License:** MIT | **Language:** JavaScript | **Stars:** ~10.2K+

Graph theory / network library for visualization and analysis.

**Modules of Interest:**
- 🕸️ **Graph Rendering** - Nodes and edges visualization
- 🎨 **Layout Algorithms** - Force-directed, hierarchical, circular
- 🔍 **Graph Analysis** - Centrality, connectivity, pathfinding
- 🎯 **Interactive** - Pan, zoom, select, drag
- 🎨 **Styling System** - CSS-like graph styling
- 📱 **Touch Support** - Mobile-friendly interactions

**SBF Integration Value:**
- Knowledge Graph visualization
- Entity relationship mapping
- Network analysis for Relationship CRM
- Interactive graph exploration

---

### Sigma.js
**Repository:** https://github.com/jacomyal/sigma.js  
**License:** MIT | **Language:** JavaScript | **Stars:** ~11.4K+

Library dedicated to graph drawing and interaction.

**Modules of Interest:**
- ⚡ **High Performance** - WebGL rendering for large graphs
- 🎨 **Customizable** - Node/edge appearance and behavior
- 🔍 **Built-in Interactions** - Pan, zoom, hover, click
- 📊 **Layout Support** - ForceAtlas2, Fruchterman-Reingold
- 🌈 **Visual Effects** - Gradients, shadows, borders

**SBF Integration Value:**
- Large-scale Knowledge Graph rendering
- Performance-critical visualizations
- Real-time graph updates
- Social network visualization for CRM

---

### ReaGraph
**Repository:** https://github.com/reaviz/reagraph  
**License:** Apache-2.0 | **Language:** TypeScript/React | **Stars:** ~2.0K+

WebGL-powered React graph visualization library.

**Modules of Interest:**
- ⚛️ **React Components** - Declarative graph rendering
- ⚡ **WebGL Performance** - Hardware-accelerated
- 🎨 **Modern Design** - Beautiful default styling
- 🔍 **Interactive** - Selection, highlighting, clustering
- 📐 **3D Support** - Optional 3D graph rendering
- 🎯 **Hierarchical Layouts** - Tree-based visualization

**SBF Integration Value:**
- Desktop app graph components
- React-based visualization
- 3D knowledge exploration
- Entity hierarchy visualization

---

## 📊 Business Intelligence & Analytics

### Apache Superset
**Repository:** https://github.com/apache/superset  
**License:** Apache-2.0 | **Language:** Python/TypeScript | **Stars:** ~62K+

Modern data exploration and visualization platform.

**Modules of Interest:**
- 📊 **Rich Visualizations** - 40+ chart types
- 🔍 **SQL Lab** - Interactive query interface
- 📋 **Dashboards** - Drag-and-drop dashboard builder
- 🔐 **Role-based Access** - Fine-grained permissions
- 🔌 **Database Support** - 30+ SQL databases
- 📈 **Semantic Layer** - Virtual datasets and metrics
- 🎨 **Custom Viz Plugins** - Extend with custom charts
- ⚡ **Caching** - Query result caching for performance

**SBF Integration Value:**
- Financial tracking dashboards
- Health metrics visualization
- Business operations analytics
- Module-specific reporting
- VA Dashboard data visualization
- Portfolio performance tracking
- Learning progress analytics

---

### Grafana
**Repository:** https://github.com/grafana/grafana  
**License:** AGPL-3.0 | **Language:** Go/TypeScript | **Stars:** ~65K+

Multi-platform analytics and monitoring solution.

**Modules of Interest:**
- 📊 **Time Series Visualization** - Graphs, heatmaps, gauges
- 🔌 **Data Source Plugins** - Prometheus, InfluxDB, PostgreSQL, etc.
- 🚨 **Alerting** - Configurable alerts with notifications
- 📋 **Dashboard Templating** - Dynamic, parameterized dashboards
- 🔍 **Explore Mode** - Ad-hoc query interface
- 📱 **Mobile Support** - Responsive dashboards
- 🎨 **Custom Panels** - Build custom visualization plugins
- 👥 **Team Permissions** - Organization and team management

**SBF Integration Value:**
- Real-time metrics monitoring
- Fitness/health tracking visualizations
- System performance dashboards
- Task completion analytics
- Habit tracking visualization
- Medication adherence monitoring
- Budget vs actual spending charts

---

### Lightdash
**Repository:** https://github.com/lightdash/lightdash  
**License:** MIT | **Language:** TypeScript | **Stars:** ~4K+

Open-source BI tool for dbt projects.

**Modules of Interest:**
- 🔧 **dbt Integration** - Direct connection to dbt models
- 📊 **Self-serve Analytics** - Business users create charts
- 📋 **Interactive Dashboards** - Drill-down and filters
- 📈 **Metrics Layer** - Centralized business logic
- 🔍 **SQL Access** - View generated SQL
- 👥 **Collaboration** - Share insights with teams
- 🎨 **Custom Charts** - Multiple visualization types
- 📱 **Slack Integration** - Share dashboards in Slack

**SBF Integration Value:**
- Module data modeling
- Self-service analytics for users
- Centralized metrics definitions
- Learning analytics dashboards
- Financial KPI tracking
- Health metrics exploration
- Relationship insights visualization

---

### Metabase
**Repository:** https://github.com/metabase/metabase  
**License:** AGPL-3.0 | **Language:** Clojure/JavaScript | **Stars:** ~39K+

Easy-to-use open-source BI and analytics platform.

**Modules of Interest:**
- 📊 **Visual Query Builder** - No SQL required
- 📈 **Interactive Dashboards** - Auto-refresh and filters
- ❓ **Questions** - Saved queries with visualizations
- 📧 **Email Reports** - Scheduled dashboard delivery
- 🔐 **Row-level Permissions** - Data sandboxing
- 📱 **Mobile-friendly** - Responsive design
- 🔌 **Database Support** - 20+ data sources
- 🎨 **Chart Types** - Tables, bar, line, pie, maps, etc.
- 🤖 **Pulse** - Automated data updates to Slack/email

**SBF Integration Value:**
- User-friendly BI for non-technical users
- Automated reporting for modules
- VA Dashboard analytics
- Budget tracking and analysis
- Learning progress reports
- Health trends visualization
- Task completion metrics
- Module usage analytics

---

## 💬 Communication & Collaboration

### Chatwoot
**Repository:** https://github.com/chatwoot/chatwoot  
**License:** MIT | **Language:** Ruby/Vue.js | **Stars:** ~21K+

Open-source customer engagement platform.

**Modules of Interest:**
- 💬 **Live Chat Widget** - Website chat integration
- 📧 **Unified Inbox** - Email, chat, social media
- 🤖 **Chatbots** - Automated responses
- 📊 **Analytics** - Conversation metrics
- 👥 **Team Collaboration** - Internal notes and assignments
- 🔗 **Integrations** - Slack, webhooks, APIs
- 📱 **Mobile Apps** - iOS and Android support

**SBF Integration Value:**
- Communication module foundation
- Multi-channel message aggregation
- Team collaboration features
- Customer interaction tracking for CRM

---

## 📅 Scheduling & Calendar

### Cal.com
**Repository:** https://github.com/calcom/cal.com  
**License:** AGPL-3.0/Commercial | **Language:** TypeScript/Next.js | **Stars:** ~32K+

Open-source Calendly alternative for scheduling.

**Modules of Interest:**
- 📅 **Event Scheduling** - Booking pages and calendar integration
- 🔗 **Calendar Sync** - Google, Outlook, CalDAV
- 👥 **Team Scheduling** - Round-robin, collective availability
- 💰 **Payment Integration** - Stripe for paid bookings
- 🔌 **Webhook Support** - Event notifications
- 📱 **Mobile Apps** - iOS and Android
- 🎨 **Custom Branding** - White-label capabilities
- 🌍 **Timezone Support** - Automatic conversion

**SBF Integration Value:**
- Scheduling for Relationship CRM
- Meeting coordination for Task Management
- Appointment tracking for Healthcare module
- Event calendar integration

---

## 🎯 CRM & Customer Support

### EspoCRM
**Repository:** https://github.com/espocrm/espocrm  
**License:** GPL-3.0 | **Language:** PHP/JavaScript | **Stars:** ~1.8K+

Open-source CRM with extensive customization.

**Modules of Interest:**
- 👥 **Contact Management** - Accounts, contacts, leads
- 📞 **Activity Tracking** - Calls, meetings, tasks
- 📧 **Email Integration** - IMAP/SMTP support
- 📊 **Sales Pipeline** - Opportunity management
- 📝 **Custom Entities** - Extend with custom modules
- 🔍 **Advanced Filtering** - Complex queries
- 📱 **Mobile Responsive** - Works on all devices
- 🔐 **Role-based ACL** - Granular permissions

**SBF Integration Value:**
- Relationship CRM enhancement
- Lead and opportunity tracking
- Sales pipeline visualization
- Custom entity modeling patterns

---

### Zammad
**Repository:** https://github.com/zammad/zammad  
**License:** AGPL-3.0 | **Language:** Ruby/CoffeeScript | **Stars:** ~4.5K+

Web-based open-source helpdesk/ticketing system.

**Modules of Interest:**
- 🎫 **Multi-channel Tickets** - Email, chat, phone, social media
- 📚 **Knowledge Base** - Internal and external articles
- 🏷️ **Tags & Custom Fields** - Organize tickets
- ⏱️ **SLA Management** - Response and resolution tracking
- 📊 **Reporting** - Ticket analytics
- 🤖 **Macros** - Predefined responses
- 🔍 **Full-text Search** - Find tickets quickly

**SBF Integration Value:**
- Support ticket module
- Knowledge base integration
- Customer interaction tracking
- SLA monitoring for operations modules

---

### LibreDesk
**Repository:** https://github.com/libredesk/libredesk  
**License:** AGPL-3.0 | **Language:** PHP

Open-source help desk and support ticketing system.

**Modules of Interest:**
- 🎫 **Ticket Management** - Create, assign, track
- 📧 **Email Piping** - Convert emails to tickets
- 📚 **Knowledge Base** - Self-service articles
- 🏷️ **Categories & Tags** - Organize tickets
- 📊 **Reporting** - Performance metrics

**SBF Integration Value:**
- Simple ticketing for small teams
- Internal help desk
- Issue tracking for projects

---

## ✏️ Text Editors & Content

### Tiptap
**Repository:** https://github.com/ueberdosis/tiptap  
**License:** MIT | **Language:** TypeScript | **Stars:** ~29K+

Headless, framework-agnostic rich text editor.

**Modules of Interest:**
- 📝 **ProseMirror-based** - Powerful editing foundation
- 🎨 **Extensible** - Custom extensions and nodes
- ⚛️ **Framework Support** - React, Vue, Svelte, vanilla JS
- 🔗 **Collaboration** - Real-time multi-user editing
- 📋 **Markdown Support** - Input and output
- 🎯 **Slash Commands** - Quick formatting
- 📱 **Mobile-friendly** - Touch interactions

**SBF Integration Value:**
- Rich text editing for notes
- Collaborative document editing
- Custom node types for entities
- Desktop app editor component

---

### Editor.js
**Repository:** https://github.com/codex-team/editor.js  
**License:** Apache-2.0 | **Language:** TypeScript | **Stars:** ~28.8K+

Block-styled editor with clean JSON output.

**Modules of Interest:**
- 🧱 **Block-based** - Each block is a plugin
- 🔌 **Plugin Architecture** - Extensible with custom blocks
- 📦 **Clean Data** - JSON output for easy processing
- 🎨 **Modern UI** - Minimalist design
- 🔗 **Inline Tools** - Bold, italic, links
- 📝 **Multiple Block Types** - Text, images, lists, code, etc.

**SBF Integration Value:**
- Structured content creation
- JSON-based entity representation
- Plugin architecture patterns
- Clean data export for processing

---

### MDX Editor
**Repository:** https://github.com/mdx-editor/editor  
**License:** MIT | **Language:** TypeScript/React | **Stars:** ~3.0K+

Open-source React component for markdown editing.

**Modules of Interest:**
- 📝 **MDX Support** - Markdown + React components
- ⚛️ **React Components** - Embed interactive elements
- 🎨 **WYSIWYG & Source** - Toggle between views
- 🔗 **Live Preview** - See rendered output
- 🎯 **Syntax Highlighting** - Code blocks
- 📋 **Markdown Shortcuts** - Fast formatting

**SBF Integration Value:**
- Markdown editing for Knowledge modules
- Component-based content
- Technical documentation editing
- Interactive tutorials

---

## 🛠️ Low-Code Platforms

### NocoDB
**Repository:** https://github.com/nocodb/nocodb  
**License:** AGPL-3.0 | **Language:** TypeScript/Vue | **Stars:** ~48K+

Open-source Airtable alternative, turns databases into smart spreadsheets.

**Modules of Interest:**
- 📊 **Database GUI** - Visual interface for SQL databases
- 🔗 **REST APIs** - Auto-generated from tables
- 📋 **Grid View** - Spreadsheet-like editing
- 📑 **Form View** - Data entry forms
- 🗺️ **Kanban View** - Project management boards
- 📸 **Gallery View** - Card-based display
- 🔐 **Role-based Access** - Fine-grained permissions
- 🔗 **Relationships** - Link records across tables
- 📱 **Mobile Responsive** - Works on all devices

**SBF Integration Value:**
- Rapid data model prototyping
- Auto-generated APIs for modules
- User-friendly data entry
- Relationship visualization
- Quick admin interfaces

---

## 🏗️ Domain-Specific Operations Frameworks

These are custom-built SBF frameworks (not external libraries) for industry-specific operations.

### Construction Operations Framework
**Path:** `construction-ops-framework/`  
**Focus:** Construction project and safety management

**Key Components:**
- Project scheduling and tracking
- Safety compliance management
- Equipment and inventory tracking
- Subcontractor coordination
- Budget and cost control

---

### Hospitality Operations Framework
**Path:** `hospitality-ops-framework/`  
**Focus:** Hotel and guest services management

**Key Components:**
- Reservation management
- Guest services tracking
- Housekeeping coordination
- Maintenance requests
- Guest feedback management

---

### Insurance Operations Framework
**Path:** `insurance-ops-framework/`  
**Focus:** Insurance claims and policy management

**Key Components:**
- Claims processing workflows
- Policy management
- Risk assessment
- Document management
- Customer communication

---

### Legal Operations Framework
**Path:** `legal-ops-framework/`  
**Focus:** Legal practice management

**Key Components:**
- Case management
- Document automation
- Time tracking and billing
- Client communication
- Deadline management

---

### Logistics Operations Framework
**Path:** `logistics-ops-framework/`  
**Focus:** Freight and customs management

**Key Components:**
- Shipment tracking
- Customs documentation
- Route optimization
- Carrier management
- Delivery scheduling

---

### Manufacturing Operations Framework
**Path:** `manufacturing-ops-framework/`  
**Focus:** Production and quality control

**Key Components:**
- Production scheduling
- Quality control workflows
- Inventory management
- Equipment maintenance
- Supply chain tracking

---

### Property Operations Framework
**Path:** `property-ops-framework/`  
**Focus:** Real estate and property management

**Key Components:**
- Property listings
- Tenant management
- Lease tracking
- Maintenance requests
- Financial reporting

---

### Renewable Operations Framework
**Path:** `renewable-ops-framework/`  
**Focus:** Solar and wind energy monitoring

**Key Components:**
- Energy production tracking
- Equipment monitoring
- Maintenance scheduling
- Performance analytics
- Grid integration

---

### Restaurant HACCP Operations Framework
**Path:** `restaurant-haccp-ops-framework/`  
**Focus:** Food safety and HACCP compliance

**Key Components:**
- Temperature monitoring
- Hazard analysis
- Critical control points
- Corrective actions
- Compliance reporting

---

### Security Operations Framework
**Path:** `security-ops-framework/`  
**Focus:** Security guard and incident management

**Key Components:**
- Shift scheduling
- Incident reporting
- Patrol tracking
- Access control
- Equipment management

---

## 🎯 Integration Strategy

### Phase 1: Core Integration (MVP)
**Timeline:** Current  
**Focus:** Essential UI and functionality

1. **Desktop App Foundation**
   - FreedomGPT - Electron setup and window management
   - Tiptap - Rich text editor
   - MDX Editor - Markdown editing

2. **AI Integration**
   - AnythingLLM - RAG capabilities
   - Open WebUI - Chat interface patterns
   - SurfSense - Research agent concepts

3. **Knowledge Graph**
   - Cytoscape.js - Graph visualization
   - D3.js - Custom charts

---

### Phase 2: Analytics & Automation (v1.1)
**Timeline:** Next Quarter  
**Focus:** Business intelligence and workflow automation

1. **BI Dashboards**
   - Apache Superset - Comprehensive BI platform
   - Metabase - User-friendly analytics
   - Grafana - Real-time monitoring

2. **Workflow Automation**
   - Activepieces - Visual workflow builder
   - n8n - Complex workflow orchestration
   - Huginn - Autonomous agents

---

### Phase 3: Productivity Enhancement (v1.2)
**Timeline:** Q2 2025  
**Focus:** Communication, scheduling, and CRM

1. **Communication & Scheduling**
   - Cal.com - Scheduling integration
   - Chatwoot - Multi-channel messaging

2. **CRM Enhancement**
   - EspoCRM - Custom entity patterns
   - Zammad - Support ticketing

---

### Phase 4: Development Acceleration (v2.0)
**Timeline:** Q3 2025  
**Focus:** Low-code tools and advanced features

1. **Low-code Development**
   - NocoDB - Rapid prototyping
   - Custom form builders

2. **Knowledge Management**
   - Logseq patterns - Block-based linking
   - Trilium patterns - Hierarchical organization
   - SilverBullet patterns - Plugin architecture

---

## 🚀 UI Extraction Quick Reference

For developers working on the MVP desktop app UI, see `EXTRACTION-GUIDE.md` for detailed instructions. Quick reference:

### Need Chat UI?
**Go to:** `FreedomGPT/`, `open-webui/`, `anything-llm/`  
**Extract:** Chat components, message bubbles, streaming  
**Priority:** P0 (Critical)

### Need Markdown Editor?
**Go to:** `mdx-editor/`, `tiptap/`  
**Extract:** Editor components, toolbar, plugins  
**Priority:** P0 (Critical)

### Need Settings Panel?
**Go to:** `obsidian-textgenerator/`  
**Extract:** Settings tabs, forms, AI config  
**Priority:** P1 (Important)

### Need File Browser?
**Go to:** `SurfSense/`  
**Extract:** Sidebar, folder tree, navigation  
**Priority:** P1 (Important)

### Need Desktop App Setup?
**Go to:** `FreedomGPT/`  
**Extract:** Electron config, main process, window management  
**Priority:** P0 (Critical)

### Need Graph Visualization?
**Go to:** `cytoscape/`, `reagraph/`, `sigmajs/`  
**Extract:** Graph rendering, layouts, interactions  
**Priority:** P2 (Enhancement)

---

## 📊 Library Statistics

### By Category
| Category | Count | Languages |
|----------|-------|-----------|
| Workflow Automation | 3 | TypeScript, Ruby |
| Knowledge Management | 5 | TypeScript, Clojure, JavaScript |
| AI & Machine Learning | 6 | Python, TypeScript, JavaScript |
| Data Visualization | 4 | JavaScript, TypeScript |
| Business Intelligence | 4 | Python, TypeScript, Go, Clojure |
| Communication | 1 | Ruby, Vue.js |
| Scheduling | 1 | TypeScript, Next.js |
| CRM & Support | 3 | PHP, Ruby, JavaScript |
| Text Editors | 3 | TypeScript |
| Low-Code Platforms | 1 | TypeScript, Vue |
| **SBF Operations Frameworks** | 10 | TypeScript |
| **Total** | **45** | **Multiple** |

### By License
| License | Count | Type |
|---------|-------|------|
| MIT | 19 | Permissive |
| Apache-2.0 | 4 | Permissive |
| AGPL-3.0 | 8 | Copyleft |
| GPL-3.0 | 2 | Strong Copyleft |
| ISC | 1 | Permissive |
| EPL-1.0 | 1 | Permissive |
| Custom | 2 | Fair-code |
| SBF (MIT) | 10 | Custom Frameworks |

### By Primary Language
| Language | Count | Percentage |
|----------|-------|------------|
| TypeScript | 18 | 40% |
| JavaScript | 8 | 18% |
| Python | 6 | 13% |
| Ruby | 3 | 7% |
| Clojure | 2 | 4% |
| Go | 1 | 2% |
| PHP | 2 | 4% |
| Mixed | 5 | 11% |

### Star Ratings (Top 10)
1. D3.js - ~109K ⭐
2. Grafana - ~65K ⭐
3. Apache Superset - ~62K ⭐
4. Open WebUI - ~52K ⭐
5. n8n - ~50K ⭐
6. NocoDB - ~48K ⭐
7. Huginn - ~44K ⭐
8. Metabase - ~39K ⭐
9. Logseq - ~33K ⭐
10. Cal.com - ~32K ⭐

**Total Combined Stars:** ~700K+ ⭐

---

## 🗺️ Dependency Map

```
SBF Core Architecture
│
├── Desktop Application
│   ├── FreedomGPT (Electron setup)
│   ├── Tiptap (Rich text editor)
│   ├── MDX Editor (Markdown editing)
│   └── ReaGraph (Graph visualization)
│
├── AI & Knowledge
│   ├── Memory Engine
│   │   ├── Letta (Long-term memory patterns)
│   │   └── AnythingLLM (RAG implementation)
│   │
│   ├── AEI Interface
│   │   ├── Open WebUI (Chat UI)
│   │   ├── AnythingLLM (Document chat)
│   │   └── SurfSense (Research agent)
│   │
│   └── Knowledge Graph
│       ├── Cytoscape.js (Graph engine)
│       ├── Sigma.js (Performance rendering)
│       ├── ReaGraph (React components)
│       └── D3.js (Custom visualizations)
│
├── Automation & Integration
│   ├── Workflow Engine
│   │   ├── Activepieces (Visual workflows)
│   │   ├── n8n (Complex orchestration)
│   │   └── Huginn (Autonomous agents)
│   │
│   └── External Services
│       ├── Cal.com (Scheduling)
│       ├── Chatwoot (Communication)
│       └── Various APIs
│
├── Analytics & BI
│   ├── Apache Superset (Primary BI platform)
│   ├── Metabase (User-friendly analytics)
│   ├── Grafana (Real-time monitoring)
│   ├── Lightdash (dbt integration)
│   └── D3.js (Custom charts)
│
├── Module System
│   ├── Frameworks (5)
│   │   ├── Financial Tracking
│   │   ├── Health Tracking
│   │   ├── Knowledge Tracking
│   │   ├── Relationship Tracking
│   │   └── Task Management
│   │
│   ├── Personal Modules (10)
│   │   └── [Various productivity modules]
│   │
│   └── Industry Modules (15)
│       └── [Operations frameworks]
│
└── Developer Tools
    ├── NocoDB (Rapid prototyping)
    ├── Editor.js (Structured content)
    └── Tiptap (Extensible editing)
```

---

## 🔧 Usage Guidelines

### Adding New Libraries

When proposing a new library:

1. **Evaluate Alignment** - Must support SBF objectives
2. **Check License** - Verify MIT compatibility
3. **Add as Submodule** - `git submodule add <repo-url> libraries/<name>`
4. **Document Integration** - Update this README
5. **Identify Modules** - List specific features of interest
6. **Define Value** - Explain SBF integration benefits

### Updating Libraries

```bash
# Update all submodules
git submodule update --remote --merge

# Update specific library
cd libraries/<library-name>
git pull origin main
cd ../..
git add libraries/<library-name>
git commit -m "Update <library-name> to latest"
```

### Extracting Code

**Best Practices:**

1. **Respect Licenses** - Follow each library's license terms
2. **Attribute Sources** - Cite original repositories in comments
3. **Adapt, Don't Copy** - Learn patterns, implement fresh code
4. **Test Thoroughly** - Ensure extracted code works in SBF context
5. **Document Changes** - Track what was adapted and why

**License Compliance:**

- **MIT/Apache/ISC** - Can use freely, just attribute
- **AGPL/GPL** - Use as separate service or for pattern reference only
- **Custom** - Review specific license terms

---

## 📚 Documentation Resources

### Main Documentation
- **This README** - Comprehensive library catalog
- **[EXTRACTION-GUIDE.md](./EXTRACTION-GUIDE.md)** - UI component extraction for MVP
- **[SBF Main README](../README.md)** - Project overview
- **[Architecture Docs](../docs/03-architecture/)** - Technical architecture

### Library-Specific Docs
- **Metabase:** Long file paths, may need `core.longpaths=true` on Windows
- **Grafana:** Large repository, partial clone recommended for reference
- **Superset:** Python-based, requires backend setup for testing
- **Lightdash:** Requires dbt setup for full functionality

### Documentation Backups
Located in `*-docs-backup/` directories:
- `activepieces-docs-backup/`
- `cal-com-docs-backup/`
- `chatwoot-docs-backup/`
- `n8n-docs-backup/`
- `nocobase-docs-backup/`

---

## 🚀 Quick Start Commands

### View Library Details
```bash
cd libraries/<library-name>
cat README.md | head -50
```

### Test Library Locally
```bash
# Node.js projects
cd libraries/<library-name>
npm install
npm run dev

# Python projects
cd libraries/<library-name>
pip install -r requirements.txt
python app.py
```

### Search for Specific Code
```bash
# Find specific patterns across all libraries
cd libraries
grep -r "keyword" --include="*.ts" --include="*.tsx"
```

---

## 🤝 Contributing

To propose changes to the libraries collection:

1. **Open an Issue** - Describe the library and its value
2. **Justify Inclusion** - Explain alignment with SBF goals
3. **Assess License** - Confirm compatibility
4. **Document Integration** - How will it enhance SBF?
5. **Submit PR** - Add as submodule with README update

### Quality Standards

New libraries should have:
- ✅ Active maintenance (commits within 6 months)
- ✅ Clear documentation
- ✅ Compatible license
- ✅ Significant community (1K+ stars recommended)
- ✅ Alignment with SBF objectives

---

## 🙏 Acknowledgments

Huge thanks to all maintainers and contributors of these incredible open-source projects. The Second Brain Foundation stands on the shoulders of giants.

**Special Recognition:**
- Apache Software Foundation (Superset)
- Grafana Labs (Grafana)
- The OpenAI community (Various AI tools)
- ProseMirror team (Tiptap, other editors)
- D3.js contributors (D3, Cytoscape, Sigma)

---

## 📞 Support

- **Questions about libraries:** Check individual library documentation
- **SBF Integration:** See [Contributing Guide](../CONTRIBUTING.md)
- **Issues:** [GitHub Issues](https://github.com/SecondBrainFoundation/second-brain-foundation/issues)
- **Discussions:** [GitHub Discussions](https://github.com/SecondBrainFoundation/second-brain-foundation/discussions)

---

<p align="center">
  <strong>45 carefully curated libraries for the future of AI-augmented knowledge management</strong><br>
  <em>Selected for excellence, integrated for impact</em>
</p>

<p align="center">
  <a href="../README.md">Back to SBF</a> •
  <a href="./EXTRACTION-GUIDE.md">UI Extraction Guide</a> •
  <a href="../CONTRIBUTING.md">Contribute</a> •
  <a href="../docs">Documentation</a>
</p>
