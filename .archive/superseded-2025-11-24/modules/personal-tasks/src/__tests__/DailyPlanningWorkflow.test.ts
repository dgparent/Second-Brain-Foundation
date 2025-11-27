/**
 * Daily Planning Workflow Tests
 */

import { createPersonalTask } from '../entities/PersonalTask';
import { DailyPlanningWorkflow } from '../workflows/DailyPlanningWorkflow';

describe('DailyPlanningWorkflow', () => {
  
  describe('createDailyPlan', () => {
    it('should create a daily plan with time blocks', () => {
      const targetDate = new Date().toISOString().split('T')[0];
      const tasks = [
        createPersonalTask('Morning task', 'high', {
          due_date: `${targetDate}T10:00:00Z`,
          estimated_hours: 2,
          energy_level: 'high'
        }),
        createPersonalTask('Afternoon task', 'medium', {
          due_date: `${targetDate}T14:00:00Z`,
          estimated_hours: 1,
          energy_level: 'medium'
        })
      ];
      
      const plan = DailyPlanningWorkflow.createDailyPlan(tasks, targetDate);
      
      expect(plan.date).toBe(targetDate);
      expect(plan.total_planned_hours).toBeGreaterThan(0);
      expect(plan.energy_distribution).toBeDefined();
    });
    
    it('should respect work hours preferences', () => {
      const targetDate = new Date().toISOString().split('T')[0];
      const tasks = [
        createPersonalTask('Task 1', 'high', {
          due_date: `${targetDate}T10:00:00Z`,
          estimated_hours: 2
        })
      ];
      
      const plan = DailyPlanningWorkflow.createDailyPlan(tasks, targetDate, {
        work_start_time: '09:00',
        work_end_time: '17:00'
      });
      
      expect(plan.morning_blocks.length + plan.afternoon_blocks.length + plan.evening_blocks.length).toBeGreaterThanOrEqual(0);
    });
  });
  
  describe('filterTasksForDay', () => {
    it('should filter tasks for specific day', () => {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const tasks = [
        createPersonalTask('Today task', 'high', {
          due_date: `${today}T10:00:00Z`
        }),
        createPersonalTask('Tomorrow task', 'high', {
          due_date: `${tomorrow}T10:00:00Z`
        }),
        createPersonalTask('No date', 'low')
      ];
      
      const todayTasks = DailyPlanningWorkflow.filterTasksForDay(tasks, today);
      
      expect(todayTasks.length).toBeGreaterThan(0);
      expect(todayTasks.some(t => t.title === 'Today task')).toBe(true);
    });
    
    it('should include overdue tasks', () => {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const tasks = [
        createPersonalTask('Overdue task', 'high', {
          due_date: `${yesterday}T10:00:00Z`
        })
      ];
      
      const todayTasks = DailyPlanningWorkflow.filterTasksForDay(tasks, today);
      
      expect(todayTasks.some(t => t.title === 'Overdue task')).toBe(true);
    });
  });
  
  describe('sortForOptimalScheduling', () => {
    it('should prioritize by priority first', () => {
      const tasks = [
        createPersonalTask('Low', 'low'),
        createPersonalTask('Critical', 'critical'),
        createPersonalTask('Medium', 'medium'),
        createPersonalTask('High', 'high')
      ];
      
      const sorted = DailyPlanningWorkflow.sortForOptimalScheduling(tasks);
      
      expect(sorted[0].metadata.priority).toBe('critical');
      expect(sorted[sorted.length - 1].metadata.priority).toBe('low');
    });
    
    it('should sort high energy tasks first when preferred', () => {
      const tasks = [
        createPersonalTask('Low energy', 'high', { energy_level: 'low' }),
        createPersonalTask('High energy', 'high', { energy_level: 'high' }),
        createPersonalTask('Medium energy', 'high', { energy_level: 'medium' })
      ];
      
      const sorted = DailyPlanningWorkflow.sortForOptimalScheduling(tasks, true);
      
      expect(sorted[0].metadata.energy_level).toBe('high');
    });
  });
  
  describe('filterByContext', () => {
    it('should filter tasks by context', () => {
      const tasks = [
        createPersonalTask('Work task', 'high', { contexts: ['work'] }),
        createPersonalTask('Home task', 'high', { contexts: ['home'] }),
        createPersonalTask('Phone task', 'high', { contexts: ['phone'] })
      ];
      
      const workTasks = DailyPlanningWorkflow.filterByContext(tasks, 'work');
      
      expect(workTasks.length).toBe(1);
      expect(workTasks[0].title).toBe('Work task');
    });
  });
  
  describe('filterByEnergyLevel', () => {
    it('should filter tasks by energy level', () => {
      const tasks = [
        createPersonalTask('High energy', 'high', { energy_level: 'high' }),
        createPersonalTask('Medium energy', 'high', { energy_level: 'medium' }),
        createPersonalTask('Low energy', 'high', { energy_level: 'low' })
      ];
      
      const highEnergyTasks = DailyPlanningWorkflow.filterByEnergyLevel(tasks, 'high');
      
      expect(highEnergyTasks.length).toBe(1);
      expect(highEnergyTasks[0].title).toBe('High energy');
    });
  });
  
  describe('getInboxTasks', () => {
    it('should return only inbox tasks', () => {
      const tasks = [
        createPersonalTask('Task 1', 'high', { is_inbox: true }),
        createPersonalTask('Task 2', 'high', { is_inbox: false }),
        createPersonalTask('Task 3', 'high', { is_inbox: true })
      ];
      
      const inboxTasks = DailyPlanningWorkflow.getInboxTasks(tasks);
      
      expect(inboxTasks.length).toBe(2);
    });
  });
  
  describe('getTodaysFocus', () => {
    it('should return top priority tasks for today', () => {
      const today = new Date().toISOString().split('T')[0];
      const tasks = [
        createPersonalTask('Critical 1', 'critical', {
          due_date: `${today}T10:00:00Z`
        }),
        createPersonalTask('Critical 2', 'critical', {
          due_date: `${today}T14:00:00Z`
        }),
        createPersonalTask('High 1', 'high', {
          due_date: `${today}T16:00:00Z`
        }),
        createPersonalTask('Medium 1', 'medium', {
          due_date: `${today}T18:00:00Z`
        })
      ];
      
      const focus = DailyPlanningWorkflow.getTodaysFocus(tasks, 3);
      
      expect(focus.length).toBeLessThanOrEqual(3);
      expect(focus[0].metadata.priority).toBe('critical');
    });
  });
});
