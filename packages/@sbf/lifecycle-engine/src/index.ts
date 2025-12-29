/**
 * @sbf/lifecycle-engine
 * 
 * Lifecycle management engine for Second Brain Foundation.
 * Implements the PRD 48-hour lifecycle state machine.
 * 
 * @example
 * ```typescript
 * import { 
 *   LifecycleStateMachine, 
 *   LifecycleScheduler,
 *   TransitionProcessor,
 *   LifecycleState,
 * } from '@sbf/lifecycle-engine';
 * 
 * // Initialize state machine
 * const stateMachine = new LifecycleStateMachine(
 *   entityService,
 *   summarizer,
 *   notifier
 * );
 * 
 * // Check if transition is valid
 * const { canTransition, reason } = await stateMachine.canTransition(
 *   entityId,
 *   LifecycleState.TRANSITIONAL
 * );
 * 
 * // Execute transition
 * const result = await stateMachine.transition(
 *   entityId,
 *   LifecycleState.TRANSITIONAL
 * );
 * 
 * // Schedule automatic processing
 * const scheduler = new LifecycleScheduler(stateMachine, entityService, jobRunner);
 * await scheduler.scheduleProcessing();
 * ```
 */

// Types
export * from './types';

// State Machine
export { LifecycleStateMachine, type StateMachineConfig } from './LifecycleStateMachine';

// Scheduler
export { LifecycleScheduler, type JobRunner } from './LifecycleScheduler';

// Processor
export { TransitionProcessor, type TransitionProcessorConfig } from './TransitionProcessor';
