# @sbf/domain-base

Base entity patterns and utilities for the Second Brain Foundation (SBF) domain layer. Provides auto-timestamps, auto-embedding, tenant isolation, and generic CRUD operations.

## Installation

```bash
pnpm add @sbf/domain-base
```

## Features

- **BaseEntity**: Auto-timestamps, generic CRUD, tenant isolation
- **EmbeddableEntity**: Auto-embedding with hash-based change detection
- **SingletonEntity**: Config/singleton pattern with instance caching
- **Timestamp Utilities**: ISO8601 manipulation functions
- **Serialization Utilities**: Database ↔ entity conversion

## Usage

### BaseEntity

Base class for all domain entities with automatic timestamps and CRUD operations.

```typescript
import { BaseEntity, DatabaseAdapter } from '@sbf/domain-base';

class User extends BaseEntity {
  static tableName = 'users';
  
  name: string = '';
  email: string = '';
  
  constructor(data: Partial<User> = {}) {
    super(data);
    this.name = data.name || '';
    this.email = data.email || '';
  }
}

// Configure database and tenant
User.configure(dbAdapter, 'tenant-123');

// Create and save
const user = new User({ name: 'Alice', email: 'alice@example.com' });
await user.save();

console.log(user.id);        // Auto-generated UUID
console.log(user.createdAt); // Auto-set timestamp
console.log(user.updatedAt); // Auto-updated on save

// Read operations
const found = await User.get('user-id-123');
const all = await User.list({ limit: 100 });

// Update
user.name = 'Alice Updated';
await user.save(); // updatedAt auto-updated

// Delete
await user.delete();
```

### EmbeddableEntity

Entity with automatic embedding generation for vector search.

```typescript
import { EmbeddableEntity, EmbeddingProvider } from '@sbf/domain-base';

class Document extends EmbeddableEntity {
  static tableName = 'documents';
  static autoEmbedding = true;
  
  title: string = '';
  content: string = '';
  
  constructor(data: Partial<Document> = {}) {
    super(data);
    this.title = data.title || '';
    this.content = data.content || '';
  }
  
  // Required: return content for embedding
  getEmbeddingContent(): string {
    return `${this.title}\n\n${this.content}`;
  }
}

// Configure with embedding provider
Document.configure(dbAdapter, 'tenant-123');
Document.configureEmbedding(embeddingProvider);

// Create document - embedding auto-generated on save
const doc = new Document({
  title: 'Getting Started',
  content: 'This is the getting started guide...',
});
await doc.save();

console.log(doc.embedding);          // number[] vector
console.log(doc.embeddingGeneratedAt);
console.log(doc.embeddingContentHash);

// Check if re-embedding needed (content changed)
doc.content = 'Updated content...';
console.log(doc.needsReembedding()); // true

// Re-embed on save
await doc.save();
```

### SingletonEntity

For configuration-type entities where only one instance exists per record ID.

```typescript
import { SingletonEntity } from '@sbf/domain-base';

class UserPreferences extends SingletonEntity {
  static tableName = 'user_preferences';
  static recordIdField = 'user_id';
  
  userId: string = '';
  theme: string = 'light';
  notifications: boolean = true;
  
  constructor(data: Partial<UserPreferences> = {}) {
    super(data);
    this.userId = data.userId || '';
    this.theme = data.theme || 'light';
    this.notifications = data.notifications ?? true;
  }
  
  getRecordId(): string {
    return this.userId;
  }
}

// Configure
UserPreferences.configure(dbAdapter, 'tenant-123');

// Get or create singleton instance
const prefs = await UserPreferences.getInstance('user-123', {
  defaults: { theme: 'dark' },
});

prefs.theme = 'dark';
await prefs.save();

// Same instance returned (cached)
const same = await UserPreferences.getInstance('user-123');
console.log(same === prefs); // true
```

## Types

### DatabaseAdapter

Interface for database operations:

```typescript
interface DatabaseAdapter {
  query<T>(sql: string, params?: unknown[]): Promise<T[]>;
  queryOne<T>(sql: string, params?: unknown[]): Promise<T | null>;
  insert(table: string, data: Record<string, unknown>): Promise<string>;
  update(table: string, id: string, data: Record<string, unknown>): Promise<number>;
  delete(table: string, id: string): Promise<number>;
  setTenantContext(tenantId: TenantId): Promise<void>;
  beginTransaction?(): Promise<void>;
  commitTransaction?(): Promise<void>;
  rollbackTransaction?(): Promise<void>;
}
```

### EmbeddingProvider

Interface for embedding generation:

```typescript
interface EmbeddingProvider {
  embed(text: string): Promise<number[]>;
  embedBatch?(texts: string[]): Promise<number[][]>;
  getDimension(): number;
}
```

### Entity Options

```typescript
interface SaveOptions {
  skipTimestamps?: boolean;
  skipEmbedding?: boolean;
  forceInsert?: boolean;
}

interface GetOptions {
  tenantId?: TenantId;
  includeDeleted?: boolean;
}

interface ListOptions extends GetOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
  where?: Record<string, unknown>;
}
```

## Utilities

### Timestamp Functions

```typescript
import { now, isValidISO8601, addDuration, Duration } from '@sbf/domain-base';

const timestamp = now();  // '2025-12-28T10:00:00.000Z'
isValidISO8601(timestamp); // true

const later = addDuration(timestamp, Duration.HOUR);
const muchLater = addDuration(timestamp, 48 * Duration.HOUR);
```

### Serialization Functions

```typescript
import { 
  modelDumpForSave, 
  rowToEntity,
  toSnakeCase,
  toCamelCase,
  deepClone 
} from '@sbf/domain-base';

// Convert entity to DB format (camelCase -> snake_case)
const dbData = modelDumpForSave(entity);

// Convert DB row to entity format (snake_case -> camelCase)
const entity = rowToEntity<MyEntity>(row);

// Case conversion
toSnakeCase('createdAt'); // 'created_at'
toCamelCase('created_at'); // 'createdAt'
```

## Entity Fields

All entities inherit these fields from `BaseEntity`:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | UUID primary key (auto-generated) |
| `tenantId` | string | Tenant ID for isolation |
| `createdAt` | string | ISO8601 creation timestamp |
| `updatedAt` | string | ISO8601 last update timestamp |

`EmbeddableEntity` adds:

| Field | Type | Description |
|-------|------|-------------|
| `embedding` | number[] | Vector embedding |
| `embeddingGeneratedAt` | string | When embedding was generated |
| `embeddingContentHash` | string | Hash of content used for embedding |

## Tenant Isolation

All entities automatically include tenant isolation via `tenantId`:

```typescript
// Configure tenant context
User.configure(dbAdapter, 'tenant-abc');

// All operations are scoped to tenant-abc
const users = await User.list(); // Only tenant-abc users

// Override tenant for specific operation
const user = await User.get('user-id', { tenantId: 'tenant-xyz' });
```

## Error Handling

The package throws `@sbf/errors` exceptions:

- `DatabaseError` - Database connection/configuration issues
- `EntityNotFoundError` - Entity not found by ID
- `ValidationError` - Invalid entity data

```typescript
import { EntityNotFoundError } from '@sbf/errors';

try {
  const user = await User.getOrThrow('invalid-id');
} catch (error) {
  if (error instanceof EntityNotFoundError) {
    console.log('User not found:', error.entityType, error.entityId);
  }
}
```

## License

MIT © Second Brain Foundation
