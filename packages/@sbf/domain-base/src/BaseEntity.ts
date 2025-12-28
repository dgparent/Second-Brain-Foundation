/**
 * @sbf/domain-base - BaseEntity
 * 
 * Base class for all domain entities with auto-timestamps,
 * CRUD operations, and tenant isolation.
 */

import { 
  EntityNotFoundError, 
  DatabaseError 
} from '@sbf/errors';
import {
  EntityId,
  TenantId,
  ISO8601,
  DatabaseAdapter,
  BaseEntityFields,
  ListOptions,
  ListResult,
  SaveOptions,
  GetOptions,
  DeleteOptions,
} from './types';
import { now } from './utils/timestamps';
import { 
  modelDumpForSave, 
  rowToEntity, 
  deepClone, 
  toSnakeCase 
} from './utils/serialization';

/**
 * Generate a UUID v4
 */
function generateId(): EntityId {
  // Simple UUID v4 generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Base entity configuration
 */
export interface BaseEntityConfig<T> {
  /**
   * Database table name
   */
  tableName: string;
  
  /**
   * Database adapter instance
   */
  db: DatabaseAdapter;
  
  /**
   * Current tenant ID
   */
  tenantId: TenantId;
  
  /**
   * Factory function to create entity instances
   */
  factory?: (data: Partial<T>) => T;
}

/**
 * Static configuration for entity classes
 */
export interface EntityStatic<T extends BaseEntity> {
  tableName: string;
  db?: DatabaseAdapter;
  
  get(id: EntityId, options?: GetOptions): Promise<T | null>;
  list(options?: ListOptions): Promise<ListResult<T>>;
  delete(id: EntityId, options?: DeleteOptions): Promise<boolean>;
}

/**
 * Base entity class providing auto-timestamps and CRUD operations.
 * 
 * @example
 * ```typescript
 * class Notebook extends BaseEntity {
 *   static tableName = 'notebooks';
 *   
 *   title: string;
 *   description?: string;
 *   
 *   constructor(data: Partial<Notebook>) {
 *     super(data);
 *     this.title = data.title || '';
 *     this.description = data.description;
 *   }
 * }
 * 
 * // Create and save
 * const notebook = new Notebook({ title: 'My Notes' });
 * await notebook.save();
 * 
 * // Get by ID
 * const found = await Notebook.get(notebook.id);
 * 
 * // Update
 * notebook.title = 'Updated Title';
 * await notebook.save();
 * ```
 */
export abstract class BaseEntity implements BaseEntityFields {
  /**
   * Database table name - must be set by subclass
   */
  static tableName: string;
  
  /**
   * Database adapter - set via configure()
   */
  protected static _db: DatabaseAdapter | null = null;
  
  /**
   * Current tenant ID - set via configure()
   */
  protected static _tenantId: TenantId | null = null;
  
  // Instance fields
  id!: EntityId;
  tenantId!: TenantId;
  createdAt!: ISO8601;
  updatedAt!: ISO8601;
  
  // Internal tracking
  protected _isNew: boolean = true;
  protected _original: Record<string, unknown> = {};
  protected _db: DatabaseAdapter | null = null;
  protected _tenantId: TenantId | null = null;
  
  constructor(data: Partial<BaseEntityFields> = {}) {
    this.id = data.id || generateId();
    this.tenantId = data.tenantId || '';
    this.createdAt = data.createdAt || now();
    this.updatedAt = data.updatedAt || now();
    
    if (data.id) {
      this._isNew = false;
      this._original = deepClone(data) as Record<string, unknown>;
    }
  }
  
  /**
   * Configure the entity class with database and tenant
   */
  static configure<T extends typeof BaseEntity>(
    this: T,
    db: DatabaseAdapter,
    tenantId: TenantId
  ): void {
    this._db = db;
    this._tenantId = tenantId;
  }
  
  /**
   * Get the configured database adapter
   */
  static getDb(): DatabaseAdapter {
    if (!this._db) {
      throw new DatabaseError({
        message: 'Database adapter not configured. Call Entity.configure(db, tenantId) first.',
      });
    }
    return this._db;
  }
  
  /**
   * Get the configured tenant ID
   */
  static getTenantId(): TenantId {
    if (!this._tenantId) {
      throw new DatabaseError({
        message: 'Tenant ID not configured. Call Entity.configure(db, tenantId) first.',
      });
    }
    return this._tenantId;
  }
  
  /**
   * Set instance-level database adapter (for testing or special cases)
   */
  setDb(db: DatabaseAdapter): this {
    this._db = db;
    return this;
  }
  
  /**
   * Set instance-level tenant ID
   */
  setTenantId(tenantId: TenantId): this {
    this._tenantId = tenantId;
    this.tenantId = tenantId;
    return this;
  }
  
  /**
   * Get the database adapter for this instance
   */
  protected getDb(): DatabaseAdapter {
    if (this._db) return this._db;
    const ctor = this.constructor as typeof BaseEntity;
    return ctor.getDb();
  }
  
  /**
   * Get the tenant ID for this instance
   */
  protected getTenantId(): TenantId {
    if (this._tenantId) return this._tenantId;
    const ctor = this.constructor as typeof BaseEntity;
    return ctor.getTenantId();
  }
  
  /**
   * Check if this is a new entity (not yet saved)
   */
  isNew(): boolean {
    return this._isNew;
  }
  
  /**
   * Get the table name for this entity
   */
  protected getTableName(): string {
    const ctor = this.constructor as typeof BaseEntity;
    return ctor.tableName;
  }
  
  /**
   * Save the entity (insert or update)
   */
  async save(options: SaveOptions = {}): Promise<this> {
    const db = this.getDb();
    const tenantId = options.tenantId || this.getTenantId();
    
    // Set tenant context for RLS
    await db.setTenantContext(tenantId);
    
    // Ensure tenant ID is set on entity
    if (!this.tenantId) {
      this.tenantId = tenantId;
    }
    
    // Update timestamp
    this.updatedAt = now();
    
    // Prepare data for save
    const data = this.modelDumpForSave();
    
    try {
      if (this._isNew) {
        // Set created timestamp for new entities
        this.createdAt = now();
        data.created_at = this.createdAt;
        
        // Insert
        await db.insert(this.getTableName(), data);
        this._isNew = false;
      } else {
        // Update
        await db.update(this.getTableName(), this.id, data);
      }
      
      // Update original for change tracking
      this._original = deepClone(this) as Record<string, unknown>;
      
      return this;
    } catch (error) {
      throw new DatabaseError({
        message: `Failed to save ${this.getTableName()}`,
        cause: error instanceof Error ? error : undefined,
        details: { entityId: this.id },
      });
    }
  }
  
  /**
   * Delete this entity
   */
  async delete(options: DeleteOptions = {}): Promise<boolean> {
    const db = this.getDb();
    const tenantId = this.getTenantId();
    
    await db.setTenantContext(tenantId);
    
    try {
      const affected = await db.delete(this.getTableName(), this.id);
      return affected > 0;
    } catch (error) {
      throw new DatabaseError({
        message: `Failed to delete ${this.getTableName()}`,
        cause: error instanceof Error ? error : undefined,
        details: { entityId: this.id },
      });
    }
  }
  
  /**
   * Refresh this entity from the database
   */
  async refresh(): Promise<this> {
    const ctor = this.constructor as typeof BaseEntity;
    const db = this.getDb();
    const tenantId = this.getTenantId();
    
    await db.setTenantContext(tenantId);
    
    const row = await db.queryOne<Record<string, unknown>>(
      `SELECT * FROM ${ctor.tableName} WHERE id = $1`,
      [this.id]
    );
    
    if (!row) {
      throw new EntityNotFoundError(ctor.tableName, this.id);
    }
    
    // Update this entity with fresh data
    const entity = rowToEntity<this>(row);
    Object.assign(this, entity);
    this._original = deepClone(entity) as Record<string, unknown>;
    this._isNew = false;
    
    return this;
  }
  
  /**
   * Convert entity to a format suitable for database save
   */
  modelDumpForSave(): Record<string, unknown> {
    return modelDumpForSave(this as unknown as Record<string, unknown>);
  }
  
  /**
   * Convert entity to plain JSON object
   */
  toJSON(): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    
    for (const key of Object.keys(this)) {
      if (key.startsWith('_')) continue;
      const value = (this as unknown as Record<string, unknown>)[key];
      if (typeof value !== 'function') {
        result[key] = value;
      }
    }
    
    return result;
  }
  
  /**
   * Get an entity by ID
   */
  static async get<T extends BaseEntity>(
    this: { new(data: Partial<T>): T; tableName: string; getDb(): DatabaseAdapter; getTenantId(): TenantId },
    id: EntityId,
    options: GetOptions = {}
  ): Promise<T | null> {
    const db = (this as unknown as typeof BaseEntity).getDb();
    const tenantId = options.tenantId || (this as unknown as typeof BaseEntity).getTenantId();
    
    await db.setTenantContext(tenantId);
    
    const row = await db.queryOne<Record<string, unknown>>(
      `SELECT * FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    
    if (!row) {
      return null;
    }
    
    const entity = new this(rowToEntity<Partial<T>>(row));
    (entity as BaseEntity)._isNew = false;
    (entity as BaseEntity)._original = deepClone(row);
    
    return entity;
  }
  
  /**
   * Get an entity by ID or throw
   */
  static async getOrThrow<T extends BaseEntity>(
    this: { new(data: Partial<T>): T; tableName: string; getDb(): DatabaseAdapter; getTenantId(): TenantId },
    id: EntityId,
    options: GetOptions = {}
  ): Promise<T> {
    const entity = await BaseEntity.get.call(this, id, options) as T | null;
    if (!entity) {
      throw new EntityNotFoundError(
        (this as unknown as typeof BaseEntity).tableName,
        id
      );
    }
    return entity;
  }
  
  /**
   * List entities with pagination
   */
  static async list<T extends BaseEntity>(
    this: { new(data: Partial<T>): T; tableName: string; getDb(): DatabaseAdapter; getTenantId(): TenantId },
    options: ListOptions = {}
  ): Promise<ListResult<T>> {
    const db = (this as unknown as typeof BaseEntity).getDb();
    const tenantId = (this as unknown as typeof BaseEntity).getTenantId();
    
    await db.setTenantContext(tenantId);
    
    const limit = options.limit || 50;
    const offset = options.offset || 0;
    const orderBy = options.orderBy ? toSnakeCase(options.orderBy) : 'created_at';
    const orderDir = options.orderDirection || 'desc';
    
    // Get items
    const rows = await db.query<Record<string, unknown>>(
      `SELECT * FROM ${this.tableName} 
       ORDER BY ${orderBy} ${orderDir.toUpperCase()}
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    // Get total count
    const countResult = await db.queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM ${this.tableName}`
    );
    const total = parseInt(countResult?.count || '0', 10);
    
    // Convert to entities
    const items = rows.map(row => {
      const entity = new this(rowToEntity<Partial<T>>(row));
      (entity as BaseEntity)._isNew = false;
      (entity as BaseEntity)._original = deepClone(row);
      return entity;
    });
    
    return {
      items,
      total,
      limit,
      offset,
      hasMore: offset + items.length < total,
    };
  }
  
  /**
   * Delete an entity by ID
   */
  static async deleteById<T extends BaseEntity>(
    this: { tableName: string; getDb(): DatabaseAdapter; getTenantId(): TenantId },
    id: EntityId,
    options: DeleteOptions = {}
  ): Promise<boolean> {
    const db = (this as unknown as typeof BaseEntity).getDb();
    const tenantId = (this as unknown as typeof BaseEntity).getTenantId();
    
    await db.setTenantContext(tenantId);
    
    const affected = await db.delete(this.tableName, id);
    return affected > 0;
  }
  
  /**
   * Count entities matching optional criteria
   */
  static async count<T extends BaseEntity>(
    this: { tableName: string; getDb(): DatabaseAdapter; getTenantId(): TenantId }
  ): Promise<number> {
    const db = (this as unknown as typeof BaseEntity).getDb();
    const tenantId = (this as unknown as typeof BaseEntity).getTenantId();
    
    await db.setTenantContext(tenantId);
    
    const result = await db.queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM ${this.tableName}`
    );
    
    return parseInt(result?.count || '0', 10);
  }
}
