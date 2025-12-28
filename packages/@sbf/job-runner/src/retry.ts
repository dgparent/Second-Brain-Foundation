/**
 * @sbf/job-runner - Retry Strategies
 * 
 * Implements various retry strategies with exponential backoff, jitter, etc.
 */

import { RetryConfig, RetryStrategy } from './types';

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: Required<Omit<RetryConfig, 'isRetryable'>> = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 60000,
  backoffMultiplier: 2,
  jitter: true,
  jitterFactor: 0.1,
  strategy: RetryStrategy.EXPONENTIAL,
};

/**
 * Calculate delay for next retry attempt based on strategy
 */
export function calculateRetryDelay(
  attempt: number,
  config: RetryConfig = {}
): number {
  const {
    baseDelayMs = DEFAULT_RETRY_CONFIG.baseDelayMs,
    maxDelayMs = DEFAULT_RETRY_CONFIG.maxDelayMs,
    backoffMultiplier = DEFAULT_RETRY_CONFIG.backoffMultiplier,
    jitter = DEFAULT_RETRY_CONFIG.jitter,
    jitterFactor = DEFAULT_RETRY_CONFIG.jitterFactor,
    strategy = DEFAULT_RETRY_CONFIG.strategy,
  } = config;

  let delay: number;

  switch (strategy) {
    case RetryStrategy.IMMEDIATE:
      delay = 0;
      break;

    case RetryStrategy.FIXED:
      delay = baseDelayMs;
      break;

    case RetryStrategy.LINEAR:
      delay = baseDelayMs * attempt;
      break;

    case RetryStrategy.EXPONENTIAL:
    default:
      // Exponential backoff: baseDelay * multiplier^(attempt-1)
      delay = baseDelayMs * Math.pow(backoffMultiplier, attempt - 1);
      break;
  }

  // Cap at max delay
  delay = Math.min(delay, maxDelayMs);

  // Add jitter if enabled
  if (jitter && delay > 0) {
    const jitterAmount = delay * jitterFactor;
    // Add random jitter between -jitterAmount and +jitterAmount
    delay += (Math.random() * 2 - 1) * jitterAmount;
    // Ensure delay doesn't go negative
    delay = Math.max(0, delay);
  }

  return Math.round(delay);
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: Error, config?: RetryConfig): boolean {
  // Use custom function if provided
  if (config?.isRetryable) {
    return config.isRetryable(error);
  }

  // Check for common non-retryable error patterns
  const nonRetryablePatterns = [
    /invalid.*input/i,
    /validation.*failed/i,
    /unauthorized/i,
    /forbidden/i,
    /not.*found/i,
    /already.*exists/i,
    /duplicate/i,
  ];

  const message = error.message || '';
  for (const pattern of nonRetryablePatterns) {
    if (pattern.test(message)) {
      return false;
    }
  }

  // Check for @sbf/errors isRetryable method
  if ('isRetryable' in error && typeof (error as any).isRetryable === 'function') {
    return (error as any).isRetryable();
  }

  // Default to retryable for network/timeout errors
  const retryablePatterns = [
    /timeout/i,
    /timed.*out/i,
    /econnreset/i,
    /econnrefused/i,
    /enotfound/i,
    /rate.*limit/i,
    /too.*many.*requests/i,
    /service.*unavailable/i,
    /internal.*server.*error/i,
    /gateway/i,
    /temporarily/i,
  ];

  for (const pattern of retryablePatterns) {
    if (pattern.test(message)) {
      return true;
    }
  }

  // Check HTTP status codes if available
  const status = (error as any).status || (error as any).statusCode;
  if (status) {
    // Retry on 429 (rate limit), 5xx (server errors)
    if (status === 429 || (status >= 500 && status < 600)) {
      return true;
    }
    // Don't retry on 4xx (client errors) except 429
    if (status >= 400 && status < 500) {
      return false;
    }
  }

  // Default to retryable for unknown errors
  return true;
}

/**
 * Merge retry configs with defaults
 */
export function mergeRetryConfig(
  ...configs: (RetryConfig | undefined)[]
): Required<Omit<RetryConfig, 'isRetryable'>> & Pick<RetryConfig, 'isRetryable'> {
  const result = { ...DEFAULT_RETRY_CONFIG } as RetryConfig;
  
  for (const config of configs) {
    if (config) {
      Object.assign(result, config);
    }
  }
  
  return result as Required<Omit<RetryConfig, 'isRetryable'>> & Pick<RetryConfig, 'isRetryable'>;
}

/**
 * Sleep for a specified duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Sleep with abort support
 */
export function sleepWithAbort(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error('Aborted'));
      return;
    }

    const timeout = setTimeout(resolve, ms);

    if (signal) {
      const abortHandler = () => {
        clearTimeout(timeout);
        reject(new Error('Aborted'));
      };
      signal.addEventListener('abort', abortHandler, { once: true });
    }
  });
}

/**
 * Execute a function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config?: RetryConfig,
  onRetry?: (attempt: number, delay: number, error: Error) => void
): Promise<T> {
  const mergedConfig = mergeRetryConfig(config);
  const maxAttempts = mergedConfig.maxAttempts;
  
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Check if we should retry
      if (attempt >= maxAttempts) {
        break;
      }
      
      if (!isRetryableError(lastError, config)) {
        break;
      }
      
      // Calculate delay and wait
      const delay = calculateRetryDelay(attempt, mergedConfig);
      
      if (onRetry) {
        onRetry(attempt, delay, lastError);
      }
      
      if (delay > 0) {
        await sleep(delay);
      }
    }
  }
  
  throw lastError;
}

/**
 * Decorator factory for adding retry logic to async methods
 * 
 * @example
 * ```typescript
 * class MyService {
 *   @WithRetry({ maxAttempts: 3, strategy: RetryStrategy.EXPONENTIAL })
 *   async fetchData(): Promise<Data> {
 *     // ...
 *   }
 * }
 * ```
 */
export function WithRetry(config?: RetryConfig) {
  return function (
    _target: any,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      return withRetry(
        () => originalMethod.apply(this, args),
        config
      );
    };
    
    return descriptor;
  };
}

/**
 * Create a retryable version of an async function
 */
export function createRetryable<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  config?: RetryConfig
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return withRetry(() => fn(...args), config);
  }) as T;
}
