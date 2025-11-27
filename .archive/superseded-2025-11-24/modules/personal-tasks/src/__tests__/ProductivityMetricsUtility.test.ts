/**
 * Productivity Metrics Utility Tests
 */

import { createPersonalTask, createHabitTask, completeHabitOccurrence } from '../entities/PersonalTask';
import { ProductivityMetricsUtility } from '../utils/ProductivityMetricsUtility';

describe('ProductivityMetricsUtility', () => {
  
  describe('calculateMetrics', () => {
    it('should calculate basic metrics', () => {
      const tasks = [
        createPersonalTask('Task 1', 'high', { 
          status: 'done',
          estimated_hours: 2,
          actual_hours: 2.5
        }),
        createPersonalTask('Task 2', 'medium', { 
          status: 'todo',
          estimated_hours: 3
        }),
        createPersonalTask('Task 3', 'low', { status: 'done' })
      ];
      
      const metrics = ProductivityMetricsUtility.calculateMetrics(tasks);
      
      expect(metrics.total_tasks).toBe(3);
      expect(metrics.completed_tasks).toBe(2);
      expect(metrics.completion_rate).toBeGreaterThan(0);
      expect(metrics.total_estimated_hours).toBeGreaterThan(0);
    });
    
    it('should calculate priority distribution', () => {
      const tasks = [
        createPersonalTask('Critical', 'critical'),
        createPersonalTask('High 1', 'high'),
        createPersonalTask('High 2', 'high'),
        createPersonalTask('Medium', 'medium'),
        createPersonalTask('Low', 'low')
      ];
      
      const metrics = ProductivityMetricsUtility.calculateMetrics(tasks);
      
      expect(metrics.priority_distribution.critical).toBe(1);
      expect(metrics.priority_distribution.high).toBe(2);
      expect(metrics.priority_distribution.medium).toBe(1);
      expect(metrics.priority_distribution.low).toBe(1);
    });
    
    it('should calculate energy distribution', () => {
      const tasks = [
        createPersonalTask('High energy', 'high', { energy_level: 'high' }),
        createPersonalTask('Medium energy', 'high', { energy_level: 'medium' }),
        createPersonalTask('Low energy', 'high', { energy_level: 'low' }),
        createPersonalTask('Unspecified', 'high')
      ];
      
      const metrics = ProductivityMetricsUtility.calculateMetrics(tasks);
      
      expect(metrics.energy_distribution.high).toBe(1);
      expect(metrics.energy_distribution.medium).toBe(1);
      expect(metrics.energy_distribution.low).toBe(1);
      expect(metrics.energy_distribution.unspecified).toBe(1);
    });
    
    it('should calculate context usage', () => {
      const tasks = [
        createPersonalTask('Work 1', 'high', { contexts: ['work'] }),
        createPersonalTask('Work 2', 'high', { contexts: ['work', 'computer'] }),
        createPersonalTask('Home', 'high', { contexts: ['home'] })
      ];
      
      const metrics = ProductivityMetricsUtility.calculateMetrics(tasks);
      
      expect(metrics.context_usage['work']).toBe(2);
      expect(metrics.context_usage['computer']).toBe(1);
      expect(metrics.context_usage['home']).toBe(1);
      expect(metrics.most_used_context).toBe('work');
    });
  });
  
  describe('calculateHabitMetrics', () => {
    it('should calculate habit metrics', () => {
      let habit = createHabitTask('Daily exercise', 'daily');
      habit = completeHabitOccurrence(habit, '2025-12-01T00:00:00Z');
      habit = completeHabitOccurrence(habit, '2025-12-02T00:00:00Z');
      habit = completeHabitOccurrence(habit, '2025-12-03T00:00:00Z');
      
      const metrics = ProductivityMetricsUtility.calculateHabitMetrics(habit);
      
      expect(metrics).not.toBeNull();
      expect(metrics!.habit_title).toBe('Daily exercise');
      expect(metrics!.total_completions).toBe(3);
      expect(metrics!.current_streak).toBeGreaterThanOrEqual(0);
    });
    
    it('should return null for non-habit task', () => {
      const task = createPersonalTask('Regular task', 'high');
      const metrics = ProductivityMetricsUtility.calculateHabitMetrics(task);
      
      expect(metrics).toBeNull();
    });
  });
  
  describe('generateWeeklyReview', () => {
    it('should generate weekly review', () => {
      const weekStart = '2025-12-01';
      const tasks = [
        createPersonalTask('Task 1', 'high', { 
          status: 'done',
          actual_hours: 3
        }),
        createPersonalTask('Task 2', 'medium', { 
          status: 'done',
          actual_hours: 2,
          contexts: ['work']
        })
      ];
      
      // Manually set created_at to be within the week
      tasks[0].created_at = '2025-12-01T10:00:00Z';
      tasks[1].created_at = '2025-12-02T10:00:00Z';
      
      const review = ProductivityMetricsUtility.generateWeeklyReview(tasks, weekStart);
      
      expect(review.week_start).toBe(weekStart);
      expect(review.productivity_score).toBeGreaterThanOrEqual(0);
      expect(review.productivity_score).toBeLessThanOrEqual(100);
      expect(review.achievements).toBeDefined();
      expect(review.improvements_needed).toBeDefined();
    });
  });
  
  describe('getProductivityTrend', () => {
    it('should calculate productivity trend', () => {
      const now = new Date();
      const tasks = [
        createPersonalTask('Old task', 'high', { status: 'done' }),
        createPersonalTask('Recent task', 'high', { status: 'done' })
      ];
      
      // Set dates
      tasks[0].created_at = new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString();
      tasks[1].created_at = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString();
      
      const trend = ProductivityMetricsUtility.getProductivityTrend(tasks, 30);
      
      expect(trend.trend).toMatch(/improving|stable|declining/);
      expect(trend.daily_completion_average).toBeGreaterThanOrEqual(0);
      expect(trend.weekly_completion_average).toBeGreaterThanOrEqual(0);
    });
  });
});
