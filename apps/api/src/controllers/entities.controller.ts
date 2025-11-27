import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/tenant-context';
import { getDbClient } from '@sbf/db-client';
import { EntitiesRepository } from '@sbf/db-client';
import { EntityValidator, CreateEntityInput, UpdateEntityInput, ValidationError } from '@sbf/core-entity-manager';
import { logger } from '@sbf/logging';

export class EntitiesController {
  static async list(req: AuthenticatedRequest, res: Response) {
    try {
      const { tenantId } = req;
      if (!tenantId) {
        return res.status(400).json({ error: 'Tenant ID is required' });
      }

      const db = getDbClient();
      const repo = new EntitiesRepository(db);
      
      const entities = await repo.findByTenant(tenantId);
      
      res.json({ 
        data: entities,
        count: entities.length 
      });
    } catch (error) {
      logger.error({ error, method: 'EntitiesController.list' });
      res.status(500).json({ error: 'Failed to retrieve entities' });
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
      const repo = new EntitiesRepository(db);
      
      const entity = await repo.findById(tenantId, id);

      if (!entity) {
        return res.status(404).json({ error: 'Entity not found' });
      }

      res.json({ data: entity });
    } catch (error) {
      logger.error({ error, method: 'EntitiesController.get' });
      res.status(500).json({ error: 'Failed to retrieve entity' });
    }
  }

  static async create(req: AuthenticatedRequest, res: Response) {
    try {
      const { tenantId, userId } = req;
      if (!tenantId) {
        return res.status(400).json({ error: 'Tenant ID is required' });
      }

      const input: CreateEntityInput = req.body;
      
      const validation = EntityValidator.validateCreate(input);
      if (!validation.valid) {
        throw new ValidationError(validation.errors);
      }

      const db = getDbClient();
      const repo = new EntitiesRepository(db);
      
      const entity = await repo.create(tenantId, {
        ...input,
        created_by: userId,
      });

      logger.info({ 
        tenantId, 
        userId, 
        entityId: entity.id,
        action: 'entity.created' 
      });

      res.status(201).json({ data: entity });
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ 
          error: 'Validation failed',
          details: error.errors 
        });
      }
      logger.error({ error, method: 'EntitiesController.create' });
      res.status(500).json({ error: 'Failed to create entity' });
    }
  }

  static async update(req: AuthenticatedRequest, res: Response) {
    try {
      const { tenantId } = req;
      const { id } = req.params;

      if (!tenantId) {
        return res.status(400).json({ error: 'Tenant ID is required' });
      }

      const input: UpdateEntityInput = req.body;
      
      const validation = EntityValidator.validateUpdate(input);
      if (!validation.valid) {
        throw new ValidationError(validation.errors);
      }

      const db = getDbClient();
      const repo = new EntitiesRepository(db);

      const existing = await repo.findById(tenantId, id);
      if (!existing) {
        return res.status(404).json({ error: 'Entity not found' });
      }

      const updated = await repo.update(tenantId, id, input);

      logger.info({ 
        tenantId, 
        entityId: id,
        action: 'entity.updated' 
      });

      res.json({ data: updated });
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ 
          error: 'Validation failed',
          details: error.errors 
        });
      }
      logger.error({ error, method: 'EntitiesController.update' });
      res.status(500).json({ error: 'Failed to update entity' });
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
      const repo = new EntitiesRepository(db);

      const existing = await repo.findById(tenantId, id);
      if (!existing) {
        return res.status(404).json({ error: 'Entity not found' });
      }

      await repo.delete(tenantId, id);

      logger.info({ 
        tenantId, 
        entityId: id,
        action: 'entity.deleted' 
      });

      res.status(204).send();
    } catch (error) {
      logger.error({ error, method: 'EntitiesController.delete' });
      res.status(500).json({ error: 'Failed to delete entity' });
    }
  }
}
