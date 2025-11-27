/**
 * Eisenhower Matrix Workflow Tests
 */

import { createPersonalTask } from '../entities/PersonalTask';
import { EisenhowerMatrixWorkflow } from '../workflows/EisenhowerMatrixWorkflow';

describe('EisenhowerMatrixWorkflow', () => {
  
  describe('categorize', () => {
    it('should categorize urgent and important task as do-first', () => {
      const task = createPersonalTask('Critical bug fix', 'critical', {
        due_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // Due in 2 hours
      });
      
      const result = EisenhowerMatrixWorkflow.categorize(task);
      
      expect(result.quadrant).toBe('do-first');
      expect(result.recommended_action).toContain('immediately');
    });
    
    it('should categorize important but not urgent task as schedule', () => {
      const task = createPersonalTask('Strategic planning', 'high', {
        due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // Due in 10 days
        project_uid: 'project-123'
      });
      
      const result = EisenhowerMatrixWorkflow.categorize(task);
      
      expect(result.quadrant).toBe('schedule');
      expect(result.recommended_action).toContain('Schedule');
    });
    
    it('should categorize urgent but not important task as delegate', () => {
      const task = createPersonalTask('Quick admin task', 'medium', {
        due_date: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // Due in 3 hours
        complexity: 'trivial'
      });
      
      const result = EisenhowerMatrixWorkflow.categorize(task);
      
      expect(result.quadrant).toBe('delegate');
      expect(result.recommended_action).toContain('delegat');
    });
    
    it('should categorize neither urgent nor important as eliminate', () => {
      const task = createPersonalTask('Maybe someday', 'low');
      
      const result = EisenhowerMatrixWorkflow.categorize(task);
      
      expect(result.quadrant).toBe('eliminate');
      expect(result.recommended_action).toContain('necessary');
    });
  });
  
  describe('organizeMatrix', () => {
    it('should organize tasks into quadrants', () => {
      const tasks = [
        createPersonalTask('Urgent & Important', 'critical', {
          due_date: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString()
        }),
        createPersonalTask('Important, Not Urgent', 'high', {
          project_uid: 'project-1'
        }),
        createPersonalTask('Urgent, Not Important', 'medium', {
          due_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
        }),
        createPersonalTask('Neither', 'low')
      ];
      
      const matrix = EisenhowerMatrixWorkflow.organizeMatrix(tasks);
      
      expect(matrix.do_first.length).toBeGreaterThan(0);
      expect(matrix.schedule.length).toBeGreaterThan(0);
      expect(matrix.delegate.length).toBeGreaterThan(0);
      expect(matrix.eliminate.length).toBeGreaterThan(0);
    });
  });
  
  describe('getCurrentFocus', () => {
    it('should return do-first tasks sorted by due date', () => {
      const tasks = [
        createPersonalTask('Task 1', 'critical', {
          due_date: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString()
        }),
        createPersonalTask('Task 2', 'critical', {
          due_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
        }),
        createPersonalTask('Task 3', 'high', {
          due_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString() // Not urgent
        })
      ];
      
      const focus = EisenhowerMatrixWorkflow.getCurrentFocus(tasks);
      
      expect(focus.length).toBeGreaterThan(0);
      expect(focus[0].title).toBe('Task 2'); // Earliest due date
    });
  });
  
  describe('getRecommendations', () => {
    it('should provide comprehensive recommendations', () => {
      const tasks = [
        createPersonalTask('Critical 1', 'critical'),
        createPersonalTask('Critical 2', 'critical'),
        createPersonalTask('High 1', 'high'),
        createPersonalTask('Medium 1', 'medium', {
          due_date: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString()
        }),
        createPersonalTask('Low 1', 'low')
      ];
      
      const recommendations = EisenhowerMatrixWorkflow.getRecommendations(tasks);
      
      expect(recommendations.focus_now).toBeDefined();
      expect(recommendations.stats.total).toBe(tasks.length);
      expect(recommendations.stats.do_first).toBeGreaterThan(0);
    });
  });
  
  describe('isUrgent', () => {
    it('should identify critical priority as urgent', () => {
      const task = createPersonalTask('Critical task', 'critical');
      expect(EisenhowerMatrixWorkflow.isUrgent(task)).toBe(true);
    });
    
    it('should identify near due date as urgent', () => {
      const task = createPersonalTask('Due soon', 'high', {
        due_date: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString() // 12 hours
      });
      expect(EisenhowerMatrixWorkflow.isUrgent(task)).toBe(true);
    });
    
    it('should not identify far future task as urgent', () => {
      const task = createPersonalTask('Later', 'medium', {
        due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days
      });
      expect(EisenhowerMatrixWorkflow.isUrgent(task)).toBe(false);
    });
  });
  
  describe('isImportant', () => {
    it('should identify high priority as important', () => {
      const task = createPersonalTask('Important work', 'high');
      expect(EisenhowerMatrixWorkflow.isImportant(task)).toBe(true);
    });
    
    it('should identify project tasks as important', () => {
      const task = createPersonalTask('Project task', 'medium', {
        project_uid: 'project-123'
      });
      expect(EisenhowerMatrixWorkflow.isImportant(task)).toBe(true);
    });
    
    it('should not identify low priority as important', () => {
      const task = createPersonalTask('Low priority', 'low');
      expect(EisenhowerMatrixWorkflow.isImportant(task)).toBe(false);
    });
  });
});
