/**
 * @sbf/db-migrations - PostgreSQL Database Adapter
 * 
 * PostgreSQL-specific implementation of the MigrationDatabase interface.
 */

import {
  MigrationDatabase,
  ColumnDefinition,
  IndexOptions,
  ForeignKeyOptions,
} from '../types';

/**
 * Options for PostgreSQL adapter
 */
export interface PostgresAdapterOptions {
  /** Pool or client instance */
  pool: PostgresPool;
  
  /** Schema name (default: 'public') */
  schema?: string;
}

/**
 * Minimal PostgreSQL pool interface
 */
export interface PostgresPool {
  query(sql: string, params?: unknown[]): Promise<{ rows: unknown[] }>;
}

/**
 * Map internal column types to PostgreSQL types
 */
function mapColumnType(type: ColumnDefinition['type']): string {
  const typeMap: Record<string, string> = {
    uuid: 'UUID',
    text: 'TEXT',
    varchar: 'VARCHAR(255)',
    integer: 'INTEGER',
    bigint: 'BIGINT',
    boolean: 'BOOLEAN',
    timestamp: 'TIMESTAMP',
    timestamptz: 'TIMESTAMPTZ',
    date: 'DATE',
    json: 'JSON',
    jsonb: 'JSONB',
    real: 'REAL',
    double: 'DOUBLE PRECISION',
    vector: 'vector(1536)', // Default OpenAI embedding dimension
    bytea: 'BYTEA',
  };
  return typeMap[type] || type.toUpperCase();
}

/**
 * Build column definition SQL
 */
function buildColumnDefinition(column: ColumnDefinition): string {
  const parts: string[] = [
    `"${column.name}"`,
    mapColumnType(column.type),
  ];

  if (column.primaryKey) {
    parts.push('PRIMARY KEY');
  }

  if (!column.nullable && !column.primaryKey) {
    parts.push('NOT NULL');
  }

  if (column.unique && !column.primaryKey) {
    parts.push('UNIQUE');
  }

  if (column.defaultValue !== undefined) {
    if (column.defaultValue === null) {
      parts.push('DEFAULT NULL');
    } else if (typeof column.defaultValue === 'string') {
      parts.push(`DEFAULT '${column.defaultValue}'`);
    } else if (typeof column.defaultValue === 'boolean') {
      parts.push(`DEFAULT ${column.defaultValue ? 'TRUE' : 'FALSE'}`);
    } else {
      parts.push(`DEFAULT ${column.defaultValue}`);
    }
  }

  if (column.references) {
    let ref = `REFERENCES "${column.references.table}"("${column.references.column}")`;
    if (column.references.onDelete) {
      ref += ` ON DELETE ${column.references.onDelete}`;
    }
    if (column.references.onUpdate) {
      ref += ` ON UPDATE ${column.references.onUpdate}`;
    }
    parts.push(ref);
  }

  return parts.join(' ');
}

/**
 * PostgreSQL adapter for migrations
 */
export class PostgresAdapter implements MigrationDatabase {
  private pool: PostgresPool;
  private schema: string;
  private inTransaction = false;

  constructor(options: PostgresAdapterOptions) {
    this.pool = options.pool;
    this.schema = options.schema || 'public';
  }

  async execute(sql: string, params?: unknown[]): Promise<void> {
    await this.pool.query(sql, params);
  }

  async transaction(fn: (db: MigrationDatabase) => Promise<void>): Promise<void> {
    if (this.inTransaction) {
      // Nested transaction - just run the function
      await fn(this);
      return;
    }

    this.inTransaction = true;
    try {
      await this.execute('BEGIN');
      await fn(this);
      await this.execute('COMMIT');
    } catch (error) {
      await this.execute('ROLLBACK');
      throw error;
    } finally {
      this.inTransaction = false;
    }
  }

  async query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]> {
    const result = await this.pool.query(sql, params);
    return result.rows as T[];
  }

  async queryOne<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T | null> {
    const results = await this.query<T>(sql, params);
    return results[0] || null;
  }

  async tableExists(tableName: string): Promise<boolean> {
    const result = await this.queryOne<{ exists: boolean }>(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = $1 AND table_name = $2
      )`,
      [this.schema, tableName]
    );
    return result?.exists ?? false;
  }

  async createTable(tableName: string, columns: ColumnDefinition[]): Promise<void> {
    const columnDefs = columns.map(buildColumnDefinition).join(',\n  ');
    await this.execute(`CREATE TABLE "${this.schema}"."${tableName}" (\n  ${columnDefs}\n)`);
  }

  async dropTable(tableName: string): Promise<void> {
    await this.execute(`DROP TABLE IF EXISTS "${this.schema}"."${tableName}" CASCADE`);
  }

  async addColumn(tableName: string, column: ColumnDefinition): Promise<void> {
    await this.execute(
      `ALTER TABLE "${this.schema}"."${tableName}" ADD COLUMN ${buildColumnDefinition(column)}`
    );
  }

  async dropColumn(tableName: string, columnName: string): Promise<void> {
    await this.execute(
      `ALTER TABLE "${this.schema}"."${tableName}" DROP COLUMN IF EXISTS "${columnName}"`
    );
  }

  async createIndex(
    tableName: string,
    indexName: string,
    columns: string[],
    options: IndexOptions = {}
  ): Promise<void> {
    const unique = options.unique ? 'UNIQUE ' : '';
    const using = options.using ? ` USING ${options.using}` : '';
    const where = options.where ? ` WHERE ${options.where}` : '';
    
    let withClause = '';
    if (options.withOptions) {
      const opts = Object.entries(options.withOptions)
        .map(([k, v]) => `${k} = ${v}`)
        .join(', ');
      withClause = ` WITH (${opts})`;
    }

    const columnList = columns.map(c => `"${c}"`).join(', ');
    
    await this.execute(
      `CREATE ${unique}INDEX "${indexName}" ON "${this.schema}"."${tableName}"${using} (${columnList})${withClause}${where}`
    );
  }

  async dropIndex(indexName: string): Promise<void> {
    await this.execute(`DROP INDEX IF EXISTS "${this.schema}"."${indexName}"`);
  }

  async addForeignKey(
    tableName: string,
    constraintName: string,
    columns: string[],
    referenceTable: string,
    referenceColumns: string[],
    options: ForeignKeyOptions = {}
  ): Promise<void> {
    const columnList = columns.map(c => `"${c}"`).join(', ');
    const refColumnList = referenceColumns.map(c => `"${c}"`).join(', ');
    
    let sql = `ALTER TABLE "${this.schema}"."${tableName}" ADD CONSTRAINT "${constraintName}" `;
    sql += `FOREIGN KEY (${columnList}) REFERENCES "${this.schema}"."${referenceTable}" (${refColumnList})`;
    
    if (options.onDelete) {
      sql += ` ON DELETE ${options.onDelete}`;
    }
    if (options.onUpdate) {
      sql += ` ON UPDATE ${options.onUpdate}`;
    }

    await this.execute(sql);
  }

  async dropForeignKey(tableName: string, constraintName: string): Promise<void> {
    await this.execute(
      `ALTER TABLE "${this.schema}"."${tableName}" DROP CONSTRAINT IF EXISTS "${constraintName}"`
    );
  }

  /**
   * Enable pgvector extension (for vector embeddings)
   */
  async enableVector(): Promise<void> {
    await this.execute('CREATE EXTENSION IF NOT EXISTS vector');
  }

  /**
   * Enable uuid-ossp extension (for UUID generation)
   */
  async enableUUID(): Promise<void> {
    await this.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  }
}
