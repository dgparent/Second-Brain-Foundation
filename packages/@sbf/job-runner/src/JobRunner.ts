/**
 * @sbf/job-runner - JobRunner
 * 
 * Main job runner class that processes jobs from a queue.
 */

import {
  Job,
  JobDefinition,
  JobId,
  JobStatus,
  JobPriority,
  JobHandler,
  JobHandle,
  JobContext,
  JobLogger,
  JobRunnerConfig,
  JobStorage,
  JobError,
  JobRunnerEvents,
  RetryConfig,
} from './types';
import { InMemoryJobStorage } from './storage';
import {
  DEFAULT_RETRY_CONFIG,
  calculateRetryDelay,
  isRetryableError,
  mergeRetryConfig,
} from './retry';

/**
 * Generate UUID v4
 */
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Default logger (console-based)
 */
const defaultLogger: JobLogger = {
  debug: (msg, meta) => console.debug(`[job-runner] ${msg}`, meta || ''),
  info: (msg, meta) => console.info(`[job-runner] ${msg}`, meta || ''),
  warn: (msg, meta) => console.warn(`[job-runner] ${msg}`, meta || ''),
  error: (msg, meta) => console.error(`[job-runner] ${msg}`, meta || ''),
};

/**
 * Event emitter implementation
 */
class EventEmitter<E extends Record<string, (...args: any[]) => void>> {
  private listeners: Map<keyof E, Set<Function>> = new Map();

  on<K extends keyof E>(event: K, listener: E[K]): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  off<K extends keyof E>(event: K, listener: E[K]): void {
    this.listeners.get(event)?.delete(listener);
  }

  emit<K extends keyof E>(event: K, ...args: Parameters<E[K]>): void {
    this.listeners.get(event)?.forEach(listener => {
      try {
        listener(...args);
      } catch (e) {
        console.error(`Error in event listener for ${String(event)}:`, e);
      }
    });
  }
}

/**
 * Job handle implementation
 */
class JobHandleImpl<R = unknown> implements JobHandle<R> {
  private resolvers: {
    resolve: (value: R) => void;
    reject: (error: Error) => void;
  }[] = [];
  private completed = false;
  private result: R | undefined;
  private error: Error | undefined;

  constructor(
    public readonly id: JobId,
    public readonly type: string,
    private readonly runner: JobRunner
  ) {}

  wait(): Promise<R> {
    if (this.completed) {
      return this.error
        ? Promise.reject(this.error)
        : Promise.resolve(this.result as R);
    }

    return new Promise((resolve, reject) => {
      this.resolvers.push({ resolve, reject });
    });
  }

  async cancel(): Promise<boolean> {
    return this.runner.cancelJob(this.id);
  }

  async getStatus(): Promise<Job> {
    const job = await this.runner.getJob(this.id);
    if (!job) {
      throw new Error(`Job ${this.id} not found`);
    }
    return job;
  }

  async isDone(): Promise<boolean> {
    const job = await this.getStatus();
    return (
      job.status === JobStatus.COMPLETED ||
      job.status === JobStatus.FAILED ||
      job.status === JobStatus.CANCELLED
    );
  }

  _resolve(result: R): void {
    this.completed = true;
    this.result = result;
    this.resolvers.forEach(r => r.resolve(result));
    this.resolvers = [];
  }

  _reject(error: Error): void {
    this.completed = true;
    this.error = error;
    this.resolvers.forEach(r => r.reject(error));
    this.resolvers = [];
  }
}

/**
 * Main JobRunner class
 */
export class JobRunner extends EventEmitter<JobRunnerEvents> {
  private handlers: Map<string, JobHandler> = new Map();
  private handles: Map<JobId, JobHandleImpl> = new Map();
  private storage: JobStorage;
  private logger: JobLogger;
  private config: Required<
    Omit<JobRunnerConfig, 'storage' | 'logger' | 'defaultRetry'>
  > & {
    defaultRetry: RetryConfig;
  };
  private running = false;
  private activeJobs = 0;
  private pollTimeout?: NodeJS.Timeout;
  private abortControllers: Map<JobId, AbortController> = new Map();

  constructor(config: JobRunnerConfig = {}) {
    super();
    
    this.storage = config.storage || new InMemoryJobStorage();
    this.logger = config.logger || defaultLogger;
    this.config = {
      concurrency: config.concurrency ?? 10,
      defaultTimeout: config.defaultTimeout ?? 300000, // 5 minutes
      pollIntervalMs: config.pollIntervalMs ?? 1000,
      autoStart: config.autoStart ?? true,
      defaultRetry: config.defaultRetry || DEFAULT_RETRY_CONFIG,
    };

    if (this.config.autoStart) {
      this.start();
    }
  }

  /**
   * Register a job handler for a job type
   */
  registerHandler<T = unknown, R = unknown>(
    type: string,
    handler: JobHandler<T, R>
  ): void {
    this.handlers.set(type, handler as JobHandler);
    this.logger.info(`Registered handler for job type: ${type}`);
  }

  /**
   * Submit a job for processing
   */
  async submit<T = unknown, R = unknown>(
    definition: JobDefinition<T>
  ): Promise<JobHandle<R>> {
    const retryConfig = mergeRetryConfig(
      this.config.defaultRetry,
      definition.retry
    );

    const job: Job<T> = {
      ...definition,
      id: generateId(),
      status: JobStatus.PENDING,
      priority: definition.priority ?? JobPriority.NORMAL,
      attempts: 0,
      maxAttempts: retryConfig.maxAttempts,
      createdAt: new Date().toISOString(),
      timeout: definition.timeout ?? this.config.defaultTimeout,
      retry: retryConfig,
    };

    // Apply delay if specified
    if (definition.delay && definition.delay > 0) {
      job.nextRetryAt = new Date(Date.now() + definition.delay).toISOString();
    }

    await this.storage.save(job);
    
    const handle = new JobHandleImpl<R>(job.id, job.type, this);
    this.handles.set(job.id, handle as JobHandleImpl);
    
    this.emit('job:submitted', job as Job);
    this.logger.info(`Job submitted: ${job.id} (${job.type})`, {
      priority: job.priority,
      maxAttempts: job.maxAttempts,
    });

    // Trigger immediate processing if running
    if (this.running) {
      this.processNextJobs();
    }

    return handle;
  }

  /**
   * Start processing jobs
   */
  start(): void {
    if (this.running) return;
    
    this.running = true;
    this.logger.info('Job runner started');
    this.emit('runner:started');
    
    this.pollForJobs();
  }

  /**
   * Stop processing jobs
   */
  async stop(graceful = true): Promise<void> {
    if (!this.running) return;
    
    this.running = false;
    
    if (this.pollTimeout) {
      clearTimeout(this.pollTimeout);
      this.pollTimeout = undefined;
    }
    
    if (graceful && this.activeJobs > 0) {
      this.logger.info(`Waiting for ${this.activeJobs} active jobs to complete...`);
      // Wait for active jobs to complete
      while (this.activeJobs > 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } else if (!graceful) {
      // Abort all running jobs
      for (const controller of this.abortControllers.values()) {
        controller.abort();
      }
    }
    
    this.logger.info('Job runner stopped');
    this.emit('runner:stopped');
  }

  /**
   * Get a job by ID
   */
  async getJob(id: JobId): Promise<Job | null> {
    return this.storage.get(id);
  }

  /**
   * Cancel a job
   */
  async cancelJob(id: JobId): Promise<boolean> {
    const job = await this.storage.get(id);
    if (!job) return false;
    
    if (job.status === JobStatus.RUNNING) {
      const controller = this.abortControllers.get(id);
      if (controller) {
        controller.abort();
      }
    }
    
    if (
      job.status === JobStatus.PENDING ||
      job.status === JobStatus.RUNNING ||
      job.status === JobStatus.RETRYING
    ) {
      job.status = JobStatus.CANCELLED;
      job.completedAt = new Date().toISOString();
      await this.storage.update(job);
      
      const handle = this.handles.get(id);
      if (handle) {
        handle._reject(new Error('Job cancelled'));
      }
      
      this.emit('job:cancelled', job);
      this.logger.info(`Job cancelled: ${id}`);
      return true;
    }
    
    return false;
  }

  /**
   * Get runner statistics
   */
  async getStats() {
    return this.storage.getStats();
  }

  /**
   * Check if runner is active
   */
  isRunning(): boolean {
    return this.running;
  }

  private pollForJobs(): void {
    if (!this.running) return;
    
    this.processNextJobs().finally(() => {
      if (this.running) {
        this.pollTimeout = setTimeout(
          () => this.pollForJobs(),
          this.config.pollIntervalMs
        );
      }
    });
  }

  private async processNextJobs(): Promise<void> {
    const availableSlots = this.config.concurrency - this.activeJobs;
    if (availableSlots <= 0) return;
    
    try {
      const jobs = await this.storage.getNextPending(availableSlots);
      
      for (const job of jobs) {
        // Skip if job has a scheduled retry time in the future
        if (job.nextRetryAt && new Date(job.nextRetryAt) > new Date()) {
          continue;
        }
        
        // Try to claim the job
        const claimed = await this.storage.markRunning(job.id);
        if (claimed) {
          this.executeJob(job);
        }
      }
    } catch (error) {
      this.logger.error('Error processing jobs', { error });
      this.emit('runner:error', error instanceof Error ? error : new Error(String(error)));
    }
  }

  private async executeJob(job: Job): Promise<void> {
    const handler = this.handlers.get(job.type);
    if (!handler) {
      this.logger.error(`No handler for job type: ${job.type}`);
      await this.failJob(job, new Error(`No handler for job type: ${job.type}`), false);
      return;
    }

    this.activeJobs++;
    
    const abortController = new AbortController();
    this.abortControllers.set(job.id, abortController);
    
    // Set up timeout
    let timeoutId: NodeJS.Timeout | undefined;
    if (job.timeout && job.timeout > 0) {
      timeoutId = setTimeout(() => {
        abortController.abort();
      }, job.timeout);
    }

    job.startedAt = new Date().toISOString();
    job.attempts++;
    
    const context: JobContext = {
      log: {
        debug: (msg, meta) => this.logger.debug(`[${job.id}] ${msg}`, meta),
        info: (msg, meta) => this.logger.info(`[${job.id}] ${msg}`, meta),
        warn: (msg, meta) => this.logger.warn(`[${job.id}] ${msg}`, meta),
        error: (msg, meta) => this.logger.error(`[${job.id}] ${msg}`, meta),
      },
      signal: abortController.signal,
      reportProgress: (_progress, _message) => {
        // Progress reporting could be implemented here
      },
      updateMetadata: metadata => {
        job.metadata = { ...job.metadata, ...metadata };
      },
    };

    this.emit('job:started', job);
    this.logger.info(`Job started: ${job.id} (attempt ${job.attempts}/${job.maxAttempts})`);

    const startTime = Date.now();
    
    try {
      const result = await handler(job, context);
      
      if (timeoutId) clearTimeout(timeoutId);
      
      if (abortController.signal.aborted) {
        throw new Error('Job timed out');
      }
      
      job.status = JobStatus.COMPLETED;
      job.result = result;
      job.completedAt = new Date().toISOString();
      job.executionTimeMs = Date.now() - startTime;
      
      await this.storage.update(job);
      
      const handle = this.handles.get(job.id);
      if (handle) {
        handle._resolve(result);
      }
      
      this.emit('job:completed', job, result);
      this.logger.info(`Job completed: ${job.id} (${job.executionTimeMs}ms)`);
      
    } catch (error) {
      if (timeoutId) clearTimeout(timeoutId);
      
      const err = error instanceof Error ? error : new Error(String(error));
      
      if (abortController.signal.aborted && err.message !== 'Job timed out') {
        // Job was cancelled
        job.status = JobStatus.CANCELLED;
        job.completedAt = new Date().toISOString();
        job.executionTimeMs = Date.now() - startTime;
        await this.storage.update(job);
        this.emit('job:cancelled', job);
      } else if (
        abortController.signal.aborted &&
        err.message === 'Job timed out'
      ) {
        // Job timed out
        await this.handleJobTimeout(job, startTime);
      } else {
        // Job failed
        await this.handleJobError(job, err, startTime);
      }
    } finally {
      this.activeJobs--;
      this.abortControllers.delete(job.id);
    }
  }

  private async handleJobTimeout(job: Job, startTime: number): Promise<void> {
    job.status = JobStatus.TIMEOUT;
    job.completedAt = new Date().toISOString();
    job.executionTimeMs = Date.now() - startTime;
    job.lastError = {
      message: 'Job timed out',
      attempt: job.attempts,
      timestamp: new Date().toISOString(),
      retryable: false,
    };
    
    await this.storage.update(job);
    
    const handle = this.handles.get(job.id);
    if (handle) {
      handle._reject(new Error('Job timed out'));
    }
    
    this.emit('job:timeout', job);
    this.logger.error(`Job timed out: ${job.id}`);
  }

  private async handleJobError(
    job: Job,
    error: Error,
    startTime: number
  ): Promise<void> {
    const retryable = isRetryableError(error, job.retry);
    const shouldRetry = retryable && job.attempts < job.maxAttempts;
    
    job.lastError = {
      message: error.message,
      code: (error as any).code,
      stack: error.stack,
      attempt: job.attempts,
      timestamp: new Date().toISOString(),
      retryable,
    };
    job.executionTimeMs = Date.now() - startTime;
    
    if (shouldRetry) {
      const delay = calculateRetryDelay(job.attempts, job.retry);
      job.status = JobStatus.RETRYING;
      job.nextRetryAt = new Date(Date.now() + delay).toISOString();
      
      // Put back to pending for retry
      await new Promise(resolve => setTimeout(resolve, delay));
      job.status = JobStatus.PENDING;
      await this.storage.update(job);
      
      this.emit('job:retrying', job, job.attempts, delay);
      this.logger.info(`Job retrying: ${job.id} (attempt ${job.attempts}, delay ${delay}ms)`);
    } else {
      await this.failJob(job, error, retryable);
    }
  }

  private async failJob(
    job: Job,
    error: Error,
    retryable: boolean
  ): Promise<void> {
    job.status = JobStatus.FAILED;
    job.completedAt = new Date().toISOString();
    job.lastError = {
      message: error.message,
      code: (error as any).code,
      stack: error.stack,
      attempt: job.attempts,
      timestamp: new Date().toISOString(),
      retryable,
    };
    
    await this.storage.update(job);
    
    const handle = this.handles.get(job.id);
    if (handle) {
      handle._reject(error);
    }
    
    this.emit('job:failed', job, error);
    this.logger.error(`Job failed: ${job.id}`, { error: error.message });
  }
}
