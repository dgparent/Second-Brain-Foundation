import { ErrorCode } from './codes';
export interface SerializedError {
    error: string;
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
    timestamp: string;
    requestId?: string;
}
export interface APIErrorResponse {
    success: false;
    error: SerializedError;
}
export interface SBFErrorOptions {
    code: ErrorCode;
    message?: string;
    details?: Record<string, unknown>;
    cause?: Error;
    requestId?: string;
}
export declare class SBFError extends Error {
    readonly code: ErrorCode;
    readonly details?: Record<string, unknown>;
    readonly cause?: Error;
    readonly timestamp: Date;
    readonly requestId?: string;
    constructor(options: SBFErrorOptions);
    get httpStatus(): number;
    get description(): string;
    is(code: ErrorCode): boolean;
    isClientError(): boolean;
    isServerError(): boolean;
    isRetryable(): boolean;
    toJSON(): SerializedError;
    toAPIResponse(): APIErrorResponse;
    withDetails(additionalDetails: Record<string, unknown>): SBFError;
    withRequestId(requestId: string): SBFError;
    toString(): string;
    static isSBFError(error: unknown): error is SBFError;
    static wrap(error: unknown, code?: ErrorCode): SBFError;
}
//# sourceMappingURL=base.d.ts.map