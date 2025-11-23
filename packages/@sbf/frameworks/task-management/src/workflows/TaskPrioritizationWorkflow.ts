import { TaskEntity, TaskStatus, TaskPriority } from '../entities/TaskEntity';
import { ProjectEntity } from '../entities/ProjectEntity';
import { MilestoneEntity } from '../entities/MilestoneEntity';

/**
 * Task Prioritization Workflow
 * Smart algorithms for prioritizing tasks
 */
export class TaskPrioritizationWorkflow {
  /**
   * Calculate priority score using Eisenhower Matrix + Complexity
   * Score: 0-100 (higher = more urgent/important)
   */
  static calculatePriorityScore(task: TaskEntity): number {
    let score = 0;
    
    // Base priority score (0-40)
    const priorityScores: Record<TaskPriority, number> = {
      critical: 40,
      high: 30,
      medium: 20,
      low: 10
    };
    score += priorityScores[task.metadata.priority];
    
    // Deadline urgency (0-30)
    if (task.metadata.due_date) {
      const dueDate = new Date(task.metadata.due_date);
      const now = new Date();
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilDue < 0) {
        score += 30; // Overdue
      } else if (daysUntilDue <= 1) {
        score += 25; // Due today/tomorrow
      } else if (daysUntilDue <= 3) {
        score += 20; // Due this week
      } else if (daysUntilDue <= 7) {
        score += 15; // Due next week
      } else if (daysUntilDue <= 30) {
        score += 10; // Due this month
      }
    }
    
    // Blocked tasks get penalty (0-15)
    if (task.metadata.blocked_by_uids && task.metadata.blocked_by_uids.length > 0) {
      score -= 15;
    }
    
    // In-progress tasks get boost (0-15)
    if (task.metadata.status === 'in-progress') {
      score += 15;
    }
    
    // Complexity penalty (prefer simpler tasks) (0-10)
    const complexityScores = {
      trivial: 10,
      simple: 7,
      moderate: 5,
      complex: 2,
      epic: 0
    };
    if (task.metadata.complexity) {
      score += complexityScores[task.metadata.complexity];
    }
    
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * Sort tasks by priority score
   */
  static prioritizeTasks(tasks: TaskEntity[]): TaskEntity[] {
    return [...tasks].sort((a, b) => {
      const scoreA = this.calculatePriorityScore(a);
      const scoreB = this.calculatePriorityScore(b);
      return scoreB - scoreA; // Descending order
    });
  }
  
  /**
   * Get recommended next tasks (top N by priority, not blocked, not done)
   */
  static getNextTasks(tasks: TaskEntity[], limit: number = 5): TaskEntity[] {
    const actionable = tasks.filter(task => 
      task.metadata.status !== 'done' &&
      task.metadata.status !== 'archived' &&
      (!task.metadata.blocked_by_uids || task.metadata.blocked_by_uids.length === 0)
    );
    
    return this.prioritizeTasks(actionable).slice(0, limit);
  }
  
  /**
   * Find overdue tasks
   */
  static findOverdueTasks(tasks: TaskEntity[]): TaskEntity[] {
    const now = new Date();
    
    return tasks.filter(task => {
      if (!task.metadata.due_date || task.metadata.status === 'done') {
        return false;
      }
      
      const dueDate = new Date(task.metadata.due_date);
      return dueDate < now;
    }).sort((a, b) => {
      const dateA = new Date(a.metadata.due_date!);
      const dateB = new Date(b.metadata.due_date!);
      return dateA.getTime() - dateB.getTime(); // Oldest first
    });
  }
  
  /**
   * Find tasks due soon (within N days)
   */
  static findTasksDueSoon(tasks: TaskEntity[], days: number = 7): TaskEntity[] {
    const now = new Date();
    const threshold = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    return tasks.filter(task => {
      if (!task.metadata.due_date || task.metadata.status === 'done') {
        return false;
      }
      
      const dueDate = new Date(task.metadata.due_date);
      return dueDate >= now && dueDate <= threshold;
    }).sort((a, b) => {
      const dateA = new Date(a.metadata.due_date!);
      const dateB = new Date(b.metadata.due_date!);
      return dateA.getTime() - dateB.getTime(); // Soonest first
    });
  }
  
  /**
   * Find blocked tasks that can be unblocked
   */
  static findUnblockableTasks(
    tasks: TaskEntity[],
    completedTaskUids: Set<string>
  ): TaskEntity[] {
    return tasks.filter(task => {
      if (!task.metadata.blocked_by_uids || task.metadata.blocked_by_uids.length === 0) {
        return false;
      }
      
      // Check if all blockers are completed
      return task.metadata.blocked_by_uids.every(blockerUid => 
        completedTaskUids.has(blockerUid)
      );
    });
  }
}
