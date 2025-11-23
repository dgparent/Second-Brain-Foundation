/**
 * @sbf/core-lifecycle-engine
 * 48-hour lifecycle automation
 */

import { Entity, LifecycleState, LifecycleTransition } from '@sbf/shared';
import { EntityManager } from '@sbf/core-entity-manager';
import { EventEmitter } from 'eventemitter3';

export interface LifecycleRule {
  fromState: LifecycleState;
  toState: LifecycleState;
  condition: (entity: Entity) => boolean;
  autoTransitionHours?: number;
}

export interface LifecycleEngineEvents {
  'lifecycle:transition': (entity: Entity, from: LifecycleState, to: LifecycleState) => void;
  'lifecycle:auto-transition': (entity: Entity, from: LifecycleState, to: LifecycleState) => void;
  'lifecycle:manual-override': (entity: Entity, from: LifecycleState, to: LifecycleState) => void;
}

export class LifecycleEngine extends EventEmitter<LifecycleEngineEvents> {
  private entityManager: EntityManager;
  private rules: LifecycleRule[] = [];
  private checkInterval: NodeJS.Timeout | null = null;
  private transitionHistory: Map<string, LifecycleTransition[]> = new Map();

  constructor(entityManager: EntityManager) {
    super();
    this.entityManager = entityManager;
    this.initializeDefaultRules();
  }

  /**
   * Initialize default 48-hour lifecycle rules
   */
  private initializeDefaultRules(): void {
    // capture → transitional (automatic after 48 hours)
    this.addRule({
      fromState: 'capture',
      toState: 'transitional',
      condition: () => true,
      autoTransitionHours: 48,
    });

    // transitional → archived (automatic after 48 hours of inactivity)
    this.addRule({
      fromState: 'transitional',
      toState: 'archived',
      condition: (entity) => {
        const lastUpdate = new Date(entity.updated);
        const hoursSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60);
        return hoursSinceUpdate >= 48;
      },
      autoTransitionHours: 48,
    });
  }

  /**
   * Add a lifecycle rule
   */
  addRule(rule: LifecycleRule): void {
    this.rules.push(rule);
  }

  /**
   * Start automatic lifecycle checks
   */
  start(intervalMinutes: number = 60): void {
    if (this.checkInterval) {
      return;
    }

    this.checkInterval = setInterval(() => {
      this.checkAutomaticTransitions();
    }, intervalMinutes * 60 * 1000);

    // Run immediately on start
    this.checkAutomaticTransitions();
  }

  /**
   * Stop automatic lifecycle checks
   */
  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Check for automatic transitions
   */
  private async checkAutomaticTransitions(): Promise<void> {
    const entities = await this.entityManager.getAll();

    for (const entity of entities) {
      for (const rule of this.rules) {
        if (entity.lifecycle.state !== rule.fromState) {
          continue;
        }

        if (!rule.autoTransitionHours) {
          continue;
        }

        // Check if enough time has passed
        const created = new Date(entity.created);
        const hoursSinceCreated = (Date.now() - created.getTime()) / (1000 * 60 * 60);

        if (hoursSinceCreated >= rule.autoTransitionHours && rule.condition(entity)) {
          await this.transition(entity.uid, rule.toState, true);
        }
      }
    }
  }

  /**
   * Manually transition an entity
   */
  async transition(
    entityUid: string,
    toState: LifecycleState,
    automated: boolean = false
  ): Promise<Entity | null> {
    const entity = await this.entityManager.get(entityUid);
    if (!entity) {
      return null;
    }

    const fromState = entity.lifecycle.state;

    if (fromState === toState) {
      return entity; // No transition needed
    }

    // Record transition
    const transition: LifecycleTransition = {
      entity_uid: entityUid,
      from_state: fromState,
      to_state: toState,
      timestamp: new Date().toISOString(),
      reason: automated ? 'Automatic 48-hour transition' : 'Manual transition',
      automated,
    };

    if (!this.transitionHistory.has(entityUid)) {
      this.transitionHistory.set(entityUid, []);
    }
    this.transitionHistory.get(entityUid)!.push(transition);

    // Update entity
    const updated = await this.entityManager.update(entityUid, {
      lifecycle: {
        ...entity.lifecycle,
        state: toState,
      },
      metadata: {
        ...entity.metadata,
        lifecycle_transitions: this.transitionHistory.get(entityUid),
      },
    });

    if (!updated) {
      return null;
    }

    // Emit events
    this.emit('lifecycle:transition', updated, fromState, toState);
    if (automated) {
      this.emit('lifecycle:auto-transition', updated, fromState, toState);
    } else {
      this.emit('lifecycle:manual-override', updated, fromState, toState);
    }

    return updated;
  }

  /**
   * Get transition history for an entity
   */
  getHistory(entityUid: string): LifecycleTransition[] {
    return this.transitionHistory.get(entityUid) || [];
  }

  /**
   * Get entities due for transition
   */
  async getDueForTransition(): Promise<Array<{ entity: Entity; rule: LifecycleRule }>> {
    const entities = await this.entityManager.getAll();
    const due: Array<{ entity: Entity; rule: LifecycleRule }> = [];

    for (const entity of entities) {
      for (const rule of this.rules) {
        if (entity.lifecycle.state !== rule.fromState) {
          continue;
        }

        if (!rule.autoTransitionHours) {
          continue;
        }

        const created = new Date(entity.created);
        const hoursSinceCreated = (Date.now() - created.getTime()) / (1000 * 60 * 60);

        if (hoursSinceCreated >= rule.autoTransitionHours && rule.condition(entity)) {
          due.push({ entity, rule });
        }
      }
    }

    return due;
  }

  /**
   * Get statistics
   */
  getStats() {
    const totalTransitions = Array.from(this.transitionHistory.values()).reduce(
      (sum, transitions) => sum + transitions.length,
      0
    );

    const automaticTransitions = Array.from(this.transitionHistory.values())
      .flat()
      .filter(t => t.automated).length;

    const manualOverrides = Array.from(this.transitionHistory.values())
      .flat()
      .filter(t => !t.automated).length;

    return {
      totalTransitions,
      automaticTransitions,
      manualOverrides,
      rules: this.rules.length,
    };
  }
}

// Export all modules
export * from './scheduler';
export * from './extraction';
export * from './dissolution';
export * from './LifecycleAutomationService';
