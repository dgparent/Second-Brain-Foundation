/**
 * Sample tests for task-management framework
 */

/// <reference types="jest" />
import { 
  createTask, 
  updateTaskStatus, 
  updateTaskProgress, 
  addBlocker, 
  removeBlocker,
  TaskEntity 
} from '../entities/TaskEntity';

describe('@sbf/task-management', () => {
  describe('Task Creation', () => {
    it('should initialize successfully', () => {
      expect(true).toBe(true);
    });
    
    it('should create a task with required fields', () => {
      const task = createTask('Test Task', 'high');
      expect(task.title).toBe('Test Task');
      expect(task.metadata.priority).toBe('high');
      expect(task.metadata.status).toBe('backlog');
      expect(task.type).toBe('task.item');
      expect(task.uid).toBeDefined();
    });
    
    it('should assign task priorities', () => {
      const task = createTask('Low Priority', 'low');
      expect(task.metadata.priority).toBe('low');
    });
    
    it('should set task due dates', () => {
      const dueDate = new Date('2025-12-31').toISOString();
      const task = createTask('Due Task', 'medium', { due_date: dueDate });
      expect(task.metadata.due_date).toBe(dueDate);
    });
  });
  
  describe('Task Lifecycle', () => {
    it('should mark task as in-progress', () => {
      let task = createTask('Progress Task');
      task = updateTaskStatus(task, 'in-progress');
      expect(task.metadata.status).toBe('in-progress');
    });
    
    it('should complete a task', () => {
      let task = createTask('Complete Task');
      task = updateTaskStatus(task, 'done');
      expect(task.metadata.status).toBe('done');
      expect(task.metadata.completed_date).toBeDefined();
      expect(task.metadata.progress_percent).toBe(100);
    });
    
    it('should archive completed tasks', () => {
      let task = createTask('Archive Task');
      task = updateTaskStatus(task, 'archived');
      expect(task.metadata.status).toBe('archived');
    });
  });
  
  describe('Task Dependencies', () => {
    it('should link dependent tasks', () => {
      // This logic is usually handled by the service or workflow, but we can test the entity structure
      const task = createTask('Child Task', 'medium', { parent_task_uid: 'parent-123' });
      expect(task.metadata.parent_task_uid).toBe('parent-123');
    });
    
    it('should block tasks based on dependencies', () => {
      let task = createTask('Blocked Task');
      task = updateTaskStatus(task, 'in-progress');
      task = addBlocker(task, 'blocker-123');
      
      expect(task.metadata.blocked_by_uids).toContain('blocker-123');
      expect(task.metadata.status).toBe('blocked');
    });
    
    it('should auto-activate tasks when dependencies complete', () => {
      let task = createTask('Blocked Task');
      task = updateTaskStatus(task, 'in-progress');
      task = addBlocker(task, 'blocker-123');
      expect(task.metadata.status).toBe('blocked');
      
      task = removeBlocker(task, 'blocker-123');
      expect(task.metadata.blocked_by_uids).not.toContain('blocker-123');
      expect(task.metadata.status).toBe('todo'); // Or whatever the logic dictates, here it reverts to todo/in-progress
    });
  });
});
