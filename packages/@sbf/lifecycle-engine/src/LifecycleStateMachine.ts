/**
 * LifecycleStateMachine
 * 
 * Manages entity lifecycle transitions following the PRD 48-hour lifecycle rules.
 * 
 * States:
 * - CAPTURED: Fresh note (0-48h)
 * - TRANSITIONAL: Awaiting entity assignment
 * - PERMANENT: Filed with entities
 * - ARCHIVED: Deprecated
 */

import { LifecycleState } from '@sbf/entity-framework';
import type {
  LifecycleTransition,
  TransitionTrigger,
  TransitionCondition,
  TransitionAction,
  TransitionResult,
  EntityServiceInterface,
  NotificationService,
  SummarizationService,
} from './types';

export interface StateMachineConfig {
  transitionAgeHours?: number;  // Default: 48
  requireSummaryForTransition?: boolean;
}

export class LifecycleStateMachine {
  private transitions: LifecycleTransition[];
  private config: StateMachineConfig;
  
  constructor(
    private entityService: EntityServiceInterface,
    private summarizer: SummarizationService,
    private notifier: NotificationService,
    config: StateMachineConfig = {}
  ) {
    this.config = {
      transitionAgeHours: config.transitionAgeHours ?? 48,
      requireSummaryForTransition: config.requireSummaryForTransition ?? false,
    };
    
    this.transitions = this.buildTransitions();
  }
  
  /**
   * Build the default transition rules
   */
  private buildTransitions(): LifecycleTransition[] {
    return [
      // Captured → Transitional after 48 hours
      {
        from: LifecycleState.CAPTURED,
        to: LifecycleState.TRANSITIONAL,
        trigger: 'time' as TransitionTrigger,
        conditions: [{ type: 'age_hours', value: this.config.transitionAgeHours }],
        actions: [
          { type: 'summarize' },
          { type: 'notify', params: { message: 'Note ready for filing' } },
        ],
      },
      // Transitional → Permanent when entity assigned
      {
        from: LifecycleState.TRANSITIONAL,
        to: LifecycleState.PERMANENT,
        trigger: 'entity_assigned' as TransitionTrigger,
        conditions: [{ type: 'has_primary_entity', value: true }],
        actions: [
          { type: 'file' },
          { type: 'update_metadata', params: { filed_at: 'now' } },
        ],
      },
      // Manual archival from any state
      {
        from: LifecycleState.CAPTURED,
        to: LifecycleState.ARCHIVED,
        trigger: 'manual' as TransitionTrigger,
        conditions: [],
        actions: [],
      },
      {
        from: LifecycleState.TRANSITIONAL,
        to: LifecycleState.ARCHIVED,
        trigger: 'manual' as TransitionTrigger,
        conditions: [],
        actions: [],
      },
      {
        from: LifecycleState.PERMANENT,
        to: LifecycleState.ARCHIVED,
        trigger: 'manual' as TransitionTrigger,
        conditions: [],
        actions: [],
      },
    ];
  }
  
  /**
   * Get valid transitions from current state
   */
  getValidTransitions(currentState: LifecycleState): LifecycleTransition[] {
    return this.transitions.filter(t => t.from === currentState);
  }
  
  /**
   * Get all defined transitions
   */
  getAllTransitions(): LifecycleTransition[] {
    return [...this.transitions];
  }
  
  /**
   * Check if a specific transition is defined
   */
  hasTransition(from: LifecycleState, to: LifecycleState): boolean {
    return this.transitions.some(t => t.from === from && t.to === to);
  }
  
  /**
   * Check if an entity can transition to target state
   */
  async canTransition(
    entityId: string,
    targetState: LifecycleState
  ): Promise<{ canTransition: boolean; reason?: string }> {
    const entity = await this.entityService.getById(entityId);
    if (!entity) {
      return { canTransition: false, reason: 'Entity not found' };
    }
    
    const transition = this.transitions.find(
      t => t.from === entity.lifecycleState && t.to === targetState
    );
    
    if (!transition) {
      return {
        canTransition: false,
        reason: `No valid transition from ${entity.lifecycleState} to ${targetState}`,
      };
    }
    
    // Check all conditions
    for (const condition of transition.conditions) {
      const met = await this.checkCondition(entity, condition);
      if (!met) {
        return {
          canTransition: false,
          reason: `Condition not met: ${condition.type}`,
        };
      }
    }
    
    return { canTransition: true };
  }
  
  /**
   * Execute a state transition
   */
  async transition(
    entityId: string,
    targetState: LifecycleState,
    options?: { force?: boolean }
  ): Promise<TransitionResult> {
    const entity = await this.entityService.getById(entityId);
    if (!entity) {
      return this.createFailedResult(entityId, '', LifecycleState.CAPTURED, targetState, 'Entity not found');
    }
    
    const fromState = entity.lifecycleState;
    const transition = this.transitions.find(
      t => t.from === fromState && t.to === targetState
    );
    
    if (!transition && !options?.force) {
      return this.createFailedResult(entityId, entity.uid, fromState, targetState, 'Invalid transition');
    }
    
    // Check conditions (unless forced)
    if (!options?.force && transition) {
      for (const condition of transition.conditions) {
        const met = await this.checkCondition(entity, condition);
        if (!met) {
          return this.createFailedResult(
            entityId,
            entity.uid,
            fromState,
            targetState,
            `Condition not met: ${condition.type}`
          );
        }
      }
    }
    
    const actionsExecuted: TransitionResult['actionsExecuted'] = [];
    
    try {
      // Execute transition actions
      for (const action of transition?.actions || []) {
        await this.executeAction(entity, action);
        actionsExecuted.push(action.type);
      }
      
      // Update entity state
      const updateData: { lifecycleState: LifecycleState; filedAt?: Date; summary?: string } = {
        lifecycleState: targetState,
      };
      
      if (targetState === LifecycleState.PERMANENT) {
        updateData.filedAt = new Date();
      }
      
      await this.entityService.update(entityId, updateData);
      
      return {
        entityId,
        entityUid: entity.uid,
        fromState,
        toState: targetState,
        success: true,
        actionsExecuted,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        entityId,
        entityUid: entity.uid,
        fromState,
        toState: targetState,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        actionsExecuted,
        timestamp: new Date(),
      };
    }
  }
  
  /**
   * Check a transition condition
   */
  private async checkCondition(
    entity: { id: string; uid: string; capturedAt: Date; summary?: string },
    condition: TransitionCondition
  ): Promise<boolean> {
    switch (condition.type) {
      case 'age_hours': {
        const ageMs = Date.now() - new Date(entity.capturedAt).getTime();
        const ageHours = ageMs / (1000 * 60 * 60);
        return ageHours >= (condition.value as number);
      }
      
      case 'has_primary_entity': {
        const relationships = await this.entityService.getRelationships(entity.uid);
        return relationships.length > 0;
      }
      
      case 'has_summary': {
        return !!entity.summary && entity.summary.length > 0;
      }
      
      case 'manual_override': {
        return true; // Always allow manual override
      }
      
      default:
        return true;
    }
  }
  
  /**
   * Execute a transition action
   */
  private async executeAction(
    entity: { id: string; uid: string; tenantId: string; content?: string; summary?: string },
    action: TransitionAction
  ): Promise<void> {
    switch (action.type) {
      case 'summarize': {
        if (!entity.summary && entity.content) {
          const summary = await this.summarizer.summarize(entity.content);
          await this.entityService.update(entity.id, { summary });
        }
        break;
      }
      
      case 'notify': {
        const message = (action.params?.message as string) || 'Lifecycle transition occurred';
        await this.notifier.notify(entity.tenantId, message);
        break;
      }
      
      case 'file': {
        // Filing logic - this could move files, update paths, etc.
        // For now, this is a placeholder for storage-specific implementation
        break;
      }
      
      case 'update_metadata': {
        if (action.params?.filed_at === 'now') {
          await this.entityService.update(entity.id, { filedAt: new Date() });
        }
        break;
      }
    }
  }
  
  /**
   * Create a failed transition result
   */
  private createFailedResult(
    entityId: string,
    entityUid: string,
    fromState: LifecycleState,
    toState: LifecycleState,
    error: string
  ): TransitionResult {
    return {
      entityId,
      entityUid,
      fromState,
      toState,
      success: false,
      error,
      actionsExecuted: [],
      timestamp: new Date(),
    };
  }
  
  /**
   * Get the next expected state for an entity
   */
  getNextState(currentState: LifecycleState): LifecycleState | null {
    const stateOrder: LifecycleState[] = [
      LifecycleState.CAPTURED,
      LifecycleState.TRANSITIONAL,
      LifecycleState.PERMANENT,
    ];
    
    const currentIndex = stateOrder.indexOf(currentState);
    if (currentIndex === -1 || currentIndex >= stateOrder.length - 1) {
      return null;
    }
    
    return stateOrder[currentIndex + 1];
  }
  
  /**
   * Check if state is terminal (no further automatic transitions)
   */
  isTerminalState(state: LifecycleState): boolean {
    return state === LifecycleState.PERMANENT || state === LifecycleState.ARCHIVED;
  }
}
