"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaValidationError = exports.OutOfRangeError = exports.InvalidFormatError = exports.MissingRequiredFieldError = exports.InvalidInputError = exports.ValidationError = void 0;
const base_1 = require("./base");
const codes_1 = require("./codes");
class ValidationError extends base_1.SBFError {
    constructor(options) {
        super({
            ...options,
            code: codes_1.ErrorCode.VALIDATION_ERROR,
            details: {
                fields: options.fields,
                ...options.details,
            },
        });
        this.fields = options.fields || [];
    }
    static fromFields(fields) {
        const fieldNames = fields.map((f) => f.field).join(', ');
        return new ValidationError({
            message: `Validation failed for fields: ${fieldNames}`,
            fields,
        });
    }
    static forField(field, message, value) {
        return new ValidationError({
            message: `Validation failed: ${field} - ${message}`,
            fields: [{ field, message, value }],
        });
    }
    addFieldError(fieldError) {
        this.fields.push(fieldError);
    }
    hasFieldError(field) {
        return this.fields.some((f) => f.field === field);
    }
    getFieldErrors(field) {
        return this.fields.filter((f) => f.field === field);
    }
}
exports.ValidationError = ValidationError;
class InvalidInputError extends base_1.SBFError {
    constructor(options) {
        super({
            ...options,
            code: codes_1.ErrorCode.INVALID_INPUT,
            details: {
                inputName: options.inputName,
                expectedType: options.expectedType,
                actualType: options.actualType,
                ...options.details,
            },
        });
        this.inputName = options.inputName;
        this.expectedType = options.expectedType;
        this.actualType = options.actualType;
    }
    static typeMismatch(inputName, expectedType, actualType) {
        return new InvalidInputError({
            message: `Expected ${expectedType} for '${inputName}', got ${actualType}`,
            inputName,
            expectedType,
            actualType,
        });
    }
}
exports.InvalidInputError = InvalidInputError;
class MissingRequiredFieldError extends base_1.SBFError {
    constructor(fieldName, options) {
        super({
            code: codes_1.ErrorCode.MISSING_REQUIRED_FIELD,
            message: options?.message || `Missing required field: ${fieldName}`,
            details: { fieldName, ...options?.details },
            cause: options?.cause,
        });
        this.fieldName = fieldName;
    }
    static forFields(fieldNames) {
        return ValidationError.fromFields(fieldNames.map((field) => ({
            field,
            message: 'This field is required',
            code: codes_1.ErrorCode.MISSING_REQUIRED_FIELD,
        })));
    }
}
exports.MissingRequiredFieldError = MissingRequiredFieldError;
class InvalidFormatError extends base_1.SBFError {
    constructor(options) {
        super({
            ...options,
            code: codes_1.ErrorCode.INVALID_FORMAT,
            details: {
                expectedFormat: options.expectedFormat,
                formatName: options.formatName,
                ...options.details,
            },
        });
        this.value = options.value;
        this.expectedFormat = options.expectedFormat;
        this.formatName = options.formatName;
    }
    static invalidUID(value) {
        return new InvalidFormatError({
            message: `Invalid UID format: ${value}`,
            value,
            formatName: 'UID',
            expectedFormat: '{type}-{slug}-{counter}',
        });
    }
    static invalidTimestamp(value) {
        return new InvalidFormatError({
            message: `Invalid timestamp format: ${value}`,
            value,
            formatName: 'ISO8601',
            expectedFormat: 'YYYY-MM-DDTHH:mm:ss.sssZ',
        });
    }
}
exports.InvalidFormatError = InvalidFormatError;
class OutOfRangeError extends base_1.SBFError {
    constructor(options) {
        super({
            ...options,
            code: codes_1.ErrorCode.OUT_OF_RANGE,
            details: {
                value: options.value,
                min: options.min,
                max: options.max,
                fieldName: options.fieldName,
                ...options.details,
            },
        });
        this.value = options.value;
        this.min = options.min;
        this.max = options.max;
        this.fieldName = options.fieldName;
    }
    static numeric(fieldName, value, min, max) {
        let message = `Value ${value} for '${fieldName}' is out of range`;
        if (min !== undefined && max !== undefined) {
            message += ` (expected ${min}-${max})`;
        }
        else if (min !== undefined) {
            message += ` (minimum: ${min})`;
        }
        else if (max !== undefined) {
            message += ` (maximum: ${max})`;
        }
        return new OutOfRangeError({
            message,
            value,
            min,
            max,
            fieldName,
        });
    }
}
exports.OutOfRangeError = OutOfRangeError;
class SchemaValidationError extends base_1.SBFError {
    constructor(options) {
        super({
            ...options,
            code: codes_1.ErrorCode.SCHEMA_VALIDATION_FAILED,
            details: {
                schemaName: options.schemaName,
                issues: options.issues,
                ...options.details,
            },
        });
        this.schemaName = options.schemaName;
        this.issues = options.issues || [];
    }
    static fromZodError(zodError, schemaName) {
        const issues = zodError.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
        }));
        return new SchemaValidationError({
            message: `Schema validation failed${schemaName ? ` for ${schemaName}` : ''}`,
            schemaName,
            issues,
        });
    }
}
exports.SchemaValidationError = SchemaValidationError;
//# sourceMappingURL=validation.js.map