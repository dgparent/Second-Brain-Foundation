/**
 * @sbf/lifecycle-engine Types
 * 
 * Type definitions for lifecycle state machine and transitions.
 */

import { LifecycleState } from '@sbf/entity-framework';

export { LifecycleState };

// =====================================
// Transition Types
// =====================================

export enum TransitionTrigger {
  TIME = 'time',               // 48-hour threshold
  ENTITY_ASSIGNED = 'entity_assigned',
  MANUAL = 'manual',
  ARCHIVED = 'archived',
}

export interface TransitionCondition {
  type: 'age_hours' | 'has_primary_entity' | 'has_summary' | 'manual_override';
  value: unknown;
}

export type TransitionActionType = 'summarize' | 'notify' | 'file' | 'update_metadata';

export interface TransitionAction {
  type: TransitionActionType;
  params?: Record<string, unknown>;
}

export interface LifecycleTransition {
  from: LifecycleState;
  to: LifecycleState;
  trigger: TransitionTrigger;
  conditions: TransitionCondition[];
  actions: TransitionAction[];
}

// =====================================
// Transition Results
// =====================================

export interface TransitionResult {
  entityId: string;
  entityUid: string;
  fromState: LifecycleState;
  toState: LifecycleState;
  success: boolean;
  error?: string;
  actionsExecuted: TransitionActionType[];
  timestamp: Date;
}

export interface BatchTransitionResult {
  processed: number;
  transitioned: number;
  errors: number;
  results: TransitionResult[];
}

// =====================================
// Processing Results
// =====================================

export interface ProcessingResult {
  processed: number;
  transitioned: number;
  errors: number;
  startTime: Date;
  endTime: Date;
  details: TransitionResult[];
}

// =====================================
// Scheduler Types
// =====================================

export interface SchedulerConfig {
  processingInterval?: string;  // Cron expression, default: '0 * * * *' (hourly)
  batchSize?: number;           // Max entities per batch, default: 100
  maxRetries?: number;          // Max retries on failure, default: 3
}

export interface ScheduledJob {
  id: string;
  type: string;
  cron: string;
  lastRun?: Date;
  nextRun?: Date;
  status: 'active' | 'paused' | 'error';
}

// =====================================
// Notification Types
// =====================================

export interface LifecycleNotification {
  tenantId: string;
  entityId: string;
  entityUid: string;
  entityName: string;
  type: 'transition_pending' | 'transition_complete' | 'review_needed';
  message: string;
  timestamp: Date;
}

// =====================================
// Summarization Types
// =====================================

export interface SummarizationResult {
  entityId: string;
  summary: string;
  confidence: number;
  extractedAt: Date;
}

// =====================================
// Service Interfaces
// =====================================

export interface NotificationService {
  notify(tenantId: string, message: string): Promise<void>;
  notifyTransition(notification: LifecycleNotification): Promise<void>;
}

export interface SummarizationService {
  summarize(content: string): Promise<string>;
}

export interface EntityServiceInterface {
  getById(id: string): Promise<{ id: string; uid: string; tenantId: string; content?: string; summary?: string; lifecycleState: LifecycleState; capturedAt: Date; filedAt?: Date } | null>;
  getRelationships(uid: string): Promise<unknown[]>;
  update(id: string, data: Partial<{ summary: string; lifecycleState: LifecycleState; filedAt: Date }>): Promise<unknown>;
  getPendingTransition(tenantId: string): Promise<Array<{ id: string; uid: string; tenantId: string; content?: string; summary?: string; lifecycleState: LifecycleState; capturedAt: Date }>>;
}
