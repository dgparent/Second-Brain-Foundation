/**
 * Lifecycle Management Types
 * Implements 48-hour lifecycle specification
 */

export type LifecycleState = 'capture' | 'transitional' | 'permanent' | 'archived';

export interface LifecycleConfig {
  state: LifecycleState;
  review_at?: string;      // ISO8601 timestamp
  dissolve_at?: string;    // ISO8601 timestamp (for daily notes)
  auto_transition?: boolean;
  transition_rules?: TransitionRule[];
}

export interface TransitionRule {
  from: LifecycleState;
  to: LifecycleState;
  condition: 'time_elapsed' | 'manual' | 'event';
  threshold?: number;      // milliseconds for time_elapsed
  event?: string;          // event name for event-based transitions
}

export interface LifecycleTransition {
  entity_uid: string;
  from_state: LifecycleState;
  to_state: LifecycleState;
  timestamp: string;       // ISO8601
  reason: string;
  automated: boolean;
  override?: {
    prevented_by: string;  // user ID or system
    reason: string;
  };
}

export interface LifecycleEvent {
  type: 'state_change' | 'review_due' | 'dissolve_due';
  entity_uid: string;
  state: LifecycleState;
  timestamp: string;
  metadata?: Record<string, any>;
}

export const LIFECYCLE_DEFAULTS: Record<LifecycleState, Partial<LifecycleConfig>> = {
  capture: {
    auto_transition: true,
    transition_rules: [{
      from: 'capture',
      to: 'transitional',
      condition: 'time_elapsed',
      threshold: 48 * 60 * 60 * 1000, // 48 hours
    }],
  },
  transitional: {
    auto_transition: false, // Manual or rule-based
  },
  permanent: {
    auto_transition: false,
  },
  archived: {
    auto_transition: false,
  },
};
