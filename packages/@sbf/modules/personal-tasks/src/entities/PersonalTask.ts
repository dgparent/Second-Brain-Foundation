/**
 * PersonalTask Entity
 * 
 * Extends TaskEntity with personal productivity features:
 * - Context-based organization (GTD contexts)
 * - Energy level tracking
 * - Eisenhower Matrix categorization
 * - Time blocking support
 * - Habit tracking integration
 */

import {
  TaskEntity,
  TaskMetadata,
  createTask,
  TaskStatus,
  TaskPriority,
  TaskComplexity
} from '@sbf/frameworks-task-management';

// ==================== Types ====================

/**
 * GTD-style contexts for tasks
 */
export type TaskContext =
  | 'home'
  | 'work'
  | 'computer'
  | 'phone'
  | 'errands'
  | 'waiting'
  | 'someday'
  | 'agenda';

/**
 * Energy level required for task
 */
export type EnergyLevel = 'high' | 'medium' | 'low';

/**
 * Eisenhower Matrix quadrant
 */
export type EisenhowerQuadrant =
  | 'do-first'      // Urgent & Important
  | 'schedule'      // Important, Not Urgent
  | 'delegate'      // Urgent, Not Important
  | 'eliminate';    // Not Urgent, Not Important

/**
 * Time of day preference
 */
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'anytime';

/**
 * Recurrence pattern for recurring tasks
 */
export interface RecurrencePattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // Every N days/weeks/months
  days_of_week?: number[]; // 0-6 for weekly
  day_of_month?: number; // 1-31 for monthly
  end_date?: string; // ISO date string
  end_after_occurrences?: number;
}

/**
 * Personal task metadata extending base task
 */
export interface PersonalTaskMetadata extends TaskMetadata {
  // Personal productivity extensions
  contexts?: TaskContext[];
  energy_level?: EnergyLevel;
  eisenhower_quadrant?: EisenhowerQuadrant;
  time_of_day_preference?: TimeOfDay;
  
  // Time blocking
  scheduled_start?: string; // ISO datetime
  scheduled_end?: string;
  calendar_event_id?: string;
  
  // Recurring tasks
  is_recurring?: boolean;
  recurrence_pattern?: RecurrencePattern;
  parent_recurring_task_uid?: string;
  occurrence_date?: string; // For instances of recurring tasks
  
  // Habit tracking
  is_habit?: boolean;
  habit_streak?: number;
  habit_best_streak?: number;
  habit_completion_dates?: string[]; // ISO dates
  
  // Focus & productivity
  pomodoros_estimated?: number;
  pomodoros_completed?: number;
  focus_time_minutes?: number;
  
  // Quick capture
  is_inbox?: boolean; // Needs processing
  processed_date?: string;
  
  // Delegation
  delegated_to?: string;
  delegated_date?: string;
  delegation_notes?: string;
  
  // Review
  next_review_date?: string;
  last_review_date?: string;
  review_frequency_days?: number;
}

/**
 * PersonalTask entity type
 */
export interface PersonalTaskEntity extends TaskEntity {
  metadata: PersonalTaskMetadata;
}

// ==================== Factory Functions ====================

/**
 * Create a personal task with productivity features
 */
export function createPersonalTask(
  title: string,
  priority: TaskPriority = 'medium',
  options: Partial<PersonalTaskMetadata> = {}
): PersonalTaskEntity {
  const baseTask = createTask(title, priority, options);
  
  return {
    ...baseTask,
    metadata: {
      ...baseTask.metadata,
      contexts: options.contexts || [],
      energy_level: options.energy_level,
      eisenhower_quadrant: options.eisenhower_quadrant,
      time_of_day_preference: options.time_of_day_preference || 'anytime',
      is_inbox: options.is_inbox ?? true, // Default to inbox for processing
      is_recurring: options.is_recurring ?? false,
      is_habit: options.is_habit ?? false,
      ...options
    }
  };
}

/**
 * Create a recurring task
 */
export function createRecurringTask(
  title: string,
  recurrencePattern: RecurrencePattern,
  options: Partial<PersonalTaskMetadata> = {}
): PersonalTaskEntity {
  return createPersonalTask(title, options.priority || 'medium', {
    ...options,
    is_recurring: true,
    recurrence_pattern: recurrencePattern
  });
}

/**
 * Create a habit task
 */
export function createHabitTask(
  title: string,
  frequency: 'daily' | 'weekly' | 'monthly',
  options: Partial<PersonalTaskMetadata> = {}
): PersonalTaskEntity {
  const recurrencePattern: RecurrencePattern = {
    frequency,
    interval: 1
  };
  
  return createPersonalTask(title, 'medium', {
    ...options,
    is_habit: true,
    is_recurring: true,
    recurrence_pattern: recurrencePattern,
    habit_streak: 0,
    habit_best_streak: 0,
    habit_completion_dates: []
  });
}

/**
 * Create a quick inbox task (needs processing)
 */
export function createInboxTask(title: string): PersonalTaskEntity {
  return createPersonalTask(title, 'medium', {
    is_inbox: true,
    status: 'backlog'
  });
}

// ==================== Helper Functions ====================

/**
 * Add context to task
 */
export function addContext(task: PersonalTaskEntity, context: TaskContext): PersonalTaskEntity {
  const contexts = task.metadata.contexts || [];
  if (!contexts.includes(context)) {
    return {
      ...task,
      metadata: {
        ...task.metadata,
        contexts: [...contexts, context]
      }
    };
  }
  return task;
}

/**
 * Set Eisenhower quadrant
 */
export function setEisenhowerQuadrant(
  task: PersonalTaskEntity,
  quadrant: EisenhowerQuadrant
): PersonalTaskEntity {
  return {
    ...task,
    metadata: {
      ...task.metadata,
      eisenhower_quadrant: quadrant
    }
  };
}

/**
 * Schedule task for time blocking
 */
export function scheduleTask(
  task: PersonalTaskEntity,
  startTime: string,
  endTime: string
): PersonalTaskEntity {
  return {
    ...task,
    metadata: {
      ...task.metadata,
      scheduled_start: startTime,
      scheduled_end: endTime
    }
  };
}

/**
 * Mark task as processed from inbox
 */
export function processInboxTask(task: PersonalTaskEntity): PersonalTaskEntity {
  return {
    ...task,
    metadata: {
      ...task.metadata,
      is_inbox: false,
      processed_date: new Date().toISOString()
    }
  };
}

/**
 * Complete habit occurrence and update streak
 */
export function completeHabitOccurrence(
  task: PersonalTaskEntity,
  completionDate: string = new Date().toISOString()
): PersonalTaskEntity {
  if (!task.metadata.is_habit) {
    throw new Error('Task is not a habit task');
  }
  
  const completionDates = task.metadata.habit_completion_dates || [];
  const dateOnly = completionDate.split('T')[0];
  
  // Don't add duplicate dates
  if (completionDates.includes(dateOnly)) {
    return task;
  }
  
  const newCompletionDates = [...completionDates, dateOnly].sort();
  const newStreak = calculateStreak(newCompletionDates);
  const bestStreak = Math.max(
    task.metadata.habit_best_streak || 0,
    newStreak
  );
  
  return {
    ...task,
    metadata: {
      ...task.metadata,
      habit_completion_dates: newCompletionDates,
      habit_streak: newStreak,
      habit_best_streak: bestStreak
    }
  };
}

/**
 * Calculate current streak from completion dates
 */
function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  
  const sortedDates = [...dates].sort().reverse();
  const today = new Date().toISOString().split('T')[0];
  
  // Streak must include today or yesterday
  const lastDate = sortedDates[0];
  const daysSinceLast = daysBetween(lastDate, today);
  
  if (daysSinceLast > 1) return 0;
  
  let streak = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const diff = daysBetween(sortedDates[i], sortedDates[i - 1]);
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

/**
 * Calculate days between two ISO date strings
 */
function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Delegate task
 */
export function delegateTask(
  task: PersonalTaskEntity,
  delegateTo: string,
  notes?: string
): PersonalTaskEntity {
  return {
    ...task,
    metadata: {
      ...task.metadata,
      status: 'in-progress',
      delegated_to: delegateTo,
      delegated_date: new Date().toISOString(),
      delegation_notes: notes,
      eisenhower_quadrant: 'delegate'
    }
  };
}

/**
 * Add pomodoro session
 */
export function addPomodoroSession(
  task: PersonalTaskEntity,
  focusMinutes: number = 25
): PersonalTaskEntity {
  return {
    ...task,
    metadata: {
      ...task.metadata,
      pomodoros_completed: (task.metadata.pomodoros_completed || 0) + 1,
      focus_time_minutes: (task.metadata.focus_time_minutes || 0) + focusMinutes
    }
  };
}
