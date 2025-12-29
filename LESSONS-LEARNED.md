# Lessons Learned: Development Conventions

**Second Brain Foundation v2.0.2**  
**Purpose:** Development conventions and patterns for future AI agents and developers  
**Last Updated:** December 29, 2025

---

## 📋 Overview

This document captures the development conventions, patterns, and lessons learned during the NextGen development cycle. It serves as a reference for:

1. **AI Agents** - To understand codebase conventions when continuing development
2. **Human Developers** - To maintain consistency across the codebase
3. **Future Sessions** - To preserve institutional knowledge

---

## 🏗️ Project Architecture

### Monorepo Structure

The project uses a **pnpm workspace monorepo** with the following organization:

```
/
├── apps/           # Deployable applications
├── packages/       # Shared libraries (@sbf scope)
├── infra/          # Infrastructure configurations
├── docs/           # Documentation
├── scripts/        # Build and utility scripts
└── e2e/            # End-to-end tests
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Packages | `@sbf/package-name` | `@sbf/search-engine` |
| Apps | `apps/app-name` | `apps/aei-core` |
| Services | `PascalCaseService` | `SearchService` |
| Types | `PascalCase` | `SearchResult` |
| Files | `PascalCase.ts` for classes, `kebab-case.ts` for utils | `SearchEngine.ts`, `query-utils.ts` |
| Test files | `*.test.ts` | `SearchEngine.test.ts` |
| Config files | `lowercase.config.ts` | `jest.config.js` |

### Package Structure Template

Every `@sbf/*` package follows this structure:

```
packages/@sbf/package-name/
├── src/
│   ├── index.ts           # Barrel exports
│   ├── types.ts           # Type definitions
│   ├── services/          # Service classes
│   │   ├── index.ts       # Service exports
│   │   └── MyService.ts
│   ├── models/            # Data models/entities
│   │   ├── index.ts
│   │   └── MyModel.ts
│   └── utils/             # Utility functions
│       ├── index.ts
│       └── helpers.ts
├── tests/                 # Or __tests__/
│   └── MyService.test.ts
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

---

## 📝 TypeScript Conventions

### Strict Mode

All packages use TypeScript strict mode:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### Type Definitions

**Prefer interfaces for object shapes:**
```typescript
// ✅ Good - interfaces for objects
export interface SearchResult {
  id: string;
  score: number;
  content: string;
}

// ✅ Good - types for unions/intersections
export type SensitivityLevel = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';

// ❌ Avoid - type for simple objects
export type SearchResult = {
  id: string;
  score: number;
};
```

**Export types from dedicated files:**
```typescript
// src/types.ts
export interface Config { ... }
export type Provider = 'openai' | 'anthropic';

// src/index.ts
export * from './types';
export * from './services';
```

### Class vs Function

**Use classes for stateful services:**
```typescript
// ✅ Services with state/dependencies
export class SearchService {
  private vectorClient: VectorClient;
  private config: SearchConfig;
  
  constructor(config: SearchServiceConfig) {
    this.vectorClient = config.vectorClient;
    this.config = config;
  }
  
  async search(query: string): Promise<SearchResult[]> { ... }
}
```

**Use functions for pure utilities:**
```typescript
// ✅ Pure functions
export function normalizeScore(score: number, max: number): number {
  return score / max;
}

export function buildSearchQuery(input: string, filters: Filters): Query {
  return { ... };
}
```

### Error Handling

**Use the `@sbf/errors` package:**
```typescript
import { 
  RecordNotFoundError, 
  ValidationError,
  ExternalServiceError 
} from '@sbf/errors';

// Throwing errors
if (!record) {
  throw new RecordNotFoundError('Source', id);
}

if (!isValid(input)) {
  throw new ValidationError('Invalid input', { field: 'query' });
}

// Catching and wrapping
try {
  await externalApi.call();
} catch (error) {
  throw ExternalServiceError.wrap('OpenAI', error);
}
```

**Error class hierarchy:**
- `SBFError` - Base class, never throw directly
- `DatabaseError` - Database operations
- `ValidationError` - Input validation
- `ExternalServiceError` - Third-party API calls
- `ContentError` - Content processing
- `TransformationError` - AI transformations
- `PodcastError` - Audio generation

---

## 🗄️ Database Conventions

### Migrations

**Migration file naming:**
```
V001__initial_schema.sql
V002__add_sources_table.sql
V003__add_vector_extension.sql
```

**Migration structure:**
```sql
-- V010__add_sensitivity_column.sql

-- Up migration
ALTER TABLE sources ADD COLUMN sensitivity_level VARCHAR(20) DEFAULT 'PUBLIC';
CREATE INDEX idx_sources_sensitivity ON sources(sensitivity_level);

-- Down migration (comment format)
-- ALTER TABLE sources DROP COLUMN sensitivity_level;
```

### Table Naming

| Convention | Example |
|------------|---------|
| Plural nouns | `sources`, `notebooks`, `users` |
| Snake_case | `source_insights`, `transformation_results` |
| Junction tables | `notebook_sources`, `user_permissions` |

### Common Columns

Every table should have:
```sql
CREATE TABLE my_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- ... other columns
);

CREATE INDEX idx_my_table_tenant ON my_table(tenant_id);
```

---

## 🐍 Python Conventions (aei-core)

### Project Structure

```
apps/aei-core/
├── main.py              # FastAPI app entry
├── config.py            # Configuration
├── api/                 # API routes
│   ├── routes/          # Route modules
│   └── docs.py          # OpenAPI customization
├── graphs/              # LangGraph agents
│   ├── base.py          # Base graph class
│   └── chat.py          # Chat graph
├── services/            # Business logic
│   ├── cache.py
│   └── podcast/         # Feature modules
├── models/              # Pydantic models
├── prompts/             # Jinja2 templates
└── tests/               # Pytest tests
```

### Naming Conventions

```python
# Classes - PascalCase
class PodcastEngine:
    pass

# Functions/methods - snake_case
def generate_podcast(notebook_id: str) -> Podcast:
    pass

# Constants - UPPER_SNAKE_CASE
MAX_RETRIES = 3
DEFAULT_MODEL = "gpt-4o"

# Private - leading underscore
def _internal_helper():
    pass
```

### Type Hints

Always use type hints:
```python
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class PodcastRequest(BaseModel):
    notebook_id: str
    style: str = "conversational"
    duration_minutes: int = 10
    voices: Optional[Dict[str, str]] = None

async def generate_podcast(
    request: PodcastRequest,
    db: AsyncSession
) -> PodcastResponse:
    ...
```

### FastAPI Patterns

```python
from fastapi import APIRouter, Depends, HTTPException, status

router = APIRouter(prefix="/api/v1/podcasts", tags=["podcasts"])

@router.post("/generate", response_model=PodcastResponse)
async def generate_podcast(
    request: PodcastRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> PodcastResponse:
    try:
        return await podcast_service.generate(request, db)
    except RecordNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
```

---

## 🧪 Testing Conventions

### Test File Location

```
# Option 1: __tests__ folder (preferred for packages)
packages/@sbf/search-engine/
├── src/
└── __tests__/
    └── SearchService.test.ts

# Option 2: tests folder (preferred for apps)
apps/aei-core/
├── src/
└── tests/
    └── test_podcast.py

# Option 3: Colocated (acceptable for small modules)
packages/@sbf/cli/src/
├── commands/
│   ├── search.ts
│   └── search.test.ts
```

### Test Naming

```typescript
// TypeScript - describe blocks with method names
describe('SearchService', () => {
  describe('search', () => {
    it('should return results matching query', async () => {});
    it('should filter by notebook when provided', async () => {});
    it('should throw ValidationError for empty query', async () => {});
  });
});

// Python - test_ prefix
def test_generate_podcast_success():
    ...

def test_generate_podcast_invalid_notebook():
    ...
```

### Mock Patterns

```typescript
// Jest mocks
jest.mock('@sbf/ai-client', () => ({
  AIClient: jest.fn().mockImplementation(() => ({
    chat: jest.fn().mockResolvedValue({ content: 'response' })
  }))
}));

// In-memory implementations
class InMemorySearchRepository implements SearchRepository {
  private items: Map<string, SearchResult> = new Map();
  
  async save(result: SearchResult): Promise<void> {
    this.items.set(result.id, result);
  }
  
  async find(id: string): Promise<SearchResult | null> {
    return this.items.get(id) ?? null;
  }
}
```

---

## 📦 Package Dependencies

### Workspace Dependencies

Use `workspace:*` for internal packages:
```json
{
  "dependencies": {
    "@sbf/errors": "workspace:*",
    "@sbf/domain-base": "workspace:*"
  }
}
```

### Peer Dependencies

Use peer dependencies for optional integrations:
```json
{
  "peerDependencies": {
    "pg": "^8.11.0"
  },
  "peerDependenciesMeta": {
    "pg": {
      "optional": true
    }
  }
}
```

### Version Pinning

- **Exact versions** for critical dependencies
- **Caret (^)** for minor/patch updates
- **Workspace** for internal packages

---

## 🔧 Configuration Patterns

### Environment Variables

```typescript
// config.ts
export interface Config {
  database: {
    url: string;
    poolSize: number;
  };
  ai: {
    openaiKey?: string;
    anthropicKey?: string;
  };
}

export function loadConfig(): Config {
  return {
    database: {
      url: process.env.DATABASE_URL ?? 'postgresql://localhost/sbf',
      poolSize: parseInt(process.env.DB_POOL_SIZE ?? '10')
    },
    ai: {
      openaiKey: process.env.OPENAI_API_KEY,
      anthropicKey: process.env.ANTHROPIC_API_KEY
    }
  };
}
```

### Factory Functions

```typescript
// Create configured instances
export function createSearchEngine(config: SearchConfig): SearchEngine {
  const vectorClient = new VectorClient(config.vector);
  const textSearch = new TextSearchService(config.database);
  
  return new HybridSearchEngine({
    vectorClient,
    textSearch,
    weights: config.weights ?? { vector: 0.7, text: 0.3 }
  });
}
```

---

## 📄 Documentation Patterns

### README Structure

Every package README should include:

1. **Title and description**
2. **Installation**
3. **Quick usage example**
4. **API reference (key methods)**
5. **Configuration options**
6. **Examples**

### JSDoc Comments

```typescript
/**
 * Search for content across the knowledge base.
 * 
 * Performs hybrid search combining vector similarity and keyword matching.
 * Results are ranked by relevance score and deduplicated.
 * 
 * @param query - Search query string
 * @param options - Search options
 * @param options.notebookId - Filter by notebook
 * @param options.limit - Maximum results (default: 20)
 * @returns Ranked search results with highlights
 * 
 * @example
 * ```typescript
 * const results = await searchEngine.search('machine learning', {
 *   notebookId: 'notebook-123',
 *   limit: 10
 * });
 * ```
 */
async search(
  query: string,
  options?: SearchOptions
): Promise<SearchResult[]> {
  // implementation
}
```

---

## 🔄 Git Conventions

### Commit Messages

```
type(scope): description

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting
- refactor: Code restructuring
- test: Adding tests
- chore: Maintenance

Examples:
feat(search-engine): add hybrid search with vector + keyword
fix(ai-client): handle rate limit errors with retry
docs(readme): update quick start guide
```

### Branch Naming

```
feature/search-engine-hybrid
fix/ai-client-retry-logic
docs/update-readme
chore/update-dependencies
```

### Tagging

```
v2.0.2    # Release versions
v2.0.2-beta.1  # Pre-release
```

---

## 🎯 AI Agent Instructions

When continuing development on this codebase:

### Before Starting

1. **Read the PRD**: `docs/02-product/prd.md` for requirements
2. **Check completion tracker**: `docs/nextgen-completion.md` for status
3. **Review instructions**: `docs/nextgen-instructions.md` for workflow

### Development Workflow

1. **Identify the phase/sprint** you're working on
2. **Create package structure** following templates above
3. **Implement with tests** - no code without tests
4. **Update exports** in `src/index.ts`
5. **Write README** with usage examples
6. **Update completion tracker** when done

### Code Generation Rules

1. **Use existing patterns** - look at similar packages for examples
2. **Import from @sbf packages** - don't duplicate utilities
3. **Add types for everything** - no `any` unless absolutely necessary
4. **Handle errors properly** - use `@sbf/errors` classes
5. **Include JSDoc comments** - especially for public APIs
6. **Write tests** - aim for key functionality coverage

### Package Creation Checklist

- [ ] `package.json` with correct dependencies
- [ ] `tsconfig.json` extending base config
- [ ] `jest.config.js` for testing
- [ ] `src/index.ts` with barrel exports
- [ ] `src/types.ts` for type definitions
- [ ] Service classes in `src/services/`
- [ ] Tests in `__tests__/` or `tests/`
- [ ] `README.md` with documentation
- [ ] Update `pnpm-workspace.yaml` if needed

---

## 📚 Reference Documents

| Document | Purpose |
|----------|---------|
| `docs/nextgen-instructions.md` | Development workflow guide |
| `docs/nextgen-completion.md` | Phase/sprint tracker |
| `docs/nextgen-blueprint.md` | Architecture overview |
| `docs/02-product/prd.md` | Product requirements |
| `CONTRIBUTING.md` | Contribution guidelines |

---

## 🏆 Summary

The key principles for this codebase:

1. **Consistency** - Follow established patterns
2. **Type Safety** - TypeScript strict mode everywhere
3. **Modularity** - Small, focused packages
4. **Testability** - Code should be testable
5. **Documentation** - Code should be self-documenting
6. **Error Handling** - Use structured exceptions
7. **Configuration** - Environment-based config

---

<p align="center">
  <em>These conventions ensure consistent, maintainable code across the project.</em>
</p>
