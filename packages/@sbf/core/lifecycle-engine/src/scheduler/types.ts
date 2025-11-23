/**
 * Scheduler types for lifecycle automation
 */

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export type JobFrequency = 'once' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'custom';

export interface Job {
  id: string;
  name: string;
  description?: string;
  frequency: JobFrequency;
  cronExpression?: string;
  nextRunTime: Date;
  lastRunTime?: Date;
  status: JobStatus;
  retryCount: number;
  maxRetries: number;
  enabled: boolean;
  metadata?: Record<string, any>;
  handler: () => Promise<void>;
}

export interface JobResult {
  jobId: string;
  status: JobStatus;
  startTime: Date;
  endTime: Date;
  duration: number;
  error?: Error;
  metadata?: Record<string, any>;
}

export interface SchedulerConfig {
  persistJobs?: boolean;
  persistencePath?: string;
  checkIntervalMs?: number;
  defaultMaxRetries?: number;
}

export interface CronSchedule {
  minute?: string;
  hour?: string;
  dayOfMonth?: string;
  month?: string;
  dayOfWeek?: string;
}
