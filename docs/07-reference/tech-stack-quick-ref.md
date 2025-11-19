# Quick Reference: Second Brain Foundation Tech Stack

**Last Updated:** 2025-11-13  
**Version:** 2.0 (Enhanced with Letta + Complementary Technologies)

---

## Core Stack (Recommended)

### Orchestration & Memory
```yaml
Memory & State:
  letta: Agent memory, learning user patterns
  mem0: Lightweight alternative (MVP → Letta progression)

LLM Orchestration:
  llamaindex: RAG-optimized for knowledge retrieval
  instructor: Type-safe entity extraction (Pydantic)
  
Automation:
  apscheduler: MVP (embedded, zero dependencies)
  prefect: Production (observability, retries)
  n8n: Optional plugin (visual workflows)
```

### Data Storage
```yaml
Vector Database:
  lancedb: Multi-modal, versioned embeddings
  alternatives: [qdrant, chroma]

Graph Database:
  sqlite: JSON + FTS5 (lightweight, embedded)
  upgrade_path: memgraph → neo4j (if needed)

Embeddings:
  nomic-embed: Open-source, 8192 context
  alternatives: [bge-large, voyage-ai]
```

### AI & Processing
```yaml
Local LLM:
  ollama: Primary (text models)
  localai: Multi-modal (text + voice)
  
Entity Extraction:
  instructor: Type-safe Pydantic output
  spacy: Fast initial NER (hybrid approach)

Voice Transcription:
  faster-whisper: Optimized Whisper inference
  pyannote-audio: Speaker diarization
```

### Infrastructure
```yaml
File Watching:
  watchfiles: Rust-based, high performance
  
Backend:
  fastapi: Async API framework
  pydantic: Schema validation
  
Validation:
  ajv: JSON schema (CLI)
  pydantic: Runtime validation (Backend)
```

---

## Automation Workflows

### Core Flows (Prefect)
```python
# 48-hour lifecycle
@flow(name="lifecycle", schedule="0 */6 * * *")
def lifecycle_workflow(vault_path: str):
    notes = find_old_notes(vault_path)
    for note in notes:
        entities = extract_entities(note)
        validated = validate_schema(entities)
        create_entity_files(validated)

# Entity extraction
@flow(name="entity-extraction")
def entity_extraction_flow(file_path: str):
    content = read_markdown(file_path)
    entities = extract_with_instructor(content)
    queue_for_approval(entities)

# Relationship maintenance
@flow(name="relationship-maintenance", schedule="0 2 * * *")
def relationship_maintenance():
    fix_broken_links()
    suggest_merges()
    update_backlinks()
```

### Optional n8n Templates
```yaml
Email to Daily Note:
  trigger: IMAP email
  actions:
    - parse content
    - POST /webhooks/create-daily-note
    - trigger Prefect flow

Slack to Entity:
  trigger: Slack mention
  actions:
    - extract person/topic
    - POST /webhooks/create-entity
    
Calendar Sync:
  trigger: Google Calendar webhook
  actions:
    - create event entity
    - link to people/places
```

---

## Implementation Phases

### Phase 2a: MVP (Weeks 1-4)
```yaml
stack:
  automation: APScheduler (embedded)
  orchestration: Basic Python functions
  memory: None (add later)
  vector: LanceDB (embedded)
  graph: SQLite
  llm: Ollama
  
focus: Prove core concept, minimal dependencies
```

### Phase 2b: Production (Weeks 5-8)
```yaml
stack:
  automation: Prefect (upgrade from APScheduler)
  orchestration: LlamaIndex
  memory: Mem0 (simple memory layer)
  vector: LanceDB
  graph: SQLite
  llm: Ollama + LocalAI
  
focus: Add observability, improve retrieval
```

### Phase 3: Advanced (Future)
```yaml
stack:
  automation: Prefect + LangGraph (complex workflows)
  orchestration: LlamaIndex + CrewAI (multi-agent)
  memory: Letta (upgrade from Mem0)
  vector: LanceDB
  graph: Memgraph (if needed)
  llm: vLLM (high-performance serving)
  
focus: Scale, multi-agent, advanced features
```

---

## Technology Comparison

### Vector Databases
| Feature | LanceDB | Qdrant | Chroma |
|---------|---------|--------|--------|
| Embedding | Multi-modal | Dense+Sparse | Text-focused |
| Versioning | ✅ Built-in | ❌ | ❌ |
| Deployment | Embedded | Server | Embedded |
| Filtering | ✅ Good | ✅✅ Excellent | 🔶 Basic |
| Performance | ✅✅ Fast | ✅✅ Fast | ✅ Good |
| **Verdict** | **Best for MVP** | Best for prod | Simplest API |

### Orchestration
| Feature | LlamaIndex | LangChain | CrewAI |
|---------|------------|-----------|--------|
| Focus | RAG/Retrieval | Agents | Multi-agent |
| Learning Curve | Low | Medium | Medium |
| Knowledge Mgmt | ✅✅ Excellent | 🔶 Good | 🔶 Good |
| Documentation | ✅✅ Excellent | ✅ Good | ✅ Good |
| **Verdict** | **Best for us** | Good general | Future phase |

### Automation
| Feature | Prefect | n8n | Temporal | Airflow |
|---------|---------|-----|----------|---------|
| Language | Python | Node.js | Multi | Python |
| Learning | Easy | Easy | Hard | Hard |
| Visual UI | ✅ Optional | ✅✅ Core | ✅ | ✅ |
| Complexity | Low | Low | High | High |
| **Verdict** | **Primary** | **Plugin** | Overkill | Overkill |

### Memory Systems
| Feature | Letta | Mem0 | SQLite |
|---------|-------|------|--------|
| Complexity | High | Low | Minimal |
| Agent Support | ✅✅ Built-in | 🔶 Basic | ❌ |
| Learning | ✅✅ Advanced | ✅ Basic | ❌ |
| Setup | Complex | Simple | Zero |
| **Verdict** | Future upgrade | **MVP** | Fallback |

---

## Configuration Examples

### Prefect Deployment
```yaml
# prefect.yaml
name: second-brain-automation
work_pool: default

deployments:
  - name: lifecycle-processor
    entrypoint: aei-core/flows/lifecycle.py:lifecycle_workflow
    schedule:
      cron: "0 */6 * * *"
    parameters:
      vault_path: ~/Documents/SecondBrain
  
  - name: maintenance
    entrypoint: aei-core/flows/maintenance.py:relationship_maintenance
    schedule:
      cron: "0 2 * * *"
```

### AEI Settings
```yaml
# ~/.secondbrain/settings.yaml
vault:
  path: ~/Documents/SecondBrain
  watch_enabled: true

automation:
  engine: prefect  # or 'apscheduler' for MVP
  prefect:
    api_url: http://localhost:4200
    work_pool: default
  n8n:
    enabled: false
    webhook_base: http://localhost:5678/webhook

llm:
  default_provider: ollama
  providers:
    ollama:
      base_url: http://localhost:11434
      model: llama3.1
    openai:
      api_key: ${OPENAI_API_KEY}
      model: gpt-4o-mini
  
  routing:
    sensitivity_rules:
      public: cloud_allowed
      personal: cloud_allowed
      confidential: local_only
      secret: local_only

vector:
  provider: lancedb
  path: ~/.secondbrain/vector_db
  embedding_model: nomic-ai/nomic-embed-text-v1.5

graph:
  provider: sqlite
  path: ~/.secondbrain/graph.db
  fts_enabled: true

memory:
  provider: mem0  # or 'letta' or 'none'
  persistence: true
```

---

## Quick Start Commands

### MVP Setup
```bash
# Install dependencies
pip install fastapi uvicorn apscheduler watchfiles

# Start backend
cd aei-core
python main.py

# Backend runs with embedded APScheduler
# Workflows execute automatically
```

### Production Setup
```bash
# Install Prefect
pip install prefect

# Start Prefect server (optional UI)
prefect server start

# Deploy flows
cd aei-core
prefect deploy --all

# Start worker
prefect worker start --pool default
```

### Optional n8n Plugin
```bash
# Install n8n
docker run -d -p 5678:5678 n8nio/n8n

# Import templates
curl -o templates.json https://sbf.dev/n8n-templates.json
n8n import --input=templates.json

# Configure webhooks in AEI settings
```

---

## Decision Matrix

Use this matrix to choose technologies:

| If you need... | Use this | Why |
|----------------|----------|-----|
| **Type-safe entity extraction** | Instructor | Pydantic validation |
| **Knowledge retrieval (RAG)** | LlamaIndex | RAG-optimized |
| **Agent memory** | Mem0 → Letta | Progressive complexity |
| **Multi-modal embeddings** | LanceDB | Future-proof |
| **Graph queries** | SQLite + FTS5 | Simple, embedded |
| **Core automation** | APScheduler → Prefect | MVP → Production |
| **User workflows** | n8n (plugin) | Visual customization |
| **Local LLM** | Ollama | Easy setup |
| **Voice processing** | faster-whisper + LocalAI | Multi-modal |
| **File watching** | watchfiles | Rust performance |

---

## Resources

### Documentation
- **Letta:** https://www.letta.com/
- **LlamaIndex:** https://docs.llamaindex.ai/
- **Instructor:** https://python.useinstructor.com/
- **Prefect:** https://docs.prefect.io/
- **LanceDB:** https://lancedb.github.io/lancedb/
- **n8n:** https://docs.n8n.io/

### Integration Architecture
- See: `docs/AUTOMATION-INTEGRATION-ARCHITECTURE.md`
- See: `docs/TECH-STACK-UPDATE-SUMMARY.md`

---

**For detailed architecture, see:** `docs/architecture.md`  
**For implementation plan, see:** `!new/OPTION-B-IMPLEMENTATION-PLAN.md`
