/**
 * @sbf/job-runner - Unit Tests
 */

import {
  JobRunner,
  JobStatus,
  JobPriority,
  RetryStrategy,
  InMemoryJobStorage,
  calculateRetryDelay,
  isRetryableError,
  withRetry,
  sleep,
  DEFAULT_RETRY_CONFIG,
} from './index';

describe('RetryStrategy', () => {
  describe('calculateRetryDelay', () => {
    it('should return 0 for IMMEDIATE strategy', () => {
      const delay = calculateRetryDelay(1, { strategy: RetryStrategy.IMMEDIATE });
      expect(delay).toBe(0);
    });

    it('should return fixed delay for FIXED strategy', () => {
      const delay = calculateRetryDelay(3, {
        strategy: RetryStrategy.FIXED,
        baseDelayMs: 1000,
        jitter: false,
      });
      expect(delay).toBe(1000);
    });

    it('should return linear delay for LINEAR strategy', () => {
      const config = {
        strategy: RetryStrategy.LINEAR,
        baseDelayMs: 1000,
        jitter: false,
      };
      expect(calculateRetryDelay(1, config)).toBe(1000);
      expect(calculateRetryDelay(2, config)).toBe(2000);
      expect(calculateRetryDelay(3, config)).toBe(3000);
    });

    it('should return exponential delay for EXPONENTIAL strategy', () => {
      const config = {
        strategy: RetryStrategy.EXPONENTIAL,
        baseDelayMs: 1000,
        backoffMultiplier: 2,
        jitter: false,
      };
      expect(calculateRetryDelay(1, config)).toBe(1000);
      expect(calculateRetryDelay(2, config)).toBe(2000);
      expect(calculateRetryDelay(3, config)).toBe(4000);
    });

    it('should cap delay at maxDelayMs', () => {
      const delay = calculateRetryDelay(10, {
        strategy: RetryStrategy.EXPONENTIAL,
        baseDelayMs: 1000,
        backoffMultiplier: 2,
        maxDelayMs: 5000,
        jitter: false,
      });
      expect(delay).toBe(5000);
    });

    it('should add jitter when enabled', () => {
      const delays = new Set<number>();
      for (let i = 0; i < 10; i++) {
        delays.add(
          calculateRetryDelay(1, {
            baseDelayMs: 1000,
            jitter: true,
            jitterFactor: 0.5,
          })
        );
      }
      // With jitter, delays should vary
      expect(delays.size).toBeGreaterThan(1);
    });
  });

  describe('isRetryableError', () => {
    it('should return true for timeout errors', () => {
      expect(isRetryableError(new Error('Request timeout'))).toBe(true);
      expect(isRetryableError(new Error('Connection timed out'))).toBe(true);
    });

    it('should return true for rate limit errors', () => {
      expect(isRetryableError(new Error('Rate limit exceeded'))).toBe(true);
      expect(isRetryableError(new Error('Too many requests'))).toBe(true);
    });

    it('should return false for validation errors', () => {
      expect(isRetryableError(new Error('Invalid input'))).toBe(false);
      expect(isRetryableError(new Error('Validation failed'))).toBe(false);
    });

    it('should return false for auth errors', () => {
      expect(isRetryableError(new Error('Unauthorized'))).toBe(false);
      expect(isRetryableError(new Error('Forbidden'))).toBe(false);
    });

    it('should return true for server errors by status', () => {
      const error = new Error('Server error') as any;
      error.status = 500;
      expect(isRetryableError(error)).toBe(true);

      error.status = 503;
      expect(isRetryableError(error)).toBe(true);
    });

    it('should return false for client errors by status', () => {
      const error = new Error('Bad request') as any;
      error.status = 400;
      expect(isRetryableError(error)).toBe(false);

      error.status = 404;
      expect(isRetryableError(error)).toBe(false);
    });

    it('should use custom isRetryable function', () => {
      const config = {
        isRetryable: (e: Error) => e.message.includes('retry-me'),
      };
      expect(isRetryableError(new Error('please retry-me'), config)).toBe(true);
      expect(isRetryableError(new Error('dont retry'), config)).toBe(false);
    });
  });

  describe('withRetry', () => {
    it('should succeed on first try', async () => {
      let attempts = 0;
      const result = await withRetry(async () => {
        attempts++;
        return 'success';
      });
      expect(result).toBe('success');
      expect(attempts).toBe(1);
    });

    it('should retry on failure', async () => {
      let attempts = 0;
      const result = await withRetry(
        async () => {
          attempts++;
          if (attempts < 3) {
            throw new Error('Rate limit exceeded');
          }
          return 'success';
        },
        { maxAttempts: 5, strategy: RetryStrategy.IMMEDIATE }
      );
      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });

    it('should throw after max attempts', async () => {
      let attempts = 0;
      await expect(
        withRetry(
          async () => {
            attempts++;
            throw new Error('Rate limit exceeded');
          },
          { maxAttempts: 3, strategy: RetryStrategy.IMMEDIATE }
        )
      ).rejects.toThrow('Rate limit exceeded');
      expect(attempts).toBe(3);
    });

    it('should not retry non-retryable errors', async () => {
      let attempts = 0;
      await expect(
        withRetry(
          async () => {
            attempts++;
            throw new Error('Invalid input');
          },
          { maxAttempts: 3, strategy: RetryStrategy.IMMEDIATE }
        )
      ).rejects.toThrow('Invalid input');
      expect(attempts).toBe(1);
    });

    it('should call onRetry callback', async () => {
      const retries: { attempt: number; delay: number }[] = [];
      let attempts = 0;

      await withRetry(
        async () => {
          attempts++;
          if (attempts < 3) {
            throw new Error('Timeout');
          }
          return 'ok';
        },
        { maxAttempts: 3, strategy: RetryStrategy.IMMEDIATE },
        (attempt, delay) => retries.push({ attempt, delay })
      );

      expect(retries).toHaveLength(2);
      expect(retries[0].attempt).toBe(1);
      expect(retries[1].attempt).toBe(2);
    });
  });

  describe('sleep', () => {
    it('should delay execution', async () => {
      const start = Date.now();
      await sleep(50);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(40); // Allow some tolerance
    });
  });
});

describe('InMemoryJobStorage', () => {
  let storage: InMemoryJobStorage;

  beforeEach(() => {
    storage = new InMemoryJobStorage();
  });

  it('should save and retrieve jobs', async () => {
    const job = {
      id: 'job-1',
      type: 'test',
      payload: { data: 'test' },
      status: JobStatus.PENDING,
      priority: JobPriority.NORMAL,
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date().toISOString(),
    };

    await storage.save(job as any);
    const retrieved = await storage.get('job-1');

    expect(retrieved).toBeDefined();
    expect(retrieved!.id).toBe('job-1');
    expect(retrieved!.type).toBe('test');
  });

  it('should return null for non-existent jobs', async () => {
    const job = await storage.get('non-existent');
    expect(job).toBeNull();
  });

  it('should get pending jobs sorted by priority', async () => {
    await storage.save({
      id: 'low',
      type: 'test',
      payload: {},
      status: JobStatus.PENDING,
      priority: JobPriority.LOW,
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date().toISOString(),
    } as any);

    await storage.save({
      id: 'high',
      type: 'test',
      payload: {},
      status: JobStatus.PENDING,
      priority: JobPriority.HIGH,
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date().toISOString(),
    } as any);

    const pending = await storage.getNextPending(10);
    expect(pending[0].id).toBe('high');
    expect(pending[1].id).toBe('low');
  });

  it('should track job statistics', async () => {
    await storage.save({
      id: 'job-1',
      type: 'test',
      payload: {},
      status: JobStatus.PENDING,
      priority: JobPriority.NORMAL,
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date().toISOString(),
    } as any);

    let stats = await storage.getStats();
    expect(stats.pending).toBe(1);

    await storage.markRunning('job-1');
    stats = await storage.getStats();
    expect(stats.pending).toBe(0);
    expect(stats.running).toBe(1);
  });

  it('should mark job as running atomically', async () => {
    await storage.save({
      id: 'job-1',
      type: 'test',
      payload: {},
      status: JobStatus.PENDING,
      priority: JobPriority.NORMAL,
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date().toISOString(),
    } as any);

    const result1 = await storage.markRunning('job-1');
    const result2 = await storage.markRunning('job-1');

    expect(result1).toBe(true);
    expect(result2).toBe(false); // Already running
  });

  it('should delete jobs', async () => {
    await storage.save({
      id: 'job-1',
      type: 'test',
      payload: {},
      status: JobStatus.PENDING,
      priority: JobPriority.NORMAL,
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date().toISOString(),
    } as any);

    await storage.delete('job-1');
    const job = await storage.get('job-1');
    expect(job).toBeNull();
  });
});

describe('JobRunner', () => {
  let runner: JobRunner;

  beforeEach(() => {
    runner = new JobRunner({
      autoStart: false,
      concurrency: 2,
      defaultTimeout: 5000,
      pollIntervalMs: 100,
    });
  });

  afterEach(async () => {
    await runner.stop(false);
  });

  it('should register handlers', () => {
    runner.registerHandler('test', async () => 'result');
    // Handler should be registered without throwing
  });

  it('should submit jobs', async () => {
    runner.registerHandler('test', async () => 'result');
    runner.start();

    const handle = await runner.submit({
      type: 'test',
      payload: { data: 'test' },
    });

    expect(handle.id).toBeDefined();
    expect(handle.type).toBe('test');
  });

  it('should execute jobs and return results', async () => {
    runner.registerHandler<{ value: number }, number>('multiply', async job => {
      return job.payload.value * 2;
    });
    runner.start();

    const handle = await runner.submit<{ value: number }, number>({
      type: 'multiply',
      payload: { value: 21 },
    });

    const result = await handle.wait();
    expect(result).toBe(42);
  });

  it('should retry failed jobs', async () => {
    let attempts = 0;
    runner.registerHandler('retry-test', async () => {
      attempts++;
      if (attempts < 2) {
        throw new Error('Rate limit exceeded');
      }
      return 'success';
    });
    runner.start();

    const handle = await runner.submit({
      type: 'retry-test',
      payload: {},
      retry: {
        maxAttempts: 3,
        strategy: RetryStrategy.IMMEDIATE,
      },
    });

    const result = await handle.wait();
    expect(result).toBe('success');
    expect(attempts).toBe(2);
  });

  it('should fail after max retries', async () => {
    runner.registerHandler('always-fail', async () => {
      throw new Error('Rate limit exceeded');
    });
    runner.start();

    const handle = await runner.submit({
      type: 'always-fail',
      payload: {},
      retry: {
        maxAttempts: 2,
        strategy: RetryStrategy.IMMEDIATE,
      },
    });

    await expect(handle.wait()).rejects.toThrow('Rate limit exceeded');
  });

  it('should handle job priority', async () => {
    const order: string[] = [];

    runner.registerHandler('priority-test', async job => {
      order.push(job.id);
      return null;
    });

    // Submit jobs before starting
    const lowHandle = await runner.submit({
      type: 'priority-test',
      payload: {},
      priority: JobPriority.LOW,
    });

    const highHandle = await runner.submit({
      type: 'priority-test',
      payload: {},
      priority: JobPriority.HIGH,
    });

    runner.start();

    await Promise.all([lowHandle.wait(), highHandle.wait()]);

    // High priority should be processed first
    expect(order[0]).toBe(highHandle.id);
  });

  it('should cancel jobs', async () => {
    runner.registerHandler('cancel-test', async () => {
      await sleep(1000);
      return 'should not reach';
    });
    runner.start();

    const handle = await runner.submit({
      type: 'cancel-test',
      payload: {},
    });

    // Cancel immediately
    const cancelled = await handle.cancel();
    expect(cancelled).toBe(true);

    await expect(handle.wait()).rejects.toThrow('cancelled');
  });

  it('should emit events', async () => {
    const events: string[] = [];

    runner.on('job:submitted', () => events.push('submitted'));
    runner.on('job:started', () => events.push('started'));
    runner.on('job:completed', () => events.push('completed'));
    runner.on('runner:started', () => events.push('runner:started'));
    runner.on('runner:stopped', () => events.push('runner:stopped'));

    runner.registerHandler('event-test', async () => 'done');
    runner.start();

    const handle = await runner.submit({
      type: 'event-test',
      payload: {},
    });

    await handle.wait();
    await runner.stop();

    expect(events).toContain('submitted');
    expect(events).toContain('started');
    expect(events).toContain('completed');
    expect(events).toContain('runner:started');
    expect(events).toContain('runner:stopped');
  });

  it('should get job status', async () => {
    runner.registerHandler('status-test', async () => {
      await sleep(50);
      return 'done';
    });
    runner.start();

    const handle = await runner.submit({
      type: 'status-test',
      payload: {},
    });

    // Initially should be pending or running
    const status1 = await handle.getStatus();
    expect([JobStatus.PENDING, JobStatus.RUNNING]).toContain(status1.status);

    await handle.wait();

    const status2 = await handle.getStatus();
    expect(status2.status).toBe(JobStatus.COMPLETED);
  });

  it('should provide job context', async () => {
    let logCalled = false;
    let signalProvided = false;

    runner.registerHandler('context-test', async (job, ctx) => {
      ctx.log.info('Test message');
      logCalled = true;
      signalProvided = ctx.signal !== undefined;
      return null;
    });
    runner.start();

    const handle = await runner.submit({
      type: 'context-test',
      payload: {},
    });

    await handle.wait();

    expect(logCalled).toBe(true);
    expect(signalProvided).toBe(true);
  });
});
