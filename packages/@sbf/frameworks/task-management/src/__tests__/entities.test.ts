/// <reference types="jest" />
import { createTask } from '../entities/TaskEntity';
import { createProject } from '../entities/ProjectEntity';
import { createMilestone } from '../entities/MilestoneEntity';

describe('Task Management Entities', () => {
  describe('TaskEntity', () => {
    it('should create a task', () => {
      const task = createTask('Implement Feature', 'high', {
        status: 'in-progress'
      });

      expect(task.type).toBe('task.item');
      expect(task.title).toBe('Implement Feature');
      expect(task.metadata.priority).toBe('high');
      expect(task.metadata.status).toBe('in-progress');
    });
  });

  describe('ProjectEntity', () => {
    it('should create a project', () => {
      const project = createProject('Second Brain', {
        status: 'active'
      });

      expect(project.type).toBe('project.item');
      expect(project.title).toBe('Second Brain');
      expect(project.metadata.status).toBe('active');
    });
  });

  describe('MilestoneEntity', () => {
    it('should create a milestone', () => {
      const milestone = createMilestone('MVP Release', '2025-12-31');

      expect(milestone.type).toBe('milestone.item');
      expect(milestone.metadata.target_date).toBe('2025-12-31');
    });
  });
});
