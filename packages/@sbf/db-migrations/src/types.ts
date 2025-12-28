/**
 * @sbf/db-migrations - Types
 * 
 * Core types and interfaces for the migration system.
 */

/**
 * Migration version identifier
 */
export type MigrationVersion = string;

/**
 * Migration direction
 */
export enum MigrationDirection {
  UP = 'up',
  DOWN = 'down',
}

/**
 * Migration status
 */
export enum MigrationStatus {
  PENDING = 'pending',
  APPLIED = 'applied',
  FAILED = 'failed',
}

/**
 * Migration definition
 */
export interface Migration {
  /** Migration version (e.g., "001", "20250101_120000") */
  version: MigrationVersion;
  
  /** Human-readable migration name */
  name: string;
  
  /** Description of what this migration does */
  description?: string;
  
  /** Apply the migration (up) */
  up: (db: MigrationDatabase) => Promise<void>;
  
  /** Rollback the migration (down) */
  down: (db: MigrationDatabase) => Promise<void>;
  
  /** Whether this migration is reversible */
  reversible?: boolean;
  
  /** Dependencies on other migrations */
  dependencies?: MigrationVersion[];
}

/**
 * Migration record in the database
 */
export interface MigrationRecord {
  /** Migration version */
  version: MigrationVersion;
  
  /** Migration name */
  name: string;
  
  /** When migration was applied */
  appliedAt: string;
  
  /** Time taken to apply in ms */
  executionTimeMs: number;
  
  /** Checksum of migration for integrity checking */
  checksum?: string;
  
  /** Which direction was applied */
  direction: MigrationDirection;
}

/**
 * Database adapter for migrations
 */
export interface MigrationDatabase {
  /** Execute raw SQL */
  execute(sql: string, params?: unknown[]): Promise<void>;
  
  /** Execute multiple SQL statements in a transaction */
  transaction(fn: (db: MigrationDatabase) => Promise<void>): Promise<void>;
  
  /** Query data */
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]>;
  
  /** Query single row */
  queryOne<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T | null>;
  
  /** Check if table exists */
  tableExists(tableName: string): Promise<boolean>;
  
  /** Create table */
  createTable(tableName: string, columns: ColumnDefinition[]): Promise<void>;
  
  /** Drop table */
  dropTable(tableName: string): Promise<void>;
  
  /** Add column to table */
  addColumn(tableName: string, column: ColumnDefinition): Promise<void>;
  
  /** Drop column from table */
  dropColumn(tableName: string, columnName: string): Promise<void>;
  
  /** Create index */
  createIndex(tableName: string, indexName: string, columns: string[], options?: IndexOptions): Promise<void>;
  
  /** Drop index */
  dropIndex(indexName: string): Promise<void>;
  
  /** Add foreign key */
  addForeignKey(
    tableName: string,
    constraintName: string,
    columns: string[],
    referenceTable: string,
    referenceColumns: string[],
    options?: ForeignKeyOptions
  ): Promise<void>;
  
  /** Drop foreign key */
  dropForeignKey(tableName: string, constraintName: string): Promise<void>;
}

/**
 * Column definition for table creation
 */
export interface ColumnDefinition {
  name: string;
  type: ColumnType;
  nullable?: boolean;
  primaryKey?: boolean;
  unique?: boolean;
  defaultValue?: string | number | boolean | null;
  references?: {
    table: string;
    column: string;
    onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
    onUpdate?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
  };
}

/**
 * Supported column types
 */
export type ColumnType =
  | 'uuid'
  | 'text'
  | 'varchar'
  | 'integer'
  | 'bigint'
  | 'boolean'
  | 'timestamp'
  | 'timestamptz'
  | 'date'
  | 'json'
  | 'jsonb'
  | 'real'
  | 'double'
  | 'vector'
  | 'bytea';

/**
 * Index creation options
 */
export interface IndexOptions {
  unique?: boolean;
  where?: string;
  using?: 'btree' | 'hash' | 'gin' | 'gist' | 'ivfflat' | 'hnsw';
  withOptions?: Record<string, string | number>;
}

/**
 * Foreign key options
 */
export interface ForeignKeyOptions {
  onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
  onUpdate?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
}

/**
 * Migration manager configuration
 */
export interface MigrationManagerConfig {
  /** Database adapter */
  database: MigrationDatabase;
  
  /** Table name for tracking migrations (default: '_migrations') */
  tableName?: string;
  
  /** Path to migrations directory */
  migrationsPath?: string;
  
  /** Logger instance */
  logger?: MigrationLogger;
  
  /** Whether to run in dry-run mode */
  dryRun?: boolean;
}

/**
 * Logger interface for migrations
 */
export interface MigrationLogger {
  debug(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
}

/**
 * Migration status report
 */
export interface MigrationStatusReport {
  /** Currently applied migrations */
  applied: MigrationRecord[];
  
  /** Pending migrations */
  pending: Migration[];
  
  /** Failed migrations */
  failed: MigrationRecord[];
  
  /** Current database version */
  currentVersion: MigrationVersion | null;
  
  /** Whether database is up to date */
  upToDate: boolean;
}

/**
 * Migration run result
 */
export interface MigrationRunResult {
  /** Migration version */
  version: MigrationVersion;
  
  /** Migration name */
  name: string;
  
  /** Direction executed */
  direction: MigrationDirection;
  
  /** Success or failure */
  success: boolean;
  
  /** Execution time in ms */
  executionTimeMs: number;
  
  /** Error if failed */
  error?: Error;
}

/**
 * Batch migration result
 */
export interface BatchMigrationResult {
  /** Individual results */
  results: MigrationRunResult[];
  
  /** Whether all migrations succeeded */
  success: boolean;
  
  /** Total execution time */
  totalTimeMs: number;
  
  /** Number of successful migrations */
  successCount: number;
  
  /** Number of failed migrations */
  failedCount: number;
}
