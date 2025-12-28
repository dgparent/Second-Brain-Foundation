/**
 * @sbf/db-migrations
 * 
 * Database migration system for Second Brain Foundation.
 * Provides schema versioning, migration tracking, and rollback support.
 */

// Types
export type {
  MigrationVersion,
  Migration,
  MigrationRecord,
  MigrationDatabase,
  MigrationManagerConfig,
  MigrationLogger,
  MigrationStatusReport,
  MigrationRunResult,
  BatchMigrationResult,
  ColumnDefinition,
  ColumnType,
  IndexOptions,
  ForeignKeyOptions,
} from './types';

export {
  MigrationDirection,
  MigrationStatus,
} from './types';

// Core
export { MigrationManager } from './MigrationManager';

// Adapters
export { PostgresAdapter, type PostgresAdapterOptions, type PostgresPool } from './adapters';

// Built-in migrations
export {
  migration001CoreSchema,
  migration002Embeddings,
  getBuiltInMigrations,
} from './migrations';
