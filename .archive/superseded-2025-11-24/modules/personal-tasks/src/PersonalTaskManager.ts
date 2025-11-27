/**
 * Personal Task Manager Service
 * 
 * Main service providing unified access to all personal task management features.
 * Combines entities, workflows, and utilities into a convenient API.
 */

import {
  PersonalTaskEntity,
  createPersonalTask,
  createRecurringTask,
  createHabitTask,
  createInboxTask,
  addContext,
  scheduleTask,
  processInboxTask,
  completeHabitOccurrence,
  delegateTask,
  addPomodoroSession,
  TaskContext,
  EnergyLevel,
  RecurrencePattern
} from './entities/PersonalTask';

import {
  EisenhowerMatrixWorkflow,
  EisenhowerMatrixView
} from './workflows/EisenhowerMatrixWorkflow';

import {
  DailyPlanningWorkflow,
  DailyPlan,
  PlanningPreferences,
  TimeBlock
} from './workflows/DailyPlanningWorkflow';

import {
  ProductivityMetricsUtility,
  ProductivityMetrics,
  HabitMetrics,
  WeeklyReview
} from './utils/ProductivityMetricsUtility';

import { TaskPriority } from '@sbf/frameworks-task-management';

/**
 * Main Personal Task Manager Service
 */
export class PersonalTaskManager {
  private tasks: PersonalTaskEntity[] = [];
  
  // ==================== Task Creation ====================
  
  /**
   * Add a personal task
   */
  addTask(
    title: string,
    priority: TaskPriority = 'medium',
    options: Partial<PersonalTaskEntity['metadata']> = {}
  ): PersonalTaskEntity {
    const task = createPersonalTask(title, priority, options);
    this.tasks.push(task);
    return task;
  }
  
  /**
   * Add a recurring task
   */
  addRecurringTask(
    title: string,
    recurrencePattern: RecurrencePattern,
    options: Partial<PersonalTaskEntity['metadata']> = {}
  ): PersonalTaskEntity {
    const task = createRecurringTask(title, recurrencePattern, options);
    this.tasks.push(task);
    return task;
  }
  
  /**
   * Add a habit
   */
  addHabit(
    title: string,
    frequency: 'daily' | 'weekly' | 'monthly',
    options: Partial<PersonalTaskEntity['metadata']> = {}
  ): PersonalTaskEntity {
    const task = createHabitTask(title, frequency, options);
    this.tasks.push(task);
    return task;
  }
  
  /**
   * Quick capture to inbox
   */
  captureToInbox(title: string): PersonalTaskEntity {
    const task = createInboxTask(title);
    this.tasks.push(task);
    return task;
  }
  
  // ==================== Task Organization ====================
  
  /**
   * Get Eisenhower Matrix view
   */
  getEisenhowerMatrix(): EisenhowerMatrixView {
    return EisenhowerMatrixWorkflow.organizeMatrix(this.tasks);
  }
  
  /**
   * Get current focus tasks (do-first quadrant)
   */
  getCurrentFocus(): PersonalTaskEntity[] {
    return EisenhowerMatrixWorkflow.getCurrentFocus(this.tasks);
  }
  
  /**
   * Get tasks needing scheduling
   */
  getTasksToSchedule(): PersonalTaskEntity[] {
    return EisenhowerMatrixWorkflow.getTasksToSchedule(this.tasks);
  }
  
  /**
   * Get tasks to delegate
   */
  getTasksToDelegate(): PersonalTaskEntity[] {
    return EisenhowerMatrixWorkflow.getTasksToDelegate(this.tasks);
  }
  
  /**
   * Get inbox tasks (need processing)
   */
  getInboxTasks(): PersonalTaskEntity[] {
    return DailyPlanningWorkflow.getInboxTasks(this.tasks);
  }
  
  // ==================== Daily Planning ====================
  
  /**
   * Create daily plan
   */
  createDailyPlan(
    targetDate: string,
    preferences?: PlanningPreferences
  ): DailyPlan {
    return DailyPlanningWorkflow.createDailyPlan(this.tasks, targetDate, preferences);
  }
  
  /**
   * Get today's focus (top 3-5 tasks)
   */
  getTodaysFocus(maxTasks: number = 3): PersonalTaskEntity[] {
    return DailyPlanningWorkflow.getTodaysFocus(this.tasks, maxTasks);
  }
  
  /**
   * Filter by context
   */
  filterByContext(context: TaskContext): PersonalTaskEntity[] {
    return DailyPlanningWorkflow.filterByContext(this.tasks, context);
  }
  
  /**
   * Filter by energy level
   */
  filterByEnergyLevel(energyLevel: EnergyLevel): PersonalTaskEntity[] {
    return DailyPlanningWorkflow.filterByEnergyLevel(this.tasks, energyLevel);
  }
  
  /**
   * Suggest time blocks
   */
  suggestTimeBlocks(
    targetDate: string,
    preferences?: PlanningPreferences
  ): TimeBlock[] {
    return DailyPlanningWorkflow.suggestTimeBlocks(this.tasks, targetDate, preferences);
  }
  
  // ==================== Habits ====================
  
  /**
   * Complete habit for today
   */
  completeHabit(taskUid: string): PersonalTaskEntity | null {
    const taskIndex = this.tasks.findIndex(t => t.uid === taskUid);
    if (taskIndex === -1) return null;
    
    const task = this.tasks[taskIndex];
    if (!task.metadata.is_habit) return null;
    
    const updated = completeHabitOccurrence(task);
    this.tasks[taskIndex] = updated;
    return updated;
  }
  
  /**
   * Get habit metrics
   */
  getHabitMetrics(taskUid: string): HabitMetrics | null {
    const task = this.tasks.find(t => t.uid === taskUid);
    if (!task) return null;
    return ProductivityMetricsUtility.calculateHabitMetrics(task);
  }
  
  /**
   * Get all habit metrics
   */
  getAllHabitMetrics(): HabitMetrics[] {
    return this.tasks
      .filter(t => t.metadata.is_habit)
      .map(t => ProductivityMetricsUtility.calculateHabitMetrics(t))
      .filter((m): m is HabitMetrics => m !== null);
  }
  
  // ==================== Productivity Metrics ====================
  
  /**
   * Calculate productivity metrics
   */
  getProductivityMetrics(): ProductivityMetrics {
    return ProductivityMetricsUtility.calculateMetrics(this.tasks);
  }
  
  /**
   * Generate weekly review
   */
  generateWeeklyReview(weekStartDate: string): WeeklyReview {
    return ProductivityMetricsUtility.generateWeeklyReview(this.tasks, weekStartDate);
  }
  
  /**
   * Get productivity trend
   */
  getProductivityTrend(periodDays: number = 30) {
    return ProductivityMetricsUtility.getProductivityTrend(this.tasks, periodDays);
  }
  
  // ==================== Task Modifications ====================
  
  /**
   * Add context to task
   */
  addContextToTask(taskUid: string, context: TaskContext): boolean {
    const taskIndex = this.tasks.findIndex(t => t.uid === taskUid);
    if (taskIndex === -1) return false;
    
    this.tasks[taskIndex] = addContext(this.tasks[taskIndex], context);
    return true;
  }
  
  /**
   * Schedule task
   */
  scheduleTaskTime(taskUid: string, startTime: string, endTime: string): boolean {
    const taskIndex = this.tasks.findIndex(t => t.uid === taskUid);
    if (taskIndex === -1) return false;
    
    this.tasks[taskIndex] = scheduleTask(this.tasks[taskIndex], startTime, endTime);
    return true;
  }
  
  /**
   * Process inbox task
   */
  processTask(taskUid: string): boolean {
    const taskIndex = this.tasks.findIndex(t => t.uid === taskUid);
    if (taskIndex === -1) return false;
    
    this.tasks[taskIndex] = processInboxTask(this.tasks[taskIndex]);
    return true;
  }
  
  /**
   * Delegate task
   */
  delegateTaskTo(taskUid: string, delegateTo: string, notes?: string): boolean {
    const taskIndex = this.tasks.findIndex(t => t.uid === taskUid);
    if (taskIndex === -1) return false;
    
    this.tasks[taskIndex] = delegateTask(this.tasks[taskIndex], delegateTo, notes);
    return true;
  }
  
  /**
   * Add pomodoro session
   */
  addPomodoro(taskUid: string, focusMinutes: number = 25): boolean {
    const taskIndex = this.tasks.findIndex(t => t.uid === taskUid);
    if (taskIndex === -1) return false;
    
    this.tasks[taskIndex] = addPomodoroSession(this.tasks[taskIndex], focusMinutes);
    return true;
  }
  
  // ==================== Getters ====================
  
  /**
   * Get all tasks
   */
  getAllTasks(): PersonalTaskEntity[] {
    return this.tasks;
  }
  
  /**
   * Get task by UID
   */
  getTask(taskUid: string): PersonalTaskEntity | undefined {
    return this.tasks.find(t => t.uid === taskUid);
  }
  
  /**
   * Get statistics
   */
  getStats() {
    const metrics = this.getProductivityMetrics();
    return {
      total_tasks: metrics.total_tasks,
      completed_tasks: metrics.completed_tasks,
      completion_rate: metrics.completion_rate,
      active_habits: metrics.active_habits,
      inbox_tasks: this.getInboxTasks().length,
      focus_tasks: this.getCurrentFocus().length,
      total_focus_hours: metrics.total_focus_hours,
      productivity_trend: this.getProductivityTrend()
    };
  }
}
