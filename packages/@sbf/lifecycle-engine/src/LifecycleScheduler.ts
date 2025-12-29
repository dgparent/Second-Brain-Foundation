/**
 * LifecycleScheduler
 * 
 * Schedules and processes lifecycle transitions for entities.
 * Runs periodically to transition entities that have exceeded the 48-hour threshold.
 */

import { LifecycleState } from '@sbf/entity-framework';
import { LifecycleStateMachine } from './LifecycleStateMachine';
import type {
  SchedulerConfig,
  ScheduledJob,
  ProcessingResult,
  BatchTransitionResult,
  TransitionResult,
  EntityServiceInterface,
} from './types';

export interface JobRunner {
  scheduleRecurring(options: {
    type: string;
    cron: string;
    handler: () => Promise<void>;
  }): Promise<string>;
  cancelJob(jobId: string): Promise<void>;
  getJob(jobId: string): Promise<ScheduledJob | null>;
}

export class LifecycleScheduler {
  private config: SchedulerConfig;
  private jobId?: string;
  
  constructor(
    private stateMachine: LifecycleStateMachine,
    private entityService: EntityServiceInterface,
    private jobRunner: JobRunner,
    config: SchedulerConfig = {}
  ) {
    this.config = {
      processingInterval: config.processingInterval ?? '0 * * * *', // Every hour
      batchSize: config.batchSize ?? 100,
      maxRetries: config.maxRetries ?? 3,
    };
  }
  
  /**
   * Schedule lifecycle processing job
   */
  async scheduleProcessing(): Promise<string> {
    this.jobId = await this.jobRunner.scheduleRecurring({
      type: 'lifecycle_processing',
      cron: this.config.processingInterval!,
      handler: async () => {
        await this.processAllTenants();
      },
    });
    
    return this.jobId;
  }
  
  /**
   * Cancel scheduled processing
   */
  async cancelProcessing(): Promise<void> {
    if (this.jobId) {
      await this.jobRunner.cancelJob(this.jobId);
      this.jobId = undefined;
    }
  }
  
  /**
   * Get scheduled job status
   */
  async getJobStatus(): Promise<ScheduledJob | null> {
    if (!this.jobId) return null;
    return this.jobRunner.getJob(this.jobId);
  }
  
  /**
   * Process all tenants (called by scheduler)
   */
  async processAllTenants(): Promise<ProcessingResult> {
    const startTime = new Date();
    const results: TransitionResult[] = [];
    let processed = 0;
    let transitioned = 0;
    let errors = 0;
    
    // In a real implementation, this would iterate over all tenants
    // For now, we process a generic batch
    const batchResult = await this.processBatch();
    
    processed += batchResult.processed;
    transitioned += batchResult.transitioned;
    errors += batchResult.errors;
    results.push(...batchResult.results);
    
    return {
      processed,
      transitioned,
      errors,
      startTime,
      endTime: new Date(),
      details: results,
    };
  }
  
  /**
   * Process entities for a specific tenant
   */
  async processLifecycles(tenantId: string): Promise<ProcessingResult> {
    const startTime = new Date();
    const results: TransitionResult[] = [];
    let processed = 0;
    let transitioned = 0;
    let errors = 0;
    
    // Get entities pending transition (48+ hours in captured state)
    const pendingEntities = await this.entityService.getPendingTransition(tenantId);
    
    for (const entity of pendingEntities.slice(0, this.config.batchSize)) {
      processed++;
      
      const result = await this.stateMachine.transition(
        entity.id,
        LifecycleState.TRANSITIONAL
      );
      
      results.push(result);
      
      if (result.success) {
        transitioned++;
      } else {
        errors++;
        console.error(`Failed to transition ${entity.uid}:`, result.error);
      }
    }
    
    return {
      processed,
      transitioned,
      errors,
      startTime,
      endTime: new Date(),
      details: results,
    };
  }
  
  /**
   * Process a batch of entities (internal)
   */
  private async processBatch(): Promise<BatchTransitionResult> {
    const results: TransitionResult[] = [];
    let processed = 0;
    let transitioned = 0;
    let errors = 0;
    
    // This would be implemented based on how tenant iteration works
    // For now, return empty results
    
    return { processed, transitioned, errors, results };
  }
  
  /**
   * Get entities pending review (in transitional state)
   */
  async getPendingReview(tenantId: string): Promise<Array<{ id: string; uid: string; name: string; capturedAt: Date }>> {
    const entities = await this.entityService.getPendingTransition(tenantId);
    
    // Filter to transitional state entities
    return entities
      .filter(e => e.lifecycleState === LifecycleState.TRANSITIONAL)
      .map(e => ({
        id: e.id,
        uid: e.uid,
        name: e.uid, // Would need name from entity
        capturedAt: e.capturedAt,
      }));
  }
  
  /**
   * Get lifecycle statistics for a tenant
   */
  async getStatistics(tenantId: string): Promise<{
    captured: number;
    transitional: number;
    permanent: number;
    archived: number;
    pendingTransition: number;
  }> {
    // This would query the database for counts
    // For now, return placeholder
    return {
      captured: 0,
      transitional: 0,
      permanent: 0,
      archived: 0,
      pendingTransition: 0,
    };
  }
  
  /**
   * Manually trigger transition for specific entity
   */
  async triggerTransition(
    entityId: string,
    targetState: LifecycleState,
    options?: { force?: boolean }
  ): Promise<TransitionResult> {
    return this.stateMachine.transition(entityId, targetState, options);
  }
  
  /**
   * Check if entity is ready for transition
   */
  async isReadyForTransition(entityId: string): Promise<boolean> {
    const entity = await this.entityService.getById(entityId);
    if (!entity) return false;
    
    if (entity.lifecycleState !== LifecycleState.CAPTURED) {
      return false;
    }
    
    const ageMs = Date.now() - new Date(entity.capturedAt).getTime();
    const ageHours = ageMs / (1000 * 60 * 60);
    
    return ageHours >= 48;
  }
  
  /**
   * Get time until next transition for an entity
   */
  async getTimeUntilTransition(entityId: string): Promise<number | null> {
    const entity = await this.entityService.getById(entityId);
    if (!entity) return null;
    
    if (entity.lifecycleState !== LifecycleState.CAPTURED) {
      return null; // Already transitioned
    }
    
    const ageMs = Date.now() - new Date(entity.capturedAt).getTime();
    const thresholdMs = 48 * 60 * 60 * 1000;
    
    const remaining = thresholdMs - ageMs;
    return remaining > 0 ? remaining : 0;
  }
}
