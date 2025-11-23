import { createTask } from '../entities/TaskEntity';
import { createProject } from '../entities/ProjectEntity';
import { createMilestone } from '../entities/MilestoneEntity';

describe('Task Management Entities', () => {
  describe('TaskEntity', () => {
    it('should create a task', () => {
      const task = createTask({
        uid: 'task-001',
        title: 'Implement Feature',
        priority: 'high',
        status: 'in_progress',
      });

      expect(task.uid).toBe('task-001');
      expect(task.type).toBe('task');
      expect(task.title).toBe('Implement Feature');
      expect(task.metadata.priority).toBe('high');
      expect(task.metadata.status).toBe('in_progress');
    });
  });

  describe('ProjectEntity', () => {
    it('should create a project', () => {
      const project = createProject({
        uid: 'proj-001',
        title: 'Second Brain',
        status: 'active',
      });

      expect(project.uid).toBe('proj-001');
      expect(project.type).toBe('project');
      expect(project.title).toBe('Second Brain');
    });
  });

  describe('MilestoneEntity', () => {
    it('should create a milestone', () => {
      const milestone = createMilestone({
        uid: 'milestone-001',
        title: 'MVP Release',
        target_date: '2025-12-31',
        status: 'in_progress',
      });

      expect(milestone.uid).toBe('milestone-001');
      expect(milestone.type).toBe('milestone');
      expect(milestone.metadata.target_date).toBe('2025-12-31');
    });
  });
});
