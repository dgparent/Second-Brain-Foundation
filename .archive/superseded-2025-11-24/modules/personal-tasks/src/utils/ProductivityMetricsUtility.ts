/**
 * Productivity Metrics Utility
 * 
 * Calculates productivity statistics and insights:
 * - Task completion rates
 * - Habit streaks
 * - Time usage analysis
 * - Energy level optimization
 * - Context effectiveness
 */

import {
  PersonalTaskEntity,
  TaskContext,
  EnergyLevel,
  EisenhowerQuadrant
} from '../entities/PersonalTask';

// ==================== Types ====================

export interface ProductivityMetrics {
  // Overall stats
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number; // percentage
  
  // Time stats
  total_estimated_hours: number;
  total_actual_hours: number;
  estimation_accuracy: number; // percentage
  average_task_duration_hours: number;
  
  // Habit stats
  active_habits: number;
  total_habit_completions: number;
  average_habit_streak: number;
  best_habit_streak: number;
  
  // Pomodoro stats
  total_pomodoros: number;
  total_focus_hours: number;
  average_pomodoros_per_task: number;
  
  // Priority distribution
  priority_distribution: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  
  // Energy distribution
  energy_distribution: {
    high: number;
    medium: number;
    low: number;
    unspecified: number;
  };
  
  // Eisenhower quadrants
  eisenhower_distribution: {
    do_first: number;
    schedule: number;
    delegate: number;
    eliminate: number;
    uncategorized: number;
  };
  
  // Context usage
  context_usage: Record<TaskContext, number>;
  most_used_context: TaskContext | null;
}

export interface HabitMetrics {
  habit_uid: string;
  habit_title: string;
  current_streak: number;
  best_streak: number;
  total_completions: number;
  completion_rate_7_days: number;
  completion_rate_30_days: number;
  last_completed: string | null;
}

export interface WeeklyReview {
  week_start: string;
  week_end: string;
  tasks_completed: number;
  tasks_created: number;
  total_hours_worked: number;
  top_contexts: TaskContext[];
  habit_completion_rate: number;
  productivity_score: number; // 0-100
  areas_of_focus: string[];
  achievements: string[];
  improvements_needed: string[];
}

// ==================== Utility ====================

export class ProductivityMetricsUtility {
  
  /**
   * Calculate comprehensive productivity metrics
   */
  static calculateMetrics(tasks: PersonalTaskEntity[]): ProductivityMetrics {
    const completed = tasks.filter(t => t.metadata.status === 'done');
    const habits = tasks.filter(t => t.metadata.is_habit);
    
    // Calculate totals
    const totalEstimated = tasks.reduce((sum, t) => sum + (t.metadata.estimated_hours || 0), 0);
    const totalActual = completed.reduce((sum, t) => sum + (t.metadata.actual_hours || 0), 0);
    
    // Calculate estimation accuracy
    const tasksWithBoth = completed.filter(t => 
      t.metadata.estimated_hours && t.metadata.actual_hours
    );
    let estimationAccuracy = 100;
    if (tasksWithBoth.length > 0) {
      const avgEstimated = tasksWithBoth.reduce((sum, t) => sum + (t.metadata.estimated_hours || 0), 0) / tasksWithBoth.length;
      const avgActual = tasksWithBoth.reduce((sum, t) => sum + (t.metadata.actual_hours || 0), 0) / tasksWithBoth.length;
      estimationAccuracy = Math.max(0, 100 - Math.abs((avgEstimated - avgActual) / avgEstimated * 100));
    }
    
    // Habit stats
    const habitCompletions = habits.reduce((sum, h) => sum + (h.metadata.habit_completion_dates?.length || 0), 0);
    const avgHabitStreak = habits.length > 0
      ? habits.reduce((sum, h) => sum + (h.metadata.habit_streak || 0), 0) / habits.length
      : 0;
    const bestHabitStreak = Math.max(0, ...habits.map(h => h.metadata.habit_best_streak || 0));
    
    // Pomodoro stats
    const totalPomodoros = tasks.reduce((sum, t) => sum + (t.metadata.pomodoros_completed || 0), 0);
    const totalFocusMinutes = tasks.reduce((sum, t) => sum + (t.metadata.focus_time_minutes || 0), 0);
    const tasksWithPomodoros = tasks.filter(t => (t.metadata.pomodoros_completed || 0) > 0);
    const avgPomodorosPerTask = tasksWithPomodoros.length > 0
      ? totalPomodoros / tasksWithPomodoros.length
      : 0;
    
    // Priority distribution
    const priority_distribution = {
      critical: tasks.filter(t => t.metadata.priority === 'critical').length,
      high: tasks.filter(t => t.metadata.priority === 'high').length,
      medium: tasks.filter(t => t.metadata.priority === 'medium').length,
      low: tasks.filter(t => t.metadata.priority === 'low').length
    };
    
    // Energy distribution
    const energy_distribution = {
      high: tasks.filter(t => t.metadata.energy_level === 'high').length,
      medium: tasks.filter(t => t.metadata.energy_level === 'medium').length,
      low: tasks.filter(t => t.metadata.energy_level === 'low').length,
      unspecified: tasks.filter(t => !t.metadata.energy_level).length
    };
    
    // Eisenhower distribution
    const eisenhower_distribution = {
      do_first: tasks.filter(t => t.metadata.eisenhower_quadrant === 'do-first').length,
      schedule: tasks.filter(t => t.metadata.eisenhower_quadrant === 'schedule').length,
      delegate: tasks.filter(t => t.metadata.eisenhower_quadrant === 'delegate').length,
      eliminate: tasks.filter(t => t.metadata.eisenhower_quadrant === 'eliminate').length,
      uncategorized: tasks.filter(t => !t.metadata.eisenhower_quadrant).length
    };
    
    // Context usage
    const contextCounts: Record<string, number> = {};
    tasks.forEach(task => {
      task.metadata.contexts?.forEach(context => {
        contextCounts[context] = (contextCounts[context] || 0) + 1;
      });
    });
    
    const context_usage = contextCounts as Record<TaskContext, number>;
    const mostUsedContext = Object.keys(contextCounts).length > 0
      ? Object.keys(contextCounts).reduce((a, b) => contextCounts[a] > contextCounts[b] ? a : b) as TaskContext
      : null;
    
    return {
      total_tasks: tasks.length,
      completed_tasks: completed.length,
      completion_rate: tasks.length > 0 ? (completed.length / tasks.length) * 100 : 0,
      
      total_estimated_hours: totalEstimated,
      total_actual_hours: totalActual,
      estimation_accuracy: estimationAccuracy,
      average_task_duration_hours: completed.length > 0 ? totalActual / completed.length : 0,
      
      active_habits: habits.length,
      total_habit_completions: habitCompletions,
      average_habit_streak: avgHabitStreak,
      best_habit_streak: bestHabitStreak,
      
      total_pomodoros: totalPomodoros,
      total_focus_hours: totalFocusMinutes / 60,
      average_pomodoros_per_task: avgPomodorosPerTask,
      
      priority_distribution,
      energy_distribution,
      eisenhower_distribution,
      context_usage,
      most_used_context: mostUsedContext
    };
  }
  
  /**
   * Calculate habit-specific metrics
   */
  static calculateHabitMetrics(habitTask: PersonalTaskEntity): HabitMetrics | null {
    if (!habitTask.metadata.is_habit) {
      return null;
    }
    
    const completionDates = habitTask.metadata.habit_completion_dates || [];
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const completions7Days = completionDates.filter(
      d => new Date(d) >= sevenDaysAgo
    ).length;
    
    const completions30Days = completionDates.filter(
      d => new Date(d) >= thirtyDaysAgo
    ).length;
    
    const lastCompleted = completionDates.length > 0
      ? completionDates[completionDates.length - 1]
      : null;
    
    return {
      habit_uid: habitTask.uid,
      habit_title: habitTask.title,
      current_streak: habitTask.metadata.habit_streak || 0,
      best_streak: habitTask.metadata.habit_best_streak || 0,
      total_completions: completionDates.length,
      completion_rate_7_days: (completions7Days / 7) * 100,
      completion_rate_30_days: (completions30Days / 30) * 100,
      last_completed: lastCompleted
    };
  }
  
  /**
   * Generate weekly review
   */
  static generateWeeklyReview(
    tasks: PersonalTaskEntity[],
    weekStartDate: string
  ): WeeklyReview {
    const weekStart = new Date(weekStartDate);
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Filter tasks for the week
    const weekTasks = tasks.filter(task => {
      const createdDate = new Date(task.created);
      return createdDate >= weekStart && createdDate < weekEnd;
    });
    
    const completedTasks = weekTasks.filter(t => t.metadata.status === 'done');
    
    // Calculate hours worked
    const totalHours = completedTasks.reduce(
      (sum, t) => sum + (t.metadata.actual_hours || t.metadata.estimated_hours || 0),
      0
    );
    
    // Top contexts
    const contextCounts: Record<string, number> = {};
    weekTasks.forEach(task => {
      task.metadata.contexts?.forEach(context => {
        contextCounts[context] = (contextCounts[context] || 0) + 1;
      });
    });
    const topContexts = Object.keys(contextCounts)
      .sort((a, b) => contextCounts[b] - contextCounts[a])
      .slice(0, 3) as TaskContext[];
    
    // Habit completion rate
    const habits = weekTasks.filter(t => t.metadata.is_habit);
    const habitCompletionRate = habits.length > 0
      ? (habits.filter(h => h.metadata.status === 'done').length / habits.length) * 100
      : 0;
    
    // Productivity score (0-100)
    const completionRate = weekTasks.length > 0 ? (completedTasks.length / weekTasks.length) * 100 : 0;
    const productivityScore = Math.round(
      (completionRate * 0.5) + 
      (habitCompletionRate * 0.3) + 
      (Math.min(totalHours / 40, 1) * 20) // Up to 40 hours = full score
    );
    
    // Extract insights
    const highPriorityCompleted = completedTasks.filter(
      t => t.metadata.priority === 'critical' || t.metadata.priority === 'high'
    );
    
    const achievements = [];
    if (completedTasks.length > 0) {
      achievements.push(`Completed ${completedTasks.length} tasks`);
    }
    if (highPriorityCompleted.length > 0) {
      achievements.push(`Finished ${highPriorityCompleted.length} high-priority items`);
    }
    if (habitCompletionRate >= 80) {
      achievements.push(`Maintained ${habitCompletionRate.toFixed(0)}% habit completion rate`);
    }
    
    const improvementsNeeded = [];
    if (completionRate < 50) {
      improvementsNeeded.push('Low task completion rate - consider reducing commitments');
    }
    if (habitCompletionRate < 50) {
      improvementsNeeded.push('Habit consistency needs attention');
    }
    if (totalHours < 20) {
      improvementsNeeded.push('Low time investment - increase focus time');
    }
    
    return {
      week_start: weekStartDate,
      week_end: weekEnd.toISOString().split('T')[0],
      tasks_completed: completedTasks.length,
      tasks_created: weekTasks.length,
      total_hours_worked: totalHours,
      top_contexts: topContexts,
      habit_completion_rate: habitCompletionRate,
      productivity_score: productivityScore,
      areas_of_focus: topContexts.map(c => c.charAt(0).toUpperCase() + c.slice(1)),
      achievements,
      improvements_needed: improvementsNeeded
    };
  }
  
  /**
   * Get productivity trends over time
   */
  static getProductivityTrend(
    tasks: PersonalTaskEntity[],
    periodDays: number = 30
  ): {
    period_start: string;
    period_end: string;
    daily_completion_average: number;
    weekly_completion_average: number;
    trend: 'improving' | 'stable' | 'declining';
  } {
    const now = new Date();
    const periodStart = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
    
    const periodTasks = tasks.filter(task => {
      const createdDate = new Date(task.created);
      return createdDate >= periodStart && createdDate <= now;
    });
    
    const completed = periodTasks.filter(t => t.metadata.status === 'done');
    
    // Calculate first and second half metrics
    const midpoint = new Date(periodStart.getTime() + (periodDays / 2) * 24 * 60 * 60 * 1000);
    const firstHalf = completed.filter(t => new Date(t.created) < midpoint).length;
    const secondHalf = completed.filter(t => new Date(t.created) >= midpoint).length;
    
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (secondHalf > firstHalf * 1.2) trend = 'improving';
    if (secondHalf < firstHalf * 0.8) trend = 'declining';
    
    return {
      period_start: periodStart.toISOString().split('T')[0],
      period_end: now.toISOString().split('T')[0],
      daily_completion_average: completed.length / periodDays,
      weekly_completion_average: (completed.length / periodDays) * 7,
      trend
    };
  }
}
