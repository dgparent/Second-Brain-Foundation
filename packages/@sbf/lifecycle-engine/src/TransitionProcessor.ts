/**
 * TransitionProcessor
 * 
 * Processes lifecycle transitions with retry logic and error handling.
 */

import { LifecycleState } from '@sbf/entity-framework';
import { LifecycleStateMachine } from './LifecycleStateMachine';
import type {
  TransitionResult,
  BatchTransitionResult,
  LifecycleNotification,
  NotificationService,
} from './types';

export interface TransitionProcessorConfig {
  maxRetries?: number;
  retryDelayMs?: number;
  notifyOnTransition?: boolean;
}

export class TransitionProcessor {
  private config: TransitionProcessorConfig;
  
  constructor(
    private stateMachine: LifecycleStateMachine,
    private notifier: NotificationService,
    config: TransitionProcessorConfig = {}
  ) {
    this.config = {
      maxRetries: config.maxRetries ?? 3,
      retryDelayMs: config.retryDelayMs ?? 1000,
      notifyOnTransition: config.notifyOnTransition ?? true,
    };
  }
  
  /**
   * Process a single entity transition with retries
   */
  async processTransition(
    entityId: string,
    targetState: LifecycleState
  ): Promise<TransitionResult> {
    let lastResult: TransitionResult | null = null;
    let attempts = 0;
    
    while (attempts < this.config.maxRetries!) {
      attempts++;
      
      const result = await this.stateMachine.transition(entityId, targetState);
      lastResult = result;
      
      if (result.success) {
        // Send notification on successful transition
        if (this.config.notifyOnTransition) {
          await this.sendTransitionNotification(result);
        }
        return result;
      }
      
      // Check if error is retryable
      if (!this.isRetryableError(result.error)) {
        return result;
      }
      
      // Wait before retry
      if (attempts < this.config.maxRetries!) {
        await this.delay(this.config.retryDelayMs! * attempts);
      }
    }
    
    return lastResult!;
  }
  
  /**
   * Process multiple transitions in batch
   */
  async processBatch(
    transitions: Array<{ entityId: string; targetState: LifecycleState }>
  ): Promise<BatchTransitionResult> {
    const results: TransitionResult[] = [];
    let processed = 0;
    let transitioned = 0;
    let errors = 0;
    
    for (const { entityId, targetState } of transitions) {
      processed++;
      
      const result = await this.processTransition(entityId, targetState);
      results.push(result);
      
      if (result.success) {
        transitioned++;
      } else {
        errors++;
      }
    }
    
    return { processed, transitioned, errors, results };
  }
  
  /**
   * Process all pending transitions for entities
   */
  async processPendingTransitions(
    entities: Array<{ id: string; uid: string; lifecycleState: LifecycleState }>
  ): Promise<BatchTransitionResult> {
    const transitions = entities
      .filter(e => e.lifecycleState === LifecycleState.CAPTURED)
      .map(e => ({
        entityId: e.id,
        targetState: LifecycleState.TRANSITIONAL,
      }));
    
    return this.processBatch(transitions);
  }
  
  /**
   * Send notification about transition
   */
  private async sendTransitionNotification(result: TransitionResult): Promise<void> {
    // Would need tenant ID and entity name - simplified for now
    const notification: LifecycleNotification = {
      tenantId: '', // Would come from entity
      entityId: result.entityId,
      entityUid: result.entityUid,
      entityName: result.entityUid, // Would use actual name
      type: 'transition_complete',
      message: `Entity ${result.entityUid} transitioned from ${result.fromState} to ${result.toState}`,
      timestamp: result.timestamp,
    };
    
    await this.notifier.notifyTransition(notification);
  }
  
  /**
   * Check if an error is retryable
   */
  private isRetryableError(error?: string): boolean {
    if (!error) return false;
    
    const nonRetryableErrors = [
      'Entity not found',
      'Invalid transition',
      'Condition not met',
    ];
    
    return !nonRetryableErrors.some(e => error.includes(e));
  }
  
  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Validate transition is allowed
   */
  async validateTransition(
    entityId: string,
    targetState: LifecycleState
  ): Promise<{ valid: boolean; reason?: string }> {
    return this.stateMachine.canTransition(entityId, targetState);
  }
  
  /**
   * Get valid target states for entity
   */
  getValidTargetStates(currentState: LifecycleState): LifecycleState[] {
    const transitions = this.stateMachine.getValidTransitions(currentState);
    return [...new Set(transitions.map(t => t.to))];
  }
}
