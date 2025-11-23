/**
 * Daily Planning Workflow
 * 
 * Helps plan daily tasks using:
 * - Time blocking
 * - Energy level optimization
 * - Context-based organization
 * - Realistic capacity planning
 */

import {
  PersonalTaskEntity,
  EnergyLevel,
  TimeOfDay,
  TaskContext,
  scheduleTask
} from '../entities/PersonalTask';

// ==================== Types ====================

export interface TimeBlock {
  start_time: string; // HH:MM format
  end_time: string;
  task: PersonalTaskEntity;
  estimated_duration_minutes: number;
}

export interface DailyPlan {
  date: string; // ISO date
  morning_blocks: TimeBlock[];
  afternoon_blocks: TimeBlock[];
  evening_blocks: TimeBlock[];
  total_planned_hours: number;
  unscheduled_tasks: PersonalTaskEntity[];
  energy_distribution: {
    high_energy_tasks: number;
    medium_energy_tasks: number;
    low_energy_tasks: number;
  };
}

export interface PlanningPreferences {
  work_start_time?: string; // HH:MM format (default: "09:00")
  work_end_time?: string; // HH:MM format (default: "17:00")
  lunch_start_time?: string; // HH:MM format (default: "12:00")
  lunch_duration_minutes?: number; // default: 60
  max_hours_per_day?: number; // default: 8
  prefer_morning_for_high_energy?: boolean; // default: true
  buffer_between_tasks_minutes?: number; // default: 10
}

// ==================== Workflow ====================

export class DailyPlanningWorkflow {
  
  /**
   * Create daily plan from tasks
   */
  static createDailyPlan(
    tasks: PersonalTaskEntity[],
    targetDate: string,
    preferences: PlanningPreferences = {}
  ): DailyPlan {
    const {
      work_start_time = '09:00',
      work_end_time = '17:00',
      lunch_start_time = '12:00',
      lunch_duration_minutes = 60,
      max_hours_per_day = 8,
      prefer_morning_for_high_energy = true,
      buffer_between_tasks_minutes = 10
    } = preferences;
    
    // Filter tasks for the day
    const dayTasks = this.filterTasksForDay(tasks, targetDate);
    
    // Sort by priority and energy level
    const sortedTasks = this.sortForOptimalScheduling(dayTasks, prefer_morning_for_high_energy);
    
    // Create time blocks
    const blocks: TimeBlock[] = [];
    let currentTime = this.parseTime(work_start_time);
    const endTime = this.parseTime(work_end_time);
    const lunchTime = this.parseTime(lunch_start_time);
    const maxMinutes = max_hours_per_day * 60;
    let totalMinutes = 0;
    
    for (const task of sortedTasks) {
      const estimatedMinutes = (task.metadata.estimated_hours || 1) * 60;
      
      // Check if we have capacity
      if (totalMinutes + estimatedMinutes > maxMinutes) {
        break;
      }
      
      // Skip lunch time
      if (currentTime >= lunchTime && currentTime < lunchTime + lunch_duration_minutes) {
        currentTime = lunchTime + lunch_duration_minutes;
      }
      
      // Check if we're past work hours
      if (currentTime + estimatedMinutes > endTime) {
        break;
      }
      
      // Create block
      const startTime = this.formatTime(currentTime);
      const endTimeForTask = currentTime + estimatedMinutes;
      const endTimeStr = this.formatTime(endTimeForTask);
      
      blocks.push({
        start_time: startTime,
        end_time: endTimeStr,
        task,
        estimated_duration_minutes: estimatedMinutes
      });
      
      totalMinutes += estimatedMinutes;
      currentTime = endTimeForTask + buffer_between_tasks_minutes;
    }
    
    // Categorize blocks by time of day
    const morningEnd = this.parseTime('12:00');
    const afternoonEnd = this.parseTime('17:00');
    
    const morning_blocks = blocks.filter(b => this.parseTime(b.start_time) < morningEnd);
    const afternoon_blocks = blocks.filter(b => 
      this.parseTime(b.start_time) >= morningEnd && 
      this.parseTime(b.start_time) < afternoonEnd
    );
    const evening_blocks = blocks.filter(b => this.parseTime(b.start_time) >= afternoonEnd);
    
    // Calculate energy distribution
    const scheduledTasks = blocks.map(b => b.task);
    const unscheduled = dayTasks.filter(t => !scheduledTasks.includes(t));
    
    return {
      date: targetDate,
      morning_blocks,
      afternoon_blocks,
      evening_blocks,
      total_planned_hours: totalMinutes / 60,
      unscheduled_tasks: unscheduled,
      energy_distribution: {
        high_energy_tasks: scheduledTasks.filter(t => t.metadata.energy_level === 'high').length,
        medium_energy_tasks: scheduledTasks.filter(t => t.metadata.energy_level === 'medium').length,
        low_energy_tasks: scheduledTasks.filter(t => t.metadata.energy_level === 'low').length
      }
    };
  }
  
  /**
   * Filter tasks for specific day
   */
  static filterTasksForDay(tasks: PersonalTaskEntity[], targetDate: string): PersonalTaskEntity[] {
    return tasks.filter(task => {
      // Skip completed or archived
      if (task.metadata.status === 'done' || task.metadata.status === 'archived') {
        return false;
      }
      
      // Include if scheduled for this day
      if (task.metadata.scheduled_start) {
        const scheduledDate = task.metadata.scheduled_start.split('T')[0];
        if (scheduledDate === targetDate) {
          return true;
        }
      }
      
      // Include if due today
      if (task.metadata.due_date) {
        const dueDate = task.metadata.due_date.split('T')[0];
        if (dueDate === targetDate) {
          return true;
        }
      }
      
      // Include if due before today and not scheduled
      if (task.metadata.due_date && !task.metadata.scheduled_start) {
        const dueDate = task.metadata.due_date.split('T')[0];
        if (dueDate < targetDate) {
          return true; // Overdue
        }
      }
      
      // Include tasks with no due date that are high priority
      if (!task.metadata.due_date && task.metadata.priority === 'critical') {
        return true;
      }
      
      return false;
    });
  }
  
  /**
   * Sort tasks for optimal scheduling
   */
  static sortForOptimalScheduling(
    tasks: PersonalTaskEntity[],
    preferMorningForHighEnergy: boolean = true
  ): PersonalTaskEntity[] {
    return [...tasks].sort((a, b) => {
      // 1. Priority first
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.metadata.priority] - priorityOrder[a.metadata.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // 2. Energy level (high energy in morning if preferred)
      if (preferMorningForHighEnergy) {
        const energyOrder = { high: 3, medium: 2, low: 1 };
        const aEnergy = energyOrder[a.metadata.energy_level || 'medium'];
        const bEnergy = energyOrder[b.metadata.energy_level || 'medium'];
        const energyDiff = bEnergy - aEnergy;
        if (energyDiff !== 0) return energyDiff;
      }
      
      // 3. Due date (earlier first)
      if (a.metadata.due_date && b.metadata.due_date) {
        return new Date(a.metadata.due_date).getTime() - new Date(b.metadata.due_date).getTime();
      }
      if (a.metadata.due_date) return -1;
      if (b.metadata.due_date) return 1;
      
      return 0;
    });
  }
  
  /**
   * Get tasks by context
   */
  static filterByContext(tasks: PersonalTaskEntity[], context: TaskContext): PersonalTaskEntity[] {
    return tasks.filter(task => 
      task.metadata.contexts?.includes(context)
    );
  }
  
  /**
   * Get tasks by energy level
   */
  static filterByEnergyLevel(tasks: PersonalTaskEntity[], energyLevel: EnergyLevel): PersonalTaskEntity[] {
    return tasks.filter(task => task.metadata.energy_level === energyLevel);
  }
  
  /**
   * Get tasks by time of day preference
   */
  static filterByTimeOfDay(tasks: PersonalTaskEntity[], timeOfDay: TimeOfDay): PersonalTaskEntity[] {
    return tasks.filter(task => 
      task.metadata.time_of_day_preference === timeOfDay || 
      task.metadata.time_of_day_preference === 'anytime'
    );
  }
  
  /**
   * Get inbox tasks (need processing)
   */
  static getInboxTasks(tasks: PersonalTaskEntity[]): PersonalTaskEntity[] {
    return tasks.filter(task => task.metadata.is_inbox === true);
  }
  
  /**
   * Get today's focus tasks (top 3-5 most important)
   */
  static getTodaysFocus(tasks: PersonalTaskEntity[], maxTasks: number = 3): PersonalTaskEntity[] {
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = this.filterTasksForDay(tasks, today);
    const sorted = this.sortForOptimalScheduling(todayTasks, true);
    return sorted.slice(0, maxTasks);
  }
  
  /**
   * Suggest time blocks for unscheduled high priority tasks
   */
  static suggestTimeBlocks(
    tasks: PersonalTaskEntity[],
    targetDate: string,
    preferences: PlanningPreferences = {}
  ): TimeBlock[] {
    const unscheduled = tasks.filter(task => 
      !task.metadata.scheduled_start && 
      task.metadata.status !== 'done' &&
      task.metadata.status !== 'archived'
    );
    
    const plan = this.createDailyPlan(unscheduled, targetDate, preferences);
    return [
      ...plan.morning_blocks,
      ...plan.afternoon_blocks,
      ...plan.evening_blocks
    ];
  }
  
  // ==================== Time Utilities ====================
  
  private static parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }
  
  private static formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }
}
