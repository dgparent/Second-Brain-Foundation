# Second Brain Foundation

**Version 2.0.2 - NextGen Complete**  
**Status: 🎉 Feature Complete (All 12 NextGen Phases Done)**

An enterprise-grade TypeScript/Python framework for building AI-augmented knowledge management systems with modular architecture, multi-provider AI support, and comprehensive tool integrations.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-green)](https://www.python.org/)
[![Node](https://img.shields.io/badge/Node-20%2B-green)](https://nodejs.org/)

---

## 🧠 What is Second Brain Foundation?

Second Brain Foundation (SBF) is a **production-ready framework** for building AI-augmented personal and team knowledge management systems. It combines a TypeScript monorepo with a Python AI backend (LangGraph) to deliver intelligent content processing, semantic search, and knowledge synthesis.

### Key Highlights

- **🤖 Multi-Provider AI** - OpenAI, Anthropic Claude, Google Gemini with automatic fallback
- **📚 Content Ingestion** - PDF, YouTube, web pages, audio transcription, Markdown
- **💬 Intelligent Chat** - RAG-powered conversations with source citations
- **🎙️ Podcast Generation** - Convert content to AI-generated audio discussions
- **🔍 Hybrid Search** - Vector + keyword search with result ranking
- **🔐 Privacy Engine** - Sensitivity levels, AI access control, audit logging
- **🔌 Tool Integrations** - Obsidian plugin, CLI tool, import/export utilities
- **📊 Knowledge Graph** - Entity extraction and relationship visualization

---

## 📦 Architecture Overview

### Applications (`apps/`)

| App | Technology | Description |
|-----|------------|-------------|
| `apps/aei-core` | Python/FastAPI | AI Engine - LangGraph agents, chat, podcast generation |
| `apps/api` | Node.js/Express | REST API - notebooks, sources, transformations |
| `apps/web` | Next.js/React | Web UI - dashboard, chat, visualizations |
| `apps/workers` | Node.js | Background job processing |
| `apps/auth-service` | Node.js | Authentication and authorization |
| `apps/llm-orchestrator` | Node.js | AI model routing and load balancing |

### Core Packages (`packages/@sbf/`)

**Foundation Layer**

| Package | Description |
|---------|-------------|
| `@sbf/errors` | Structured exception hierarchy with serialization |
| `@sbf/domain-base` | Base entity patterns with CRUD and tenant isolation |
| `@sbf/job-runner` | Background job processing with retry strategies |
| `@sbf/db-migrations` | Database schema migration framework |

**AI & Content Layer**

| Package | Description |
|---------|-------------|
| `@sbf/ai-client` | Multi-provider LLM client (OpenAI, Anthropic, Gemini) |
| `@sbf/content-engine` | Content ingestion pipeline (PDF, YouTube, Web, Audio) |
| `@sbf/chat-engine` | RAG-powered chat with source context |
| `@sbf/transformation-engine` | Content transformations (summaries, flashcards, insights) |

**Knowledge Layer**

| Package | Description |
|---------|-------------|
| `@sbf/search-engine` | Hybrid vector + keyword search with ranking |
| `@sbf/entity-framework` | Entity extraction, UIDs, lifecycle management |
| `@sbf/knowledge-graph` | Relationship extraction and graph queries |
| `@sbf/privacy-engine` | Sensitivity detection, AI access control |

**Audio Layer**

| Package | Description |
|---------|-------------|
| `@sbf/tts-client` | Multi-provider TTS (OpenAI, ElevenLabs, Google, Azure) |
| `@sbf/podcast-engine` | Script generation and audio synthesis |

**Integration Layer**

| Package | Description |
|---------|-------------|
| `@sbf/obsidian-plugin` | Bi-directional Obsidian vault sync |
| `@sbf/cli` | Command-line interface for power users |

---

## 🚀 Quick Start

See **[QUICK-START.md](./QUICK-START.md)** for detailed setup instructions.

### Prerequisites

- **Node.js** 20+ with pnpm
- **Python** 3.11+ with pip
- **Docker** and Docker Compose
- **PostgreSQL** with pgvector extension (via Docker)

### Installation

```bash
# Clone the repository
git clone https://github.com/dgparent/Second-Brain-Foundation.git
cd Second-Brain-Foundation

# Install Node.js dependencies
pnpm install

# Set up Python environment
cd apps/aei-core
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ../..

# Copy environment template
cp .env.example .env
# Edit .env with your API keys

# Start infrastructure
docker-compose up -d postgres redis

# Run database migrations
pnpm run db:migrate

# Start the application
pnpm run dev
```

### Accessing Services

| Service | URL | Description |
|---------|-----|-------------|
| Web App | http://localhost:3000 | Main dashboard |
| API | http://localhost:3001 | REST API |
| AI Engine | http://localhost:8000 | Python AI backend |
| API Docs | http://localhost:8000/docs | Swagger documentation |

---

## 🎯 Core Features

### 1. Content Ingestion

Ingest content from multiple sources:

```typescript
import { ContentEngine } from '@sbf/content-engine';

const engine = new ContentEngine(config);

// Ingest a PDF
await engine.ingest({
  type: 'pdf',
  source: '/path/to/document.pdf',
  notebookId: 'notebook-123'
});

// Ingest a YouTube video
await engine.ingest({
  type: 'youtube',
  source: 'https://youtube.com/watch?v=...',
  notebookId: 'notebook-123'
});

// Ingest a web page
await engine.ingest({
  type: 'web',
  source: 'https://example.com/article',
  notebookId: 'notebook-123'
});
```

### 2. AI Chat with RAG

Chat with your knowledge base:

```typescript
import { ChatEngine } from '@sbf/chat-engine';

const chat = new ChatEngine(config);

const response = await chat.sendMessage({
  message: "What are the key points from my research?",
  notebookId: 'notebook-123',
  includeContext: true
});

// Response includes citations to source documents
console.log(response.content);
console.log(response.citations);
```

### 3. Content Transformations

Transform content into various formats:

```typescript
import { TransformationEngine } from '@sbf/transformation-engine';

const transformer = new TransformationEngine(config);

// Generate summary
const summary = await transformer.transform({
  sourceId: 'source-123',
  type: 'summary'
});

// Generate flashcards
const flashcards = await transformer.transform({
  sourceId: 'source-123',
  type: 'flashcards',
  options: { count: 10 }
});

// Generate study notes
const notes = await transformer.transform({
  sourceId: 'source-123',
  type: 'study-notes'
});
```

### 4. Podcast Generation

Convert content to audio podcasts:

```python
# Python API endpoint
POST /api/v1/podcasts/generate
{
  "notebook_id": "notebook-123",
  "style": "conversational",
  "duration_minutes": 10,
  "voices": {
    "host": "alloy",
    "guest": "nova"
  }
}
```

### 5. Hybrid Search

Search across all your content:

```typescript
import { SearchEngine } from '@sbf/search-engine';

const search = new SearchEngine(config);

const results = await search.query({
  query: "machine learning fundamentals",
  filters: {
    notebookId: 'notebook-123',
    sourceTypes: ['pdf', 'web'],
    dateRange: { from: '2024-01-01' }
  },
  limit: 20
});
```

### 6. Privacy Controls

Control AI access to sensitive content:

```typescript
import { PrivacyEngine } from '@sbf/privacy-engine';

const privacy = new PrivacyEngine();

// Set content sensitivity
await privacy.setSensitivity({
  sourceId: 'source-123',
  level: 'INTERNAL',  // PUBLIC, INTERNAL, CONFIDENTIAL, RESTRICTED
  aiAccess: false
});

// Check permissions before AI processing
const canAccess = await privacy.checkAIAccess({
  sourceId: 'source-123',
  operation: 'summarize'
});
```

---

## 🔌 Integrations

### Obsidian Plugin

Sync your Obsidian vault with SBF:

```bash
# Install the plugin
cd packages/@sbf/obsidian-plugin
pnpm run build
# Copy to your Obsidian plugins folder
```

Features:
- Bi-directional sync with conflict resolution
- Wikilink preservation
- Frontmatter handling
- Background auto-sync

### CLI Tool

Power user command-line interface:

```bash
# Install globally
npm install -g @sbf/cli

# Initialize configuration
sbf init

# Search your knowledge base
sbf search "machine learning"

# Import from Obsidian vault
sbf migrate import --source obsidian --path /path/to/vault

# Export to NotebookLM format
sbf migrate export --format notebooklm --output ./export

# Start interactive chat
sbf chat --notebook my-research
```

### Import/Export

Import from other tools:

| Source | Format | Command |
|--------|--------|---------|
| Obsidian | Vault folder | `sbf migrate import --source obsidian` |
| Notion | ZIP export | `sbf migrate import --source notion` |
| Roam | JSON export | `sbf migrate import --source roam` |

Export to other tools:

| Target | Format | Command |
|--------|--------|---------|
| NotebookLM | Optimized MD | `sbf migrate export --format notebooklm` |
| Markdown | Plain MD | `sbf migrate export --format markdown` |
| JSON | Structured | `sbf migrate export --format json` |

---

## 🏗️ Development

### Project Structure

```
second-brain-foundation/
├── apps/
│   ├── aei-core/          # Python AI backend (FastAPI + LangGraph)
│   ├── api/               # Node.js REST API
│   ├── web/               # Next.js frontend
│   └── workers/           # Background job workers
├── packages/@sbf/
│   ├── errors/            # Exception hierarchy
│   ├── domain-base/       # Base entity patterns
│   ├── job-runner/        # Job processing
│   ├── ai-client/         # Multi-provider AI
│   ├── content-engine/    # Content ingestion
│   ├── chat-engine/       # RAG chat
│   ├── search-engine/     # Hybrid search
│   ├── transformation-engine/  # Content transforms
│   ├── podcast-engine/    # Audio generation
│   ├── tts-client/        # Text-to-speech
│   ├── entity-framework/  # Entity management
│   ├── knowledge-graph/   # Graph operations
│   ├── privacy-engine/    # Access control
│   ├── obsidian-plugin/   # Obsidian integration
│   └── cli/               # Command-line tool
├── infra/
│   ├── k8s/               # Kubernetes manifests
│   ├── migrations/        # SQL migrations
│   └── nginx/             # Reverse proxy config
├── docs/                  # Documentation
└── e2e/                   # End-to-end tests
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific package tests
pnpm --filter @sbf/search-engine test

# Run Python tests
cd apps/aei-core
pytest

# Run E2E tests
cd e2e
pnpm test
```

### Building

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @sbf/cli build

# Build Python for production
cd apps/aei-core
pip install -r requirements.txt
```

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [QUICK-START.md](./QUICK-START.md) | Step-by-step setup guide |
| [LESSONS-LEARNED.md](./LESSONS-LEARNED.md) | Development conventions for AI agents |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Contribution guidelines |
| [docs/nextgen-instructions.md](./docs/nextgen-instructions.md) | Development workflow guide |
| [docs/nextgen-completion.md](./docs/nextgen-completion.md) | Phase completion tracker |

### API Documentation

- **REST API**: http://localhost:3001/api-docs (Swagger)
- **AI Engine**: http://localhost:8000/docs (FastAPI Swagger)

---

## 🗺️ Version History

### v2.0.2 - NextGen Complete (Current)

All 12 NextGen phases implemented:

| Phase | Name | Packages |
|-------|------|----------|
| 00 | Foundation | @sbf/errors, @sbf/domain-base, @sbf/job-runner |
| 01 | Database | @sbf/db-migrations |
| 02 | AI Client | @sbf/ai-client (multi-provider) |
| 03 | Content | @sbf/content-engine |
| 04 | Chat | @sbf/chat-engine |
| 05 | Transformations | @sbf/transformation-engine |
| 06 | Audio | @sbf/podcast-engine, @sbf/tts-client |
| 07 | Knowledge Graph | @sbf/knowledge-graph |
| 08 | Entity Framework | @sbf/entity-framework |
| 09 | Search | @sbf/search-engine |
| 10 | Privacy | @sbf/privacy-engine |
| 11 | Integrations | @sbf/obsidian-plugin, @sbf/cli |

### v2.0.0 - Foundation

Initial NextGen foundation with Phase 00 and 01 complete.

### v1.0.0 - Original

Framework-first architecture with 25 production modules.

---

## 📊 Project Stats

| Metric | Value |
|--------|-------|
| Total Phases | 12 |
| Total Sprints | 36 |
| Core Packages | 15+ |
| Total Files | 400+ |
| PRD Compliance | 100% |

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Quick Contribution Guide

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make changes with tests
4. Run tests: `pnpm test`
5. Commit: `git commit -m 'Add my feature'`
6. Push: `git push origin feature/my-feature`
7. Open a Pull Request

---

## 📜 License

MIT License - see [LICENSE](./LICENSE) for details.

---

## 🙏 Acknowledgments

Built with inspiration from:

- **NotebookLM** by Google - AI-powered notebook concept
- **Obsidian** - Markdown-based knowledge management
- **LangGraph** - Stateful AI agent framework
- **PARA Method** by Tiago Forte - Knowledge organization

---

<p align="center">
  <strong>Second Brain Foundation v2.0.2</strong><br>
  <em>AI-augmented knowledge management for everyone</em>
</p>
