/**
 * @sbf/errors - Validation Errors
 * 
 * Errors related to input validation, schema validation,
 * and data format issues.
 */

import { SBFError, SBFErrorOptions } from './base';
import { ErrorCode } from './codes';

/**
 * Field validation error detail
 */
export interface FieldError {
  field: string;
  message: string;
  code?: string;
  value?: unknown;
}

/**
 * General validation error
 * 
 * @example
 * ```typescript
 * throw new ValidationError({
 *   message: 'Validation failed',
 *   fields: [
 *     { field: 'email', message: 'Invalid email format' },
 *     { field: 'age', message: 'Must be a positive number' }
 *   ]
 * });
 * ```
 */
export class ValidationError extends SBFError {
  public readonly fields: FieldError[];

  constructor(
    options: Omit<SBFErrorOptions, 'code'> & { fields?: FieldError[] }
  ) {
    super({
      ...options,
      code: ErrorCode.VALIDATION_ERROR,
      details: {
        fields: options.fields,
        ...options.details,
      },
    });
    this.fields = options.fields || [];
  }

  /**
   * Create a validation error from a list of field errors
   */
  static fromFields(fields: FieldError[]): ValidationError {
    const fieldNames = fields.map((f) => f.field).join(', ');
    return new ValidationError({
      message: `Validation failed for fields: ${fieldNames}`,
      fields,
    });
  }

  /**
   * Create a validation error for a single field
   */
  static forField(field: string, message: string, value?: unknown): ValidationError {
    return new ValidationError({
      message: `Validation failed: ${field} - ${message}`,
      fields: [{ field, message, value }],
    });
  }

  /**
   * Add a field error to this validation error
   */
  addFieldError(fieldError: FieldError): void {
    this.fields.push(fieldError);
  }

  /**
   * Check if a specific field has errors
   */
  hasFieldError(field: string): boolean {
    return this.fields.some((f) => f.field === field);
  }

  /**
   * Get errors for a specific field
   */
  getFieldErrors(field: string): FieldError[] {
    return this.fields.filter((f) => f.field === field);
  }
}

/**
 * Invalid input error (more general than field validation)
 */
export class InvalidInputError extends SBFError {
  public readonly inputName?: string;
  public readonly expectedType?: string;
  public readonly actualType?: string;

  constructor(
    options: Omit<SBFErrorOptions, 'code'> & {
      inputName?: string;
      expectedType?: string;
      actualType?: string;
    }
  ) {
    super({
      ...options,
      code: ErrorCode.INVALID_INPUT,
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

  /**
   * Create an error for a type mismatch
   */
  static typeMismatch(
    inputName: string,
    expectedType: string,
    actualType: string
  ): InvalidInputError {
    return new InvalidInputError({
      message: `Expected ${expectedType} for '${inputName}', got ${actualType}`,
      inputName,
      expectedType,
      actualType,
    });
  }
}

/**
 * Missing required field error
 */
export class MissingRequiredFieldError extends SBFError {
  public readonly fieldName: string;

  constructor(fieldName: string, options?: Partial<Omit<SBFErrorOptions, 'code'>>) {
    super({
      code: ErrorCode.MISSING_REQUIRED_FIELD,
      message: options?.message || `Missing required field: ${fieldName}`,
      details: { fieldName, ...options?.details },
      cause: options?.cause,
    });
    this.fieldName = fieldName;
  }

  /**
   * Create errors for multiple missing fields
   */
  static forFields(fieldNames: string[]): ValidationError {
    return ValidationError.fromFields(
      fieldNames.map((field) => ({
        field,
        message: 'This field is required',
        code: ErrorCode.MISSING_REQUIRED_FIELD,
      }))
    );
  }
}

/**
 * Invalid format error (e.g., invalid email format, invalid date format)
 */
export class InvalidFormatError extends SBFError {
  public readonly value?: string;
  public readonly expectedFormat?: string;
  public readonly formatName?: string;

  constructor(
    options: Omit<SBFErrorOptions, 'code'> & {
      value?: string;
      expectedFormat?: string;
      formatName?: string;
    }
  ) {
    super({
      ...options,
      code: ErrorCode.INVALID_FORMAT,
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

  /**
   * Create an error for an invalid UID format
   */
  static invalidUID(value: string): InvalidFormatError {
    return new InvalidFormatError({
      message: `Invalid UID format: ${value}`,
      value,
      formatName: 'UID',
      expectedFormat: '{type}-{slug}-{counter}',
    });
  }

  /**
   * Create an error for an invalid timestamp format
   */
  static invalidTimestamp(value: string): InvalidFormatError {
    return new InvalidFormatError({
      message: `Invalid timestamp format: ${value}`,
      value,
      formatName: 'ISO8601',
      expectedFormat: 'YYYY-MM-DDTHH:mm:ss.sssZ',
    });
  }
}

/**
 * Out of range error (value outside allowed bounds)
 */
export class OutOfRangeError extends SBFError {
  public readonly value?: number;
  public readonly min?: number;
  public readonly max?: number;
  public readonly fieldName?: string;

  constructor(
    options: Omit<SBFErrorOptions, 'code'> & {
      value?: number;
      min?: number;
      max?: number;
      fieldName?: string;
    }
  ) {
    super({
      ...options,
      code: ErrorCode.OUT_OF_RANGE,
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

  /**
   * Create an error for a value outside a numeric range
   */
  static numeric(fieldName: string, value: number, min?: number, max?: number): OutOfRangeError {
    let message = `Value ${value} for '${fieldName}' is out of range`;
    if (min !== undefined && max !== undefined) {
      message += ` (expected ${min}-${max})`;
    } else if (min !== undefined) {
      message += ` (minimum: ${min})`;
    } else if (max !== undefined) {
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

/**
 * Schema validation failed error (for complex schema validation like Zod)
 */
export class SchemaValidationError extends SBFError {
  public readonly schemaName?: string;
  public readonly issues: FieldError[];

  constructor(
    options: Omit<SBFErrorOptions, 'code'> & {
      schemaName?: string;
      issues?: FieldError[];
    }
  ) {
    super({
      ...options,
      code: ErrorCode.SCHEMA_VALIDATION_FAILED,
      details: {
        schemaName: options.schemaName,
        issues: options.issues,
        ...options.details,
      },
    });
    this.schemaName = options.schemaName;
    this.issues = options.issues || [];
  }

  /**
   * Create from Zod-like error format
   */
  static fromZodError(
    zodError: { issues: Array<{ path: (string | number)[]; message: string }> },
    schemaName?: string
  ): SchemaValidationError {
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
