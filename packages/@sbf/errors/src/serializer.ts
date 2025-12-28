/**
 * @sbf/errors - Error Serialization Utilities
 * 
 * Utilities for serializing errors for API responses,
 * logging, and error handling middleware.
 */

import { SBFError, SerializedError, APIErrorResponse } from './base';
import { ErrorCode, ErrorCodeHttpStatus } from './codes';

/**
 * Standard API error response format
 */
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

/**
 * Serialize any error to a standard format
 */
export function serializeError(error: unknown, requestId?: string): SerializedError {
  if (error instanceof SBFError) {
    const serialized = error.toJSON();
    if (requestId && !serialized.requestId) {
      serialized.requestId = requestId;
    }
    return serialized;
  }

  if (error instanceof Error) {
    return {
      error: error.name,
      code: ErrorCode.UNKNOWN_ERROR,
      message: error.message,
      timestamp: new Date().toISOString(),
      requestId,
    };
  }

  return {
    error: 'UnknownError',
    code: ErrorCode.UNKNOWN_ERROR,
    message: String(error),
    timestamp: new Date().toISOString(),
    requestId,
  };
}

/**
 * Create a standard API error response
 */
export function toAPIErrorResponse(error: unknown, requestId?: string): APIErrorResponse {
  return {
    success: false,
    error: serializeError(error, requestId),
  };
}

/**
 * Create a standard API success response
 */
export function toAPISuccessResponse<T>(
  data: T,
  meta?: { requestId?: string; duration?: number }
): StandardAPIResponse<T> {
  return {
    success: true,
    data,
    meta: {
      ...meta,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Get HTTP status code for any error
 */
export function getHttpStatusCode(error: unknown): number {
  if (error instanceof SBFError) {
    return error.httpStatus;
  }
  return 500;
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof SBFError) {
    return error.isRetryable();
  }
  return false;
}

/**
 * Check if an error is a client error (4xx)
 */
export function isClientError(error: unknown): boolean {
  if (error instanceof SBFError) {
    return error.isClientError();
  }
  return false;
}

/**
 * Check if an error is a server error (5xx)
 */
export function isServerError(error: unknown): boolean {
  if (error instanceof SBFError) {
    return error.isServerError();
  }
  // Default unknown errors to server errors
  return true;
}

/**
 * Format error for logging (includes stack trace)
 */
export function formatErrorForLogging(error: unknown): Record<string, unknown> {
  const base: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
  };

  if (error instanceof SBFError) {
    return {
      ...base,
      name: error.name,
      code: error.code,
      message: error.message,
      details: error.details,
      requestId: error.requestId,
      stack: error.stack,
      cause: error.cause ? formatErrorForLogging(error.cause) : undefined,
    };
  }

  if (error instanceof Error) {
    return {
      ...base,
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    ...base,
    error: String(error),
  };
}

/**
 * Sanitize error for external exposure (removes sensitive details)
 */
export function sanitizeErrorForExternal(error: unknown): SerializedError {
  const serialized = serializeError(error);

  // Remove potentially sensitive details
  const sanitized: SerializedError = {
    error: serialized.error,
    code: serialized.code,
    message: serialized.message,
    timestamp: serialized.timestamp,
    requestId: serialized.requestId,
  };

  // Only include safe details
  if (serialized.details) {
    const safeKeys = ['entityId', 'entityType', 'field', 'fields'];
    const safeDetails: Record<string, unknown> = {};
    
    for (const key of safeKeys) {
      if (key in serialized.details) {
        safeDetails[key] = serialized.details[key];
      }
    }
    
    if (Object.keys(safeDetails).length > 0) {
      sanitized.details = safeDetails;
    }
  }

  return sanitized;
}

/**
 * Express-compatible error handler middleware factory
 */
export function createErrorHandler(options?: {
  logErrors?: boolean;
  includeStack?: boolean;
  sanitize?: boolean;
}) {
  const { logErrors = true, includeStack = false, sanitize = true } = options || {};

  return function errorHandler(
    err: unknown,
    req: { requestId?: string },
    res: { status: (code: number) => { json: (body: unknown) => void } },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: unknown
  ): void {
    if (logErrors) {
      // eslint-disable-next-line no-console
      (console as any).error('Error:', formatErrorForLogging(err));
    }

    const statusCode = getHttpStatusCode(err);
    let errorResponse = serializeError(err, req.requestId);

    if (sanitize) {
      errorResponse = sanitizeErrorForExternal(err);
      errorResponse.requestId = req.requestId;
    }

    if (includeStack && err instanceof Error) {
      (errorResponse as unknown as Record<string, unknown>).stack = err.stack;
    }

    res.status(statusCode).json({
      success: false,
      error: errorResponse,
    });
  };
}

/**
 * Wrap an async function to catch errors and wrap them as SBFError
 */
export function wrapAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  defaultCode?: ErrorCode
): T {
  return (async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    try {
      return await fn(...args);
    } catch (error) {
      throw SBFError.wrap(error, defaultCode);
    }
  }) as T;
}

/**
 * Assert a condition, throwing SBFError if false
 */
export function assertSBF(
  condition: boolean,
  code: ErrorCode,
  message?: string,
  details?: Record<string, unknown>
): asserts condition {
  if (!condition) {
    throw new SBFError({ code, message, details });
  }
}
