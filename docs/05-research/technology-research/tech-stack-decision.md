# Technology Stack Decision: FastAPI vs Spring Boot

**Date:** 2025-11-13  
**Context:** Option B (AEI MVP) - Backend Framework Selection  
**Decision Required:** Python/FastAPI vs Java/Spring Boot

---

## User Preferences Confirmed

1. ✅ **LLM Provider:** Ollama only (local-first)
2. ✅ **Database:** PostgreSQL from Day 1
3. ✅ **Desktop Priority:** Web-only MVP, defer desktop
4. ✅ **UI Framework:** React (TypeScript)
5. ❓ **Backend:** Consider Spring Boot as alternative to FastAPI

---

## FastAPI vs Spring Boot Comparison

### Architecture Document Context

The original architecture (`2_bf_aei_developer_architecture_migration_plan_v_1.md`) explicitly specifies:
- **Language:** Python 3.11+
- **Framework:** FastAPI
- **Rationale:** Async by default, AI/ML ecosystem, rapid prototyping

### Trade-off Analysis

| Criterion | FastAPI (Python) | Spring Boot (Java) | Winner |
|-----------|------------------|-------------------|---------|
| **AI/ML Ecosystem** | ⭐⭐⭐⭐⭐ Native (LangChain, ChromaDB, Ollama bindings) | ⭐⭐ Via JNI/gRPC | FastAPI |
| **Async Performance** | ⭐⭐⭐⭐⭐ Native async/await | ⭐⭐⭐⭐ Project Reactor (WebFlux) | Tie |
| **Type Safety** | ⭐⭐⭐ Pydantic + mypy | ⭐⭐⭐⭐⭐ Compile-time | Spring Boot |
| **Development Speed** | ⭐⭐⭐⭐⭐ Minimal boilerplate | ⭐⭐⭐ More verbose | FastAPI |
| **Auto Documentation** | ⭐⭐⭐⭐⭐ OpenAPI built-in | ⭐⭐⭐⭐ Springdoc | FastAPI |
| **Deployment Size** | ⭐⭐⭐⭐ ~50MB container | ⭐⭐⭐ ~150MB container | FastAPI |
| **Enterprise Patterns** | ⭐⭐⭐ Good enough | ⭐⭐⭐⭐⭐ Battle-tested | Spring Boot |
| **Observability** | ⭐⭐⭐⭐ Prometheus + OTel | ⭐⭐⭐⭐⭐ Spring Actuator | Spring Boot |
| **Learning Curve** | ⭐⭐⭐⭐⭐ Python familiarity | ⭐⭐⭐ Java ecosystem | FastAPI |
| **LLM Integration** | ⭐⭐⭐⭐⭐ LiteLLM, LangChain native | ⭐⭐ LangChain4j | FastAPI |

---

## Key Considerations for Spring Boot

### ✅ Advantages

1. **Type Safety**
   - Compile-time error detection
   - Better refactoring support in IntelliJ
   - Null safety with Java 17+ Records

2. **Enterprise Readiness**
   - Mature security (Spring Security)
   - Battle-tested at scale
   - Excellent monitoring (Actuator)

3. **Performance at Scale**
   - Better CPU/memory efficiency for large deployments
   - Virtual threads (Java 21) match async performance
   - Proven with millions of RPS

4. **Team Familiarity**
   - If team is Java-first, faster development
   - Rich ecosystem (Maven/Gradle)

### ❌ Disadvantages for AEI MVP

1. **AI/ML Integration Friction** ⚠️ CRITICAL
   - LangChain4j less mature than Python LangChain
   - Ollama Java bindings require JNI or HTTP overhead
   - ChromaDB best accessed via Python
   - Entity extraction prompts harder to iterate

2. **Development Velocity** ⚠️ CRITICAL
   - More boilerplate (services, DTOs, configs)
   - Slower iteration on AI prompts
   - Longer compile times vs Python

3. **Architecture Mismatch**
   - Original design assumes Python ML stack
   - Hybrid retrieval (Tantivy) has poor Java bindings
   - Re-ranker models (HuggingFace) Python-native

4. **Deployment Complexity**
   - Web-only MVP → Docker container
   - Spring Boot container ~3x larger
   - JVM warmup vs instant Python startup

---

## Recommendation: FastAPI (Python)

### Why FastAPI Wins for AEI MVP

**1. AI/ML Ecosystem is Non-Negotiable**
- LangChain, LangGraph, LiteLLM are Python-first
- Ollama Python bindings are official and complete
- Entity extraction iterates faster with Python notebooks
- ChromaDB + Tantivy have excellent Python support

**2. 8-Week Timeline is Aggressive**
- FastAPI's minimal boilerplate saves 20-30% dev time
- Pydantic models = instant API validation
- No compile step = faster iteration
- Easy to prototype agent behavior

**3. Architecture Alignment**
- Original design is Python-based
- Backlog EPICs assume Python stack
- Switching to Java requires re-architecting

**4. Web-Only MVP Negates Spring Boot Strengths**
- Enterprise features (Actuator, Security) are overkill for MVP
- Single-user web app doesn't need JVM robustness
- Can migrate to Spring Boot in Stage 3+ if needed

---

## Decision Matrix

| Factor | Weight | FastAPI Score | Spring Boot Score |
|--------|--------|---------------|-------------------|
| AI/ML Integration | 40% | 10/10 | 4/10 |
| Development Speed | 30% | 10/10 | 6/10 |
| Type Safety | 10% | 6/10 | 10/10 |
| Architecture Fit | 20% | 10/10 | 5/10 |
| **Weighted Total** | 100% | **9.2/10** | **5.4/10** |

---

## Alternative: Hybrid Approach (Not Recommended)

**Could we use Spring Boot for orchestration + Python for AI?**

**Architecture:**
```
Spring Boot API Gateway (port 8080)
  ↓
Python AI Services (gRPC)
  ├── Entity Extractor
  ├── Retriever
  └── Agent Orchestrator
```

**Pros:**
- Type safety where it matters
- Leverage Java enterprise patterns
- Microservices-ready

**Cons:**
- ❌ Massive complexity increase for MVP
- ❌ Network latency between services
- ❌ Two codebases to maintain
- ❌ Violates "monolith first" principle

**Verdict:** Over-engineered for 8-week MVP

---

## Final Decision: FastAPI ✅

### Rationale Summary

1. **AI-first architecture demands Python**
   - 80% of codebase is AI/ML logic
   - LangChain, Ollama, ChromaDB are Python-native
   - Entity extraction iteration speed is critical

2. **8-week timeline requires velocity**
   - FastAPI eliminates boilerplate
   - Async by default (no WebFlux complexity)
   - Instant OpenAPI documentation

3. **Web-only MVP = right-sized tool**
   - Don't need Spring Boot's enterprise features yet
   - Can evolve to microservices in Stage 3
   - PostgreSQL + FastAPI proven at scale (Instagram, Netflix ML)

4. **Architecture document alignment**
   - Switching to Java requires rewriting architecture
   - 2-week delay to re-spec everything
   - Team velocity loss from context switch

---

## Modified Technology Stack

### Backend (Python 3.11+)
- ✅ **Framework:** FastAPI
- ✅ **Database:** PostgreSQL (from Day 1, no SQLite)
- ✅ **ORM:** SQLAlchemy 2.0 (async)
- ✅ **Migrations:** Alembic
- ✅ **LLM:** LiteLLM (Ollama only)
- ✅ **Agents:** LangGraph
- ✅ **Vector DB:** PostgreSQL with pgvector extension
- ✅ **Keyword Search:** PostgreSQL full-text search (FTS)
- ✅ **File Watcher:** Watchdog
- ✅ **Testing:** pytest + pytest-asyncio

### Frontend (React 18+)
- ✅ **Build Tool:** Vite
- ✅ **Language:** TypeScript
- ✅ **State:** Zustand
- ✅ **Server State:** TanStack Query
- ✅ **Styling:** Tailwind CSS
- ✅ **Graph Viz:** D3.js (deferred to post-MVP)
- ✅ **Testing:** Vitest

### Local LLM (Ollama)
- ✅ **Chat Models:** llama3.2, mistral
- ✅ **Embeddings:** nomic-embed-text
- ✅ **Re-ranker:** Local Python model (bge-reranker-base)

### Deployment (Web-only MVP)
- ✅ **Docker:** FastAPI + React in single container
- ✅ **Database:** PostgreSQL container (Docker Compose)
- ✅ **Reverse Proxy:** Nginx (static + API)
- ✅ **Hosting:** Self-hosted or DigitalOcean droplet

---

## Migration Path (Post-MVP)

If Spring Boot becomes necessary (Stage 3: Enterprise):

1. **Keep Python AI services**
   - Extract extractor, retriever, orchestrator to separate services
   - Expose via gRPC

2. **Add Spring Boot API Gateway**
   - Auth, rate limiting, observability
   - Route to Python services

3. **Incremental migration**
   - Migrate CRUD endpoints to Spring Boot
   - Leave AI logic in Python
   - Best of both worlds

---

## Action Items

### Updated for User Preferences

1. ✅ **Backend:** FastAPI (Python 3.11+)
2. ✅ **Database:** PostgreSQL from Day 1 (no SQLite)
3. ✅ **Desktop:** Deferred (web-only MVP)
4. ✅ **Vector DB:** pgvector (not ChromaDB)
5. ✅ **Keyword Search:** PostgreSQL FTS (not Tantivy)
6. ✅ **LLM:** Ollama only (no OpenAI)

### Simplifications from Web-Only Decision

**Removed from MVP:**
- ❌ Desktop packaging (Tauri/Electron)
- ❌ Auto-update mechanism
- ❌ System tray integration
- ❌ Local installer generation

**Gained Benefits:**
- ✅ Simpler deployment (Docker Compose)
- ✅ Faster iteration (no desktop build step)
- ✅ Cross-platform by default (browser)
- ✅ Easier testing (Playwright web tests)

---

## Updated Week 1 Plan

### Day 1: Environment & Database
- Setup Python 3.11+ venv
- Install PostgreSQL 15+
- Install pgvector extension
- Create database schema
- Install Ollama + models

### Day 2: FastAPI Skeleton
- Initialize FastAPI project
- Setup SQLAlchemy async
- Create Pydantic models
- Health check endpoints
- Database connection pool

### Day 3: Vault API
- Vault initialization endpoint
- UID generation service
- YAML frontmatter parser
- Entity CRUD endpoints
- File system operations

### Day 4: React Setup
- Create Vite + React + TypeScript project
- Tailwind CSS configuration
- Basic layout (nav, content)
- API client setup
- Dark mode theme

### Day 5: Integration Test
- End-to-end: Init vault → Create entity → Query via API
- Database migrations tested
- React connects to FastAPI
- Health check dashboard
- Week 1 checkpoint review

---

## Conclusion

**FastAPI is the correct choice for AEI MVP.**

Spring Boot is excellent for enterprise Java shops, but introduces unnecessary complexity and friction for an AI-first, rapid-iteration MVP with an 8-week deadline.

**Next Step:** Reply **"CONFIRMED"** to proceed with FastAPI implementation.

---

*Decision Document Version: 1.0*  
*Date: 2025-11-13*
