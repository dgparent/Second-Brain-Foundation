/**
 * Memory Engine
 * Main class that orchestrates storage, lifecycle, and graph operations
 */

import EventEmitter from 'eventemitter3';
import {
  Entity,
  VaultOptions,
  VaultScanResult,
  OperationResult,
  MemoryEngineHooks,
  LifecycleState,
  EntityEvent
} from './types';
import { VaultAdapter } from './storage/VaultAdapter';
import { LifecycleEngine } from './lifecycle/LifecycleEngine';
import { computeAeiCode } from './storage/AeiCodeComputer';

export class MemoryEngine extends EventEmitter {
  private vaultAdapter: VaultAdapter;
  private lifecycleEngine: LifecycleEngine;
  private hooks: MemoryEngineHooks;
  private entityCache: Map<string, Entity>;

  constructor(options: VaultOptions) {
    super();
    
    this.vaultAdapter = new VaultAdapter(options.vaultRoot);
    this.lifecycleEngine = new LifecycleEngine({
      enableAutoTransitions: options.autoComputeAeiCode ?? true
    });
    this.hooks = {};
    this.entityCache = new Map();

    // Forward lifecycle events
    this.lifecycleEngine.on('lifecycle:transition', (data) => {
      this.emit('lifecycle:transition', data);
      this.emitEntityEvent('lifecycle:transition', data.entity.id, data);
    });

    this.lifecycleEngine.on('lifecycle:tick', async () => {
      await this.runAutomaticTransitions();
    });
  }

  /**
   * Scans the vault and loads all entities
   */
  async scan(): Promise<VaultScanResult> {
    const result = await this.vaultAdapter.scan();

    // Cache entities
    for (const entity of result.entities) {
      this.entityCache.set(entity.id, entity);
    }

    return result;
  }

  /**
   * Gets an entity by ID
   */
  async getEntity(id: string): Promise<Entity | null> {
    // Check cache first
    if (this.entityCache.has(id)) {
      return this.entityCache.get(id)!;
    }

    // Try to load from vault
    const entity = await this.vaultAdapter.readEntity(id + '.md');
    if (entity) {
      this.entityCache.set(id, entity);
    }

    return entity;
  }

  /**
   * Creates a new entity
   */
  async createEntity(partial: Partial<Entity>): Promise<OperationResult<Entity>> {
    try {
      // Run before hook
      let entityData = partial;
      if (this.hooks.beforeEntityCreate) {
        entityData = await this.hooks.beforeEntityCreate(partial);
      }

      // Validate required fields
      if (!entityData.title) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Entity title is required'
          }
        };
      }

      // Generate ID if not provided
      const id = entityData.id || entityData.uid || this.generateId(entityData.title);

      // Set defaults
      const now = new Date().toISOString();
      const entity: Entity = {
        id,
        uid: id,
        vault_path: entityData.vault_path || `${id}.md`,
        title: entityData.title,
        content: entityData.content || '',
        tags: entityData.tags || [],
        memory: {
          memory_level: entityData.memory?.memory_level || 'transitory',
          stability_score: entityData.memory?.stability_score ?? 0.5,
          importance_score: entityData.memory?.importance_score ?? 0.5,
          last_active_at: now,
          user_pinned: entityData.memory?.user_pinned ?? false,
          created_at: now,
          updated_at: now
        },
        sensitivity: entityData.sensitivity || {
          level: 1,
          privacy: {
            cloud_ai_allowed: true,
            local_ai_allowed: true,
            export_allowed: true
          },
          visibility: 'public'
        },
        control: entityData.control,
        aei_code: '' // Will be computed below
      };

      // Compute AEI code
      entity.aei_code = computeAeiCode(
        entity.memory.memory_level,
        entity.sensitivity,
        entity.control
      );

      // Write to vault
      await this.vaultAdapter.writeEntity(entity);

      // Cache entity
      this.entityCache.set(id, entity);

      // Run after hook
      if (this.hooks.afterEntityCreate) {
        await this.hooks.afterEntityCreate(entity);
      }

      // Emit event
      this.emitEntityEvent('entity:created', id, entity);

      return {
        success: true,
        data: entity
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: error instanceof Error ? error.message : String(error),
          details: error
        }
      };
    }
  }

  /**
   * Updates an entity
   */
  async updateEntity(id: string, updates: Partial<Entity>): Promise<OperationResult<Entity>> {
    try {
      // Get existing entity
      const existing = await this.getEntity(id);
      if (!existing) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Entity with ID ${id} not found`
          }
        };
      }

      // Run before hook
      let updateData = updates;
      if (this.hooks.beforeEntityUpdate) {
        updateData = await this.hooks.beforeEntityUpdate(id, updates);
      }

      // Merge updates
      const updated: Entity = {
        ...existing,
        ...updateData,
        id: existing.id, // Don't allow ID change
        uid: existing.uid,
        memory: {
          ...existing.memory,
          ...updateData.memory,
          updated_at: new Date().toISOString()
        }
      };

      // Recompute AEI code if memory or sensitivity changed
      if (updateData.memory?.memory_level || updateData.sensitivity || updateData.control) {
        updated.aei_code = computeAeiCode(
          updated.memory.memory_level,
          updated.sensitivity,
          updated.control
        );
      }

      // Write to vault
      await this.vaultAdapter.writeEntity(updated);

      // Update cache
      this.entityCache.set(id, updated);

      // Run after hook
      if (this.hooks.afterEntityUpdate) {
        await this.hooks.afterEntityUpdate(updated);
      }

      // Emit event
      this.emitEntityEvent('entity:updated', id, updated);

      return {
        success: true,
        data: updated
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: error instanceof Error ? error.message : String(error),
          details: error
        }
      };
    }
  }

  /**
   * Deletes an entity
   */
  async deleteEntity(id: string): Promise<OperationResult<boolean>> {
    try {
      // Check if entity exists
      const existing = await this.getEntity(id);
      if (!existing) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Entity with ID ${id} not found`
          }
        };
      }

      // Run before hook (can cancel deletion)
      if (this.hooks.beforeEntityDelete) {
        const shouldDelete = await this.hooks.beforeEntityDelete(id);
        if (!shouldDelete) {
          return {
            success: false,
            error: {
              code: 'CANCELLED',
              message: 'Deletion cancelled by hook'
            }
          };
        }
      }

      // Delete from vault
      const deleted = await this.vaultAdapter.deleteEntity(existing.vault_path);

      if (!deleted) {
        return {
          success: false,
          error: {
            code: 'DELETE_ERROR',
            message: 'Failed to delete entity from vault'
          }
        };
      }

      // Remove from cache
      this.entityCache.delete(id);

      // Run after hook
      if (this.hooks.afterEntityDelete) {
        await this.hooks.afterEntityDelete(id);
      }

      // Emit event
      this.emitEntityEvent('entity:deleted', id);

      return {
        success: true,
        data: true
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: error instanceof Error ? error.message : String(error),
          details: error
        }
      };
    }
  }

  /**
   * Transitions an entity to a new lifecycle state
   */
  async transitionEntity(
    id: string,
    targetState: LifecycleState,
    automatic: boolean = false,
    reason?: string
  ): Promise<OperationResult<Entity>> {
    const entity = await this.getEntity(id);
    if (!entity) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Entity with ID ${id} not found`
        }
      };
    }

    const transitioned = this.lifecycleEngine.transition(entity, targetState, automatic, reason);

    // Save updated entity
    return this.updateEntity(id, transitioned);
  }

  /**
   * Runs automatic lifecycle transitions on all cached entities
   */
  async runAutomaticTransitions(): Promise<void> {
    const entities = Array.from(this.entityCache.values());
    const updated = await this.lifecycleEngine.applyAutomaticTransitions(entities);

    // Save updated entities
    for (const entity of updated) {
      if (entity.memory.updated_at !== this.entityCache.get(entity.id)?.memory.updated_at) {
        await this.updateEntity(entity.id, entity);
      }
    }
  }

  /**
   * Registers hooks
   */
  registerHooks(hooks: Partial<MemoryEngineHooks>): void {
    this.hooks = { ...this.hooks, ...hooks };
  }

  /**
   * Gets the lifecycle engine
   */
  get lifecycle(): LifecycleEngine {
    return this.lifecycleEngine;
  }

  /**
   * Emits an entity event
   */
  private emitEntityEvent(type: EntityEvent['type'], entityId: string, data?: unknown): void {
    const event: EntityEvent = {
      type,
      entityId,
      timestamp: new Date().toISOString(),
      data
    };
    this.emit(type, event);
    this.emit('entity:*', event);
  }

  /**
   * Generates a unique ID from title
   */
  private generateId(title: string): string {
    const base = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const timestamp = Date.now().toString(36);
    return `${base}-${timestamp}`;
  }

  /**
   * Cleanup
   */
  async shutdown(): Promise<void> {
    this.lifecycleEngine.stop();
    this.entityCache.clear();
    this.removeAllListeners();
  }
}
