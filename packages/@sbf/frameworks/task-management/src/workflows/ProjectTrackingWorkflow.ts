import { ProjectEntity, ProjectStatus } from '../entities/ProjectEntity';
import { TaskEntity, TaskStatus } from '../entities/TaskEntity';
import { MilestoneEntity, MilestoneStatus } from '../entities/MilestoneEntity';

/**
 * Project Tracking Workflow
 * Analytics and monitoring for projects
 */
export class ProjectTrackingWorkflow {
  /**
   * Calculate project completion based on tasks
   */
  static calculateProjectCompletion(
    project: ProjectEntity,
    tasks: TaskEntity[]
  ): number {
    const projectTasks = tasks.filter(task => 
      task.metadata.project_uid === project.uid
    );
    
    if (projectTasks.length === 0) {
      return project.metadata.progress_percent || 0;
    }
    
    const completedTasks = projectTasks.filter(task => 
      task.metadata.status === 'done'
    );
    
    return Math.round((completedTasks.length / projectTasks.length) * 100);
  }
  
  /**
   * Calculate project health based on multiple factors
   */
  static assessProjectHealth(
    project: ProjectEntity,
    tasks: TaskEntity[],
    milestones: MilestoneEntity[]
  ): 'green' | 'yellow' | 'red' {
    let healthScore = 0;
    
    // Factor 1: Progress vs Time (30 points)
    if (project.metadata.start_date && project.metadata.target_end_date) {
      const start = new Date(project.metadata.start_date).getTime();
      const end = new Date(project.metadata.target_end_date).getTime();
      const now = new Date().getTime();
      
      const totalDuration = end - start;
      const elapsed = now - start;
      const expectedProgress = (elapsed / totalDuration) * 100;
      const actualProgress = project.metadata.progress_percent || 0;
      
      if (actualProgress >= expectedProgress) {
        healthScore += 30; // On track
      } else if (actualProgress >= expectedProgress * 0.8) {
        healthScore += 20; // Slightly behind
      } else {
        healthScore += 10; // Behind schedule
      }
    }
    
    // Factor 2: Overdue tasks (30 points)
    const projectTasks = tasks.filter(t => t.metadata.project_uid === project.uid);
    const now = new Date();
    const overdueTasks = projectTasks.filter(task => {
      if (!task.metadata.due_date || task.metadata.status === 'done') return false;
      return new Date(task.metadata.due_date) < now;
    });
    
    const overdueRatio = projectTasks.length > 0 
      ? overdueTasks.length / projectTasks.length 
      : 0;
    
    if (overdueRatio === 0) {
      healthScore += 30; // No overdue tasks
    } else if (overdueRatio < 0.2) {
      healthScore += 20; // Some overdue
    } else {
      healthScore += 10; // Many overdue
    }
    
    // Factor 3: Milestone status (40 points)
    const projectMilestones = milestones.filter(m => 
      m.metadata.project_uid === project.uid
    );
    
    if (projectMilestones.length > 0) {
      const achievedMilestones = projectMilestones.filter(m => 
        m.metadata.status === 'achieved'
      );
      const atRiskMilestones = projectMilestones.filter(m => 
        m.metadata.status === 'at-risk'
      );
      const missedMilestones = projectMilestones.filter(m => 
        m.metadata.status === 'missed'
      );
      
      const achievedRatio = achievedMilestones.length / projectMilestones.length;
      const atRiskRatio = atRiskMilestones.length / projectMilestones.length;
      const missedRatio = missedMilestones.length / projectMilestones.length;
      
      if (missedRatio > 0.2) {
        healthScore += 10; // Multiple missed milestones
      } else if (atRiskRatio > 0.3) {
        healthScore += 20; // Multiple at-risk milestones
      } else if (achievedRatio > 0.7) {
        healthScore += 40; // Most milestones achieved
      } else {
        healthScore += 30; // Mixed status
      }
    } else {
      healthScore += 30; // No milestones, neutral
    }
    
    // Determine health (0-100 scale)
    if (healthScore >= 70) {
      return 'green';
    } else if (healthScore >= 40) {
      return 'yellow';
    } else {
      return 'red';
    }
  }
  
  /**
   * Get project statistics
   */
  static getProjectStats(
    project: ProjectEntity,
    tasks: TaskEntity[],
    milestones: MilestoneEntity[]
  ) {
    const projectTasks = tasks.filter(t => t.metadata.project_uid === project.uid);
    const projectMilestones = milestones.filter(m => m.metadata.project_uid === project.uid);
    
    const tasksByStatus: Record<TaskStatus, number> = {
      'backlog': 0,
      'todo': 0,
      'in-progress': 0,
      'blocked': 0,
      'review': 0,
      'done': 0,
      'archived': 0
    };
    
    projectTasks.forEach(task => {
      tasksByStatus[task.metadata.status]++;
    });
    
    const totalEstimatedHours = projectTasks.reduce(
      (sum, task) => sum + (task.metadata.estimated_hours || 0), 
      0
    );
    
    const totalActualHours = projectTasks.reduce(
      (sum, task) => sum + (task.metadata.actual_hours || 0), 
      0
    );
    
    return {
      task_count: projectTasks.length,
      tasks_by_status: tasksByStatus,
      milestone_count: projectMilestones.length,
      completion_percent: this.calculateProjectCompletion(project, tasks),
      health: this.assessProjectHealth(project, tasks, milestones),
      estimated_hours: totalEstimatedHours,
      actual_hours: totalActualHours,
      budget_status: totalEstimatedHours > 0 
        ? Math.round((totalActualHours / totalEstimatedHours) * 100) 
        : 0
    };
  }
  
  /**
   * Find at-risk projects
   */
  static findAtRiskProjects(
    projects: ProjectEntity[],
    tasks: TaskEntity[],
    milestones: MilestoneEntity[]
  ): ProjectEntity[] {
    return projects.filter(project => {
      if (project.metadata.status === 'completed' || project.metadata.status === 'cancelled') {
        return false;
      }
      
      const health = this.assessProjectHealth(project, tasks, milestones);
      return health === 'red' || health === 'yellow';
    });
  }
  
  /**
   * Get project velocity (tasks completed per week)
   */
  static calculateProjectVelocity(
    project: ProjectEntity,
    tasks: TaskEntity[],
    weeksToAnalyze: number = 4
  ): number {
    const projectTasks = tasks.filter(t => t.metadata.project_uid === project.uid);
    const now = new Date();
    const weeksAgo = new Date(now.getTime() - weeksToAnalyze * 7 * 24 * 60 * 60 * 1000);
    
    const recentlyCompleted = projectTasks.filter(task => {
      if (!task.metadata.completed_date) return false;
      const completedDate = new Date(task.metadata.completed_date);
      return completedDate >= weeksAgo && completedDate <= now;
    });
    
    return recentlyCompleted.length / weeksToAnalyze;
  }
}
