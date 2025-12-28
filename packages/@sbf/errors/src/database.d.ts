import { SBFError, SBFErrorOptions } from './base';
import { ErrorCode } from './codes';
export declare class DatabaseError extends SBFError {
    constructor(options: Omit<SBFErrorOptions, 'code'> & {
        code?: ErrorCode;
    });
}
export declare class NotFoundError extends SBFError {
    constructor(options: Omit<SBFErrorOptions, 'code'>);
    static forEntity(entityType: string, entityId: string): NotFoundError;
}
export declare class EntityNotFoundError extends SBFError {
    readonly entityType: string;
    readonly entityId: string;
    constructor(entityType: string, entityId: string, options?: Partial<Omit<SBFErrorOptions, 'code'>>);
}
export declare class ConnectionError extends SBFError {
    readonly host?: string;
    readonly port?: number;
    constructor(options: Omit<SBFErrorOptions, 'code'> & {
        host?: string;
        port?: number;
    });
}
export declare class QueryError extends SBFError {
    readonly query?: string;
    readonly params?: unknown[];
    constructor(options: Omit<SBFErrorOptions, 'code'> & {
        query?: string;
        params?: unknown[];
    });
}
export declare class TransactionError extends SBFError {
    constructor(options: Omit<SBFErrorOptions, 'code'>);
}
export declare class DuplicateKeyError extends SBFError {
    readonly key?: string;
    readonly value?: unknown;
    constructor(options: Omit<SBFErrorOptions, 'code'> & {
        key?: string;
        value?: unknown;
    });
}
export declare class ForeignKeyError extends SBFError {
    readonly constraintName?: string;
    readonly referencedTable?: string;
    constructor(options: Omit<SBFErrorOptions, 'code'> & {
        constraintName?: string;
        referencedTable?: string;
    });
}
export declare class ConstraintViolationError extends SBFError {
    readonly constraintName?: string;
    readonly constraintType?: 'check' | 'unique' | 'foreign_key' | 'not_null';
    constructor(options: Omit<SBFErrorOptions, 'code'> & {
        constraintName?: string;
        constraintType?: 'check' | 'unique' | 'foreign_key' | 'not_null';
    });
}
export declare class MigrationError extends SBFError {
    readonly migrationVersion?: number;
    readonly migrationName?: string;
    readonly direction?: 'up' | 'down';
    constructor(options: Omit<SBFErrorOptions, 'code'> & {
        migrationVersion?: number;
        migrationName?: string;
        direction?: 'up' | 'down';
    });
}
//# sourceMappingURL=database.d.ts.map