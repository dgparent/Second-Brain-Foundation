/**
 * @sbf/errors - Base Error Class
 * 
 * SBFError is the base class for all Second Brain Foundation errors.
 * All error types extend from this class for consistent error handling.
 */

import { 
  ErrorCode, 
  ErrorCodeDescriptions, 
  ErrorCodeHttpStatus 
} from './codes';

/**
 * Serialized error format for API responses
 */
export interface SerializedError {
  error: string;
  code: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
  requestId?: string;
}

/**
 * API-friendly error response
 */
export interface APIErrorResponse {
  success: false;
  error: SerializedError;
}

/**
 * Options for creating an SBFError
 */
export interface SBFErrorOptions {
  code: ErrorCode;
  message?: string;
  details?: Record<string, unknown>;
  cause?: Error;
  requestId?: string;
}

/**
 * Base error class for all SBF errors.
 * 
 * @example
 * ```typescript
 * throw new SBFError({
 *   code: ErrorCode.NOT_FOUND,
 *   message: 'Entity not found',
 *   details: { entityId: '123' }
 * });
 * ```
 */
export class SBFError extends Error {
  public readonly code: ErrorCode;
  public readonly details?: Record<string, unknown>;
  public readonly cause?: Error;
  public readonly timestamp: Date;
  public readonly requestId?: string;

  constructor(options: SBFErrorOptions) {
    const message = options.message || ErrorCodeDescriptions[options.code];
    super(message);
    
    this.name = this.constructor.name;
    this.code = options.code;
    this.details = options.details;
    this.cause = options.cause;
    this.timestamp = new Date();
    this.requestId = options.requestId;

    // Maintain proper stack trace in V8 environments
    if (typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Get the HTTP status code for this error
   */
  get httpStatus(): number {
    return ErrorCodeHttpStatus[this.code];
  }

  /**
   * Get the default description for this error code
   */
  get description(): string {
    return ErrorCodeDescriptions[this.code];
  }

  /**
   * Check if this is a specific type of error
   */
  is(code: ErrorCode): boolean {
    return this.code === code;
  }

  /**
   * Check if this is a client error (4xx)
   */
  isClientError(): boolean {
    return this.httpStatus >= 400 && this.httpStatus < 500;
  }

  /**
   * Check if this is a server error (5xx)
   */
  isServerError(): boolean {
    return this.httpStatus >= 500;
  }

  /**
   * Check if this error is retryable
   */
  isRetryable(): boolean {
    const retryableCodes = [
      ErrorCode.CONNECTION_ERROR,
      ErrorCode.TIMEOUT_ERROR,
      ErrorCode.NETWORK_ERROR,
      ErrorCode.SERVICE_UNAVAILABLE,
      ErrorCode.RATE_LIMIT_ERROR,
    ];
    return retryableCodes.includes(this.code);
  }

  /**
   * Serialize error to JSON format
   */
  toJSON(): SerializedError {
    return {
      error: this.name,
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
      requestId: this.requestId,
    };
  }

  /**
   * Convert to API error response format
   */
  toAPIResponse(): APIErrorResponse {
    return {
      success: false,
      error: this.toJSON(),
    };
  }

  /**
   * Create a new error with additional context
   */
  withDetails(additionalDetails: Record<string, unknown>): SBFError {
    return new SBFError({
      code: this.code,
      message: this.message,
      details: { ...this.details, ...additionalDetails },
      cause: this.cause,
      requestId: this.requestId,
    });
  }

  /**
   * Create a new error with request ID
   */
  withRequestId(requestId: string): SBFError {
    return new SBFError({
      code: this.code,
      message: this.message,
      details: this.details,
      cause: this.cause,
      requestId,
    });
  }

  /**
   * Convert error to string representation
   */
  toString(): string {
    let str = `${this.name} [${this.code}]: ${this.message}`;
    if (this.details) {
      str += `\nDetails: ${JSON.stringify(this.details, null, 2)}`;
    }
    if (this.cause) {
      str += `\nCaused by: ${this.cause.message}`;
    }
    return str;
  }

  /**
   * Static helper to check if an error is an SBFError
   */
  static isSBFError(error: unknown): error is SBFError {
    return error instanceof SBFError;
  }

  /**
   * Static helper to wrap unknown errors
   */
  static wrap(error: unknown, code?: ErrorCode): SBFError {
    if (error instanceof SBFError) {
      return error;
    }

    const errorCode = code || ErrorCode.UNKNOWN_ERROR;
    const message = error instanceof Error ? error.message : String(error);
    const cause = error instanceof Error ? error : undefined;

    return new SBFError({
      code: errorCode,
      message,
      cause,
    });
  }
}
