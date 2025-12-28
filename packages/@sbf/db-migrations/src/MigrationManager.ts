/**
 * @sbf/db-migrations - MigrationManager
 * 
 * Main class for managing database migrations.
 */

import { MigrationError, DatabaseError } from '@sbf/errors';
import {
  Migration,
  MigrationVersion,
  MigrationDirection,
  MigrationRecord,
  MigrationDatabase,
  MigrationManagerConfig,
  MigrationLogger,
  MigrationStatusReport,
  MigrationRunResult,
  BatchMigrationResult,
} from './types';

/**
 * Default logger (console-based)
 */
const defaultLogger: MigrationLogger = {
  debug: (msg, meta) => console.debug(`[migrations] ${msg}`, meta || ''),
  info: (msg, meta) => console.info(`[migrations] ${msg}`, meta || ''),
  warn: (msg, meta) => console.warn(`[migrations] ${msg}`, meta || ''),
  error: (msg, meta) => console.error(`[migrations] ${msg}`, meta || ''),
};

/**
 * Generate a simple checksum for migration integrity checking
 */
function generateChecksum(migration: Migration): string {
  const content = `${migration.version}:${migration.name}:${migration.up.toString()}:${migration.down.toString()}`;
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Sort migrations by version
 */
function sortMigrations(migrations: Migration[]): Migration[] {
  return [...migrations].sort((a, b) => {
    // Try numeric comparison first
    const numA = parseInt(a.version, 10);
    const numB = parseInt(b.version, 10);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    // Fall back to string comparison
    return a.version.localeCompare(b.version);
  });
}

/**
 * MigrationManager class for handling database migrations
 */
export class MigrationManager {
  private db: MigrationDatabase;
  private tableName: string;
  private logger: MigrationLogger;
  private dryRun: boolean;
  private migrations: Map<MigrationVersion, Migration> = new Map();
  private initialized = false;

  constructor(config: MigrationManagerConfig) {
    this.db = config.database;
    this.tableName = config.tableName || '_migrations';
    this.logger = config.logger || defaultLogger;
    this.dryRun = config.dryRun || false;
  }

  /**
   * Register a migration
   */
  register(migration: Migration): void {
    if (this.migrations.has(migration.version)) {
      throw new MigrationError({
        message: `Migration ${migration.version} is already registered`,
        details: { version: migration.version },
      });
    }
    this.migrations.set(migration.version, migration);
    this.logger.debug(`Registered migration: ${migration.version} - ${migration.name}`);
  }

  /**
   * Register multiple migrations
   */
  registerAll(migrations: Migration[]): void {
    for (const migration of migrations) {
      this.register(migration);
    }
  }

  /**
   * Get all registered migrations sorted by version
   */
  getMigrations(): Migration[] {
    return sortMigrations(Array.from(this.migrations.values()));
  }

  /**
   * Initialize the migrations table
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    const exists = await this.db.tableExists(this.tableName);
    if (!exists) {
      this.logger.info(`Creating migrations table: ${this.tableName}`);
      
      if (!this.dryRun) {
        await this.db.createTable(this.tableName, [
          { name: 'version', type: 'varchar', primaryKey: true },
          { name: 'name', type: 'varchar', nullable: false },
          { name: 'applied_at', type: 'timestamptz', nullable: false },
          { name: 'execution_time_ms', type: 'integer', nullable: false },
          { name: 'checksum', type: 'varchar', nullable: true },
          { name: 'direction', type: 'varchar', nullable: false },
        ]);
      }
    }

    this.initialized = true;
  }

  /**
   * Get migration status report
   */
  async getStatus(): Promise<MigrationStatusReport> {
    await this.initialize();

    const appliedRecords = await this.getAppliedMigrations();
    const appliedVersions = new Set(appliedRecords.map(r => r.version));
    
    const allMigrations = this.getMigrations();
    const pending = allMigrations.filter(m => !appliedVersions.has(m.version));
    
    // Find failed migrations (those that were applied but then failed rollback, etc.)
    const failed = appliedRecords.filter(r => 
      r.direction === MigrationDirection.DOWN
    );

    // Current version is the highest applied migration
    const applied = appliedRecords.filter(r => 
      r.direction === MigrationDirection.UP
    );
    const currentVersion = applied.length > 0
      ? applied[applied.length - 1].version
      : null;

    return {
      applied,
      pending,
      failed,
      currentVersion,
      upToDate: pending.length === 0,
    };
  }

  /**
   * Get applied migrations from database
   */
  async getAppliedMigrations(): Promise<MigrationRecord[]> {
    await this.initialize();

    const rows = await this.db.query<{
      version: string;
      name: string;
      applied_at: string;
      execution_time_ms: number;
      checksum: string;
      direction: string;
    }>(`SELECT * FROM ${this.tableName} ORDER BY version ASC`);

    return rows.map(row => ({
      version: row.version,
      name: row.name,
      appliedAt: row.applied_at,
      executionTimeMs: row.execution_time_ms,
      checksum: row.checksum,
      direction: row.direction as MigrationDirection,
    }));
  }

  /**
   * Run all pending migrations
   */
  async up(): Promise<BatchMigrationResult> {
    const status = await this.getStatus();
    return this.runMigrations(status.pending, MigrationDirection.UP);
  }

  /**
   * Run migrations up to a specific version
   */
  async upTo(targetVersion: MigrationVersion): Promise<BatchMigrationResult> {
    const status = await this.getStatus();
    const pending = status.pending.filter(m => m.version <= targetVersion);
    return this.runMigrations(pending, MigrationDirection.UP);
  }

  /**
   * Rollback last migration
   */
  async down(): Promise<MigrationRunResult | null> {
    const status = await this.getStatus();
    if (status.applied.length === 0) {
      this.logger.info('No migrations to rollback');
      return null;
    }

    const lastApplied = status.applied[status.applied.length - 1];
    const migration = this.migrations.get(lastApplied.version);
    
    if (!migration) {
      throw new MigrationError({
        message: `Migration ${lastApplied.version} not found in registry`,
        details: { version: lastApplied.version },
      });
    }

    return this.runSingleMigration(migration, MigrationDirection.DOWN);
  }

  /**
   * Rollback to a specific version
   */
  async downTo(targetVersion: MigrationVersion): Promise<BatchMigrationResult> {
    const status = await this.getStatus();
    
    // Find migrations to rollback (applied migrations after target)
    const toRollback = status.applied
      .filter(r => r.version > targetVersion)
      .reverse(); // Rollback in reverse order

    const migrations: Migration[] = [];
    for (const record of toRollback) {
      const migration = this.migrations.get(record.version);
      if (!migration) {
        throw new MigrationError({
          message: `Migration ${record.version} not found in registry`,
          details: { version: record.version },
        });
      }
      migrations.push(migration);
    }

    return this.runMigrations(migrations, MigrationDirection.DOWN);
  }

  /**
   * Rollback all migrations
   */
  async reset(): Promise<BatchMigrationResult> {
    const status = await this.getStatus();
    
    const migrations: Migration[] = [];
    for (const record of [...status.applied].reverse()) {
      const migration = this.migrations.get(record.version);
      if (!migration) {
        throw new MigrationError({
          message: `Migration ${record.version} not found in registry`,
          details: { version: record.version },
        });
      }
      migrations.push(migration);
    }

    return this.runMigrations(migrations, MigrationDirection.DOWN);
  }

  /**
   * Run a single migration
   */
  private async runSingleMigration(
    migration: Migration,
    direction: MigrationDirection
  ): Promise<MigrationRunResult> {
    const startTime = Date.now();
    const directionStr = direction === MigrationDirection.UP ? 'Applying' : 'Rolling back';
    
    this.logger.info(`${directionStr} migration: ${migration.version} - ${migration.name}`);

    if (this.dryRun) {
      this.logger.info(`[DRY RUN] Would ${direction} migration ${migration.version}`);
      return {
        version: migration.version,
        name: migration.name,
        direction,
        success: true,
        executionTimeMs: 0,
      };
    }

    try {
      await this.db.transaction(async (db) => {
        if (direction === MigrationDirection.UP) {
          await migration.up(db);
          
          // Record migration
          await this.db.execute(
            `INSERT INTO ${this.tableName} (version, name, applied_at, execution_time_ms, checksum, direction)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              migration.version,
              migration.name,
              new Date().toISOString(),
              Date.now() - startTime,
              generateChecksum(migration),
              direction,
            ]
          );
        } else {
          await migration.down(db);
          
          // Remove migration record
          await this.db.execute(
            `DELETE FROM ${this.tableName} WHERE version = $1`,
            [migration.version]
          );
        }
      });

      const executionTimeMs = Date.now() - startTime;
      this.logger.info(`Migration ${migration.version} ${direction} completed in ${executionTimeMs}ms`);

      return {
        version: migration.version,
        name: migration.name,
        direction,
        success: true,
        executionTimeMs,
      };
    } catch (error) {
      const executionTimeMs = Date.now() - startTime;
      const err = error instanceof Error ? error : new Error(String(error));
      
      this.logger.error(`Migration ${migration.version} ${direction} failed: ${err.message}`);

      return {
        version: migration.version,
        name: migration.name,
        direction,
        success: false,
        executionTimeMs,
        error: err,
      };
    }
  }

  /**
   * Run multiple migrations
   */
  private async runMigrations(
    migrations: Migration[],
    direction: MigrationDirection
  ): Promise<BatchMigrationResult> {
    const startTime = Date.now();
    const results: MigrationRunResult[] = [];
    let successCount = 0;
    let failedCount = 0;

    // Sort migrations appropriately
    const sorted = direction === MigrationDirection.UP
      ? sortMigrations(migrations)
      : sortMigrations(migrations).reverse();

    for (const migration of sorted) {
      const result = await this.runSingleMigration(migration, direction);
      results.push(result);

      if (result.success) {
        successCount++;
      } else {
        failedCount++;
        // Stop on first failure
        break;
      }
    }

    return {
      results,
      success: failedCount === 0,
      totalTimeMs: Date.now() - startTime,
      successCount,
      failedCount,
    };
  }

  /**
   * Create a new migration file
   */
  static createMigration(
    version: MigrationVersion,
    name: string,
    description?: string
  ): string {
    const cleanName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const timestamp = new Date().toISOString();

    return `/**
 * Migration: ${version}_${cleanName}
 * Created: ${timestamp}
 * Description: ${description || name}
 */

import { Migration, MigrationDatabase } from '@sbf/db-migrations';

export const migration: Migration = {
  version: '${version}',
  name: '${name}',
  description: '${description || ''}',
  reversible: true,

  async up(db: MigrationDatabase): Promise<void> {
    // Add your migration logic here
    // await db.createTable('table_name', [...]);
    // await db.execute('SQL statement');
  },

  async down(db: MigrationDatabase): Promise<void> {
    // Add your rollback logic here
    // await db.dropTable('table_name');
    // await db.execute('SQL statement');
  },
};
`;
  }

  /**
   * Verify migration integrity
   */
  async verifyIntegrity(): Promise<{ valid: boolean; issues: string[] }> {
    const applied = await this.getAppliedMigrations();
    const issues: string[] = [];

    for (const record of applied) {
      const migration = this.migrations.get(record.version);
      
      if (!migration) {
        issues.push(`Migration ${record.version} is applied but not registered`);
        continue;
      }

      if (record.checksum) {
        const currentChecksum = generateChecksum(migration);
        if (currentChecksum !== record.checksum) {
          issues.push(
            `Migration ${record.version} has been modified since it was applied ` +
            `(stored: ${record.checksum}, current: ${currentChecksum})`
          );
        }
      }
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }
}
