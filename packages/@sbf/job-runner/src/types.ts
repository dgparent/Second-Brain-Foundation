/**
 * @sbf/job-runner - Types
 * 
 * Core types and interfaces for the job runner system.
 */

/**
 * Unique identifier for a job
 */
export type JobId = string;

/**
 * Job priority levels
 */
export enum JobPriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  CRITICAL = 3,
}

/**
 * Job execution status
 */
export enum JobStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  RETRYING = 'retrying',
  CANCELLED = 'cancelled',
  TIMEOUT = 'timeout',
}

/**
 * Job definition - what a job looks like when submitted
 */
export interface JobDefinition<T = unknown> {
  /** Unique job type identifier */
  type: string;
  
  /** Job payload data */
  payload: T;
  
  /** Job priority (default: NORMAL) */
  priority?: JobPriority;
  
  /** Custom retry configuration */
  retry?: RetryConfig;
  
  /** Maximum execution time in ms */
  timeout?: number;
  
  /** Delay before first execution in ms */
  delay?: number;
  
  /** Job metadata */
  metadata?: Record<string, unknown>;
  
  /** Tenant ID for multi-tenant jobs */
  tenantId?: string;
}

/**
 * Full job record with execution state
 */
export interface Job<T = unknown> extends JobDefinition<T> {
  /** Unique job ID */
  id: JobId;
  
  /** Current status */
  status: JobStatus;
  
  /** Number of attempts made */
  attempts: number;
  
  /** Maximum retry attempts (from config) */
  maxAttempts: number;
  
  /** When job was created */
  createdAt: string;
  
  /** When job started executing */
  startedAt?: string;
  
  /** When job completed/failed */
  completedAt?: string;
  
  /** When next retry is scheduled */
  nextRetryAt?: string;
  
  /** Last error if failed */
  lastError?: JobError;
  
  /** Job result if completed */
  result?: unknown;
  
  /** Total execution time in ms */
  executionTimeMs?: number;
}

/**
 * Job error information
 */
export interface JobError {
  /** Error message */
  message: string;
  
  /** Error code */
  code?: string;
  
  /** Error stack trace */
  stack?: string;
  
  /** Attempt number when error occurred */
  attempt: number;
  
  /** When error occurred */
  timestamp: string;
  
  /** Whether error is retryable */
  retryable: boolean;
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  /** Maximum number of retry attempts (default: 3) */
  maxAttempts?: number;
  
  /** Base delay between retries in ms (default: 1000) */
  baseDelayMs?: number;
  
  /** Maximum delay between retries in ms (default: 60000) */
  maxDelayMs?: number;
  
  /** Backoff multiplier for exponential backoff (default: 2) */
  backoffMultiplier?: number;
  
  /** Whether to add jitter to delays (default: true) */
  jitter?: boolean;
  
  /** Jitter factor 0-1 (default: 0.1) */
  jitterFactor?: number;
  
  /** Retry strategy to use */
  strategy?: RetryStrategy;
  
  /** Custom function to determine if error is retryable */
  isRetryable?: (error: Error) => boolean;
}

/**
 * Retry strategy types
 */
export enum RetryStrategy {
  /** Fixed delay between retries */
  FIXED = 'fixed',
  
  /** Exponential backoff (delay doubles each time) */
  EXPONENTIAL = 'exponential',
  
  /** Linear backoff (delay increases linearly) */
  LINEAR = 'linear',
  
  /** Immediate retry (no delay) */
  IMMEDIATE = 'immediate',
}

/**
 * Job handler function type
 */
export type JobHandler<T = unknown, R = unknown> = (
  job: Job<T>,
  context: JobContext
) => Promise<R>;

/**
 * Context passed to job handlers
 */
export interface JobContext {
  /** Logger instance */
  log: JobLogger;
  
  /** Signal abort controller */
  signal: AbortSignal;
  
  /** Report job progress */
  reportProgress: (progress: number, message?: string) => void;
  
  /** Update job metadata */
  updateMetadata: (metadata: Record<string, unknown>) => void;
}

/**
 * Job logger interface
 */
export interface JobLogger {
  debug(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
}

/**
 * Job handle returned when submitting a job
 */
export interface JobHandle<R = unknown> {
  /** Job ID */
  id: JobId;
  
  /** Job type */
  type: string;
  
  /** Wait for job completion */
  wait(): Promise<R>;
  
  /** Cancel the job */
  cancel(): Promise<boolean>;
  
  /** Get current job status */
  getStatus(): Promise<Job>;
  
  /** Check if job is done */
  isDone(): Promise<boolean>;
}

/**
 * Job runner configuration
 */
export interface JobRunnerConfig {
  /** Maximum concurrent jobs (default: 10) */
  concurrency?: number;
  
  /** Default retry configuration */
  defaultRetry?: RetryConfig;
  
  /** Default job timeout in ms (default: 300000 = 5 min) */
  defaultTimeout?: number;
  
  /** Poll interval for job queue in ms (default: 1000) */
  pollIntervalMs?: number;
  
  /** Whether to start processing immediately (default: true) */
  autoStart?: boolean;
  
  /** Job storage adapter */
  storage?: JobStorage;
  
  /** Logger instance */
  logger?: JobLogger;
}

/**
 * Job storage adapter interface
 */
export interface JobStorage {
  /** Save a new job */
  save(job: Job): Promise<void>;
  
  /** Update an existing job */
  update(job: Job): Promise<void>;
  
  /** Get job by ID */
  get(id: JobId): Promise<Job | null>;
  
  /** Get next pending jobs */
  getNextPending(limit: number): Promise<Job[]>;
  
  /** Get jobs by status */
  getByStatus(status: JobStatus, limit?: number): Promise<Job[]>;
  
  /** Mark job as running */
  markRunning(id: JobId): Promise<boolean>;
  
  /** Delete job */
  delete(id: JobId): Promise<void>;
  
  /** Get job statistics */
  getStats(): Promise<JobStats>;
}

/**
 * Job statistics
 */
export interface JobStats {
  pending: number;
  running: number;
  completed: number;
  failed: number;
  totalProcessed: number;
  averageExecutionMs: number;
}

/**
 * Events emitted by job runner
 */
export interface JobRunnerEvents extends Record<string, (...args: any[]) => void> {
  'job:submitted': (job: Job) => void;
  'job:started': (job: Job) => void;
  'job:completed': (job: Job, result: unknown) => void;
  'job:failed': (job: Job, error: Error) => void;
  'job:retrying': (job: Job, attempt: number, delay: number) => void;
  'job:cancelled': (job: Job) => void;
  'job:timeout': (job: Job) => void;
  'runner:started': () => void;
  'runner:stopped': () => void;
  'runner:error': (error: Error) => void;
}
