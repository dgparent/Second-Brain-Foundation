# @sbf/db-migrations

Database migration system for Second Brain Foundation. Provides schema versioning, migration tracking, rollback support, and a CLI for managing migrations.

## Installation

```bash
pnpm add @sbf/db-migrations
```

## Features

- **MigrationManager**: Core migration runner with up/down/reset operations
- **Version Tracking**: Tracks applied migrations with checksums for integrity
- **PostgreSQL Adapter**: Full PostgreSQL support with vector search
- **Built-in Migrations**: Core schema included out of the box
- **CLI Tool**: Command-line interface for migration operations
- **Dry Run Mode**: Preview changes without executing

## Usage

### Basic Setup

```typescript
import { 
  MigrationManager, 
  PostgresAdapter, 
  getBuiltInMigrations 
} from '@sbf/db-migrations';
import { Pool } from 'pg';

// Create database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PostgresAdapter({ pool });

// Create migration manager
const manager = new MigrationManager({
  database: adapter,
});

// Register built-in migrations
manager.registerAll(getBuiltInMigrations());

// Run migrations
await manager.up();
```

### Check Status

```typescript
const status = await manager.getStatus();

console.log('Applied:', status.applied.length);
console.log('Pending:', status.pending.length);
console.log('Current Version:', status.currentVersion);
console.log('Up to Date:', status.upToDate);
```

### Run Migrations

```typescript
// Run all pending migrations
const result = await manager.up();
console.log(`Success: ${result.success}`);
console.log(`Applied: ${result.successCount}`);
console.log(`Time: ${result.totalTimeMs}ms`);

// Run up to a specific version
await manager.upTo('002');
```

### Rollback Migrations

```typescript
// Rollback last migration
await manager.down();

// Rollback to a specific version
await manager.downTo('001');

// Reset all migrations
await manager.reset();
```

### Creating Custom Migrations

```typescript
import { Migration, MigrationDatabase } from '@sbf/db-migrations';

const migration: Migration = {
  version: '003',
  name: 'add_notes_table',
  description: 'Creates notes table for users',
  reversible: true,

  async up(db: MigrationDatabase): Promise<void> {
    await db.createTable('notes', [
      { name: 'id', type: 'uuid', primaryKey: true },
      { name: 'user_id', type: 'uuid', nullable: false, references: {
        table: 'users',
        column: 'id',
        onDelete: 'CASCADE',
      }},
      { name: 'title', type: 'varchar', nullable: false },
      { name: 'content', type: 'text', nullable: true },
      { name: 'created_at', type: 'timestamptz', nullable: false },
      { name: 'updated_at', type: 'timestamptz', nullable: false },
    ]);

    await db.createIndex('notes', 'idx_notes_user', ['user_id']);
  },

  async down(db: MigrationDatabase): Promise<void> {
    await db.dropTable('notes');
  },
};

// Register custom migration
manager.register(migration);
```

### CLI Usage

```bash
# Set database connection
export DATABASE_URL="postgres://user:pass@localhost:5432/mydb"

# Run all pending migrations
npx sbf-migrate up

# Rollback last migration
npx sbf-migrate down

# Show migration status
npx sbf-migrate status

# Reset database (rollback all)
npx sbf-migrate reset

# Preview changes without executing
npx sbf-migrate up --dry-run

# Create new migration template
npx sbf-migrate create add_tags_table
```

## Built-in Migrations

### 001: Core Schema

Creates foundational tables:
- `tenants` - Multi-tenant support
- `users` - User accounts
- `entities` - Base entity tracking
- `entity_relationships` - Entity connections

### 002: Vector Embeddings

Adds AI/vector capabilities:
- `entity_embeddings` - Vector embeddings table
- `jobs` - Background job queue
- HNSW index for efficient vector search
- `search_entities_by_embedding()` function

## API Reference

### MigrationDatabase Interface

Database adapter interface for migrations:

```typescript
interface MigrationDatabase {
  execute(sql: string, params?: unknown[]): Promise<void>;
  transaction(fn: (db: MigrationDatabase) => Promise<void>): Promise<void>;
  query<T>(sql: string, params?: unknown[]): Promise<T[]>;
  queryOne<T>(sql: string, params?: unknown[]): Promise<T | null>;
  tableExists(tableName: string): Promise<boolean>;
  createTable(tableName: string, columns: ColumnDefinition[]): Promise<void>;
  dropTable(tableName: string): Promise<void>;
  addColumn(tableName: string, column: ColumnDefinition): Promise<void>;
  dropColumn(tableName: string, columnName: string): Promise<void>;
  createIndex(tableName: string, indexName: string, columns: string[], options?: IndexOptions): Promise<void>;
  dropIndex(indexName: string): Promise<void>;
  addForeignKey(...): Promise<void>;
  dropForeignKey(tableName: string, constraintName: string): Promise<void>;
}
```

### Column Types

Supported column types:
- `uuid` - UUID
- `text` - Unlimited text
- `varchar` - Variable character (255)
- `integer` - 32-bit integer
- `bigint` - 64-bit integer
- `boolean` - True/false
- `timestamp` - Timestamp without timezone
- `timestamptz` - Timestamp with timezone
- `date` - Date only
- `json` - JSON data
- `jsonb` - Binary JSON (indexed)
- `real` - Single precision float
- `double` - Double precision float
- `vector` - pgvector embedding
- `bytea` - Binary data

### Index Options

```typescript
interface IndexOptions {
  unique?: boolean;        // Create unique index
  where?: string;          // Partial index condition
  using?: 'btree' | 'hash' | 'gin' | 'gist' | 'ivfflat' | 'hnsw';
  withOptions?: Record<string, string | number>;  // Index-specific options
}
```

## Migration Best Practices

1. **Version Naming**: Use sequential numbers (`001`, `002`) or timestamps (`20250101_120000`)
2. **Atomic Changes**: Each migration should be self-contained
3. **Reversibility**: Always implement `down()` for rollback support
4. **Test Rollbacks**: Test both `up` and `down` in development
5. **Never Edit Applied**: Don't modify migrations already applied to production
6. **Small Migrations**: Prefer many small migrations over few large ones

## License

MIT © Second Brain Foundation
