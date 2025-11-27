/**
 * PersonalTask Entity Tests
 */

import {
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
  PersonalTaskEntity
} from '../entities/PersonalTask';

describe('PersonalTask Entity', () => {
  
  describe('createPersonalTask', () => {
    it('should create a personal task with basic fields', () => {
      const task = createPersonalTask('Write documentation', 'high');
      
      expect(task.title).toBe('Write documentation');
      expect(task.metadata.priority).toBe('high');
      expect(task.metadata.status).toBe('backlog');
      expect(task.metadata.is_inbox).toBe(true);
      expect(task.metadata.is_recurring).toBe(false);
      expect(task.metadata.is_habit).toBe(false);
    });
    
    it('should accept personal productivity options', () => {
      const task = createPersonalTask('Code review', 'medium', {
        contexts: ['work', 'computer'],
        energy_level: 'high',
        time_of_day_preference: 'morning',
        estimated_hours: 2
      });
      
      expect(task.metadata.contexts).toEqual(['work', 'computer']);
      expect(task.metadata.energy_level).toBe('high');
      expect(task.metadata.time_of_day_preference).toBe('morning');
      expect(task.metadata.estimated_hours).toBe(2);
    });
  });
  
  describe('createRecurringTask', () => {
    it('should create a recurring task with pattern', () => {
      const task = createRecurringTask('Weekly report', {
        frequency: 'weekly',
        interval: 1,
        days_of_week: [5] // Friday
      });
      
      expect(task.metadata.is_recurring).toBe(true);
      expect(task.metadata.recurrence_pattern?.frequency).toBe('weekly');
      expect(task.metadata.recurrence_pattern?.interval).toBe(1);
      expect(task.metadata.recurrence_pattern?.days_of_week).toEqual([5]);
    });
  });
  
  describe('createHabitTask', () => {
    it('should create a habit task with tracking fields', () => {
      const task = createHabitTask('Morning meditation', 'daily');
      
      expect(task.metadata.is_habit).toBe(true);
      expect(task.metadata.is_recurring).toBe(true);
      expect(task.metadata.habit_streak).toBe(0);
      expect(task.metadata.habit_best_streak).toBe(0);
      expect(task.metadata.habit_completion_dates).toEqual([]);
      expect(task.metadata.recurrence_pattern?.frequency).toBe('daily');
    });
  });
  
  describe('createInboxTask', () => {
    it('should create an inbox task for processing', () => {
      const task = createInboxTask('Random idea');
      
      expect(task.title).toBe('Random idea');
      expect(task.metadata.is_inbox).toBe(true);
      expect(task.metadata.status).toBe('backlog');
    });
  });
  
  describe('addContext', () => {
    it('should add context to task', () => {
      let task = createPersonalTask('Call client');
      task = addContext(task, 'phone');
      
      expect(task.metadata.contexts).toContain('phone');
    });
    
    it('should not add duplicate context', () => {
      let task = createPersonalTask('Email team', 'medium', {
        contexts: ['work']
      });
      task = addContext(task, 'work');
      
      expect(task.metadata.contexts?.length).toBe(1);
    });
  });
  
  describe('scheduleTask', () => {
    it('should schedule task with time block', () => {
      let task = createPersonalTask('Team meeting');
      task = scheduleTask(task, '2025-12-01T10:00:00Z', '2025-12-01T11:00:00Z');
      
      expect(task.metadata.scheduled_start).toBe('2025-12-01T10:00:00Z');
      expect(task.metadata.scheduled_end).toBe('2025-12-01T11:00:00Z');
    });
  });
  
  describe('processInboxTask', () => {
    it('should mark task as processed from inbox', () => {
      let task = createInboxTask('Process this');
      task = processInboxTask(task);
      
      expect(task.metadata.is_inbox).toBe(false);
      expect(task.metadata.processed_date).toBeTruthy();
    });
  });
  
  describe('completeHabitOccurrence', () => {
    it('should record habit completion', () => {
      let task = createHabitTask('Exercise', 'daily');
      const completionDate = '2025-12-01T00:00:00Z';
      task = completeHabitOccurrence(task, completionDate);
      
      expect(task.metadata.habit_completion_dates).toContain('2025-12-01');
    });
    
    it('should calculate streak correctly', () => {
      let task = createHabitTask('Read', 'daily');
      
      // Complete for 3 consecutive days
      task = completeHabitOccurrence(task, '2025-12-01T00:00:00Z');
      task = completeHabitOccurrence(task, '2025-12-02T00:00:00Z');
      task = completeHabitOccurrence(task, '2025-12-03T00:00:00Z');
      
      expect(task.metadata.habit_completion_dates?.length).toBe(3);
      expect(task.metadata.habit_streak).toBeGreaterThanOrEqual(1);
    });
    
    it('should not add duplicate dates', () => {
      let task = createHabitTask('Workout', 'daily');
      const date = '2025-12-01T10:00:00Z';
      
      task = completeHabitOccurrence(task, date);
      task = completeHabitOccurrence(task, date);
      
      expect(task.metadata.habit_completion_dates?.length).toBe(1);
    });
    
    it('should throw error for non-habit task', () => {
      const task = createPersonalTask('Not a habit');
      
      expect(() => {
        completeHabitOccurrence(task);
      }).toThrow('Task is not a habit task');
    });
  });
  
  describe('delegateTask', () => {
    it('should delegate task to someone', () => {
      let task = createPersonalTask('Create report');
      task = delegateTask(task, 'john@example.com', 'Please complete by Friday');
      
      expect(task.metadata.delegated_to).toBe('john@example.com');
      expect(task.metadata.delegation_notes).toBe('Please complete by Friday');
      expect(task.metadata.eisenhower_quadrant).toBe('delegate');
      expect(task.metadata.status).toBe('in-progress');
    });
  });
  
  describe('addPomodoroSession', () => {
    it('should add pomodoro session', () => {
      let task = createPersonalTask('Deep work');
      task = addPomodoroSession(task);
      
      expect(task.metadata.pomodoros_completed).toBe(1);
      expect(task.metadata.focus_time_minutes).toBe(25);
    });
    
    it('should accumulate multiple sessions', () => {
      let task = createPersonalTask('Long task');
      task = addPomodoroSession(task, 25);
      task = addPomodoroSession(task, 25);
      task = addPomodoroSession(task, 25);
      
      expect(task.metadata.pomodoros_completed).toBe(3);
      expect(task.metadata.focus_time_minutes).toBe(75);
    });
  });
});
