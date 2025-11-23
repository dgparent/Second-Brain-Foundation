/**
 * Job Scheduler for lifecycle automation
 * Manages scheduled jobs with persistence and retry logic
 */

import { EventEmitter } from 'eventemitter3';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Job, JobResult, JobStatus, SchedulerConfig } from './types';
import { CronParser } from './CronParser';

export interface SchedulerEvents {
  'job:scheduled': (job: Job) => void;
  'job:started': (job: Job) => void;
  'job:completed': (result: JobResult) => void;
  'job:failed': (result: JobResult) => void;
  'job:cancelled': (job: Job) => void;
}

export class Scheduler extends EventEmitter<SchedulerEvents> {
  private jobs: Map<string, Job> = new Map();
  private checkInterval: NodeJS.Timeout | null = null;
  private config: SchedulerConfig;
  private runningJobs: Set<string> = new Set();

  constructor(config: SchedulerConfig = {}) {
    super();
    this.config = {
      persistJobs: config.persistJobs ?? false,
      persistencePath: config.persistencePath ?? './scheduler-jobs.json',
      checkIntervalMs: config.checkIntervalMs ?? 60000, // 1 minute
      defaultMaxRetries: config.defaultMaxRetries ?? 3,
    };
  }

  /**
   * Initialize scheduler and load persisted jobs
   */
  async initialize(): Promise<void> {
    if (this.config.persistJobs) {
      await this.loadJobs();
    }
  }

  /**
   * Start the scheduler
   */
  start(): void {
    if (this.checkInterval) {
      return; // Already running
    }

    this.checkInterval = setInterval(() => {
      this.checkJobs();
    }, this.config.checkIntervalMs);

    // Run immediately on start
    this.checkJobs();
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Schedule a new job
   */
  async scheduleJob(job: Omit<Job, 'id' | 'status' | 'retryCount'>): Promise<string> {
    const id = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newJob: Job = {
      ...job,
      id,
      status: 'pending',
      retryCount: 0,
      maxRetries: job.maxRetries ?? this.config.defaultMaxRetries!,
    };

    this.jobs.set(id, newJob);
    this.emit('job:scheduled', newJob);

    if (this.config.persistJobs) {
      await this.persistJobs();
    }

    return id;
  }

  /**
   * Cancel a job
   */
  async cancelJob(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job) {
      return false;
    }

    if (this.runningJobs.has(jobId)) {
      // Cannot cancel running job
      return false;
    }

    job.status = 'cancelled';
    job.enabled = false;
    this.emit('job:cancelled', job);

    if (this.config.persistJobs) {
      await this.persistJobs();
    }

    return true;
  }

  /**
   * Get job by ID
   */
  getJob(jobId: string): Job | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Get all jobs
   */
  getAllJobs(): Job[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Get jobs by status
   */
  getJobsByStatus(status: JobStatus): Job[] {
    return this.getAllJobs().filter(job => job.status === status);
  }

  /**
   * Check for jobs that need to run
   */
  private async checkJobs(): Promise<void> {
    const now = new Date();

    for (const job of this.jobs.values()) {
      if (!job.enabled || job.status === 'cancelled') {
        continue;
      }

      if (this.runningJobs.has(job.id)) {
        continue; // Already running
      }

      if (job.nextRunTime <= now) {
        await this.runJob(job);
      }
    }
  }

  /**
   * Run a job
   */
  private async runJob(job: Job): Promise<void> {
    this.runningJobs.add(job.id);
    job.status = 'running';
    this.emit('job:started', job);

    const startTime = new Date();
    let error: Error | undefined;

    try {
      await job.handler();
      job.status = 'completed';
      job.lastRunTime = new Date();

      // Calculate next run time
      if (job.frequency !== 'once') {
        job.nextRunTime = this.calculateNextRunTime(job);
        job.status = 'pending';
      }

      const result: JobResult = {
        jobId: job.id,
        status: 'completed',
        startTime,
        endTime: new Date(),
        duration: Date.now() - startTime.getTime(),
        metadata: job.metadata,
      };

      this.emit('job:completed', result);
    } catch (err) {
      error = err as Error;
      job.retryCount++;

      if (job.retryCount >= job.maxRetries) {
        job.status = 'failed';
        job.enabled = false;
      } else {
        job.status = 'pending';
        // Retry in 5 minutes
        job.nextRunTime = new Date(Date.now() + 5 * 60 * 1000);
      }

      const result: JobResult = {
        jobId: job.id,
        status: 'failed',
        startTime,
        endTime: new Date(),
        duration: Date.now() - startTime.getTime(),
        error,
        metadata: job.metadata,
      };

      this.emit('job:failed', result);
    } finally {
      this.runningJobs.delete(job.id);

      if (this.config.persistJobs) {
        await this.persistJobs();
      }
    }
  }

  /**
   * Calculate next run time based on job frequency
   */
  private calculateNextRunTime(job: Job): Date {
    const now = new Date();

    if (job.cronExpression) {
      return CronParser.getNextRunTime(job.cronExpression, now);
    }

    switch (job.frequency) {
      case 'hourly':
        return new Date(now.getTime() + 60 * 60 * 1000);
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        return nextMonth;
      default:
        return new Date(now.getTime() + 60 * 60 * 1000);
    }
  }

  /**
   * Persist jobs to disk
   */
  private async persistJobs(): Promise<void> {
    if (!this.config.persistencePath) {
      return;
    }

    const jobData = Array.from(this.jobs.values()).map(job => ({
      ...job,
      handler: undefined, // Cannot serialize functions
      nextRunTime: job.nextRunTime.toISOString(),
      lastRunTime: job.lastRunTime?.toISOString(),
    }));

    const dir = path.dirname(this.config.persistencePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(this.config.persistencePath, JSON.stringify(jobData, null, 2));
  }

  /**
   * Load jobs from disk
   */
  private async loadJobs(): Promise<void> {
    if (!this.config.persistencePath) {
      return;
    }

    try {
      const data = await fs.readFile(this.config.persistencePath, 'utf-8');
      const jobData = JSON.parse(data);

      for (const job of jobData) {
        this.jobs.set(job.id, {
          ...job,
          nextRunTime: new Date(job.nextRunTime),
          lastRunTime: job.lastRunTime ? new Date(job.lastRunTime) : undefined,
          handler: async () => {
            console.warn(`Job ${job.id} has no handler after reload`);
          },
        });
      }
    } catch (err) {
      // File doesn't exist or is invalid, ignore
    }
  }

  /**
   * Check if scheduler is running
   */
  isRunning(): boolean {
    return this.checkInterval !== null;
  }

  /**
   * Get scheduler statistics
   */
  getStats() {
    const jobs = this.getAllJobs();
    return {
      total: jobs.length,
      pending: jobs.filter(j => j.status === 'pending').length,
      running: jobs.filter(j => j.status === 'running').length,
      completed: jobs.filter(j => j.status === 'completed').length,
      failed: jobs.filter(j => j.status === 'failed').length,
      cancelled: jobs.filter(j => j.status === 'cancelled').length,
      runningJobIds: Array.from(this.runningJobs),
    };
  }

  /**
   * Get scheduler statistics (alias for getStats)
   */
  getStatistics() {
    return this.getStats();
  }
}
