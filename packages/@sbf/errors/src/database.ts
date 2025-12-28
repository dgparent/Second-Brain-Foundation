/**
 * @sbf/errors - Database Errors
 * 
 * Errors related to database operations including connections,
 * queries, transactions, and data integrity.
 */

import { SBFError, SBFErrorOptions } from './base';
import { ErrorCode } from './codes';

/**
 * General database error
 */
export class DatabaseError extends SBFError {
  constructor(options: Omit<SBFErrorOptions, 'code'> & { code?: ErrorCode }) {
    super({
      ...options,
      code: options.code || ErrorCode.DATABASE_ERROR,
    });
  }
}

/**
 * Resource not found error
 * 
 * @example
 * ```typescript
 * throw new NotFoundError({
 *   message: 'User not found',
 *   details: { userId: '123' }
 * });
 * ```
 */
export class NotFoundError extends SBFError {
  constructor(options: Omit<SBFErrorOptions, 'code'>) {
    super({
      ...options,
      code: ErrorCode.NOT_FOUND,
    });
  }

  /**
   * Create a NotFoundError for a specific entity type
   */
  static forEntity(entityType: string, entityId: string): NotFoundError {
    return new NotFoundError({
      message: `${entityType} not found: ${entityId}`,
      details: { entityType, entityId },
    });
  }
}

/**
 * Entity not found error (more specific than NotFoundError)
 */
export class EntityNotFoundError extends SBFError {
  public readonly entityType: string;
  public readonly entityId: string;

  constructor(
    entityType: string,
    entityId: string,
    options?: Partial<Omit<SBFErrorOptions, 'code'>>
  ) {
    super({
      code: ErrorCode.ENTITY_NOT_FOUND,
      message: options?.message || `Entity not found: ${entityType}/${entityId}`,
      details: { entityType, entityId, ...options?.details },
      cause: options?.cause,
    });
    this.entityType = entityType;
    this.entityId = entityId;
  }
}

/**
 * Database connection error
 */
export class ConnectionError extends SBFError {
  public readonly host?: string;
  public readonly port?: number;

  constructor(options: Omit<SBFErrorOptions, 'code'> & { host?: string; port?: number }) {
    super({
      ...options,
      code: ErrorCode.CONNECTION_ERROR,
      details: { host: options.host, port: options.port, ...options.details },
    });
    this.host = options.host;
    this.port = options.port;
  }
}

/**
 * Database query error
 */
export class QueryError extends SBFError {
  public readonly query?: string;
  public readonly params?: unknown[];

  constructor(options: Omit<SBFErrorOptions, 'code'> & { query?: string; params?: unknown[] }) {
    super({
      ...options,
      code: ErrorCode.QUERY_ERROR,
      // Don't include full query in details for security
      details: { ...options.details },
    });
    this.query = options.query;
    this.params = options.params;
  }
}

/**
 * Database transaction error
 */
export class TransactionError extends SBFError {
  constructor(options: Omit<SBFErrorOptions, 'code'>) {
    super({
      ...options,
      code: ErrorCode.TRANSACTION_ERROR,
    });
  }
}

/**
 * Duplicate key error (unique constraint violation)
 */
export class DuplicateKeyError extends SBFError {
  public readonly key?: string;
  public readonly value?: unknown;

  constructor(options: Omit<SBFErrorOptions, 'code'> & { key?: string; value?: unknown }) {
    super({
      ...options,
      code: ErrorCode.DUPLICATE_KEY,
      details: { key: options.key, ...options.details },
    });
    this.key = options.key;
    this.value = options.value;
  }
}

/**
 * Foreign key constraint violation error
 */
export class ForeignKeyError extends SBFError {
  public readonly constraintName?: string;
  public readonly referencedTable?: string;

  constructor(
    options: Omit<SBFErrorOptions, 'code'> & {
      constraintName?: string;
      referencedTable?: string;
    }
  ) {
    super({
      ...options,
      code: ErrorCode.FOREIGN_KEY_VIOLATION,
      details: {
        constraintName: options.constraintName,
        referencedTable: options.referencedTable,
        ...options.details,
      },
    });
    this.constraintName = options.constraintName;
    this.referencedTable = options.referencedTable;
  }
}

/**
 * Database constraint violation error
 */
export class ConstraintViolationError extends SBFError {
  public readonly constraintName?: string;
  public readonly constraintType?: 'check' | 'unique' | 'foreign_key' | 'not_null';

  constructor(
    options: Omit<SBFErrorOptions, 'code'> & {
      constraintName?: string;
      constraintType?: 'check' | 'unique' | 'foreign_key' | 'not_null';
    }
  ) {
    super({
      ...options,
      code: ErrorCode.CONSTRAINT_VIOLATION,
      details: {
        constraintName: options.constraintName,
        constraintType: options.constraintType,
        ...options.details,
      },
    });
    this.constraintName = options.constraintName;
    this.constraintType = options.constraintType;
  }
}

/**
 * Database migration error
 */
export class MigrationError extends SBFError {
  public readonly migrationVersion?: number;
  public readonly migrationName?: string;
  public readonly direction?: 'up' | 'down';

  constructor(
    options: Omit<SBFErrorOptions, 'code'> & {
      migrationVersion?: number;
      migrationName?: string;
      direction?: 'up' | 'down';
    }
  ) {
    super({
      ...options,
      code: ErrorCode.MIGRATION_ERROR,
      details: {
        migrationVersion: options.migrationVersion,
        migrationName: options.migrationName,
        direction: options.direction,
        ...options.details,
      },
    });
    this.migrationVersion = options.migrationVersion;
    this.migrationName = options.migrationName;
    this.direction = options.direction;
  }
}
