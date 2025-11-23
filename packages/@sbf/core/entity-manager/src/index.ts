/**
 * @sbf/core-entity-manager
 * Entity CRUD operations and validation
 */

import { Entity, EntityType, EntityQuery } from '@sbf/shared';
import { KnowledgeGraph } from '@sbf/core-knowledge-graph';
import { EventEmitter } from 'eventemitter3';
import { randomUUID } from 'crypto';

export interface EntityManagerEvents {
  'entity:created': (entity: Entity) => void;
  'entity:updated': (entity: Entity, previous: Entity) => void;
  'entity:deleted': (uid: string) => void;
}

export class EntityManager extends EventEmitter<EntityManagerEvents> {
  private entities: Map<string, Entity> = new Map();
  private knowledgeGraph: KnowledgeGraph;

  constructor(knowledgeGraph: KnowledgeGraph) {
    super();
    this.knowledgeGraph = knowledgeGraph;
  }

  /**
   * Create a new entity
   */
  async create(entityData: Omit<Entity, 'uid' | 'created' | 'updated'>): Promise<Entity> {
    const now = new Date().toISOString();
    const entity: Entity = {
      uid: randomUUID(),
      ...entityData,
      created: now,
      updated: now,
      lifecycle: entityData.lifecycle || {
        state: 'capture',
        auto_transition: true,
      },
      sensitivity: entityData.sensitivity || {
        level: 'personal',
        privacy: {
          cloud_ai_allowed: false,
          local_ai_allowed: true,
          export_allowed: true,
        },
      },
      metadata: entityData.metadata || {},
    };

    // Validate entity
    this.validateEntity(entity);

    // Store entity
    this.entities.set(entity.uid, entity);

    // Emit event
    this.emit('entity:created', entity);

    return entity;
  }

  /**
   * Get entity by UID
   */
  async get(uid: string): Promise<Entity | null> {
    return this.entities.get(uid) || null;
  }

  /**
   * Update an entity
   */
  async update(uid: string, updates: Partial<Entity>): Promise<Entity | null> {
    const existing = this.entities.get(uid);
    if (!existing) {
      return null;
    }

    const previous = { ...existing };
    const updated: Entity = {
      ...existing,
      ...updates,
      uid, // Ensure UID cannot be changed
      created: existing.created, // Preserve creation time
      updated: new Date().toISOString(),
    };

    // Validate updated entity
    this.validateEntity(updated);

    // Store updated entity
    this.entities.set(uid, updated);

    // Emit event
    this.emit('entity:updated', updated, previous);

    return updated;
  }

  /**
   * Delete an entity
   */
  async delete(uid: string): Promise<boolean> {
    const entity = this.entities.get(uid);
    if (!entity) {
      return false;
    }

    this.entities.delete(uid);

    // Clean up relationships
    const relationships = await this.knowledgeGraph.getEntityRelationships(uid);
    for (const rel of relationships) {
      await this.knowledgeGraph.removeRelationship(rel.uid);
    }

    // Emit event
    this.emit('entity:deleted', uid);

    return true;
  }

  /**
   * Query entities
   */
  async query(query: EntityQuery): Promise<Entity[]> {
    let results = Array.from(this.entities.values());

    // Filter by type
    if (query.type) {
      const types = Array.isArray(query.type) ? query.type : [query.type];
      results = results.filter(e => types.includes(e.type));
    }

    // Filter by lifecycle state
    if (query.filters?.lifecycleState) {
      const states = Array.isArray(query.filters.lifecycleState) ? query.filters.lifecycleState : [query.filters.lifecycleState];
      results = results.filter(e => states.includes(e.lifecycle.state));
    }

    // Text search (simple implementation - can be enhanced)
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      results = results.filter(e =>
        e.title.toLowerCase().includes(searchLower) ||
        e.content?.toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination
    const offset = query.offset || 0;
    const limit = query.limit || results.length;
    results = results.slice(offset, offset + limit);

    return results;
  }

  /**
   * Get all entities (with optional type filter)
   */
  async getAll(type?: EntityType): Promise<Entity[]> {
    if (!type) {
      return Array.from(this.entities.values());
    }
    return this.query({ type });
  }

  /**
   * Get entity count
   */
  async count(query?: EntityQuery): Promise<number> {
    if (!query) {
      return this.entities.size;
    }
    const results = await this.query(query);
    return results.length;
  }

  /**
   * Validate entity structure
   */
  private validateEntity(entity: Entity): void {
    if (!entity.uid) {
      throw new Error('Entity must have a UID');
    }
    if (!entity.title) {
      throw new Error('Entity must have a title');
    }
    if (!entity.type) {
      throw new Error('Entity must have a type');
    }
    if (!entity.lifecycle || !entity.lifecycle.state) {
      throw new Error('Entity must have a lifecycle state');
    }
    if (!entity.sensitivity || !entity.sensitivity.level) {
      throw new Error('Entity must have a sensitivity level');
    }
  }

  /**
   * Get statistics
   */
  getStats() {
    const byType: Record<string, number> = {};
    const byLifecycleState: Record<string, number> = {};

    for (const entity of this.entities.values()) {
      byType[entity.type] = (byType[entity.type] || 0) + 1;
      byLifecycleState[entity.lifecycle.state] = (byLifecycleState[entity.lifecycle.state] || 0) + 1;
    }

    return {
      total: this.entities.size,
      byType,
      byLifecycleState,
    };
  }
}
