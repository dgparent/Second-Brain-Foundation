import { SerializedError, APIErrorResponse } from './base';
import { ErrorCode } from './codes';
export interface StandardAPIResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: SerializedError;
    meta?: {
        requestId?: string;
        timestamp: string;
        duration?: number;
    };
}
export declare function serializeError(error: unknown, requestId?: string): SerializedError;
export declare function toAPIErrorResponse(error: unknown, requestId?: string): APIErrorResponse;
export declare function toAPISuccessResponse<T>(data: T, meta?: {
    requestId?: string;
    duration?: number;
}): StandardAPIResponse<T>;
export declare function getHttpStatusCode(error: unknown): number;
export declare function isRetryableError(error: unknown): boolean;
export declare function isClientError(error: unknown): boolean;
export declare function isServerError(error: unknown): boolean;
export declare function formatErrorForLogging(error: unknown): Record<string, unknown>;
export declare function sanitizeErrorForExternal(error: unknown): SerializedError;
export declare function createErrorHandler(options?: {
    logErrors?: boolean;
    includeStack?: boolean;
    sanitize?: boolean;
}): (err: unknown, req: {
    requestId?: string;
}, res: {
    status: (code: number) => {
        json: (body: unknown) => void;
    };
}, _next: unknown) => void;
export declare function wrapAsync<T extends (...args: any[]) => Promise<any>>(fn: T, defaultCode?: ErrorCode): T;
export declare function assertSBF(condition: boolean, code: ErrorCode, message?: string, details?: Record<string, unknown>): asserts condition;
//# sourceMappingURL=serializer.d.ts.map