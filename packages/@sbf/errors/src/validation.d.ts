import { SBFError, SBFErrorOptions } from './base';
export interface FieldError {
    field: string;
    message: string;
    code?: string;
    value?: unknown;
}
export declare class ValidationError extends SBFError {
    readonly fields: FieldError[];
    constructor(options: Omit<SBFErrorOptions, 'code'> & {
        fields?: FieldError[];
    });
    static fromFields(fields: FieldError[]): ValidationError;
    static forField(field: string, message: string, value?: unknown): ValidationError;
    addFieldError(fieldError: FieldError): void;
    hasFieldError(field: string): boolean;
    getFieldErrors(field: string): FieldError[];
}
export declare class InvalidInputError extends SBFError {
    readonly inputName?: string;
    readonly expectedType?: string;
    readonly actualType?: string;
    constructor(options: Omit<SBFErrorOptions, 'code'> & {
        inputName?: string;
        expectedType?: string;
        actualType?: string;
    });
    static typeMismatch(inputName: string, expectedType: string, actualType: string): InvalidInputError;
}
export declare class MissingRequiredFieldError extends SBFError {
    readonly fieldName: string;
    constructor(fieldName: string, options?: Partial<Omit<SBFErrorOptions, 'code'>>);
    static forFields(fieldNames: string[]): ValidationError;
}
export declare class InvalidFormatError extends SBFError {
    readonly value?: string;
    readonly expectedFormat?: string;
    readonly formatName?: string;
    constructor(options: Omit<SBFErrorOptions, 'code'> & {
        value?: string;
        expectedFormat?: string;
        formatName?: string;
    });
    static invalidUID(value: string): InvalidFormatError;
    static invalidTimestamp(value: string): InvalidFormatError;
}
export declare class OutOfRangeError extends SBFError {
    readonly value?: number;
    readonly min?: number;
    readonly max?: number;
    readonly fieldName?: string;
    constructor(options: Omit<SBFErrorOptions, 'code'> & {
        value?: number;
        min?: number;
        max?: number;
        fieldName?: string;
    });
    static numeric(fieldName: string, value: number, min?: number, max?: number): OutOfRangeError;
}
export declare class SchemaValidationError extends SBFError {
    readonly schemaName?: string;
    readonly issues: FieldError[];
    constructor(options: Omit<SBFErrorOptions, 'code'> & {
        schemaName?: string;
        issues?: FieldError[];
    });
    static fromZodError(zodError: {
        issues: Array<{
            path: (string | number)[];
            message: string;
        }>;
    }, schemaName?: string): SchemaValidationError;
}
//# sourceMappingURL=validation.d.ts.map