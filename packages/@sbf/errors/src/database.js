"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrationError = exports.ConstraintViolationError = exports.ForeignKeyError = exports.DuplicateKeyError = exports.TransactionError = exports.QueryError = exports.ConnectionError = exports.EntityNotFoundError = exports.NotFoundError = exports.DatabaseError = void 0;
const base_1 = require("./base");
const codes_1 = require("./codes");
class DatabaseError extends base_1.SBFError {
    constructor(options) {
        super({
            ...options,
            code: options.code || codes_1.ErrorCode.DATABASE_ERROR,
        });
    }
}
exports.DatabaseError = DatabaseError;
class NotFoundError extends base_1.SBFError {
    constructor(options) {
        super({
            ...options,
            code: codes_1.ErrorCode.NOT_FOUND,
        });
    }
    static forEntity(entityType, entityId) {
        return new NotFoundError({
            message: `${entityType} not found: ${entityId}`,
            details: { entityType, entityId },
        });
    }
}
exports.NotFoundError = NotFoundError;
class EntityNotFoundError extends base_1.SBFError {
    constructor(entityType, entityId, options) {
        super({
            code: codes_1.ErrorCode.ENTITY_NOT_FOUND,
            message: options?.message || `Entity not found: ${entityType}/${entityId}`,
            details: { entityType, entityId, ...options?.details },
            cause: options?.cause,
        });
        this.entityType = entityType;
        this.entityId = entityId;
    }
}
exports.EntityNotFoundError = EntityNotFoundError;
class ConnectionError extends base_1.SBFError {
    constructor(options) {
        super({
            ...options,
            code: codes_1.ErrorCode.CONNECTION_ERROR,
            details: { host: options.host, port: options.port, ...options.details },
        });
        this.host = options.host;
        this.port = options.port;
    }
}
exports.ConnectionError = ConnectionError;
class QueryError extends base_1.SBFError {
    constructor(options) {
        super({
            ...options,
            code: codes_1.ErrorCode.QUERY_ERROR,
            details: { ...options.details },
        });
        this.query = options.query;
        this.params = options.params;
    }
}
exports.QueryError = QueryError;
class TransactionError extends base_1.SBFError {
    constructor(options) {
        super({
            ...options,
            code: codes_1.ErrorCode.TRANSACTION_ERROR,
        });
    }
}
exports.TransactionError = TransactionError;
class DuplicateKeyError extends base_1.SBFError {
    constructor(options) {
        super({
            ...options,
            code: codes_1.ErrorCode.DUPLICATE_KEY,
            details: { key: options.key, ...options.details },
        });
        this.key = options.key;
        this.value = options.value;
    }
}
exports.DuplicateKeyError = DuplicateKeyError;
class ForeignKeyError extends base_1.SBFError {
    constructor(options) {
        super({
            ...options,
            code: codes_1.ErrorCode.FOREIGN_KEY_VIOLATION,
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
exports.ForeignKeyError = ForeignKeyError;
class ConstraintViolationError extends base_1.SBFError {
    constructor(options) {
        super({
            ...options,
            code: codes_1.ErrorCode.CONSTRAINT_VIOLATION,
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
exports.ConstraintViolationError = ConstraintViolationError;
class MigrationError extends base_1.SBFError {
    constructor(options) {
        super({
            ...options,
            code: codes_1.ErrorCode.MIGRATION_ERROR,
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
exports.MigrationError = MigrationError;
//# sourceMappingURL=database.js.map