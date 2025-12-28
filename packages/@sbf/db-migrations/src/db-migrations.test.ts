/**
 * @sbf/db-migrations - Unit Tests
 */

import {
  MigrationManager,
  MigrationDirection,
  MigrationStatus,
  Migration,
  MigrationDatabase,
  ColumnDefinition,
} from './index';

// Mock database adapter
function createMockDatabase(): MigrationDatabase & {
  _tables: Map<string, ColumnDefinition[]>;
  _data: Map<string, Record<string, unknown>[]>;
  _executed: string[];
} {
  const tables = new Map<string, ColumnDefinition[]>();
  const data = new Map<string, Record<string, unknown>[]>();
  const executed: string[] = [];

  return {
    _tables: tables,
    _data: data,
    _executed: executed,

    async execute(sql: string, params?: unknown[]): Promise<void> {
      executed.push(sql);
    },

    async transaction(fn: (db: MigrationDatabase) => Promise<void>): Promise<void> {
      await fn(this);
    },

    async query<T>(sql: string, params?: unknown[]): Promise<T[]> {
      executed.push(sql);
      
      // Handle migrations table query
      const tableName = sql.match(/FROM (\w+)/i)?.[1];
      if (tableName) {
        const tableData = data.get(tableName);
        if (tableData) {
          return tableData as T[];
        }
      }
      return [] as T[];
    },

    async queryOne<T>(sql: string, params?: unknown[]): Promise<T | null> {
      const results = await (this.query as any)(sql, params) as T[];
      return results[0] || null;
    },

    async tableExists(tableName: string): Promise<boolean> {
      return tables.has(tableName);
    },

    async createTable(tableName: string, columns: ColumnDefinition[]): Promise<void> {
      tables.set(tableName, columns);
      data.set(tableName, []);
      executed.push(`CREATE TABLE ${tableName}`);
    },

    async dropTable(tableName: string): Promise<void> {
      tables.delete(tableName);
      data.delete(tableName);
      executed.push(`DROP TABLE ${tableName}`);
    },

    async addColumn(tableName: string, column: ColumnDefinition): Promise<void> {
      const cols = tables.get(tableName) || [];
      cols.push(column);
      tables.set(tableName, cols);
      executed.push(`ADD COLUMN ${tableName}.${column.name}`);
    },

    async dropColumn(tableName: string, columnName: string): Promise<void> {
      const cols = tables.get(tableName) || [];
      const filtered = cols.filter(c => c.name !== columnName);
      tables.set(tableName, filtered);
      executed.push(`DROP COLUMN ${tableName}.${columnName}`);
    },

    async createIndex(tableName: string, indexName: string, columns: string[]): Promise<void> {
      executed.push(`CREATE INDEX ${indexName} ON ${tableName}`);
    },

    async dropIndex(indexName: string): Promise<void> {
      executed.push(`DROP INDEX ${indexName}`);
    },

    async addForeignKey(
      tableName: string,
      constraintName: string,
      columns: string[],
      referenceTable: string,
      referenceColumns: string[]
    ): Promise<void> {
      executed.push(`ADD FK ${constraintName} ON ${tableName}`);
    },

    async dropForeignKey(tableName: string, constraintName: string): Promise<void> {
      executed.push(`DROP FK ${constraintName} ON ${tableName}`);
    },
  };
}

// Test migrations
const testMigration1: Migration = {
  version: '001',
  name: 'create_users',
  description: 'Creates users table',

  async up(db: MigrationDatabase): Promise<void> {
    await db.createTable('users', [
      { name: 'id', type: 'uuid', primaryKey: true },
      { name: 'email', type: 'varchar', nullable: false },
    ]);
  },

  async down(db: MigrationDatabase): Promise<void> {
    await db.dropTable('users');
  },
};

const testMigration2: Migration = {
  version: '002',
  name: 'add_users_name',
  description: 'Adds name column to users',

  async up(db: MigrationDatabase): Promise<void> {
    await db.addColumn('users', { name: 'name', type: 'varchar', nullable: true });
  },

  async down(db: MigrationDatabase): Promise<void> {
    await db.dropColumn('users', 'name');
  },
};

describe('MigrationManager', () => {
  let db: ReturnType<typeof createMockDatabase>;
  let manager: MigrationManager;

  beforeEach(() => {
    db = createMockDatabase();
    manager = new MigrationManager({
      database: db,
      tableName: '_migrations',
    });
  });

  describe('register', () => {
    it('should register a migration', () => {
      manager.register(testMigration1);
      const migrations = manager.getMigrations();
      expect(migrations).toHaveLength(1);
      expect(migrations[0].version).toBe('001');
    });

    it('should register multiple migrations', () => {
      manager.registerAll([testMigration1, testMigration2]);
      const migrations = manager.getMigrations();
      expect(migrations).toHaveLength(2);
    });

    it('should sort migrations by version', () => {
      manager.register(testMigration2);
      manager.register(testMigration1);
      const migrations = manager.getMigrations();
      expect(migrations[0].version).toBe('001');
      expect(migrations[1].version).toBe('002');
    });

    it('should throw for duplicate versions', () => {
      manager.register(testMigration1);
      expect(() => manager.register(testMigration1)).toThrow();
    });
  });

  describe('initialize', () => {
    it('should create migrations table if not exists', async () => {
      await manager.initialize();
      expect(db._tables.has('_migrations')).toBe(true);
    });

    it('should not recreate table if exists', async () => {
      db._tables.set('_migrations', []);
      const initialTables = db._tables.size;
      await manager.initialize();
      expect(db._tables.size).toBe(initialTables);
    });
  });

  describe('getStatus', () => {
    it('should return pending migrations', async () => {
      manager.registerAll([testMigration1, testMigration2]);
      const status = await manager.getStatus();

      expect(status.pending).toHaveLength(2);
      expect(status.applied).toHaveLength(0);
      expect(status.currentVersion).toBeNull();
      expect(status.upToDate).toBe(false);
    });
  });

  describe('up', () => {
    it('should run all pending migrations', async () => {
      manager.registerAll([testMigration1, testMigration2]);
      
      const result = await manager.up();
      
      expect(result.success).toBe(true);
      expect(result.successCount).toBe(2);
      expect(result.results).toHaveLength(2);
      expect(db._tables.has('users')).toBe(true);
    });

    it('should record applied migrations', async () => {
      manager.register(testMigration1);
      
      await manager.up();
      
      // Check that INSERT was executed for tracking
      expect(db._executed.some(sql => sql.includes('INSERT INTO _migrations'))).toBe(true);
    });
  });

  describe('down', () => {
    it('should rollback last migration', async () => {
      manager.registerAll([testMigration1, testMigration2]);
      
      // Run up first
      await manager.up();
      
      // Manually add migration records to mock data
      db._data.set('_migrations', [
        {
          version: '001',
          name: 'create_users',
          applied_at: new Date().toISOString(),
          execution_time_ms: 10,
          checksum: '',
          direction: 'up',
        },
        {
          version: '002',
          name: 'add_users_name',
          applied_at: new Date().toISOString(),
          execution_time_ms: 10,
          checksum: '',
          direction: 'up',
        },
      ]);

      // Now rollback
      const result = await manager.down();
      
      expect(result).not.toBeNull();
      expect(result!.version).toBe('002');
      expect(result!.success).toBe(true);
    });

    it('should return null when no migrations to rollback', async () => {
      manager.register(testMigration1);
      
      const result = await manager.down();
      
      expect(result).toBeNull();
    });
  });

  describe('createMigration', () => {
    it('should generate migration template', () => {
      const template = MigrationManager.createMigration('001', 'create_users', 'Creates user table');
      
      expect(template).toContain("version: '001'");
      expect(template).toContain("name: 'create_users'");
      expect(template).toContain('async up(db: MigrationDatabase)');
      expect(template).toContain('async down(db: MigrationDatabase)');
    });
  });

  describe('dryRun mode', () => {
    it('should not execute migrations in dry-run mode', async () => {
      const dryManager = new MigrationManager({
        database: db,
        dryRun: true,
      });
      dryManager.register(testMigration1);

      const result = await dryManager.up();

      expect(result.success).toBe(true);
      expect(db._tables.has('users')).toBe(false); // Table not actually created
    });
  });
});

describe('MigrationDirection', () => {
  it('should have correct values', () => {
    expect(MigrationDirection.UP).toBe('up');
    expect(MigrationDirection.DOWN).toBe('down');
  });
});

describe('MigrationStatus', () => {
  it('should have correct values', () => {
    expect(MigrationStatus.PENDING).toBe('pending');
    expect(MigrationStatus.APPLIED).toBe('applied');
    expect(MigrationStatus.FAILED).toBe('failed');
  });
});
