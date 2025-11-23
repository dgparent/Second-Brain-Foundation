/**
 * Tests for Scheduler
 */

import { Scheduler } from '../scheduler/Scheduler';

describe('Scheduler', () => {
  let scheduler: Scheduler;

  beforeEach(() => {
    scheduler = new Scheduler({
      persistJobs: false,
      checkIntervalMs: 100,
      defaultMaxRetries: 3,
    });
  });

  afterEach(() => {
    scheduler.stop();
  });

  describe('initialization', () => {
    it('should create scheduler with default config', () => {
      const s = new Scheduler();
      expect(s).toBeDefined();
    });

    it('should initialize without errors', async () => {
      await scheduler.initialize();
      // No errors means success
    });
  });

  describe('job scheduling', () => {
    it('should schedule a new job', async () => {
      const jobId = await scheduler.scheduleJob({
        name: 'test-job',
        handler: jest.fn(),
        frequency: 'hourly',
        nextRunTime: new Date(Date.now() + 60000),
        maxRetries: 3,
        enabled: true,
      });

      expect(jobId).toMatch(/^job-/);
    });

    it('should assign pending status to new jobs', async () => {
      const jobId = await scheduler.scheduleJob({
        name: 'test-job',
        handler: jest.fn(),
        frequency: 'hourly',
        nextRunTime: new Date(Date.now() + 60000),
        maxRetries: 3,
        enabled: true,
      });

      const job = scheduler.getJob(jobId);
      expect(job?.status).toBe('pending');
    });
  });

  describe('job retrieval', () => {
    it('should get job by id', async () => {
      const jobId = await scheduler.scheduleJob({
        name: 'test-job',
        handler: jest.fn(),
        frequency: 'hourly',
        nextRunTime: new Date(Date.now() + 60000),
        maxRetries: 3,
        enabled: true,
      });

      const job = scheduler.getJob(jobId);
      expect(job).toBeDefined();
      expect(job?.id).toBe(jobId);
    });

    it('should return undefined for non-existent job', () => {
      const job = scheduler.getJob('non-existent');
      expect(job).toBeUndefined();
    });

    it('should list all jobs', async () => {
      await scheduler.scheduleJob({
        name: 'job1',
        handler: jest.fn(),
        frequency: 'hourly',
        nextRunTime: new Date(Date.now() + 60000),
        maxRetries: 3,
        enabled: true,
      });
      
      await scheduler.scheduleJob({
        name: 'job2',
        handler: jest.fn(),
        frequency: 'hourly',
        nextRunTime: new Date(Date.now() + 60000),
        maxRetries: 3,
        enabled: true,
      });

      const jobs = scheduler.getAllJobs();
      expect(jobs).toHaveLength(2);
    });
  });

  describe('scheduler lifecycle', () => {
    it('should start and stop scheduler', () => {
      scheduler.start();
      expect(scheduler.isRunning()).toBe(true);

      scheduler.stop();
      expect(scheduler.isRunning()).toBe(false);
    });
  });

  describe('statistics', () => {
    it('should return job statistics', async () => {
      await scheduler.scheduleJob({
        name: 'test-job',
        handler: jest.fn(),
        frequency: 'hourly',
        nextRunTime: new Date(Date.now() + 60000),
        maxRetries: 3,
        enabled: true,
      });

      const stats = scheduler.getStatistics();
      expect(stats.total).toBe(1);
      expect(stats.pending).toBe(1);
    });
  });
});
