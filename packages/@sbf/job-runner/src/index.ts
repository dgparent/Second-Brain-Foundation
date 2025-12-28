/**
 * @sbf/job-runner
 * 
 * Job runner and retry system for Second Brain Foundation.
 * Provides background job processing with retry strategies,
 * exponential backoff, and job status tracking.
 */

// Types
export type {
  JobId,
  JobDefinition,
  Job,
  JobError,
  JobHandler,
  JobHandle,
  JobContext,
  JobLogger,
  JobRunnerConfig,
  JobStorage,
  JobStats,
  JobRunnerEvents,
  RetryConfig,
} from './types';

export {
  JobPriority,
  JobStatus,
  RetryStrategy,
} from './types';

// Core
export { JobRunner } from './JobRunner';
export { InMemoryJobStorage } from './storage';

// Retry utilities
export {
  DEFAULT_RETRY_CONFIG,
  calculateRetryDelay,
  isRetryableError,
  mergeRetryConfig,
  sleep,
  sleepWithAbort,
  withRetry,
  WithRetry,
  createRetryable,
} from './retry';
