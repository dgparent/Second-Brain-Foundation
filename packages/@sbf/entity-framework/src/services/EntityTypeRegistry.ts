/**
 * EntityTypeRegistry Service
 * 
 * Manages entity type definitions including system defaults and tenant customizations.
 */

import { v4 as uuidv4 } from 'uuid';
import { EntityType } from '../entities/EntityType';
import type { EntityTypeData, EntityTypeSchema } from '../types';

export interface EntityTypeRegistryConfig {
  cacheEnabled?: boolean;
  cacheTTL?: number; // in milliseconds
}

export interface DatabaseAdapter {
  query<T>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>;
  execute(sql: string, params?: unknown[]): Promise<{ rowCount: number }>;
}

export class EntityTypeRegistry {
  private cache: Map<string, { types: EntityType[]; timestamp: number }> = new Map();
  private config: EntityTypeRegistryConfig;
  private db: DatabaseAdapter;
  
  constructor(db: DatabaseAdapter, config: EntityTypeRegistryConfig = {}) {
    this.db = db;
    this.config = {
      cacheEnabled: config.cacheEnabled ?? true,
      cacheTTL: config.cacheTTL ?? 60000, // 1 minute default
    };
  }
  
  /**
   * Get all entity types available for a tenant (system + custom)
   */
  async getTypes(tenantId: string): Promise<EntityType[]> {
    const cacheKey = `types:${tenantId}`;
    
    // Check cache
    if (this.config.cacheEnabled) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.config.cacheTTL!) {
        return cached.types;
      }
    }
    
    // Fetch from database
    const result = await this.db.query<Record<string, unknown>>(
      `SELECT * FROM entity_types 
       WHERE is_system = true OR tenant_id = $1 
       ORDER BY is_system DESC, name ASC`,
      [tenantId]
    );
    
    const types = result.rows.map(row => EntityType.fromRow(row));
    
    // Update cache
    if (this.config.cacheEnabled) {
      this.cache.set(cacheKey, { types, timestamp: Date.now() });
    }
    
    return types;
  }
  
  /**
   * Get a specific entity type by slug
   */
  async getType(tenantId: string, slug: string): Promise<EntityType | null> {
    // First check tenant-specific
    const customResult = await this.db.query<Record<string, unknown>>(
      `SELECT * FROM entity_types WHERE tenant_id = $1 AND slug = $2`,
      [tenantId, slug]
    );
    
    if (customResult.rows.length > 0) {
      return EntityType.fromRow(customResult.rows[0]);
    }
    
    // Fall back to system default
    const systemResult = await this.db.query<Record<string, unknown>>(
      `SELECT * FROM entity_types WHERE is_system = true AND slug = $1`,
      [slug]
    );
    
    if (systemResult.rows.length > 0) {
      return EntityType.fromRow(systemResult.rows[0]);
    }
    
    return null;
  }
  
  /**
   * Get type by ID
   */
  async getTypeById(id: string): Promise<EntityType | null> {
    const result = await this.db.query<Record<string, unknown>>(
      `SELECT * FROM entity_types WHERE id = $1`,
      [id]
    );
    
    if (result.rows.length > 0) {
      return EntityType.fromRow(result.rows[0]);
    }
    
    return null;
  }
  
  /**
   * Get system default types
   */
  async getSystemTypes(): Promise<EntityType[]> {
    const result = await this.db.query<Record<string, unknown>>(
      `SELECT * FROM entity_types WHERE is_system = true ORDER BY name ASC`
    );
    
    return result.rows.map(row => EntityType.fromRow(row));
  }
  
  /**
   * Register a new custom entity type for a tenant
   */
  async registerType(data: Partial<EntityTypeData>): Promise<EntityType> {
    const entityType = new EntityType({
      ...data,
      id: data.id ?? uuidv4(),
      isSystem: false,
      uidCounter: 0,
    });
    
    // Validate
    const validation = entityType.validate();
    if (!validation.valid) {
      throw new Error(`Invalid entity type: ${validation.errors.join(', ')}`);
    }
    
    // Check for duplicate slug in tenant
    const existing = await this.getType(entityType.tenantId!, entityType.slug);
    if (existing) {
      throw new Error(`Entity type with slug '${entityType.slug}' already exists`);
    }
    
    // Insert into database
    const row = entityType.toRow();
    await this.db.execute(
      `INSERT INTO entity_types (id, tenant_id, name, slug, description, icon, color, folder_path, schema, template, uid_counter, is_system, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())`,
      [row.id, row.tenant_id, row.name, row.slug, row.description, row.icon, row.color, row.folder_path, row.schema, row.template, row.uid_counter, row.is_system]
    );
    
    // Invalidate cache
    this.invalidateCache(entityType.tenantId!);
    
    return entityType;
  }
  
  /**
   * Update an existing entity type
   */
  async updateType(id: string, updates: Partial<EntityTypeData>): Promise<EntityType> {
    const existing = await this.getTypeById(id);
    if (!existing) {
      throw new Error(`Entity type not found: ${id}`);
    }
    
    if (existing.isSystem) {
      throw new Error('Cannot modify system entity types');
    }
    
    // Apply updates
    Object.assign(existing, updates);
    
    // Validate
    const validation = existing.validate();
    if (!validation.valid) {
      throw new Error(`Invalid entity type: ${validation.errors.join(', ')}`);
    }
    
    // Update in database
    const row = existing.toRow();
    await this.db.execute(
      `UPDATE entity_types 
       SET name = $2, description = $3, icon = $4, color = $5, folder_path = $6, schema = $7, template = $8, updated_at = NOW()
       WHERE id = $1`,
      [id, row.name, row.description, row.icon, row.color, row.folder_path, row.schema, row.template]
    );
    
    // Invalidate cache
    if (existing.tenantId) {
      this.invalidateCache(existing.tenantId);
    }
    
    return existing;
  }
  
  /**
   * Delete a custom entity type
   */
  async deleteType(id: string): Promise<void> {
    const existing = await this.getTypeById(id);
    if (!existing) {
      throw new Error(`Entity type not found: ${id}`);
    }
    
    if (existing.isSystem) {
      throw new Error('Cannot delete system entity types');
    }
    
    // Check for existing entities of this type
    const entitiesResult = await this.db.query<{ count: number }>(
      `SELECT COUNT(*) as count FROM entities WHERE type_slug = $1 AND tenant_id = $2`,
      [existing.slug, existing.tenantId]
    );
    
    if (entitiesResult.rows[0].count > 0) {
      throw new Error('Cannot delete entity type with existing entities');
    }
    
    await this.db.execute(
      `DELETE FROM entity_types WHERE id = $1`,
      [id]
    );
    
    // Invalidate cache
    if (existing.tenantId) {
      this.invalidateCache(existing.tenantId);
    }
  }
  
  /**
   * Invalidate cache for a tenant
   */
  invalidateCache(tenantId: string): void {
    this.cache.delete(`types:${tenantId}`);
  }
  
  /**
   * Clear all caches
   */
  clearCache(): void {
    this.cache.clear();
  }
}
