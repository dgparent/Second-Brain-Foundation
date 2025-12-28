/**
 * @sbf/job-runner - In-Memory Storage
 * 
 * Simple in-memory job storage for testing and development.
 */

import {
  Job,
  JobId,
  JobStatus,
  JobStorage,
  JobStats,
} from './types';

/**
 * In-memory job storage implementation
 */
export class InMemoryJobStorage implements JobStorage {
  private jobs: Map<JobId, Job> = new Map();
  private stats: JobStats = {
    pending: 0,
    running: 0,
    completed: 0,
    failed: 0,
    totalProcessed: 0,
    averageExecutionMs: 0,
  };
  private totalExecutionTime = 0;

  async save(job: Job): Promise<void> {
    this.jobs.set(job.id, { ...job });
    this.updateStatsOnSave(job);
  }

  async update(job: Job): Promise<void> {
    const existing = this.jobs.get(job.id);
    if (existing) {
      this.updateStatsOnStatusChange(existing.status, job.status, job.executionTimeMs);
    }
    this.jobs.set(job.id, { ...job });
  }

  async get(id: JobId): Promise<Job | null> {
    const job = this.jobs.get(id);
    return job ? { ...job } : null;
  }

  async getNextPending(limit: number): Promise<Job[]> {
    const pending: Job[] = [];
    
    for (const job of this.jobs.values()) {
      if (job.status === JobStatus.PENDING) {
        pending.push({ ...job });
        if (pending.length >= limit) break;
      }
    }
    
    // Sort by priority (higher first) then by createdAt (older first)
    pending.sort((a, b) => {
      if ((a.priority || 0) !== (b.priority || 0)) {
        return (b.priority || 0) - (a.priority || 0);
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
    
    return pending.slice(0, limit);
  }

  async getByStatus(status: JobStatus, limit = 100): Promise<Job[]> {
    const result: Job[] = [];
    
    for (const job of this.jobs.values()) {
      if (job.status === status) {
        result.push({ ...job });
        if (result.length >= limit) break;
      }
    }
    
    return result;
  }

  async markRunning(id: JobId): Promise<boolean> {
    const job = this.jobs.get(id);
    if (!job || job.status !== JobStatus.PENDING) {
      return false;
    }
    
    job.status = JobStatus.RUNNING;
    job.startedAt = new Date().toISOString();
    
    this.stats.pending--;
    this.stats.running++;
    
    return true;
  }

  async delete(id: JobId): Promise<void> {
    const job = this.jobs.get(id);
    if (job) {
      this.updateStatsOnDelete(job.status);
    }
    this.jobs.delete(id);
  }

  async getStats(): Promise<JobStats> {
    return { ...this.stats };
  }

  /**
   * Clear all jobs (for testing)
   */
  clear(): void {
    this.jobs.clear();
    this.stats = {
      pending: 0,
      running: 0,
      completed: 0,
      failed: 0,
      totalProcessed: 0,
      averageExecutionMs: 0,
    };
    this.totalExecutionTime = 0;
  }

  /**
   * Get all jobs (for testing/debugging)
   */
  getAll(): Job[] {
    return Array.from(this.jobs.values()).map(job => ({ ...job }));
  }

  private updateStatsOnSave(job: Job): void {
    switch (job.status) {
      case JobStatus.PENDING:
        this.stats.pending++;
        break;
      case JobStatus.RUNNING:
        this.stats.running++;
        break;
      case JobStatus.COMPLETED:
        this.stats.completed++;
        break;
      case JobStatus.FAILED:
        this.stats.failed++;
        break;
    }
  }

  private updateStatsOnStatusChange(
    oldStatus: JobStatus,
    newStatus: JobStatus,
    executionTimeMs?: number
  ): void {
    // Decrement old status
    switch (oldStatus) {
      case JobStatus.PENDING:
        this.stats.pending--;
        break;
      case JobStatus.RUNNING:
        this.stats.running--;
        break;
      case JobStatus.COMPLETED:
        this.stats.completed--;
        break;
      case JobStatus.FAILED:
        this.stats.failed--;
        break;
    }
    
    // Increment new status
    switch (newStatus) {
      case JobStatus.PENDING:
        this.stats.pending++;
        break;
      case JobStatus.RUNNING:
        this.stats.running++;
        break;
      case JobStatus.COMPLETED:
        this.stats.completed++;
        this.stats.totalProcessed++;
        if (executionTimeMs !== undefined) {
          this.totalExecutionTime += executionTimeMs;
          this.stats.averageExecutionMs = this.totalExecutionTime / this.stats.totalProcessed;
        }
        break;
      case JobStatus.FAILED:
        this.stats.failed++;
        this.stats.totalProcessed++;
        if (executionTimeMs !== undefined) {
          this.totalExecutionTime += executionTimeMs;
          this.stats.averageExecutionMs = this.totalExecutionTime / this.stats.totalProcessed;
        }
        break;
    }
  }

  private updateStatsOnDelete(status: JobStatus): void {
    switch (status) {
      case JobStatus.PENDING:
        this.stats.pending--;
        break;
      case JobStatus.RUNNING:
        this.stats.running--;
        break;
      case JobStatus.COMPLETED:
        this.stats.completed--;
        break;
      case JobStatus.FAILED:
        this.stats.failed--;
        break;
    }
  }
}
