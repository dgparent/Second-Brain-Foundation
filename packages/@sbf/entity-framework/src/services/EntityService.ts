/**
 * EntityService
 * 
 * Core service for entity CRUD operations and relationship management.
 */

import { v4 as uuidv4 } from 'uuid';
import { Entity } from '../entities/Entity';
import { EntityRelationship } from '../entities/EntityRelationship';
import { UIDGenerator } from './UIDGenerator';
import { EntityTypeRegistry, type DatabaseAdapter } from './EntityTypeRegistry';
import {
  LifecycleState,
  type CreateEntityOptions,
  type FindEntitiesOptions,
  type CreateRelationshipOptions,
  type EntityData,
} from '../types';

export interface EntityServiceConfig {
  defaultSensitivity?: 'public' | 'personal' | 'confidential' | 'secret';
  defaultTruthLevel?: 'L1' | 'L2' | 'L3' | 'U1' | 'U2' | 'U3';
}

export class EntityService {
  private db: DatabaseAdapter;
  private uidGenerator: UIDGenerator;
  private typeRegistry: EntityTypeRegistry;
  private config: EntityServiceConfig;
  
  constructor(
    db: DatabaseAdapter,
    uidGenerator: UIDGenerator,
    typeRegistry: EntityTypeRegistry,
    config: EntityServiceConfig = {}
  ) {
    this.db = db;
    this.uidGenerator = uidGenerator;
    this.typeRegistry = typeRegistry;
    this.config = {
      defaultSensitivity: config.defaultSensitivity ?? 'personal',
      defaultTruthLevel: config.defaultTruthLevel ?? 'U1',
    };
  }
  
  /**
   * Create a new entity
   */
  async create(options: CreateEntityOptions): Promise<Entity> {
    // Verify entity type exists
    const entityType = await this.typeRegistry.getType(options.tenantId, options.typeSlug);
    if (!entityType) {
      throw new Error(`Unknown entity type: ${options.typeSlug}`);
    }
    
    // Generate UID
    const uid = await this.uidGenerator.generateUID(
      options.tenantId,
      options.typeSlug,
      options.name
    );
    
    // Create entity
    const entity = new Entity({
      id: uuidv4(),
      tenantId: options.tenantId,
      uid,
      typeSlug: options.typeSlug,
      name: options.name,
      content: options.content,
      sensitivity: options.sensitivity ?? this.config.defaultSensitivity,
      truthLevel: options.truthLevel ?? this.config.defaultTruthLevel,
      lifecycleState: LifecycleState.CAPTURED,
      capturedAt: new Date(),
      metadata: options.metadata,
    });
    
    // Validate
    const validation = entity.validate();
    if (!validation.valid) {
      throw new Error(`Invalid entity: ${validation.errors.join(', ')}`);
    }
    
    // Insert into database
    const row = entity.toRow();
    await this.db.execute(
      `INSERT INTO entities (id, tenant_id, uid, type_slug, name, content, summary, sensitivity, truth_level, lifecycle_state, captured_at, filed_at, archived_at, metadata, bmom, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())`,
      [
        row.id, row.tenant_id, row.uid, row.type_slug, row.name, row.content, row.summary,
        row.sensitivity, row.truth_level, row.lifecycle_state, row.captured_at, row.filed_at,
        row.archived_at, row.metadata, row.bmom
      ]
    );
    
    entity.createdAt = new Date();
    entity.updatedAt = new Date();
    
    return entity;
  }
  
  /**
   * Get entity by ID
   */
  async getById(id: string): Promise<Entity | null> {
    const result = await this.db.query<Record<string, unknown>>(
      `SELECT * FROM entities WHERE id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) return null;
    return Entity.fromRow(result.rows[0]);
  }
  
  /**
   * Get entity by UID
   */
  async getByUID(tenantId: string, uid: string): Promise<Entity | null> {
    const result = await this.db.query<Record<string, unknown>>(
      `SELECT * FROM entities WHERE tenant_id = $1 AND uid = $2`,
      [tenantId, uid]
    );
    
    if (result.rows.length === 0) return null;
    return Entity.fromRow(result.rows[0]);
  }
  
  /**
   * Find entities with filters
   */
  async find(options: FindEntitiesOptions): Promise<Entity[]> {
    const conditions: string[] = ['tenant_id = $1'];
    const params: unknown[] = [options.tenantId];
    let paramIndex = 2;
    
    if (options.typeSlug) {
      conditions.push(`type_slug = $${paramIndex++}`);
      params.push(options.typeSlug);
    }
    
    if (options.lifecycleState) {
      conditions.push(`lifecycle_state = $${paramIndex++}`);
      params.push(options.lifecycleState);
    }
    
    if (options.sensitivity) {
      conditions.push(`sensitivity = $${paramIndex++}`);
      params.push(options.sensitivity);
    }
    
    const orderBy = options.orderBy || 'created_at';
    const orderDir = options.orderDirection || 'desc';
    const limit = options.limit || 100;
    const offset = options.offset || 0;
    
    const sql = `
      SELECT * FROM entities 
      WHERE ${conditions.join(' AND ')}
      ORDER BY ${orderBy} ${orderDir}
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    const result = await this.db.query<Record<string, unknown>>(sql, params);
    return result.rows.map(row => Entity.fromRow(row));
  }
  
  /**
   * Find entities by type
   */
  async findByType(tenantId: string, typeSlug: string): Promise<Entity[]> {
    return this.find({ tenantId, typeSlug });
  }
  
  /**
   * Find entities by lifecycle state
   */
  async findByLifecycleState(tenantId: string, state: LifecycleState): Promise<Entity[]> {
    return this.find({ tenantId, lifecycleState: state });
  }
  
  /**
   * Update an entity
   */
  async update(id: string, updates: Partial<EntityData>): Promise<Entity> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Entity not found: ${id}`);
    }
    
    // Apply updates (excluding immutable fields)
    const { id: _, tenantId: __, uid: ___, typeSlug: ____, capturedAt: _____, createdAt: ______, ...allowedUpdates } = updates;
    Object.assign(existing, allowedUpdates);
    
    // Validate
    const validation = existing.validate();
    if (!validation.valid) {
      throw new Error(`Invalid entity: ${validation.errors.join(', ')}`);
    }
    
    const row = existing.toRow();
    await this.db.execute(
      `UPDATE entities 
       SET name = $2, content = $3, summary = $4, sensitivity = $5, truth_level = $6, 
           lifecycle_state = $7, filed_at = $8, archived_at = $9, metadata = $10, bmom = $11, updated_at = NOW()
       WHERE id = $1`,
      [id, row.name, row.content, row.summary, row.sensitivity, row.truth_level, 
       row.lifecycle_state, row.filed_at, row.archived_at, row.metadata, row.bmom]
    );
    
    existing.updatedAt = new Date();
    return existing;
  }
  
  /**
   * Delete an entity
   */
  async delete(id: string): Promise<void> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Entity not found: ${id}`);
    }
    
    // Delete relationships first
    await this.db.execute(
      `DELETE FROM entity_relationships WHERE source_uid = $1 OR target_uid = $1`,
      [existing.uid]
    );
    
    // Delete entity
    await this.db.execute(
      `DELETE FROM entities WHERE id = $1`,
      [id]
    );
  }
  
  /**
   * Get entity with relationships
   */
  async getWithRelationships(id: string): Promise<{
    entity: Entity;
    relationships: EntityRelationship[];
  } | null> {
    const entity = await this.getById(id);
    if (!entity) return null;
    
    const relationships = await this.getRelationships(entity.uid);
    return { entity, relationships };
  }
  
  /**
   * Get relationships for an entity
   */
  async getRelationships(uid: string): Promise<EntityRelationship[]> {
    const result = await this.db.query<Record<string, unknown>>(
      `SELECT * FROM entity_relationships 
       WHERE source_uid = $1 OR (target_uid = $1 AND bidirectional = true)
       ORDER BY created_at DESC`,
      [uid]
    );
    
    return result.rows.map(row => EntityRelationship.fromRow(row));
  }
  
  /**
   * Create a relationship between entities
   */
  async createRelationship(options: CreateRelationshipOptions): Promise<EntityRelationship> {
    // Verify both UIDs exist
    const sourceExists = await this.uidGenerator.uidExists(options.tenantId, options.sourceUid);
    const targetExists = await this.uidGenerator.uidExists(options.tenantId, options.targetUid);
    
    if (!sourceExists) {
      throw new Error(`Source entity not found: ${options.sourceUid}`);
    }
    if (!targetExists) {
      throw new Error(`Target entity not found: ${options.targetUid}`);
    }
    
    const relationship = new EntityRelationship({
      id: uuidv4(),
      tenantId: options.tenantId,
      sourceUid: options.sourceUid,
      targetUid: options.targetUid,
      relationshipType: options.relationshipType,
      context: options.context,
      bidirectional: options.bidirectional ?? false,
      confidence: options.confidence,
    });
    
    // Validate
    const validation = relationship.validate();
    if (!validation.valid) {
      throw new Error(`Invalid relationship: ${validation.errors.join(', ')}`);
    }
    
    // Check for existing relationship
    const existingResult = await this.db.query<{ count: number }>(
      `SELECT COUNT(*) as count FROM entity_relationships 
       WHERE tenant_id = $1 AND source_uid = $2 AND target_uid = $3 AND relationship_type = $4`,
      [options.tenantId, options.sourceUid, options.targetUid, options.relationshipType]
    );
    
    if (existingResult.rows[0].count > 0) {
      throw new Error('Relationship already exists');
    }
    
    const row = relationship.toRow();
    await this.db.execute(
      `INSERT INTO entity_relationships (id, tenant_id, source_uid, target_uid, relationship_type, context, bidirectional, confidence, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
      [row.id, row.tenant_id, row.source_uid, row.target_uid, row.relationship_type, row.context, row.bidirectional, row.confidence]
    );
    
    relationship.createdAt = new Date();
    relationship.updatedAt = new Date();
    
    return relationship;
  }
  
  /**
   * Delete a relationship
   */
  async deleteRelationship(id: string): Promise<void> {
    await this.db.execute(
      `DELETE FROM entity_relationships WHERE id = $1`,
      [id]
    );
  }
  
  /**
   * Update entity BMOM
   */
  async updateBMOM(id: string, bmom: EntityData['bmom']): Promise<Entity> {
    return this.update(id, { bmom });
  }
  
  /**
   * Update entity sensitivity
   */
  async updateSensitivity(id: string, sensitivity: EntityData['sensitivity']): Promise<Entity> {
    return this.update(id, { sensitivity });
  }
  
  /**
   * Search entities by name (prefix match)
   */
  async searchByName(tenantId: string, query: string, limit: number = 20): Promise<Entity[]> {
    const result = await this.db.query<Record<string, unknown>>(
      `SELECT * FROM entities 
       WHERE tenant_id = $1 AND name ILIKE $2
       ORDER BY name ASC
       LIMIT $3`,
      [tenantId, `${query}%`, limit]
    );
    
    return result.rows.map(row => Entity.fromRow(row));
  }
  
  /**
   * Get entities pending transition (48+ hours in captured state)
   */
  async getPendingTransition(tenantId: string): Promise<Entity[]> {
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
    
    const result = await this.db.query<Record<string, unknown>>(
      `SELECT * FROM entities 
       WHERE tenant_id = $1 
         AND lifecycle_state = $2
         AND captured_at < $3
       ORDER BY captured_at ASC`,
      [tenantId, LifecycleState.CAPTURED, cutoff.toISOString()]
    );
    
    return result.rows.map(row => Entity.fromRow(row));
  }
  
  /**
   * Count entities by type
   */
  async countByType(tenantId: string): Promise<Record<string, number>> {
    const result = await this.db.query<{ type_slug: string; count: number }>(
      `SELECT type_slug, COUNT(*) as count 
       FROM entities 
       WHERE tenant_id = $1
       GROUP BY type_slug`,
      [tenantId]
    );
    
    const counts: Record<string, number> = {};
    for (const row of result.rows) {
      counts[row.type_slug] = row.count;
    }
    return counts;
  }
}
