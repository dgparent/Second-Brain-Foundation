import { EntityManager } from '@sbf/core-entity-manager';
import { 
  TaskEntity, 
  createTask, 
  updateTaskStatus, 
  TaskStatus, 
  TaskPriority,
  TaskMetadata
} from '@sbf/frameworks-task-management';
import { TaskPrioritizationWorkflow } from '@sbf/frameworks-task-management';
import { BaseAIProvider } from '@sbf/aei';

export class TaskService {
  constructor(
    private entityManager: EntityManager,
    private aiProvider: BaseAIProvider
  ) {}

  /**
   * Create a new task
   */
  async createTask(
    title: string, 
    priority: TaskPriority = 'medium',
    options: Partial<TaskMetadata> = {}
  ): Promise<TaskEntity> {
    const task = createTask(title, priority, options);
    
    // If AI is enabled, try to refine priority or suggest tags
    // This is a simple example, could be more complex
    if (options.priority === undefined) {
      // TODO: Use AI to suggest priority
    }

    await this.entityManager.create(task);
    return task;
  }

  /**
   * Get a task by ID
   */
  async getTask(uid: string): Promise<TaskEntity | null> {
    const entity = await this.entityManager.get(uid);
    if (entity && entity.type === 'task.item') {
      return entity as TaskEntity;
    }
    return null;
  }

  /**
   * Update task status
   */
  async updateStatus(uid: string, status: TaskStatus): Promise<TaskEntity> {
    const task = await this.getTask(uid);
    if (!task) {
      throw new Error(`Task ${uid} not found`);
    }

    const updatedTask = updateTaskStatus(task, status);
    await this.entityManager.update(uid, updatedTask);
    return updatedTask;
  }

  /**
   * Get all tasks
   */
  async getAllTasks(): Promise<TaskEntity[]> {
    const entities = await this.entityManager.getAll();
    return entities.filter(e => e.type === 'task.item') as TaskEntity[];
  }

  /**
   * Get tasks by status
   */
  async getTasksByStatus(status: TaskStatus): Promise<TaskEntity[]> {
    const tasks = await this.getAllTasks();
    return tasks.filter(t => t.metadata.status === status);
  }

  /**
   * Get tasks for a project
   */
  async getProjectTasks(projectUid: string): Promise<TaskEntity[]> {
    const tasks = await this.getAllTasks();
    return tasks.filter(t => t.metadata.project_uid === projectUid);
  }

  /**
   * Prioritize backlog
   * Uses AI to suggest priorities for backlog items
   */
  async prioritizeBacklog(): Promise<void> {
    const backlog = await this.getTasksByStatus('backlog');
    if (backlog.length === 0) return;

    // This would use the workflow to analyze and update tasks
    // For now, we'll just log
    console.log(`Analyzing ${backlog.length} backlog items...`);
  }
}
