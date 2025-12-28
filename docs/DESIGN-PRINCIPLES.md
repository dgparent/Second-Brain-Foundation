# SBF Design Principles

**Version:** 1.0.0  
**Last Updated:** December 28, 2025  
**Phase:** 00 - Foundation Infrastructure

---

## Core Philosophy

The Second Brain Foundation (SBF) platform is built on these foundational principles:

1. **Developer Experience First**: Every API should be intuitive and self-documenting
2. **Fail Fast, Fail Clearly**: Errors should be specific, actionable, and traceable
3. **Multi-Tenancy by Default**: Every data operation is tenant-isolated
4. **Extensibility Over Features**: Core should be minimal, plugins should be powerful
5. **Type Safety Everywhere**: TypeScript strict mode, runtime validation, database types

---

## Error Handling

### Principle: Every Error Tells a Story

Errors in SBF follow a strict hierarchy and contain complete context for debugging.

### Error Hierarchy

```
SBFError (base)
├── DatabaseError
│   ├── ConnectionError
│   ├── QueryError
│   ├── TransactionError
│   ├── MigrationError
│   ├── RecordNotFoundError
│   ├── DuplicateRecordError
│   └── ForeignKeyViolationError
├── ValidationError
│   ├── SchemaValidationError
│   ├── TypeValidationError
│   └── BusinessRuleError
├── ExternalServiceError
│   ├── ApiError
│   ├── TimeoutError
│   └── RateLimitError
└── DomainError
    ├── ContentError
    ├── TransformationError
    └── PodcastError
```

### Usage Pattern

```typescript
import { 
  SBFError, 
  RecordNotFoundError, 
  ExternalServiceError 
} from '@sbf/errors';

// Creating domain-specific errors
throw new RecordNotFoundError('User', userId, { tenantId });

// Wrapping external errors
try {
  await fetch(url);
} catch (error) {
  throw SBFError.wrap(error, 'ExternalServiceError', 'API call failed');
}

// Error response for API
app.use((error, req, res, next) => {
  if (error instanceof SBFError) {
    res.status(error.statusCode).json(error.toAPIResponse());
  }
});
```

### Error Requirements

| Requirement | Description |
|-------------|-------------|
| Code | Unique error code (e.g., `ERR_RECORD_NOT_FOUND`) |
| Message | Human-readable, non-technical when possible |
| Details | Structured context for debugging |
| Stack | Full stack trace in development |
| Retry Info | `isRetryable` boolean for retry logic |
| Timestamp | When the error occurred |

---

## Entity Patterns

### Principle: Entities Are Self-Managing

Entities in SBF handle their own persistence, validation, and lifecycle.

### Base Entity Features

```typescript
import { BaseEntity } from '@sbf/domain-base';

class User extends BaseEntity {
  email: string;
  name: string;
  
  async beforeSave(): Promise<void> {
    this.email = this.email.toLowerCase();
  }
  
  async afterSave(): Promise<void> {
    await this.publishEvent('user.saved');
  }
}

// Usage
const user = new User({ email: 'Test@Example.com', name: 'Test' });
await user.save();  // Auto-lowercases email, updates timestamps
```

### Entity Types

| Type | Purpose | Key Features |
|------|---------|--------------|
| `BaseEntity` | Standard entities | CRUD, timestamps, hooks |
| `EmbeddableEntity` | AI-searchable | Auto-embedding, hash tracking |
| `SingletonEntity` | Shared instances | Instance caching, thread-safe |
| `AggregateRoot` | Domain aggregates | Consistency boundary |

### Embeddable Pattern

```typescript
class Document extends EmbeddableEntity {
  title: string;
  content: string;
  
  getEmbeddingContent(): string {
    return `${this.title}\n\n${this.content}`;
  }
}

// Auto-generates embedding on content change
const doc = new Document({ title: 'Guide', content: 'Long content...' });
await doc.save();  // Generates embedding if content changed
```

### Lifecycle Hooks

| Hook | When Called | Use Cases |
|------|-------------|-----------|
| `beforeSave` | Before insert/update | Validation, normalization |
| `afterSave` | After successful save | Events, cache invalidation |
| `beforeDelete` | Before deletion | Cleanup, validation |
| `afterDelete` | After successful delete | Events, cascade |

---

## Multi-Tenancy

### Principle: Data Isolation is Non-Negotiable

Every operation in SBF operates within a tenant context. Cross-tenant access requires explicit elevation.

### Tenant Context

```typescript
import { setTenantContext, getTenantContext } from '@sbf/domain-base';

// Set at request start (middleware)
app.use((req, res, next) => {
  const tenantId = extractTenantId(req);
  setTenantContext(tenantId);
  next();
});

// All queries auto-filter by tenant
const users = await User.list();  // WHERE tenant_id = ?
```

### Tenant Isolation Rules

| Rule | Enforcement |
|------|-------------|
| All tables have `tenant_id` | Migration schema enforcement |
| All queries filter by tenant | BaseEntity query builder |
| Cross-tenant requires elevation | `withElevatedAccess()` wrapper |
| Tenant context is async-local | Uses AsyncLocalStorage |

### Multi-Tenant Schema

```sql
CREATE TABLE entities (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  type VARCHAR(100) NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_entities_tenant ON entities(tenant_id);
```

---

## Job Processing

### Principle: Background Work Should Be Reliable

Jobs in SBF are persistent, retryable, and observable.

### Job Definition

```typescript
import { JobRunner, RetryStrategy } from '@sbf/job-runner';

const runner = new JobRunner();

runner.register({
  type: 'email:send',
  handler: async (payload, handle) => {
    handle.progress(0.1, 'Preparing email');
    await prepareEmail(payload);
    
    handle.progress(0.5, 'Sending');
    await sendEmail(payload);
    
    return { sent: true };
  },
  options: {
    retryStrategy: RetryStrategy.EXPONENTIAL,
    maxRetries: 5,
    timeout: 30000,
  },
});

// Enqueue job
const job = await runner.enqueue('email:send', { to: 'user@example.com' });
```

### Retry Strategies

| Strategy | Behavior | Use Case |
|----------|----------|----------|
| `FIXED` | Same delay each retry | Simple retries |
| `LINEAR` | Increasing by base | Gradual backoff |
| `EXPONENTIAL` | 2^attempt * base | External APIs |
| `IMMEDIATE` | No delay | Quick retries |

### Job States

```
PENDING → RUNNING → COMPLETED
              ↓
           FAILED → PENDING (retry)
              ↓
           FAILED (max retries)
```

---

## Database Migrations

### Principle: Schema Changes Are Versioned and Reversible

Every schema change is tracked, versioned, and can be rolled back.

### Migration Structure

```typescript
import { MigrationDatabase } from '@sbf/db-migrations';

export default {
  version: '001',
  name: 'core_schema',
  
  async up(db: MigrationDatabase): Promise<void> {
    await db.createTable('users', [
      { name: 'id', type: 'UUID', primaryKey: true },
      { name: 'email', type: 'VARCHAR(255)', unique: true },
      { name: 'created_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
    ]);
  },
  
  async down(db: MigrationDatabase): Promise<void> {
    await db.dropTable('users');
  },
};
```

### Migration Commands

```bash
# Apply all pending migrations
sbf-migrate up

# Rollback last migration
sbf-migrate down

# Apply up to specific version
sbf-migrate up --to 003

# Show migration status
sbf-migrate status
```

### Migration Rules

| Rule | Rationale |
|------|-----------|
| Always reversible | Enable quick rollbacks |
| One concern per migration | Easier debugging |
| Test up and down | Verify reversibility |
| Never modify applied | Create new migration instead |

---

## Token & Context Management

### Principle: Context Assembly is Budget-Aware

LLM context is precious. Assemble it with priority and cost awareness.

### Context Builder

```typescript
import { ContextBuilder, ContextPriority, createContextBuilder } from '@sbf/ai-client';

const builder = createContextBuilder('gpt-4', { maxTokens: 6000 });

// Add items by priority
builder.addSystemMessage('You are helpful.');  // CRITICAL
builder.addDocument(doc.content, 0.9);         // HIGH + relevance
builder.addHistory(messages);                   // HIGH
builder.addUserMessage(query);                  // CRITICAL

const result = builder.build();
// result.messages - ready for API
// result.excludedItems - what didn't fit
// result.budgetUtilization - % of budget used
```

### Priority Levels

| Priority | Include When | Examples |
|----------|--------------|----------|
| CRITICAL | Always | System prompt, user query |
| HIGH | Space allows | Recent context, direct refs |
| MEDIUM | Budget permits | Related content |
| LOW | Excess budget | Supplementary info |

### Cost Tracking

```typescript
import { TokenTracker, calculateCost } from '@sbf/ai-client';

const tracker = new TokenTracker({ tenantId: 'tenant-123' });

// Record usage
await tracker.record('gpt-4', 1000, 500, { operation: 'chat' });

// Check budget
const budget = await tracker.getRemainingBudget(10.0, 'day');
if (budget.remaining < 1.0) {
  // Switch to cheaper model or warn user
}
```

---

## Code Style Guidelines

### TypeScript

```typescript
// ✅ Explicit types for public APIs
export function createUser(data: CreateUserInput): Promise<User>

// ✅ Use const assertions for literals
const RETRY_STRATEGIES = ['fixed', 'linear', 'exponential'] as const;

// ✅ Prefer interfaces over types for extensibility
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<User>;
}

// ✅ Use discriminated unions for state
type JobState = 
  | { status: 'pending' }
  | { status: 'running'; startedAt: Date }
  | { status: 'completed'; result: unknown }
  | { status: 'failed'; error: Error };
```

### Naming Conventions

| Item | Convention | Example |
|------|------------|---------|
| Classes | PascalCase | `UserRepository` |
| Interfaces | PascalCase, no I prefix | `UserRepository` |
| Functions | camelCase | `createUser` |
| Constants | SCREAMING_SNAKE | `MAX_RETRIES` |
| Files | kebab-case | `user-repository.ts` |
| Packages | @sbf/kebab-case | `@sbf/domain-base` |

### File Organization

```
packages/
  @sbf/
    errors/
      src/
        index.ts        # Public exports only
        base.ts         # Base error class
        database.ts     # Database errors
        validation.ts   # Validation errors
        errors.test.ts  # Tests next to source
      package.json
      tsconfig.json
      jest.config.js
      README.md
```

---

## Testing Guidelines

### Test Structure

```typescript
describe('UserRepository', () => {
  describe('findById', () => {
    it('should return user when found', async () => {
      // Arrange
      const user = await createTestUser();
      
      // Act
      const result = await repo.findById(user.id);
      
      // Assert
      expect(result).toEqual(user);
    });
    
    it('should throw RecordNotFoundError when not found', async () => {
      await expect(repo.findById('invalid-id'))
        .rejects.toThrow(RecordNotFoundError);
    });
  });
});
```

### Test Requirements

| Requirement | Coverage |
|-------------|----------|
| Unit tests | All public functions |
| Integration tests | Database operations |
| Error cases | All error paths |
| Edge cases | Null, empty, boundary |

---

## Package Structure

### Standard Package Layout

```
@sbf/package-name/
├── src/
│   ├── index.ts         # Public exports
│   ├── types.ts         # Type definitions
│   ├── [feature].ts     # Feature implementation
│   └── [feature].test.ts # Feature tests
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

### Package.json Template

```json
{
  "name": "@sbf/package-name",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "dev": "tsc --watch"
  },
  "devDependencies": {
    "@types/jest": "^29.5.11",
    "@types/node": "^20.10.0",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1",
    "typescript": "^5.3.3"
  }
}
```

---

## Security Principles

### Data Protection

| Principle | Implementation |
|-----------|----------------|
| Encrypt at rest | Database encryption |
| Encrypt in transit | TLS everywhere |
| Minimize exposure | Return only needed fields |
| Audit access | Log all data access |

### Tenant Isolation

| Layer | Protection |
|-------|------------|
| Database | Row-level security |
| Application | Tenant context validation |
| API | Tenant verification middleware |
| Logs | Tenant-scoped logging |

---

## Performance Guidelines

### Database

| Guideline | Rationale |
|-----------|-----------|
| Index foreign keys | Faster joins |
| Use JSONB for flexible data | Better indexing |
| Paginate list queries | Bounded memory |
| Use connection pooling | Resource efficiency |

### Application

| Guideline | Rationale |
|-----------|-----------|
| Batch database operations | Fewer round trips |
| Use async/await properly | Non-blocking I/O |
| Cache expensive operations | Reduce latency |
| Lazy load relationships | Avoid N+1 |

---

*This document defines the core design principles for the SBF platform. All code contributions should align with these principles.*
