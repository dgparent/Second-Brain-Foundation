/**
 * @sbf/errors - External Service Errors
 * 
 * Errors related to external service integrations including
 * AI providers, APIs, and network operations.
 */

import { SBFError, SBFErrorOptions } from './base';
import { ErrorCode } from './codes';

/**
 * General external service error
 */
export class ExternalServiceError extends SBFError {
  public readonly serviceName?: string;
  public readonly endpoint?: string;
  public readonly statusCode?: number;

  constructor(
    options: Omit<SBFErrorOptions, 'code'> & {
      code?: ErrorCode;
      serviceName?: string;
      endpoint?: string;
      statusCode?: number;
    }
  ) {
    super({
      ...options,
      code: options.code || ErrorCode.EXTERNAL_SERVICE_ERROR,
      details: {
        serviceName: options.serviceName,
        endpoint: options.endpoint,
        statusCode: options.statusCode,
        ...options.details,
      },
    });
    this.serviceName = options.serviceName;
    this.endpoint = options.endpoint;
    this.statusCode = options.statusCode;
  }
}

/**
 * AI provider-specific error (OpenAI, Anthropic, Google, Ollama)
 */
export class AIProviderError extends SBFError {
  public readonly provider: string;
  public readonly model?: string;
  public readonly operation?: 'chat' | 'completion' | 'embedding' | 'transcription' | 'tts';
  public readonly providerErrorCode?: string;

  constructor(
    options: Omit<SBFErrorOptions, 'code'> & {
      provider: string;
      model?: string;
      operation?: 'chat' | 'completion' | 'embedding' | 'transcription' | 'tts';
      providerErrorCode?: string;
    }
  ) {
    super({
      ...options,
      code: ErrorCode.AI_PROVIDER_ERROR,
      details: {
        provider: options.provider,
        model: options.model,
        operation: options.operation,
        providerErrorCode: options.providerErrorCode,
        ...options.details,
      },
    });
    this.provider = options.provider;
    this.model = options.model;
    this.operation = options.operation;
    this.providerErrorCode = options.providerErrorCode;
  }

  /**
   * Create error for OpenAI
   */
  static openai(message: string, options?: { model?: string; operation?: AIProviderError['operation'] }): AIProviderError {
    return new AIProviderError({
      message,
      provider: 'openai',
      ...options,
    });
  }

  /**
   * Create error for Anthropic
   */
  static anthropic(message: string, options?: { model?: string; operation?: AIProviderError['operation'] }): AIProviderError {
    return new AIProviderError({
      message,
      provider: 'anthropic',
      ...options,
    });
  }

  /**
   * Create error for Google (Gemini)
   */
  static google(message: string, options?: { model?: string; operation?: AIProviderError['operation'] }): AIProviderError {
    return new AIProviderError({
      message,
      provider: 'google',
      ...options,
    });
  }

  /**
   * Create error for Ollama (local)
   */
  static ollama(message: string, options?: { model?: string; operation?: AIProviderError['operation'] }): AIProviderError {
    return new AIProviderError({
      message,
      provider: 'ollama',
      ...options,
    });
  }
}

/**
 * Rate limit error with retry information
 */
export class RateLimitError extends SBFError {
  public readonly serviceName?: string;
  public readonly retryAfter?: number; // seconds
  public readonly limit?: number;
  public readonly remaining?: number;
  public readonly resetAt?: Date;

  constructor(
    options: Omit<SBFErrorOptions, 'code'> & {
      serviceName?: string;
      retryAfter?: number;
      limit?: number;
      remaining?: number;
      resetAt?: Date;
    }
  ) {
    super({
      ...options,
      code: ErrorCode.RATE_LIMIT_ERROR,
      details: {
        serviceName: options.serviceName,
        retryAfter: options.retryAfter,
        limit: options.limit,
        remaining: options.remaining,
        resetAt: options.resetAt?.toISOString(),
        ...options.details,
      },
    });
    this.serviceName = options.serviceName;
    this.retryAfter = options.retryAfter;
    this.limit = options.limit;
    this.remaining = options.remaining;
    this.resetAt = options.resetAt;
  }

  /**
   * Check if the rate limit should be retried now
   */
  shouldRetryNow(): boolean {
    if (this.resetAt) {
      return new Date() >= this.resetAt;
    }
    return false;
  }

  /**
   * Get milliseconds until retry is allowed
   */
  getRetryDelayMs(): number {
    if (this.retryAfter !== undefined) {
      return this.retryAfter * 1000;
    }
    if (this.resetAt) {
      return Math.max(0, this.resetAt.getTime() - Date.now());
    }
    return 60000; // Default 1 minute
  }
}

/**
 * Timeout error
 */
export class TimeoutError extends SBFError {
  public readonly timeoutMs?: number;
  public readonly operation?: string;

  constructor(
    options: Omit<SBFErrorOptions, 'code'> & {
      timeoutMs?: number;
      operation?: string;
    }
  ) {
    super({
      ...options,
      code: ErrorCode.TIMEOUT_ERROR,
      details: {
        timeoutMs: options.timeoutMs,
        operation: options.operation,
        ...options.details,
      },
    });
    this.timeoutMs = options.timeoutMs;
    this.operation = options.operation;
  }
}

/**
 * Network error
 */
export class NetworkError extends SBFError {
  public readonly url?: string;
  public readonly method?: string;
  public readonly networkErrorCode?: string;

  constructor(
    options: Omit<SBFErrorOptions, 'code'> & {
      url?: string;
      method?: string;
      networkErrorCode?: string;
    }
  ) {
    super({
      ...options,
      code: ErrorCode.NETWORK_ERROR,
      details: {
        url: options.url,
        method: options.method,
        networkErrorCode: options.networkErrorCode,
        ...options.details,
      },
    });
    this.url = options.url;
    this.method = options.method;
    this.networkErrorCode = options.networkErrorCode;
  }
}

/**
 * General API error from external service
 */
export class APIError extends SBFError {
  public readonly serviceName?: string;
  public readonly statusCode?: number;
  public readonly responseBody?: unknown;

  constructor(
    options: Omit<SBFErrorOptions, 'code'> & {
      serviceName?: string;
      statusCode?: number;
      responseBody?: unknown;
    }
  ) {
    super({
      ...options,
      code: ErrorCode.API_ERROR,
      details: {
        serviceName: options.serviceName,
        statusCode: options.statusCode,
        ...options.details,
      },
    });
    this.serviceName = options.serviceName;
    this.statusCode = options.statusCode;
    this.responseBody = options.responseBody;
  }
}

/**
 * Service unavailable error (503)
 */
export class ServiceUnavailableError extends SBFError {
  public readonly serviceName?: string;
  public readonly retryAfter?: number;

  constructor(
    options: Omit<SBFErrorOptions, 'code'> & {
      serviceName?: string;
      retryAfter?: number;
    }
  ) {
    super({
      ...options,
      code: ErrorCode.SERVICE_UNAVAILABLE,
      details: {
        serviceName: options.serviceName,
        retryAfter: options.retryAfter,
        ...options.details,
      },
    });
    this.serviceName = options.serviceName;
    this.retryAfter = options.retryAfter;
  }
}

/**
 * Quota exceeded error (different from rate limit - usually billing related)
 */
export class QuotaExceededError extends SBFError {
  public readonly serviceName?: string;
  public readonly quotaType?: 'tokens' | 'requests' | 'storage' | 'compute';
  public readonly currentUsage?: number;
  public readonly limit?: number;

  constructor(
    options: Omit<SBFErrorOptions, 'code'> & {
      serviceName?: string;
      quotaType?: 'tokens' | 'requests' | 'storage' | 'compute';
      currentUsage?: number;
      limit?: number;
    }
  ) {
    super({
      ...options,
      code: ErrorCode.QUOTA_EXCEEDED,
      details: {
        serviceName: options.serviceName,
        quotaType: options.quotaType,
        currentUsage: options.currentUsage,
        limit: options.limit,
        ...options.details,
      },
    });
    this.serviceName = options.serviceName;
    this.quotaType = options.quotaType;
    this.currentUsage = options.currentUsage;
    this.limit = options.limit;
  }
}

/**
 * Invalid response from external service
 */
export class InvalidResponseError extends SBFError {
  public readonly serviceName?: string;
  public readonly expectedFormat?: string;

  constructor(
    options: Omit<SBFErrorOptions, 'code'> & {
      serviceName?: string;
      expectedFormat?: string;
    }
  ) {
    super({
      ...options,
      code: ErrorCode.INVALID_RESPONSE,
      details: {
        serviceName: options.serviceName,
        expectedFormat: options.expectedFormat,
        ...options.details,
      },
    });
    this.serviceName = options.serviceName;
    this.expectedFormat = options.expectedFormat;
  }
}
