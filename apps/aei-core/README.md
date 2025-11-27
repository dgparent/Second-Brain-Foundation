# AEI Core Backend

FastAPI backend for the AI-Enabled Interface (AEI) of Second Brain Foundation.

## Quick Start

### Prerequisites

- Python 3.11 or higher
- PostgreSQL 15+ with pgvector extension
- Ollama (for local LLM)

### Installation

```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Database Setup

```bash
# Install PostgreSQL (if not already installed)
# Windows: Download from postgresql.org
# Mac: brew install postgresql
# Linux: sudo apt install postgresql

# Create database
createdb aei_core

# Install pgvector extension
psql aei_core -c "CREATE EXTENSION vector;"
```

### Ollama Setup

```bash
# Install Ollama from ollama.ai

# Pull required models
ollama pull llama3.2
ollama pull nomic-embed-text
```

### Configuration

Create `.env` file:

```env
DATABASE_URL=postgresql+asyncpg://aei:aei@localhost:5432/aei_core
VAULT_PATH=/path/to/your/vault
OLLAMA_BASE_URL=http://localhost:11434
DEBUG=true
```

### Run Development Server

```bash
python main.py

# Or with uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Server will start at: http://localhost:8000
API docs at: http://localhost:8000/docs

## Project Structure

```
aei-core/
├── main.py              # FastAPI app entry point
├── config.py            # Settings management
├── models/              # Pydantic schemas
│   └── entity.py        # Entity models
├── db/                  # Database layer
│   ├── database.py      # Connection & session
│   └── models.py        # SQLAlchemy ORM models
├── api/                 # API endpoints
│   ├── vault.py         # Vault management
│   ├── queue.py         # Approval queue
│   ├── ask.py           # RAG queries
│   └── audit.py         # Audit logs
├── services/            # Business logic
│   ├── watcher.py       # File watching
│   ├── extractor.py     # Entity extraction
│   ├── indexer.py       # Vector indexing
│   ├── retriever.py     # Hybrid search
│   └── orchestrator.py  # Agent coordination
├── agents/              # LangGraph agents
│   ├── librarian.py     # Organization agent
│   ├── researcher.py    # Research agent
│   └── qa.py            # Quality assurance
└── tests/               # Test suite
    ├── test_api.py
    ├── test_services.py
    └── test_agents.py
```

## API Endpoints

### Health Checks
- `GET /healthz` - Liveness probe
- `GET /readyz` - Readiness check

### Vault Management (TODO)
- `POST /api/v1/vault/init` - Initialize vault
- `GET /api/v1/vault/stats` - Vault statistics

### Organization Queue (TODO)
- `GET /api/v1/queue` - List pending suggestions
- `POST /api/v1/queue/{id}/apply` - Apply suggestion
- `POST /api/v1/queue/{id}/reject` - Reject suggestion

### RAG Queries (TODO)
- `POST /api/v1/ask` - Ask question with context

### Audit Logs (TODO)
- `GET /api/v1/audit` - Query audit trail

## Development

### Run Tests

```bash
pytest
pytest --cov=. --cov-report=html
```

### Code Quality

```bash
# Format code
black .

# Lint
ruff check .

# Type checking
mypy .
```

## Current Status

✅ Project structure created
✅ FastAPI skeleton
✅ Pydantic entity models
✅ Database configuration
⏳ API endpoints (Week 1-2)
⏳ Services implementation (Week 2-4)
⏳ Agent orchestration (Week 3)
⏳ Testing suite (Week 8)

## Next Steps

See `!new/OPTION-B-IMPLEMENTATION-PLAN.md` for complete 8-week roadmap.
