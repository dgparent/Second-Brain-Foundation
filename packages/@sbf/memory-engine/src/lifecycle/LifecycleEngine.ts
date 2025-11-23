/**
 * Lifecycle Engine
 * Manages automatic memory level transitions based on 48-hour rule and other criteria
 */

import EventEmitter from 'eventemitter3';
import {
  Entity,
  MemoryLevel,
  LifecycleRule,
  LifecycleEngineOptions,
  LifecycleTransition,
  LifecycleState
} from '../types';

/**
 * Default lifecycle rules (48-hour transitions)
 */
const DEFAULT_RULES: LifecycleRule[] = [
  {
    from: 'transitory',
    to: 'temporary',
    conditions: { hours_inactive: 48 }
  },
  {
    from: 'temporary',
    to: 'short_term',
    conditions: { hours_inactive: 48, stability_threshold: 0.3 }
  },
  {
    from: 'short_term',
    to: 'long_term',
    conditions: { hours_inactive: 48, stability_threshold: 0.5, importance_threshold: 0.4 }
  },
  {
    from: 'long_term',
    to: 'canonical',
    conditions: { hours_inactive: 48, stability_threshold: 0.8, importance_threshold: 0.7 }
  }
];

export class LifecycleEngine extends EventEmitter {
  private rules: LifecycleRule[];
  private enableAutoTransitions: boolean;
  private intervalHandle?: NodeJS.Timeout;

  constructor(options: LifecycleEngineOptions = {}) {
    super();
    this.rules = options.rules || DEFAULT_RULES;
    this.enableAutoTransitions = options.enableAutoTransitions ?? true;

    // Auto-start transition checker if interval specified
    const intervalHours = options.transitionIntervalHours ?? 1;
    if (this.enableAutoTransitions && intervalHours > 0) {
      this.startAutoTransitions(intervalHours);
    }
  }

  /**
   * Evaluates an entity and returns the target lifecycle state if transition needed
   */
  evaluateTransition(entity: Entity): LifecycleState | null {
    // Don't transition if user has pinned this entity
    if (entity.memory.user_pinned) {
      return null;
    }

    const currentLevel = entity.memory.memory_level;

    // Don't transition from archived or canonical (terminal states)
    if (currentLevel === 'archived' || currentLevel === 'canonical') {
      return null;
    }

    // Find applicable rule
    const rule = this.rules.find(r => r.from === currentLevel);
    if (!rule) {
      return null;
    }

    // Check conditions
    if (!this.checkConditions(entity, rule)) {
      return null;
    }

    return rule.to;
  }

  /**
   * Checks if an entity meets the conditions for a lifecycle rule
   */
  private checkConditions(entity: Entity, rule: LifecycleRule): boolean {
    const { conditions } = rule;

    // Check hours inactive
    if (conditions.hours_inactive !== undefined) {
      const lastActive = new Date(entity.memory.last_active_at);
      const hoursSinceActive = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60);

      if (hoursSinceActive < conditions.hours_inactive) {
        return false;
      }
    }

    // Check stability threshold
    if (conditions.stability_threshold !== undefined) {
      if (entity.memory.stability_score < conditions.stability_threshold) {
        return false;
      }
    }

    // Check importance threshold
    if (conditions.importance_threshold !== undefined) {
      if (entity.memory.importance_score < conditions.importance_threshold) {
        return false;
      }
    }

    return true;
  }

  /**
   * Performs a lifecycle transition on an entity
   */
  transition(
    entity: Entity,
    targetState: LifecycleState,
    automatic: boolean = true,
    reason?: string
  ): Entity {
    const oldState = entity.memory.memory_level;

    // Create transition record
    const transition: LifecycleTransition = {
      from: oldState,
      to: targetState,
      timestamp: new Date().toISOString(),
      automatic,
      reason
    };

    // Update entity
    const updatedEntity: Entity = {
      ...entity,
      memory: {
        ...entity.memory,
        memory_level: targetState,
        updated_at: new Date().toISOString()
      },
      lifecycle_history: [
        ...(entity.lifecycle_history || []),
        transition
      ]
    };

    // Emit event
    this.emit('lifecycle:transition', {
      entity: updatedEntity,
      from: oldState,
      to: targetState,
      transition
    });

    return updatedEntity;
  }

  /**
   * Manually transitions an entity (human override)
   */
  manualTransition(
    entity: Entity,
    targetState: LifecycleState,
    reason: string
  ): Entity {
    return this.transition(entity, targetState, false, reason);
  }

  /**
   * Processes a batch of entities and returns those needing transitions
   */
  processBatch(entities: Entity[]): Array<{ entity: Entity; targetState: LifecycleState }> {
    const transitions: Array<{ entity: Entity; targetState: LifecycleState }> = [];

    for (const entity of entities) {
      const targetState = this.evaluateTransition(entity);
      if (targetState) {
        transitions.push({ entity, targetState });
      }
    }

    return transitions;
  }

  /**
   * Applies automatic transitions to a batch of entities
   */
  async applyAutomaticTransitions(entities: Entity[]): Promise<Entity[]> {
    if (!this.enableAutoTransitions) {
      return entities;
    }

    const updated: Entity[] = [];

    for (const entity of entities) {
      const targetState = this.evaluateTransition(entity);
      if (targetState) {
        const transitioned = this.transition(
          entity,
          targetState,
          true,
          `Automatic transition after ${this.getHoursSinceActive(entity)} hours inactive`
        );
        updated.push(transitioned);
      } else {
        updated.push(entity);
      }
    }

    return updated;
  }

  /**
   * Gets hours since entity was last active
   */
  private getHoursSinceActive(entity: Entity): number {
    const lastActive = new Date(entity.memory.last_active_at);
    return Math.round((Date.now() - lastActive.getTime()) / (1000 * 60 * 60));
  }

  /**
   * Updates entity activity timestamp (prevents automatic transitions)
   */
  touchEntity(entity: Entity): Entity {
    return {
      ...entity,
      memory: {
        ...entity.memory,
        last_active_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
  }

  /**
   * Archives an entity
   */
  archive(entity: Entity, reason: string): Entity {
    return this.manualTransition(entity, 'archived', reason);
  }

  /**
   * Pins an entity to prevent automatic transitions
   */
  pin(entity: Entity): Entity {
    return {
      ...entity,
      memory: {
        ...entity.memory,
        user_pinned: true,
        updated_at: new Date().toISOString()
      }
    };
  }

  /**
   * Unpins an entity to allow automatic transitions
   */
  unpin(entity: Entity): Entity {
    return {
      ...entity,
      memory: {
        ...entity.memory,
        user_pinned: false,
        updated_at: new Date().toISOString()
      }
    };
  }

  /**
   * Starts automatic transition checking
   */
  private startAutoTransitions(intervalHours: number): void {
    const intervalMs = intervalHours * 60 * 60 * 1000;

    this.intervalHandle = setInterval(() => {
      this.emit('lifecycle:tick', { timestamp: new Date().toISOString() });
    }, intervalMs);
  }

  /**
   * Stops automatic transition checking
   */
  stop(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = undefined;
    }
  }

  /**
   * Gets lifecycle rules
   */
  getRules(): LifecycleRule[] {
    return [...this.rules];
  }

  /**
   * Adds a custom lifecycle rule
   */
  addRule(rule: LifecycleRule): void {
    this.rules.push(rule);
  }

  /**
   * Removes a lifecycle rule
   */
  removeRule(from: MemoryLevel, to: MemoryLevel): boolean {
    const index = this.rules.findIndex(r => r.from === from && r.to === to);
    if (index >= 0) {
      this.rules.splice(index, 1);
      return true;
    }
    return false;
  }
}
