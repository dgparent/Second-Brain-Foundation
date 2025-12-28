# @sbf/job-runner

Background job processing with retry strategies, exponential backoff, and job status tracking for Second Brain Foundation.

## Installation

```bash
pnpm add @sbf/job-runner
```

## Features

- **JobRunner**: Main job processor with concurrent execution
- **Retry Strategies**: Fixed, linear, exponential backoff with jitter
- **Job Priorities**: LOW, NORMAL, HIGH, CRITICAL
- **Status Tracking**: PENDING, RUNNING, COMPLETED, FAILED, RETRYING, CANCELLED, TIMEOUT
- **Event System**: Subscribe to job lifecycle events
- **Pluggable Storage**: In-memory default, custom adapters supported
- **Job Handles**: Wait for results, cancel jobs, check status
- **Decorators**: `@WithRetry` for method-level retry logic

## Usage

### Basic Job Processing

```typescript
import { JobRunner, JobPriority } from '@sbf/job-runner';

// Create runner
const runner = new JobRunner({
  concurrency: 10,        // Max concurrent jobs
  defaultTimeout: 60000,  // 1 minute timeout
  pollIntervalMs: 1000,   // Poll every second
});

// Register handler
runner.registerHandler<{ email: string }, boolean>('send-email', async (job, ctx) => {
  ctx.log.info(`Sending email to ${job.payload.email}`);
  
  // Your email sending logic
  await sendEmail(job.payload.email);
  
  return true;
});

// Submit job
const handle = await runner.submit({
  type: 'send-email',
  payload: { email: 'user@example.com' },
  priority: JobPriority.HIGH,
});

// Wait for result
const result = await handle.wait();
console.log('Email sent:', result);
```

### Retry Configuration

```typescript
import { JobRunner, RetryStrategy } from '@sbf/job-runner';

const runner = new JobRunner({
  defaultRetry: {
    maxAttempts: 5,
    baseDelayMs: 1000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
    jitter: true,
    jitterFactor: 0.1,
    strategy: RetryStrategy.EXPONENTIAL,
  },
});

// Or per-job configuration
const handle = await runner.submit({
  type: 'api-call',
  payload: { endpoint: '/users' },
  retry: {
    maxAttempts: 3,
    strategy: RetryStrategy.EXPONENTIAL,
    isRetryable: (error) => error.message.includes('timeout'),
  },
});
```

### Retry Strategies

| Strategy | Description |
|----------|-------------|
| `IMMEDIATE` | No delay between retries |
| `FIXED` | Same delay between each retry |
| `LINEAR` | Delay increases linearly (baseDelay * attempt) |
| `EXPONENTIAL` | Delay doubles each time (baseDelay * 2^(attempt-1)) |

### Job Events

```typescript
runner.on('job:submitted', (job) => {
  console.log(`Job ${job.id} submitted`);
});

runner.on('job:started', (job) => {
  console.log(`Job ${job.id} started (attempt ${job.attempts})`);
});

runner.on('job:completed', (job, result) => {
  console.log(`Job ${job.id} completed:`, result);
});

runner.on('job:failed', (job, error) => {
  console.error(`Job ${job.id} failed:`, error);
});

runner.on('job:retrying', (job, attempt, delay) => {
  console.log(`Job ${job.id} retrying (attempt ${attempt}, delay ${delay}ms)`);
});

runner.on('job:cancelled', (job) => {
  console.log(`Job ${job.id} cancelled`);
});

runner.on('job:timeout', (job) => {
  console.log(`Job ${job.id} timed out`);
});
```

### Job Handle Operations

```typescript
const handle = await runner.submit({
  type: 'long-task',
  payload: {},
  timeout: 300000, // 5 minutes
});

// Wait for completion
try {
  const result = await handle.wait();
} catch (error) {
  console.error('Job failed:', error);
}

// Check status
const status = await handle.getStatus();
console.log(status.status, status.attempts, status.lastError);

// Cancel job
const cancelled = await handle.cancel();

// Check if done
const isDone = await handle.isDone();
```

### Job Context

Handlers receive a context object with utilities:

```typescript
runner.registerHandler('process', async (job, ctx) => {
  // Logging scoped to job
  ctx.log.debug('Debug message');
  ctx.log.info('Info message');
  ctx.log.warn('Warning');
  ctx.log.error('Error');
  
  // Abort signal for cancellation
  if (ctx.signal.aborted) {
    throw new Error('Job cancelled');
  }
  
  // Report progress (for monitoring)
  ctx.reportProgress(50, 'Halfway done');
  
  // Update job metadata
  ctx.updateMetadata({ processedItems: 100 });
  
  return 'done';
});
```

### Graceful Shutdown

```typescript
// Graceful - waits for running jobs to complete
await runner.stop(true);

// Force - aborts running jobs immediately
await runner.stop(false);
```

### Using withRetry Standalone

```typescript
import { withRetry, RetryStrategy } from '@sbf/job-runner';

// Wrap any async function with retry logic
const result = await withRetry(
  async () => {
    const response = await fetch('https://api.example.com/data');
    if (!response.ok) throw new Error('API error');
    return response.json();
  },
  {
    maxAttempts: 3,
    strategy: RetryStrategy.EXPONENTIAL,
    baseDelayMs: 500,
  },
  (attempt, delay, error) => {
    console.log(`Retry ${attempt} after ${delay}ms: ${error.message}`);
  }
);
```

### @WithRetry Decorator

```typescript
import { WithRetry, RetryStrategy } from '@sbf/job-runner';

class ApiClient {
  @WithRetry({
    maxAttempts: 3,
    strategy: RetryStrategy.EXPONENTIAL,
    baseDelayMs: 1000,
  })
  async fetchData(id: string): Promise<Data> {
    const response = await fetch(`/api/data/${id}`);
    if (!response.ok) throw new Error('Failed to fetch');
    return response.json();
  }
}
```

### Custom Job Storage

```typescript
import { JobRunner, JobStorage, Job, JobId, JobStatus } from '@sbf/job-runner';

class PostgresJobStorage implements JobStorage {
  async save(job: Job): Promise<void> {
    await db.query('INSERT INTO jobs ...', [job]);
  }
  
  async update(job: Job): Promise<void> {
    await db.query('UPDATE jobs SET ...', [job]);
  }
  
  async get(id: JobId): Promise<Job | null> {
    return db.queryOne('SELECT * FROM jobs WHERE id = $1', [id]);
  }
  
  async getNextPending(limit: number): Promise<Job[]> {
    return db.query(
      'SELECT * FROM jobs WHERE status = $1 ORDER BY priority DESC, created_at ASC LIMIT $2',
      [JobStatus.PENDING, limit]
    );
  }
  
  async markRunning(id: JobId): Promise<boolean> {
    const result = await db.query(
      'UPDATE jobs SET status = $1, started_at = NOW() WHERE id = $2 AND status = $3',
      [JobStatus.RUNNING, id, JobStatus.PENDING]
    );
    return result.rowCount > 0;
  }
  
  // ... other methods
}

const runner = new JobRunner({
  storage: new PostgresJobStorage(),
});
```

## Types

### Job Definition

```typescript
interface JobDefinition<T> {
  type: string;           // Job type (must have handler)
  payload: T;             // Job data
  priority?: JobPriority; // Execution priority
  retry?: RetryConfig;    // Retry configuration
  timeout?: number;       // Max execution time (ms)
  delay?: number;         // Initial delay before first run (ms)
  metadata?: Record<string, unknown>;
  tenantId?: string;      // For multi-tenant support
}
```

### Job Status

```typescript
enum JobStatus {
  PENDING = 'pending',     // Waiting to be processed
  RUNNING = 'running',     // Currently executing
  COMPLETED = 'completed', // Finished successfully
  FAILED = 'failed',       // Failed after all retries
  RETRYING = 'retrying',   // Waiting for retry
  CANCELLED = 'cancelled', // Manually cancelled
  TIMEOUT = 'timeout',     // Exceeded timeout
}
```

### Retry Config

```typescript
interface RetryConfig {
  maxAttempts?: number;      // Max retry attempts (default: 3)
  baseDelayMs?: number;      // Base delay (default: 1000)
  maxDelayMs?: number;       // Max delay cap (default: 60000)
  backoffMultiplier?: number; // For exponential (default: 2)
  jitter?: boolean;          // Add randomness (default: true)
  jitterFactor?: number;     // Jitter amount (default: 0.1)
  strategy?: RetryStrategy;  // Retry strategy
  isRetryable?: (error: Error) => boolean; // Custom retry check
}
```

## License

MIT © Second Brain Foundation
