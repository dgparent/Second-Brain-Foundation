import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/tenant-context';
import { getDbClient } from '@sbf/db-client';
import { TasksRepository } from '@sbf/db-client';
import { TaskValidator, CreateTaskInput, UpdateTaskInput, ValidationError } from '@sbf/core-entity-manager';
import { logger } from '@sbf/logging';

// const taskService = new TaskService();

export class TasksController {
  static async list(req: AuthenticatedRequest, res: Response) {
    try {
      const { tenantId } = req;
      if (!tenantId) {
        return res.status(400).json({ error: 'Tenant ID is required' });
      }

      const db = getDbClient();
      const repo = new TasksRepository(db);
      
      const tasks = await repo.findByTenant(tenantId);
      
      res.json({ 
        data: tasks,
        count: tasks.length 
      });
    } catch (error) {
      logger.error({ error, method: 'TasksController.list' });
      res.status(500).json({ error: 'Failed to retrieve tasks' });
    }
  }

  static async get(req: AuthenticatedRequest, res: Response) {
    try {
      const { tenantId } = req;
      const { id } = req.params;

      if (!tenantId) {
        return res.status(400).json({ error: 'Tenant ID is required' });
      }

      const db = getDbClient();
      const repo = new TasksRepository(db);
      
      const task = await repo.findById(tenantId, id);

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      res.json({ data: task });
    } catch (error) {
      logger.error({ error, method: 'TasksController.get' });
      res.status(500).json({ error: 'Failed to retrieve task' });
    }
  }

  static async create(req: AuthenticatedRequest, res: Response) {
    try {
      const { tenantId, userId } = req;
      if (!tenantId) {
        return res.status(400).json({ error: 'Tenant ID is required' });
      }

      const input: CreateTaskInput = req.body;
      
      const validation = TaskValidator.validateCreate(input);
      if (!validation.valid) {
        throw new ValidationError(validation.errors);
      }

      const db = getDbClient();
      const repo = new TasksRepository(db);
      
      const task = await repo.create(tenantId, {
        ...input,
        created_by: userId,
      });

      logger.info({ 
        tenantId, 
        userId, 
        taskId: task.id,
        action: 'task.created' 
      });

      res.status(201).json({ data: task });
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ 
          error: 'Validation failed',
          details: error.errors 
        });
      }
      logger.error({ error, method: 'TasksController.create' });
      res.status(500).json({ error: 'Failed to create task' });
    }
  }

  static async update(req: AuthenticatedRequest, res: Response) {
    try {
      const { tenantId } = req;
      const { id } = req.params;

      if (!tenantId) {
        return res.status(400).json({ error: 'Tenant ID is required' });
      }

      const input: UpdateTaskInput = req.body;
      
      const validation = TaskValidator.validateUpdate(input);
      if (!validation.valid) {
        throw new ValidationError(validation.errors);
      }

      const db = getDbClient();
      const repo = new TasksRepository(db);

      const updated = await repo.update(tenantId, id, input);

      if (!updated) {
        return res.status(404).json({ error: 'Task not found' });
      }

      logger.info({ 
        tenantId, 
        taskId: id,
        action: 'task.updated' 
      });

      res.json({ data: updated });
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ 
          error: 'Validation failed',
          details: error.errors 
        });
      }
      logger.error({ error, method: 'TasksController.update' });
      res.status(500).json({ error: 'Failed to update task' });
    }
  }

  static async updateStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { tenantId } = req;
      const { id } = req.params;
      const { status } = req.body;

      if (!tenantId) {
        return res.status(400).json({ error: 'Tenant ID is required' });
      }

      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      const db = getDbClient();
      const repo = new TasksRepository(db);

      const updated = await repo.updateStatus(tenantId, id, status);

      if (!updated) {
        return res.status(404).json({ error: 'Task not found' });
      }

      logger.info({ 
        tenantId, 
        taskId: id,
        status,
        action: 'task.status_changed' 
      });

      res.json({ data: updated });
    } catch (error) {
      logger.error({ error, method: 'TasksController.updateStatus' });
      res.status(500).json({ error: 'Failed to update task status' });
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response) {
    try {
      const { tenantId } = req;
      const { id } = req.params;

      if (!tenantId) {
        return res.status(400).json({ error: 'Tenant ID is required' });
      }

      const db = getDbClient();
      const repo = new TasksRepository(db);

      await repo.delete(tenantId, id);

      logger.info({ 
        tenantId, 
        taskId: id,
        action: 'task.deleted' 
      });

      res.status(204).send();
    } catch (error) {
      logger.error({ error, method: 'TasksController.delete' });
      res.status(500).json({ error: 'Failed to delete task' });
    }
  }
}
