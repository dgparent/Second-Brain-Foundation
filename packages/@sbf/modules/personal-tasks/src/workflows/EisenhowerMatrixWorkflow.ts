/**
 * Eisenhower Matrix Workflow
 * 
 * Automatically categorizes tasks into Eisenhower Matrix quadrants:
 * - Do First: Urgent & Important
 * - Schedule: Important, Not Urgent
 * - Delegate: Urgent, Not Important
 * - Eliminate: Not Urgent, Not Important
 */

import {
  PersonalTaskEntity,
  EisenhowerQuadrant,
  setEisenhowerQuadrant
} from '../entities/PersonalTask';
import { TaskPriority } from '@sbf/frameworks-task-management';

// ==================== Types ====================

export interface EisenhowerCategorization {
  quadrant: EisenhowerQuadrant;
  reason: string;
  recommended_action: string;
}

export interface EisenhowerMatrixView {
  do_first: PersonalTaskEntity[];        // Urgent & Important
  schedule: PersonalTaskEntity[];        // Important, Not Urgent
  delegate: PersonalTaskEntity[];        // Urgent, Not Important
  eliminate: PersonalTaskEntity[];       // Not Urgent, Not Important
}

// ==================== Workflow ====================

export class EisenhowerMatrixWorkflow {
  
  /**
   * Determine if task is urgent
   */
  static isUrgent(task: PersonalTaskEntity): boolean {
    const now = new Date();
    
    // Critical priority = always urgent
    if (task.metadata.priority === 'critical') {
      return true;
    }
    
    // High priority with near due date = urgent
    if (task.metadata.priority === 'high' && task.metadata.due_date) {
      const dueDate = new Date(task.metadata.due_date);
      const daysUntilDue = Math.ceil(
        (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilDue <= 3;
    }
    
    // Has due date within 24 hours
    if (task.metadata.due_date) {
      const dueDate = new Date(task.metadata.due_date);
      const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      return hoursUntilDue <= 24;
    }
    
    // Scheduled soon = urgent
    if (task.metadata.scheduled_start) {
      const scheduledStart = new Date(task.metadata.scheduled_start);
      const hoursUntilStart = (scheduledStart.getTime() - now.getTime()) / (1000 * 60 * 60);
      return hoursUntilStart <= 24;
    }
    
    return false;
  }
  
  /**
   * Determine if task is important
   */
  static isImportant(task: PersonalTaskEntity): boolean {
    // Critical or high priority = important
    if (task.metadata.priority === 'critical' || task.metadata.priority === 'high') {
      return true;
    }
    
    // Has project = important
    if (task.metadata.project_uid) {
      return true;
    }
    
    // Requires high energy = important
    if (task.metadata.energy_level === 'high') {
      return true;
    }
    
    // Complex tasks = important
    if (task.metadata.complexity === 'complex' || task.metadata.complexity === 'epic') {
      return true;
    }
    
    // Low priority = not important
    if (task.metadata.priority === 'low') {
      return false;
    }
    
    // Medium priority = moderately important
    return task.metadata.priority === 'medium';
  }
  
  /**
   * Categorize task into Eisenhower quadrant
   */
  static categorize(task: PersonalTaskEntity): EisenhowerCategorization {
    const urgent = this.isUrgent(task);
    const important = this.isImportant(task);
    
    if (urgent && important) {
      return {
        quadrant: 'do-first',
        reason: 'Task is both urgent and important',
        recommended_action: 'Do this task immediately'
      };
    }
    
    if (important && !urgent) {
      return {
        quadrant: 'schedule',
        reason: 'Task is important but not urgent',
        recommended_action: 'Schedule dedicated time for this task'
      };
    }
    
    if (urgent && !important) {
      return {
        quadrant: 'delegate',
        reason: 'Task is urgent but not important',
        recommended_action: 'Consider delegating or automating this task'
      };
    }
    
    return {
      quadrant: 'eliminate',
      reason: 'Task is neither urgent nor important',
      recommended_action: 'Consider if this task is necessary'
    };
  }
  
  /**
   * Auto-categorize task and update metadata
   */
  static autoCategorize(task: PersonalTaskEntity): PersonalTaskEntity {
    const categorization = this.categorize(task);
    return setEisenhowerQuadrant(task, categorization.quadrant);
  }
  
  /**
   * Categorize all tasks
   */
  static categorizeAll(tasks: PersonalTaskEntity[]): PersonalTaskEntity[] {
    return tasks.map(task => this.autoCategorize(task));
  }
  
  /**
   * Organize tasks into Eisenhower Matrix view
   */
  static organizeMatrix(tasks: PersonalTaskEntity[]): EisenhowerMatrixView {
    const categorized = this.categorizeAll(tasks);
    
    return {
      do_first: categorized.filter(t => t.metadata.eisenhower_quadrant === 'do-first'),
      schedule: categorized.filter(t => t.metadata.eisenhower_quadrant === 'schedule'),
      delegate: categorized.filter(t => t.metadata.eisenhower_quadrant === 'delegate'),
      eliminate: categorized.filter(t => t.metadata.eisenhower_quadrant === 'eliminate')
    };
  }
  
  /**
   * Get tasks for current focus (do-first quadrant)
   */
  static getCurrentFocus(tasks: PersonalTaskEntity[]): PersonalTaskEntity[] {
    const matrix = this.organizeMatrix(tasks);
    return matrix.do_first.sort((a, b) => {
      // Sort by due date, then priority
      if (a.metadata.due_date && b.metadata.due_date) {
        return new Date(a.metadata.due_date).getTime() - new Date(b.metadata.due_date).getTime();
      }
      if (a.metadata.due_date) return -1;
      if (b.metadata.due_date) return 1;
      
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.metadata.priority] - priorityOrder[a.metadata.priority];
    });
  }
  
  /**
   * Get tasks to schedule (schedule quadrant)
   */
  static getTasksToSchedule(tasks: PersonalTaskEntity[]): PersonalTaskEntity[] {
    const matrix = this.organizeMatrix(tasks);
    return matrix.schedule.filter(t => !t.metadata.scheduled_start);
  }
  
  /**
   * Get tasks to delegate (delegate quadrant)
   */
  static getTasksToDelegate(tasks: PersonalTaskEntity[]): PersonalTaskEntity[] {
    const matrix = this.organizeMatrix(tasks);
    return matrix.delegate.filter(t => !t.metadata.delegated_to);
  }
  
  /**
   * Get tasks to eliminate (eliminate quadrant)
   */
  static getTasksToEliminate(tasks: PersonalTaskEntity[]): PersonalTaskEntity[] {
    const matrix = this.organizeMatrix(tasks);
    return matrix.eliminate;
  }
  
  /**
   * Get recommendations for task management
   */
  static getRecommendations(tasks: PersonalTaskEntity[]): {
    focus_now: PersonalTaskEntity[];
    schedule_time: PersonalTaskEntity[];
    consider_delegating: PersonalTaskEntity[];
    consider_eliminating: PersonalTaskEntity[];
    stats: {
      total: number;
      do_first: number;
      schedule: number;
      delegate: number;
      eliminate: number;
    };
  } {
    const matrix = this.organizeMatrix(tasks);
    
    return {
      focus_now: this.getCurrentFocus(tasks).slice(0, 5),
      schedule_time: this.getTasksToSchedule(tasks).slice(0, 10),
      consider_delegating: this.getTasksToDelegate(tasks).slice(0, 5),
      consider_eliminating: this.getTasksToEliminate(tasks),
      stats: {
        total: tasks.length,
        do_first: matrix.do_first.length,
        schedule: matrix.schedule.length,
        delegate: matrix.delegate.length,
        eliminate: matrix.eliminate.length
      }
    };
  }
}
